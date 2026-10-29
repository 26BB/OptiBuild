import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

async function main() {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const tempProfile = fs.mkdtempSync(path.join(os.tmpdir(), "chrome-shell-"));
  const debugPort = 9335;
  const nextPort = 3032;
  const outDir = "D:\\OptiBuild BE Project\\OptiBuild-Main\\docs\\ui-checkpoint";

  console.log("1. Starting mock backend on port 8000...");
  const mockBackend = spawn("node", ["scripts/mock_backend.mjs"], {
    cwd: "D:\\OptiBuild BE Project\\OptiBuild-Main",
    stdio: "inherit"
  });
  await new Promise((r) => setTimeout(r, 1000));

  console.log("2. Starting Next.js on port", nextPort);
  const nextProc = spawn("cmd.exe", ["/c", `npx.cmd next start -p ${nextPort}`], {
    cwd: "D:\\OptiBuild BE Project\\OptiBuild-Main\\frontend",
    stdio: "ignore"
  });

  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      const res = await fetch(`http://127.0.0.1:${nextPort}/login`);
      if (res.ok) {
        console.log("Next.js is ready!");
        break;
      }
    } catch {}
  }

  console.log("3. Starting isolated Chrome...");
  const chrome = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    `--user-data-dir=${tempProfile}`,
    `--remote-debugging-port=${debugPort}`,
    "--window-size=1440,900",
    "about:blank"
  ], { stdio: "ignore" });

  let targets = [];
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      const res = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
      if (res.ok) {
        targets = await res.json();
        if (targets.length > 0) break;
      }
    } catch {}
  }

  const page = targets.find((t) => t.type === "page") || targets[0];
  console.log("4. Connecting CDP WebSocket:", page.webSocketDebuggerUrl);
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let idCounter = 1;
  const pending = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg.result);
      pending.delete(msg.id);
    }
  };

  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const id = idCounter++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });

  await new Promise((r) => (ws.onopen = r));
  await send("Page.enable");
  await send("Runtime.enable");

  // Step A: Load login and screenshot
  console.log("5. Capturing login page...");
  await send("Page.navigate", { url: `http://127.0.0.1:${nextPort}/login` });
  await new Promise((r) => setTimeout(r, 2000));
  const loginShot = await send("Page.captureScreenshot", { format: "png" });
  if (loginShot && loginShot.data) {
    fs.writeFileSync(path.join(outDir, "login-rebuilt.png"), Buffer.from(loginShot.data, "base64"));
    console.log("Saved login-rebuilt.png");
  }

  // Step B: Inject demo auth session
  console.log("6. Injecting demo session...");
  const script = `
    localStorage.setItem("optibuild_token", "mock-auth-token-1234");
    localStorage.setItem("optibuild_user", JSON.stringify({
      id: "usr-pm-01",
      email: "pm@optibuild.io",
      full_name: "Priya Sharma",
      role: "project_manager",
      is_active: true
    }));
    localStorage.setItem("optibuild_active_project_id", "proj-1");
    document.cookie = "optibuild_token=mock-auth-token-1234; path=/; max-age=86400";
    document.cookie = "optibuild_role=project_manager; path=/; max-age=86400";
  `;
  await send("Runtime.evaluate", { expression: script });

  // Step C: Navigate to / and screenshot
  console.log("7. Navigating to authenticated home shell...");
  await send("Page.navigate", { url: `http://127.0.0.1:${nextPort}/` });
  await new Promise((r) => setTimeout(r, 3000));
  const shellShot = await send("Page.captureScreenshot", { format: "png" });
  if (shellShot && shellShot.data) {
    const dest = path.join(outDir, "shell-home-rebuilt.png");
    fs.writeFileSync(dest, Buffer.from(shellShot.data, "base64"));
    console.log("Saved shell-home-rebuilt.png, size:", fs.statSync(dest).size);
  }

  // Teardown
  ws.close();
  chrome.kill();
  nextProc.kill();
  mockBackend.kill();
  try {
    fs.rmSync(tempProfile, { recursive: true, force: true });
  } catch {}
  console.log("All done!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

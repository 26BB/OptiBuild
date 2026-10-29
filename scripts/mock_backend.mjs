import http from "http";

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url || "";

  res.setHeader("Content-Type", "application/json");

  if (url.includes("/api/v1/auth/me")) {
    res.writeHead(200);
    res.end(JSON.stringify({
      user: {
        id: "usr-pm-01",
        email: "pm@optibuild.io",
        full_name: "Priya Sharma",
        role: "project_manager",
        is_active: true
      },
      projects: [
        {
          id: "proj-1",
          name: "Godrej Sky Greens Tower A",
          status: "active",
          rera_registration_no: "P52100024567",
          delay_days: 14,
          has_wbs: true,
          has_schedule: true,
          has_optimizer: true
        }
      ]
    }));
    return;
  }

  if (url.includes("/api/v1/projects/proj-1")) {
    res.writeHead(200);
    res.end(JSON.stringify({
      id: "proj-1",
      name: "Godrej Sky Greens Tower A",
      rera_registration_no: "P52100024567",
      tasks: [],
      optimizer_data: null
    }));
    return;
  }

  if (url.includes("/api/v1/projects")) {
    res.writeHead(200);
    res.end(JSON.stringify([
      {
        id: "proj-1",
        name: "Godrej Sky Greens Tower A",
        status: "active",
        rera_registration_no: "P52100024567",
        delay_days: 14,
        has_wbs: true,
        has_schedule: true,
        has_optimizer: true
      }
    ]));
    return;
  }

  res.writeHead(200);
  res.end(JSON.stringify({ status: "ok" }));
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Mock backend listening on 127.0.0.1:8000");
});

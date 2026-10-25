import { NextRequest, NextResponse } from "next/server";

function getBackendBaseUrl(): string {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  return "http://127.0.0.1:8000";
}

const HOP_BY_HOP_HEADERS = [
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "content-length",
  "upgrade",
  "proxy-connection",
  "expect",
];

async function handleProxy(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const backendBase = getBackendBaseUrl();
  const searchParams = req.nextUrl.search;
  const targetUrl = `${backendBase}/api/${path.join("/")}${searchParams}`;

  const headers = new Headers(req.headers);
  for (const h of HOP_BY_HOP_HEADERS) {
    headers.delete(h);
  }

  try {
    const isBodyAllowed = req.method !== "GET" && req.method !== "HEAD";
    const body = isBodyAllowed ? await req.arrayBuffer() : undefined;

    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      // @ts-expect-error duplex is required by Node fetch for streaming payloads
      duplex: "half",
    });

    const resHeaders = new Headers(backendRes.headers);
    // Don't forward transfer-encoding or content-encoding that might conflict with Next.js response handling
    resHeaders.delete("transfer-encoding");
    resHeaders.delete("content-encoding");

    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: resHeaders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Backend proxy error";
    const cause = (err as any)?.cause ? String((err as any)?.cause) : null;
    console.error("PROXY FETCH ERROR:", err, "CAUSE:", (err as any)?.cause);
    return NextResponse.json(
      {
        error: "Backend service unreachable",
        detail: `Cannot connect to OptiBuild backend at ${backendBase}. Please ensure FastAPI is running (uvicorn backend.app.main:app --port 8000). Error: ${message}${cause ? ` [Cause: ${cause}]` : ""}`,
        targetUrl,
      },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
export const PATCH = handleProxy;
export const HEAD = handleProxy;
export const OPTIONS = handleProxy;

import { NextRequest, NextResponse } from "next/server";

function getBackendBaseUrl(): string {
  // 1. Explicit environment variable pointing to container backend (Render / VPS)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  // 2. Fallback for local development
  return "http://localhost:8000";
}

async function handleProxy(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const backendBase = getBackendBaseUrl();
  const searchParams = req.nextUrl.search;
  const targetUrl = `${backendBase}/api/${path.join("/")}${searchParams}`;

  const headers = new Headers(req.headers);
  headers.delete("host");

  try {
    const isBodyAllowed = req.method !== "GET" && req.method !== "HEAD";
    const body = isBodyAllowed ? await req.blob() : undefined;

    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      // @ts-expect-error duplex is required by Node fetch for streaming payloads
      duplex: "half",
    });

    const resHeaders = new Headers(backendRes.headers);
    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: resHeaders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Backend proxy error";
    return NextResponse.json(
      { error: "Failed to connect to backend service", detail: message, targetUrl },
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

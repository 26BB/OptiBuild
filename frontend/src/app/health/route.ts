import { NextResponse } from "next/server";

function getBackendBaseUrl(): string {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  return "http://127.0.0.1:8000";
}

export async function GET() {
  const backendBase = getBackendBaseUrl();
  try {
    const res = await fetch(`${backendBase}/health`, {
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({ status: "healthy" }));
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Backend unreachable";
    return NextResponse.json(
      { status: "unreachable", error: message },
      { status: 502 }
    );
  }
}

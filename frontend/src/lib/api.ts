/**
 * Resolves API URL for cross-service calls in Vercel Services and local development.
 *
 * - On the server (Next.js server runtime): Reads BACKEND_URL injected by Vercel
 *   service binding, falling back to NEXT_PUBLIC_API_URL or local backend.
 * - On the client (browser): Uses relative path so requests route through
 *   Vercel's top-level rewrite or the Next.js API proxy route handler.
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (typeof window !== "undefined") {
    // In browser, use relative paths to go through Vercel rewrites / proxy
    return cleanPath;
  }

  // Server-side execution in Next.js functions: use service binding
  const backendBase =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";

  return `${backendBase.replace(/\/$/, "")}${cleanPath}`;
}

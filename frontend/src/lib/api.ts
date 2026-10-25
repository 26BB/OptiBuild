/**
 * Resolves API URL for backend calls and local development.
 *
 * - On the server (Next.js server runtime): Reads NEXT_PUBLIC_API_URL,
 *   falling back to local backend http://localhost:8000.
 * - On the client (browser): Uses relative path so requests route through
 *   the Next.js API proxy route handler (/api/...).
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (typeof window !== "undefined") {
    // In browser, use relative paths to go through Next.js proxy
    return cleanPath;
  }

  // Server-side execution in Next.js: use NEXT_PUBLIC_API_URL
  const backendBase =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";

  return `${backendBase.replace(/\/$/, "")}${cleanPath}`;
}

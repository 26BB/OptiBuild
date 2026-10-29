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

  // Server-side execution in Next.js: check BACKEND_URL (e.g. for Docker network) then NEXT_PUBLIC_API_URL
  const backendBase =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";

  return `${backendBase.replace(/\/$/, "")}${cleanPath}`;
}

type WakeupListener = (isWakingUp: boolean) => void;
const wakeupListeners: Set<WakeupListener> = new Set();

export function onWakeupStateChange(listener: WakeupListener): () => void {
  wakeupListeners.add(listener);
  return () => {
    wakeupListeners.delete(listener);
  };
}

let activeWakeupRequests = 0;

export function notifyWakeup(isWaking: boolean) {
  wakeupListeners.forEach((l) => {
    try {
      l(isWaking);
    } catch {}
  });
}

// Client-side automatic fetch wrapper:
// - If any API request takes longer than 5 seconds, notifies wakeup listener ("Waking up the server, please wait...")
// - Retries automatically up to 3 times before displaying an error
interface OptiBuildWindow extends Window {
  __optibuild_fetch_installed__?: boolean;
}

if (typeof window !== "undefined" && !(window as OptiBuildWindow).__optibuild_fetch_installed__) {
  (window as OptiBuildWindow).__optibuild_fetch_installed__ = true;
  const originalFetch = window.fetch;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt <= maxRetries) {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      let hasNotifiedWakeup = false;

      timeoutId = setTimeout(() => {
        hasNotifiedWakeup = true;
        activeWakeupRequests++;
        notifyWakeup(true);
      }, 5000);

      try {
        const response = await originalFetch(input, init);

        clearTimeout(timeoutId);
        if (hasNotifiedWakeup) {
          activeWakeupRequests = Math.max(0, activeWakeupRequests - 1);
          if (activeWakeupRequests === 0) notifyWakeup(false);
          hasNotifiedWakeup = false;
        }

        // On cold-start, free servers or gateway proxies can return 502/503/504 while waking up
        if (
          (response.status === 502 || response.status === 503 || response.status === 504) &&
          attempt < maxRetries
        ) {
          attempt++;
          await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
          continue;
        }

        return response;
      } catch (err) {
        clearTimeout(timeoutId);
        if (hasNotifiedWakeup) {
          activeWakeupRequests = Math.max(0, activeWakeupRequests - 1);
          if (activeWakeupRequests === 0) notifyWakeup(false);
          hasNotifiedWakeup = false;
        }

        if (attempt < maxRetries) {
          attempt++;
          await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
        } else {
          throw err;
        }
      }
    }

    throw new Error("Failed to reach server after retries.");
  };
}

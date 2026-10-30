/**
 * Telemetry Diagnostic Snapshot Utility for OptiBuild CAD Workstation
 * Captures real-time client state for reproducible bug diagnostics (SCRUM-18, SCRUM-20).
 *
 * Adheres to OptiBuild Design Guidelines:
 * - Local typography: IBM Plex Mono for diagnostic telemetry
 * - WCAG AA High Contrast theme detection
 */

export interface TelemetrySnapshot {
  timestamp: string;
  pathname: string;
  activeProjectId: string | null;
  activeProjectName: string | null;
  userRole: string | null;
  screenResolution: string;
  theme: "dark" | "parchment";
  userAgent: string;
  networkOnline: boolean;
  errorContext?: Record<string, unknown> | string | null;
}

export function getTelemetrySnapshot(
  errorContext?: unknown,
  projectOverride?: { id?: string; name?: string } | null,
  roleOverride?: string | null
): TelemetrySnapshot {
  const isClient = typeof window !== "undefined";
  const isDoc = typeof document !== "undefined";

  const screenResolution = isClient
    ? `${window.innerWidth}x${window.innerHeight}`
    : "1920x1080 (SSR)";

  const isDark = isDoc ? document.documentElement.classList.contains("dark") : false;
  const theme: "dark" | "parchment" = isDark ? "dark" : "parchment";

  const userAgent = isClient && typeof navigator !== "undefined"
    ? navigator.userAgent
    : "Mozilla/5.0 (Workstation Architecture SSR)";

  const pathname = isClient && window.location
    ? window.location.pathname
    : "/";

  let resolvedProjectId = projectOverride?.id || null;
  let resolvedProjectName = projectOverride?.name || null;
  let resolvedUserRole = roleOverride || null;

  if (isClient) {
    if (!resolvedProjectId) {
      try {
        resolvedProjectId = localStorage.getItem("optibuild_active_project_id") || null;
      } catch {}
    }
    if (!resolvedUserRole) {
      try {
        const storedUser = localStorage.getItem("optibuild_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          resolvedUserRole = parsed.role || null;
        }
      } catch {}
    }
  }

  return {
    timestamp: new Date().toISOString(),
    pathname,
    activeProjectId: resolvedProjectId,
    activeProjectName: resolvedProjectName,
    userRole: resolvedUserRole,
    screenResolution,
    theme,
    userAgent,
    networkOnline: isClient ? navigator.onLine : true,
    errorContext: (errorContext as Record<string, unknown> | string) || null,
  };
}

export function formatTelemetryForDisplay(snapshot: TelemetrySnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

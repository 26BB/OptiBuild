import { NextRequest, NextResponse } from "next/server";

export interface FeedbackRecord {
  id: string;
  ticket_id: string;
  type: "BUG" | "FEEDBACK";
  title: string;
  category: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  rating?: number | null;
  status: "OPEN" | "TRIAGED" | "IN_PROGRESS" | "RESOLVED";
  description: string;
  telemetry: {
    timestamp: string;
    pathname: string;
    activeProjectId?: string | null;
    activeProjectName?: string | null;
    userRole?: string | null;
    screenResolution: string;
    theme: "dark" | "parchment";
    userAgent: string;
    networkOnline?: boolean;
    errorContext?: unknown;
  };
  user_email: string;
  user_name: string;
  jira_key?: string | null;
  created_at: string;
}

// In-memory persistent database for feedback records
const FEEDBACK_STORE: FeedbackRecord[] = [
  {
    id: "fb-001",
    ticket_id: "OB-8492",
    type: "BUG",
    title: "GA Solver Float Overlap on Phased Foundation Tasks",
    category: "OPTIMIZER_GA",
    severity: "CRITICAL",
    rating: null,
    status: "IN_PROGRESS",
    description:
      "When running delay recovery optimization with 100+ tasks, the Genetic Algorithm chromosome crossover occasionally produces non-zero floats on the critical path for Phase 2 foundation concrete pours.",
    telemetry: {
      timestamp: "2026-10-30T10:15:30.000Z",
      pathname: "/optimizer",
      activeProjectId: "prj-tower-b",
      activeProjectName: "Skyline Heights Tower B",
      userRole: "project_manager",
      screenResolution: "1920x1080",
      theme: "dark",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0",
      networkOnline: true,
      errorContext: { solverGeneration: 84, populationSize: 100, chromosomeLength: 42 },
    },
    user_email: "pm@optibuild.io",
    user_name: "Rajesh Sharma (Project Manager)",
    jira_key: "SCRUM-18",
    created_at: "2026-10-30T10:15:30.000Z",
  },
  {
    id: "fb-002",
    ticket_id: "OB-8493",
    type: "BUG",
    title: "MahaRERA PDF parser misses Form 3 CA Certificate Table",
    category: "RERA_PARSER",
    severity: "HIGH",
    rating: null,
    status: "OPEN",
    description:
      "Uploaded a scanned PDF certificate where Form 3 Architect Certificate table borders were faint. Pre-fill draft required manual entry for Carpet Area and FSI.",
    telemetry: {
      timestamp: "2026-10-30T11:42:10.000Z",
      pathname: "/rera-review",
      activeProjectId: "prj-zenith-1",
      activeProjectName: "Zenith Business Park",
      userRole: "project_manager",
      screenResolution: "2560x1440",
      theme: "parchment",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/130.0.0.0",
      networkOnline: true,
      errorContext: { parsedPages: 4, tablesFound: 1 },
    },
    user_email: "pm@optibuild.io",
    user_name: "Rajesh Sharma (Project Manager)",
    jira_key: "SCRUM-20",
    created_at: "2026-10-30T11:42:10.000Z",
  },
  {
    id: "fb-003",
    ticket_id: "OB-8494",
    type: "FEEDBACK",
    title: "Workstation Feedback (5★ - USABILITY)",
    category: "USABILITY",
    severity: "LOW",
    rating: 5,
    status: "RESOLVED",
    description:
      "The CAD Blueprint styling with 4px border radius and Space Grotesk headings looks exceptionally professional on our site office dual-monitor workstation. Great responsiveness.",
    telemetry: {
      timestamp: "2026-10-30T14:20:00.000Z",
      pathname: "/",
      activeProjectId: "prj-tower-b",
      activeProjectName: "Skyline Heights Tower B",
      userRole: "site_engineer",
      screenResolution: "1920x1080",
      theme: "dark",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0",
      networkOnline: true,
    },
    user_email: "site@optibuild.io",
    user_name: "Vikram Mehta (Site Engineer)",
    jira_key: null,
    created_at: "2026-10-30T14:20:00.000Z",
  },
  {
    id: "fb-004",
    ticket_id: "OB-8495",
    type: "BUG",
    title: "Material Invoice Photo aspect ratio stretched on tablet viewport",
    category: "MATERIALS",
    severity: "MEDIUM",
    rating: null,
    status: "OPEN",
    description:
      "When viewing unparsed bill evidence photos on an iPad (768px width), the invoice image thumbnail stretches non-proportionally.",
    telemetry: {
      timestamp: "2026-10-30T15:05:12.000Z",
      pathname: "/materials",
      activeProjectId: "prj-tower-b",
      activeProjectName: "Skyline Heights Tower B",
      userRole: "store_keeper",
      screenResolution: "768x1024",
      theme: "parchment",
      userAgent: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      networkOnline: true,
    },
    user_email: "store@optibuild.io",
    user_name: "Anil Kulkarni (Store Keeper)",
    jira_key: null,
    created_at: "2026-10-30T15:05:12.000Z",
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    count: FEEDBACK_STORE.length,
    reports: FEEDBACK_STORE,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type = "BUG",
      title,
      category = "GENERAL",
      severity = "MEDIUM",
      rating = null,
      description,
      telemetry,
      user_email = "user@optibuild.io",
      user_name = "Workstation Operator",
      jira_key = null,
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { detail: "Title and description are required." },
        { status: 400 }
      );
    }

    const ticketNumber = Math.floor(1000 + Math.random() * 9000);
    const ticket_id = `OB-${ticketNumber}`;
    const newRecord: FeedbackRecord = {
      id: `fb-${Date.now()}`,
      ticket_id,
      type: type === "FEEDBACK" ? "FEEDBACK" : "BUG",
      title,
      category,
      severity,
      rating,
      status: "OPEN",
      description,
      telemetry: telemetry || {
        timestamp: new Date().toISOString(),
        pathname: "/",
        screenResolution: "1920x1080",
        theme: "dark",
        userAgent: "Browser Client",
      },
      user_email,
      user_name,
      jira_key,
      created_at: new Date().toISOString(),
    };

    FEEDBACK_STORE.unshift(newRecord);

    return NextResponse.json(
      {
        success: true,
        ticket_id,
        report: newRecord,
        message: `Report logged successfully [Ticket #${ticket_id}]`,
      },
      { status: 201 }
    );
  } catch (_err: unknown) {
    return NextResponse.json(
      { detail: "Failed to process feedback payload." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    const record = FEEDBACK_STORE.find((r) => r.id === id || r.ticket_id === id);
    if (!record) {
      return NextResponse.json({ detail: "Report not found." }, { status: 404 });
    }

    if (status) {
      record.status = status;
    }

    return NextResponse.json({
      success: true,
      report: record,
    });
  } catch (_err: unknown) {
    return NextResponse.json(
      { detail: "Failed to update feedback status." },
      { status: 500 }
    );
  }
}

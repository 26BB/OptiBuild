---
name: jira-sync
description: Query, transition, and log progress on Atlassian Jira Cloud tickets for OptiBuild sprints, and sync tickets with ACTIVE_SPRINT.md. Trigger when user says "sync jira", "check jira tickets", "update jira", or "log work to jira".
---

# Jira Sync Skill for OptiBuild

Use this skill to keep the 4 team members' Jira sprint tasks and Antigravity 2.0 context completely aligned.

## Capabilities

1. **Fetch Active Tickets:**
   - Query project `SCRUM` (or `OPTI`) using Jira JQL: `project = "SCRUM" AND sprint in openSprints() ORDER BY rank ASC`.
   - Identify which tickets belong to:
     - Member 1 (`cpm`, `genetic-algorithm`)
     - Member 2 (`cpsat`, `penalty-engine`, `math-model`)
     - Member 3 (`fastapi`, `nextjs`, `jira-feedback`)
     - Member 4 (`pdf-ocr`, `mobilenetv2`, `cv`)

2. **Transition Ticket Status:**
   - When starting work: move ticket from `To Do` to `In Progress`.
   - When work is done and verified: move ticket to `Done` or `In Review`.

3. **Log Worklog & Notes:**
   - Log time spent and a concise description of code written, test results, or papers referenced.

4. **Update `ACTIVE_SPRINT.md`:**
   - Keep the repository's `ACTIVE_SPRINT.md` synchronized with the latest Jira ticket IDs and summaries so offline teammates see it on `git pull`.

## Jira Integration Instructions

When Jira MCP is available:
- Call `searchJiraIssuesUsingJql` with query: `project = "SCRUM" ORDER BY updated DESC`.
- Call `getJiraIssue` for details on a specific issue.
- Call `addWorklogToJiraIssue` to log work time for SPPU agile reporting.
- Call `transitionJiraIssue` to move ticket status.

When using REST API directly:
- Use `.env` credentials:
  - Base URL: `JIRA_BASE_URL` (default: `https://bhosalebhushanvijay.atlassian.net`)
  - User Email: `JIRA_USER_EMAIL`
  - API Token: `JIRA_API_TOKEN`
  - Project Key: `SCRUM` / `OPTI`

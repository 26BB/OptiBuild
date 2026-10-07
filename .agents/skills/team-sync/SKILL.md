---
name: team-sync
description: Synchronize multi-agent team context across all 4 team members by updating ACTIVE_SPRINT.md, checking cross-member contract dependencies, and formatting sprint handovers. Trigger on "team sync", "update team status", or "sync team".
---

# Team Sync Skill for OptiBuild

This skill maintains continuity across all 4 developers running Antigravity 2.0 on different machines.

## Protocol Steps

1. **Read Teammate State:**
   - Parse `ACTIVE_SPRINT.md` at the repository root.
   - Summarize what the other 3 members have recently committed or are currently executing.

2. **Verify Interfaces:**
   - If current work touches `app/schemas/`, confirm that it does not break downstream schemas relied upon by other members.

3. **Record Progress:**
   - Update the current member's block in `ACTIVE_SPRINT.md`:
     - Status: `IN_PROGRESS`, `BLOCKED`, or `DONE`
     - Touched files
     - Active Jira ticket key
     - Handover notes for teammates
   - Bump "Last Updated" timestamp.

4. **Prepare Commit:**
   - Ensure the commit message follows `[<TICKET>] <type>: <summary>`.

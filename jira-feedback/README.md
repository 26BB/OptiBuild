# Jira Feedback Integration Module

This module connects the live MVP web application directly with Atlassian Jira Cloud.

## How it Works
1. **Frontend Feedback Widget:** A floating button or modal in the MVP where users submit bug reports, rating stars, and feature requests.
2. **Backend API Route (`/api/feedback`):** Receives the user feedback payload and formats it into Jira's REST API schema (Atlassian Document Format).
3. **Jira Issue Creation:** Sends a `POST` request to `https://your-domain.atlassian.net/rest/api/3/issue` to automatically create a `Bug` or `Task` under project key `OPTI`.

## Environment Variables Needed (`.env`)
```env
JIRA_BASE_URL=https://bhosalebhushanvijay.atlassian.net
JIRA_USER_EMAIL=bhosale.bhushan.vijay@gmail.com
JIRA_API_TOKEN=<your-atlassian-api-token>
JIRA_PROJECT_KEY=SCRUM
```

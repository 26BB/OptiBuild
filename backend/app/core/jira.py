import json
import logging
import os
from typing import Any, Dict, Optional
import httpx

logger = logging.getLogger("optibuild.jira")


class JiraCloudService:
    """
    Asynchronous client for Atlassian Jira Cloud REST API v3.
    Integrates directly with project SCRUM to create tasks and bug tickets.
    Safely degrades if credentials are unconfigured or remote API returns errors.
    """

    def __init__(self):
        raw_host = os.getenv("JIRA_HOST", "").strip().rstrip("/")
        if raw_host and not raw_host.startswith("http://") and not raw_host.startswith("https://"):
            raw_host = f"https://{raw_host}"
        self.host = raw_host
        self.email = os.getenv("JIRA_USER_EMAIL", "").strip()
        self.token = os.getenv("JIRA_API_TOKEN", "").strip()
        self.project_key = os.getenv("JIRA_PROJECT_KEY", "SCRUM").strip().upper()

    @property
    def is_configured(self) -> bool:
        return bool(self.host and self.email and self.token and self.project_key)

    async def create_issue_async(
        self,
        report_type: str,
        title: str,
        description: str,
        category: str = "GENERAL",
        severity: str = "MEDIUM",
        project_id: Optional[str] = None,
        telemetry_data: Optional[Dict[str, Any]] = None,
        attachment_url: Optional[str] = None,
    ) -> Optional[str]:
        """
        Creates a Jira issue asynchronously.
        Returns the Jira issue key (e.g., 'SCRUM-105') or None if disabled/failed.
        """
        if not self.is_configured:
            logger.info("Jira Cloud integration skipped: JIRA_HOST/USER_EMAIL/API_TOKEN not configured.")
            return None

        url = f"{self.host}/rest/api/3/issue"
        auth = (self.email, self.token)
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

        # Select issue type
        issue_type_name = "Task"  # SCRUM project uses Task, Story, Epic, Subtask

        # Build ADF description
        desc_paragraphs: list[dict[str, Any]] = [
            {
                "type": "paragraph",
                "content": [{"type": "text", "text": description}],
            },
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": "\n--- OptiBuild In-App Telemetry Metadata ---\n",
                        "marks": [{"type": "strong"}],
                    },
                    {
                        "type": "text",
                        "text": f"Report Type: {report_type}\nCategory: {category}\nSeverity: {severity}\nProject ID: {project_id or 'N/A'}\n",
                    },
                ],
            },
        ]

        if attachment_url:
            desc_paragraphs.append(
                {
                    "type": "paragraph",
                    "content": [
                        {
                            "type": "text",
                            "text": f"Attachment (INV-3 Evidence): {attachment_url}\n",
                        }
                    ],
                }
            )

        if telemetry_data:
            desc_paragraphs.append(
                {
                    "type": "paragraph",
                    "content": [
                        {"type": "text", "text": "Client Telemetry Snapshot:\n", "marks": [{"type": "strong"}]},
                        {"type": "text", "text": json.dumps(telemetry_data, indent=2)},
                    ],
                }
            )

        payload = {
            "fields": {
                "project": {"key": self.project_key},
                "summary": f"[{report_type.upper()}] {title}",
                "description": {
                    "type": "doc",
                    "version": 1,
                    "content": desc_paragraphs,
                },
                "issuetype": {"name": issue_type_name},
                "labels": ["optibuild", "telemetry", report_type.lower(), category.lower()],
            }
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, json=payload, auth=auth, headers=headers)
                if response.status_code in (200, 201):
                    res_json = response.json()
                    jira_key = res_json.get("key")
                    logger.info("Successfully created Jira issue %s for '%s'", jira_key, title)
                    return jira_key
                else:
                    logger.warning(
                        "Jira API error (%d): %s. Preserving local record.",
                        response.status_code,
                        response.text,
                    )
                    return None
        except Exception as exc:
            logger.warning(
                "Failed to dispatch issue to Jira Cloud (%s): %s. Preserving local record.",
                type(exc).__name__,
                exc,
            )
            return None


jira_service = JiraCloudService()

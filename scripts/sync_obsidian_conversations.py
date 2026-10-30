"""
OptiBuild Obsidian Conversation Synchronizer & Backfill Engine
==============================================================
Automatically syncs Antigravity AI conversation transcripts into the local
Obsidian vault at: 'opti build claude context/'

Generates:
1. Individual session notes under: 'opti build claude context/sessions/'
2. Master Index (Map of Content): 'opti build claude context/00_Conversations_Index.md'
3. Unified continuous archive: 'opti build claude context/All_Conversations.md'

Usage:
    python scripts/sync_obsidian_conversations.py --all       # Backfill/sync all OptiBuild sessions
    python scripts/sync_obsidian_conversations.py --current   # Sync current session
    python scripts/sync_obsidian_conversations.py --watch     # Run continuous background watcher
"""

import os
import sys
import json
import re
import time
import argparse
from datetime import datetime, timezone

WORKSPACE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BRAIN_DIR = os.path.expanduser(r"~\.gemini\antigravity\brain")
VAULT_DIR = os.path.join(WORKSPACE_DIR, "opti build claude context")
SESSIONS_DIR = os.path.join(VAULT_DIR, "sessions")
INDEX_PATH = os.path.join(VAULT_DIR, "00_Conversations_Index.md")
CONSOLIDATED_PATH = os.path.join(VAULT_DIR, "All_Conversations.md")

CURRENT_CID = "552e83e6-dd43-4ff0-9538-e9f7735455a3"


def clean_user_prompt(text: str) -> str:
    """Extract clean user text from Antigravity prompt wrappers."""
    if not text:
        return ""
    m = re.search(r"<USER_REQUEST>(.*?)</USER_REQUEST>", text, re.DOTALL)
    if m:
        text = m.group(1)
    else:
        text = re.sub(r"<ADDITIONAL_METADATA>.*?</ADDITIONAL_METADATA>", "", text, flags=re.DOTALL)
        text = re.sub(r"<USER_SETTINGS_CHANGE>.*?</USER_SETTINGS_CHANGE>", "", text, flags=re.DOTALL)
        text = re.sub(r"<SYSTEM_MESSAGE>.*?</SYSTEM_MESSAGE>", "", text, flags=re.DOTALL)
    return text.strip()


def sanitize_filename(name: str) -> str:
    """Create a Windows-safe filename string."""
    name = re.sub(r'[\\/*?:"<>|]', "", name)
    name = re.sub(r"[\s_]+", "-", name).strip("-")
    return name[:50] or "session"


def parse_session(cid: str) -> dict:
    """Parse transcript.jsonl for a given conversation ID."""
    tpath = os.path.join(BRAIN_DIR, cid, ".system_generated", "logs", "transcript.jsonl")
    if not os.path.isfile(tpath):
        return None

    turns = []
    current_tools = []
    start_time = None
    is_optibuild = False
    first_user_prompt = ""
    user_turns_count = 0

    try:
        with open(tpath, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                data = json.loads(line)
                t = data.get("type")
                c = data.get("content", "")
                tools = data.get("tool_calls", [])
                created = data.get("created_at")

                if not start_time and created:
                    start_time = created

                # Check if session is related to Opti Build
                if not is_optibuild:
                    raw_str = (c or "") + str(tools)
                    if (
                        "opti build" in raw_str.lower()
                        or "optibuild" in raw_str.lower()
                        or cid == CURRENT_CID
                    ):
                        is_optibuild = True

                if t == "USER_INPUT":
                    # Flush pending tool calls if any
                    if current_tools:
                        turns.append({"role": "tools", "items": current_tools})
                        current_tools = []

                    cleaned = clean_user_prompt(c)
                    if cleaned:
                        user_turns_count += 1
                        if not first_user_prompt:
                            first_user_prompt = cleaned
                        turns.append({"role": "user", "time": created, "content": cleaned})

                elif t == "PLANNER_RESPONSE":
                    if tools:
                        for tc in tools:
                            name = tc.get("name", "tool")
                            args = tc.get("args", {})
                            summary = ""
                            if isinstance(args, dict):
                                summary = args.get("toolSummary", "")
                                if isinstance(summary, str):
                                    summary = summary.strip('"')
                            summary_str = f"`{name}`: {summary}" if summary else f"`{name}`"
                            current_tools.append(summary_str)

                    if c:
                        # Flush pending tool calls before response
                        if current_tools:
                            turns.append({"role": "tools", "items": current_tools})
                            current_tools = []
                        turns.append({"role": "assistant", "time": created, "content": c})

            if current_tools:
                turns.append({"role": "tools", "items": current_tools})
                current_tools = []

    except Exception as e:
        print(f"Error parsing {cid}: {e}", file=sys.stderr)
        return None

    if not is_optibuild or user_turns_count == 0:
        return None

    # Format timestamp
    dt = None
    if start_time:
        try:
            dt = datetime.fromisoformat(start_time.replace("Z", "+00:00"))
        except Exception:
            pass

    date_str = dt.strftime("%Y-%m-%d %H:%M") if dt else "Unknown Date"
    file_prefix = dt.strftime("%Y-%m-%d_%H%M") if dt else "2026-00-00_0000"
    slug = sanitize_filename(first_user_prompt.split("\n")[0])
    filename = f"{file_prefix}_{cid[:8]}_{slug}.md"

    title = first_user_prompt.split("\n")[0][:80].strip() or f"Session {cid[:8]}"

    return {
        "cid": cid,
        "dt": dt,
        "date_str": date_str,
        "filename": filename,
        "title": title,
        "user_turns": user_turns_count,
        "first_prompt": first_user_prompt,
        "turns": turns,
    }


def render_session_markdown(session: dict) -> str:
    """Render a single session dictionary to clean Obsidian Markdown."""
    dt_iso = session["dt"].isoformat() if session["dt"] else ""
    lines = [
        "---",
        f'title: "{session["title"].replace('"', '\\"')}"',
        f"date: {dt_iso}",
        f'session_id: "{session["cid"]}"',
        'project: "OptiBuild"',
        f'user_turns: {session["user_turns"]}',
        "tags:",
        "  - optibuild/session",
        "  - antigravity",
        "---",
        "",
        f"# 🧠 Session: {session['title']}",
        "",
        "> [!INFO] **Session Metadata**",
        f"> - **Date & Time:** {session['date_str']} UTC",
        f"> - **Session ID:** `{session['cid']}`",
        f"> - **User Turns:** {session['user_turns']}",
        "> - **Vault Index:** [[00_Conversations_Index|⬅️ Back to Index]] | [[All_Conversations|📚 Complete Archive]]",
        "",
        "---",
        "",
        "## 💬 Dialogue Transcript",
        "",
    ]

    for turn in session["turns"]:
        role = turn["role"]
        if role == "user":
            lines.append("### 👤 User")
            # Format user prompt in a nice blockquote
            prompt_lines = turn["content"].split("\n")
            lines.extend([f"> {p}" if p else ">" for p in prompt_lines])
            lines.append("")
        elif role == "tools":
            items = turn["items"]
            count = len(items)
            lines.append(f"<details>")
            lines.append(f"<summary>🛠️ <b>Tool Actions</b> ({count} operations)</summary>\n")
            for it in items:
                lines.append(f"- {it}")
            lines.append("\n</details>\n")
        elif role == "assistant":
            lines.append("### 🤖 Assistant")
            lines.append(turn["content"])
            lines.append("\n---\n")

    return "\n".join(lines)


def sync_all_sessions():
    """Discover, parse, and write all OptiBuild sessions."""
    os.makedirs(SESSIONS_DIR, exist_ok=True)
    all_sessions = []

    print(f"Scanning brain directory: {BRAIN_DIR} ...")
    for cid in os.listdir(BRAIN_DIR):
        sess = parse_session(cid)
        if sess:
            all_sessions.append(sess)

    # Sort chronologically
    all_sessions.sort(key=lambda s: s["dt"] or datetime.min.replace(tzinfo=timezone.utc))
    print(f"Found {len(all_sessions)} verified OptiBuild conversation sessions.")

    # 1. Write individual session notes
    for sess in all_sessions:
        target_path = os.path.join(SESSIONS_DIR, sess["filename"])
        content = render_session_markdown(sess)
        with open(target_path, "w", encoding="utf-8") as f:
            f.write(content)

    print(f"Wrote {len(all_sessions)} notes to: {SESSIONS_DIR}")

    # 2. Write Master Index (00_Conversations_Index.md)
    index_lines = [
        "---",
        'title: "OptiBuild Conversations - Master Index"',
        'project: "OptiBuild"',
        f"last_updated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
        "tags:",
        "  - optibuild/index",
        "  - moc",
        "---",
        "",
        "# 📚 OptiBuild Conversations — Master Map of Content (MOC)",
        "",
        f"> **Total Synced Sessions:** {len(all_sessions)}  ",
        f"> **Last Synchronized:** `{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}`  ",
        "> **Full Monolithic View:** [[All_Conversations|📖 Open All Conversations in One File]]",
        "",
        "---",
        "",
        "## 🗓️ Chronological Session Ledger",
        "",
        "| Date & Time (UTC) | Session Note | Turns | Initial Goal / Prompt |",
        "|:---|:---|:---:|:---|",
    ]

    for sess in reversed(all_sessions):  # newest first in the index table
        base_name = os.path.splitext(sess["filename"])[0]
        link = f"[[{base_name}|{sess['title'][:45]}]]"
        summary = sess["first_prompt"].replace("\n", " ").replace("|", "\\|")[:80]
        index_lines.append(f"| {sess['date_str']} | {link} | {sess['user_turns']} | {summary} |")

    index_lines.append("\n---\n*Auto-generated by `scripts/sync_obsidian_conversations.py`*")
    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(index_lines))

    print(f"Updated Master Index: {INDEX_PATH}")

    # 3. Write Consolidated Archive (All_Conversations.md)
    archive_lines = [
        "---",
        'title: "OptiBuild - Consolidated Conversations Archive"',
        'project: "OptiBuild"',
        f"last_updated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
        "tags:",
        "  - optibuild/archive",
        "---",
        "",
        "# 📚 OptiBuild — Complete Consolidated Conversations Archive",
        "",
        "> [!NOTE] Complete Historical Stream",
        f"> This file compiles all {len(all_sessions)} conversation sessions in chronological order.",
        "> For modular session notes, see [[00_Conversations_Index|Master Index (MOC)]].",
        "",
        "---",
        "",
    ]

    for sess in all_sessions:
        base_name = os.path.splitext(sess["filename"])[0]
        archive_lines.append(f"## 📌 [[{base_name}|{sess['title']}]]")
        archive_lines.append(f"**Date:** {sess['date_str']} UTC | **Session ID:** `{sess['cid']}` | **Turns:** {sess['user_turns']}\n")
        
        for turn in sess["turns"]:
            role = turn["role"]
            if role == "user":
                archive_lines.append("#### 👤 User")
                p_lines = turn["content"].split("\n")
                archive_lines.extend([f"> {p}" if p else ">" for p in p_lines])
                archive_lines.append("")
            elif role == "assistant":
                archive_lines.append("#### 🤖 Assistant")
                archive_lines.append(turn["content"])
                archive_lines.append("")
        
        archive_lines.append("\n---\n")

    with open(CONSOLIDATED_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(archive_lines))

    print(f"Updated Consolidated Archive: {CONSOLIDATED_PATH}")


def sync_current_session():
    """Sync only the current session and refresh the index."""
    sess = parse_session(CURRENT_CID)
    if not sess:
        print(f"Could not find or parse current session {CURRENT_CID}")
        return

    os.makedirs(SESSIONS_DIR, exist_ok=True)
    target_path = os.path.join(SESSIONS_DIR, sess["filename"])
    content = render_session_markdown(sess)
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Synced current session note: {target_path}")

    # Re-run full index sync so links and consolidated files stay fresh
    sync_all_sessions()


def watch_current_session(interval_sec=30):
    """Continuously monitor current transcript.jsonl and sync on modifications."""
    tpath = os.path.join(BRAIN_DIR, CURRENT_CID, ".system_generated", "logs", "transcript.jsonl")
    print(f"Starting continuous watcher on: {tpath} (interval: {interval_sec}s)", flush=True)
    last_mtime = 0
    last_size = 0

    while True:
        try:
            if os.path.isfile(tpath):
                stat = os.stat(tpath)
                if stat.st_mtime != last_mtime or stat.st_size != last_size:
                    last_mtime = stat.st_mtime
                    last_size = stat.st_size
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] Detected transcript change. Syncing...", flush=True)
                    sync_current_session()
            time.sleep(interval_sec)
        except KeyboardInterrupt:
            print("Watcher stopped.", flush=True)
            break
        except Exception as e:
            print(f"Watcher error: {e}", file=sys.stderr, flush=True)
            time.sleep(interval_sec)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sync OptiBuild conversations to Obsidian.")
    parser.add_argument("--all", action="store_true", help="Sync/backfill all OptiBuild sessions")
    parser.add_argument("--current", action="store_true", help="Sync the current session")
    parser.add_argument("--watch", action="store_true", help="Run background watcher")
    parser.add_argument("--interval", type=int, default=30, help="Watcher polling interval in seconds")

    args = parser.parse_args()

    if args.watch:
        watch_current_session(interval_sec=args.interval)
    elif args.all:
        sync_all_sessions()
    else:
        # Default to current session or all if index doesn't exist
        if not os.path.isfile(INDEX_PATH):
            sync_all_sessions()
        else:
            sync_current_session()

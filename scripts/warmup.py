#!/usr/bin/env python3
"""
OptiBuild Pre-Demo Cloud Warmup & Cold-Start Awakening CLI
=========================================================
Polls the OptiBuild backend engine until container spin-up and database
connections are warm and responsive.

Designed for executive demos and high-profile presentations to eliminate
Render / cloud cold-start latency before presenting.

Usage:
    # Use default URL (from env BACKEND_URL, NEXT_PUBLIC_API_URL, or http://localhost:8000)
    python scripts/warmup.py

    # Warm up a specific cloud staging or production instance
    python scripts/warmup.py --url https://optibuild-api.onrender.com

    # Custom timeout and interval
    python scripts/warmup.py --url http://127.0.0.1:8000 --timeout 90 --interval 2
"""

import os
import sys
import time
import json
import argparse
import urllib.request
import urllib.error


def parse_args() -> argparse.Namespace:
    default_url = (
        os.getenv("BACKEND_URL")
        or os.getenv("NEXT_PUBLIC_API_URL")
        or "http://localhost:8000"
    )

    parser = argparse.ArgumentParser(
        description="Warm up OptiBuild backend engine before live presentations."
    )
    parser.add_argument(
        "--url",
        default=default_url,
        help=f"Target backend base URL or health endpoint (default: {default_url})",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=60,
        help="Total timeout in seconds to wait for backend spin-up (default: 60)",
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=3.0,
        help="Interval in seconds between health check polls (default: 3.0)",
    )
    return parser.parse_args()


def main():
    args = parse_args()

    raw_url = args.url.strip().rstrip("/")
    if raw_url.endswith("/health"):
        health_url = raw_url
    else:
        health_url = f"{raw_url}/health"

    print("=" * 72)
    print("  OPTIBUILD CLOUD ENGINE PRE-DEMO WARMUP")
    print(f"  Target:  {health_url}")
    print(f"  Timeout: {args.timeout}s (polling every {args.interval}s)")
    print("=" * 72)

    spinner_chars = ["|", "/", "-", "\\"]
    spinner_idx = 0
    start_time = time.time()
    attempt = 0

    while True:
        attempt += 1
        elapsed = time.time() - start_time
        if elapsed > args.timeout:
            print(f"\n\n[TIMEOUT] OptiBuild Engine failed to respond within {args.timeout}s.")
            print("Troubleshooting:")
            print("  1. Verify the cloud container / service is active.")
            print("  2. Check Uvicorn / database logs for crash-loops.")
            print(f"  3. Test manually with: curl -I {health_url}")
            sys.exit(1)

        spinner = spinner_chars[spinner_idx % len(spinner_chars)]
        spinner_idx += 1
        sys.stdout.write(
            f"\r[{spinner}] Attempt #{attempt} | Elapsed: {elapsed:4.1f}s | Probing {health_url}..."
        )
        sys.stdout.flush()

        req_start = time.perf_counter()
        try:
            req = urllib.request.Request(
                health_url,
                headers={"User-Agent": "OptiBuild-PreDemo-Warmup/1.0"},
            )
            with urllib.request.urlopen(req, timeout=args.interval) as resp:
                req_latency_ms = (time.perf_counter() - req_start) * 1000.0
                if resp.status == 200:
                    payload = json.loads(resp.read().decode("utf-8"))
                    if payload.get("status") in ("healthy", "ok"):
                        print(f"\n\n[READY] OptiBuild Engine is warm and responding in {req_latency_ms:.1f} ms. Ready for executive demo.")
                        print(f"Service: {payload.get('service', 'OptiBuild Engine')} (v{payload.get('version', '1.0.0')})")
                        sys.exit(0)
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, ConnectionError, OSError):
            # Container is spinning up, connecting, or 502/503/504
            pass

        time.sleep(args.interval)


if __name__ == "__main__":
    main()

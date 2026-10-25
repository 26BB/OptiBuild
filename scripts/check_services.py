"""
OptiBuild Services Verification Script (scripts/check_services.py)
Tests:
  1. Database connection & table existence against DATABASE_URL (Supabase PostgreSQL)
  2. Object storage upload, download verification, and cleanup for each configured S3 bucket
  3. /health endpoint verification (via live HTTP or in-process FastAPI TestClient fallback)

Prints a clear PASS / FAIL status for each service.
"""

import os
import sys
import uuid
import time
from pathlib import Path

# Add project root to sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))


def load_env_file():
    """Fallback loader for .env file if environment variables are not pre-set."""
    candidates = [
        REPO_ROOT / ".env",
        REPO_ROOT / "backend" / ".env",
        Path.cwd() / ".env",
    ]
    for p in candidates:
        if p.is_file():
            with open(p, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k not in os.environ:
                            os.environ[k] = v
            break


load_env_file()


def check_database() -> tuple[bool, str]:
    """Test PostgreSQL database connection and confirm all 6 OptiBuild tables exist."""
    raw_url = os.getenv("DATABASE_URL")
    if not raw_url:
        return False, "DATABASE_URL environment variable is not set."

    try:
        from backend.app.db.session import clean_database_url, Base
        from sqlalchemy import create_engine, inspect, text
        from sqlalchemy.pool import NullPool

        db_url = clean_database_url(raw_url)
        engine = create_engine(db_url, poolclass=NullPool)

        with engine.connect() as conn:
            # Check basic connection
            result = conn.execute(text("SELECT 1;")).fetchone()
            if not result or result[0] != 1:
                return False, "Database responded with unexpected result."

            inspector = inspect(engine)
            existing_tables = inspector.get_table_names()

            expected_tables = [
                "projects",
                "tasks",
                "material_logs",
                "rera_certificates",
                "site_photos",
                "delay_recovery_evaluations",
            ]

            missing = [t for t in expected_tables if t not in existing_tables]
            if missing:
                return (
                    False,
                    f"Connected, but missing expected tables: {missing}. Existing tables: {existing_tables}",
                )

            return (
                True,
                f"Connected successfully. All {len(expected_tables)} OptiBuild tables verified: {expected_tables}",
            )
    except Exception as e:
        return False, f"Connection error: {str(e)}"


def check_storage_bucket(bucket_name: str) -> tuple[bool, str]:
    """Test S3-compatible storage by uploading and downloading a test probe file."""
    endpoint_url = os.getenv("S3_ENDPOINT_URL")
    access_key = os.getenv("S3_ACCESS_KEY")
    secret_key = os.getenv("S3_SECRET_KEY")
    region = os.getenv("S3_REGION", "ap-south-1")

    if not access_key or not secret_key:
        return (
            False,
            f"Missing S3_ACCESS_KEY or S3_SECRET_KEY for bucket '{bucket_name}'. "
            "Configure them in your .env or platform secrets.",
        )

    try:
        import boto3
        from botocore.exceptions import ClientError

        s3 = boto3.client(
            "s3",
            endpoint_url=endpoint_url if endpoint_url else None,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region,
        )

        # 1. Ensure bucket exists
        try:
            s3.head_bucket(Bucket=bucket_name)
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code")
            if error_code in ("404", "NoSuchBucket"):
                # Attempt to create
                try:
                    s3.create_bucket(Bucket=bucket_name)
                except Exception as ce:
                    return False, f"Bucket '{bucket_name}' not found and creation failed: {ce}"
            else:
                return False, f"head_bucket failed for '{bucket_name}': {e}"

        # 2. Upload probe file
        probe_key = f"health_checks/test_probe_{uuid.uuid4().hex[:8]}.txt"
        probe_content = f"optibuild-probe-{time.time()}".encode("utf-8")

        s3.put_object(
            Bucket=bucket_name,
            Key=probe_key,
            Body=probe_content,
            Metadata={"test": "true", "purpose": "health_check"},
        )

        # 3. Download and verify content
        response = s3.get_object(Bucket=bucket_name, Key=probe_key)
        downloaded_content = response["Body"].read()

        if downloaded_content != probe_content:
            return (
                False,
                f"Data mismatch: uploaded {len(probe_content)} bytes but read {len(downloaded_content)} bytes.",
            )

        # 4. Clean up probe file
        s3.delete_object(Bucket=bucket_name, Key=probe_key)

        return True, f"Bucket '{bucket_name}': write, read, and cleanup verified successfully."

    except Exception as e:
        return False, f"Storage error for bucket '{bucket_name}': {str(e)}"


def check_health_endpoint() -> tuple[bool, str]:
    """Test the /health endpoint either via HTTP request or directly via FastAPI TestClient."""
    api_url = (
        os.getenv("NEXT_PUBLIC_API_URL")
        or os.getenv("API_URL")
        or "http://localhost:8000"
    ).rstrip("/")
    health_url = f"{api_url}/health"

    # Try live HTTP request first
    try:
        import httpx

        response = httpx.get(health_url, timeout=3.0)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "healthy":
                return True, f"Live HTTP 200 OK from {health_url}: {data}"
    except Exception:
        pass

    # Fallback: In-process FastAPI TestClient
    try:
        from starlette.testclient import TestClient
        from backend.app.main import app

        client = TestClient(app)
        res = client.get("/health")
        if res.status_code == 200 and res.json().get("status") == "healthy":
            return (
                True,
                f"FastAPI app in-process verification passed (HTTP 200 OK): {res.json()}",
            )
        else:
            return (
                False,
                f"In-process /health returned status {res.status_code}: {res.text}",
            )
    except Exception as e:
        return False, f"Failed to test /health endpoint: {str(e)}"


def main():
    print("=" * 70)
    print("         OptiBuild Production Services Verification")
    print("=" * 70)
    print()

    results = []

    # 1. Database Check
    print("[*] Testing Database Connection (Supabase PostgreSQL)...")
    db_pass, db_msg = check_database()
    results.append(("Database (Supabase PostgreSQL)", db_pass, db_msg))
    print(f"    {'[PASS]' if db_pass else '[FAIL]'} {db_msg}\n")

    # 2. Storage Check (support single or comma-separated buckets)
    raw_buckets = os.getenv("S3_BUCKET_NAME", "optibuild-artifacts")
    bucket_list = [b.strip() for b in raw_buckets.split(",") if b.strip()]

    print(f"[*] Testing S3-compatible Object Storage for {len(bucket_list)} bucket(s)...")
    for bucket in bucket_list:
        st_pass, st_msg = check_storage_bucket(bucket)
        results.append((f"Storage Bucket ({bucket})", st_pass, st_msg))
        print(f"    {'[PASS]' if st_pass else '[FAIL]'} {st_msg}")
    print()

    # 3. Health Endpoint Check
    print("[*] Testing /health Endpoint...")
    h_pass, h_msg = check_health_endpoint()
    results.append(("/health Endpoint", h_pass, h_msg))
    print(f"    {'[PASS]' if h_pass else '[FAIL]'} {h_msg}\n")

    # Summary
    print("=" * 70)
    print("                          Summary")
    print("=" * 70)
    all_passed = True
    for service, passed, msg in results:
        status_tag = "PASS" if passed else "FAIL"
        print(f"  [{status_tag:4}] {service}")
        if not passed:
            all_passed = False
            print(f"         Reason: {msg}")

    print("=" * 70)
    if all_passed:
        print("[SUCCESS] All verified services are healthy and operational!\n")
        return 0
    else:
        print("[WARNING] One or more service checks failed or require credentials.\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())

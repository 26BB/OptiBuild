"""
OptiBuild Neon PostgreSQL Verification & Setup Script
====================================================
Tests connectivity to a Neon Serverless PostgreSQL database,
creates all required tables (10 models), and optionally runs seed.

Usage:
    python scripts/test_neon_db.py [NEON_DATABASE_URL]
    python scripts/test_neon_db.py --seed [NEON_DATABASE_URL]
"""

import os
import sys
from pathlib import Path

repo_root = Path(__file__).resolve().parent.parent
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from sqlalchemy import text, create_engine
from backend.app.db.session import clean_database_url
from backend.app.db.models import Base, User, Project


def test_neon_connection(db_url: str, do_seed: bool = False):
    print(f"\n[+] Testing Neon PostgreSQL Connection...")
    cleaned_url = clean_database_url(db_url)
    # Mask password for display
    display_url = cleaned_url
    if "@" in display_url and ":" in display_url.split("@")[0]:
        user_part = display_url.split("@")[0]
        host_part = display_url.split("@")[1]
        protocol_user = user_part.split(":")[0] + ":" + user_part.split(":")[1]
        display_url = f"{protocol_user}:****@{host_part}"
    print(f"[*] Normalized URL: {display_url}")

    try:
        engine = create_engine(cleaned_url, pool_pre_ping=True)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();")).fetchone()
            print(f"[SUCCESS] Connected to Neon PostgreSQL!")
            print(f"[*] Engine Version: {result[0] if result else 'Unknown'}")

            # Create tables
            print("[*] Creating / verifying all 10 schema tables...")
            Base.metadata.create_all(bind=engine)
            print("[SUCCESS] All database tables verified.")

            # Check existing users
            user_count = conn.execute(text("SELECT COUNT(*) FROM users;")).scalar()
            project_count = conn.execute(text("SELECT COUNT(*) FROM projects;")).scalar()
            print(f"[*] Current Records -> Users: {user_count}, Projects: {project_count}")

            if do_seed or user_count == 0:
                print("[*] Running initial seed on Neon database...")
                from sqlalchemy.orm import sessionmaker
                from backend.app.db.seed import seed_database
                # Temporarily point environment to this url
                os.environ["DATABASE_URL"] = db_url
                seed_database()
                print("[SUCCESS] Neon database seeded with demo accounts and flagship showcase project!")

            return True
    except Exception as e:
        print(f"\n[ERROR] Failed to connect to Neon PostgreSQL: {e}")
        return False


if __name__ == "__main__":
    args = sys.argv[1:]
    do_seed = "--seed" in args
    filtered_args = [a for a in args if a != "--seed"]

    target_url = filtered_args[0] if filtered_args else os.getenv("NEON_DATABASE_URL") or os.getenv("DATABASE_URL")

    if not target_url or "neon.tech" not in target_url and "postgres" not in target_url:
        print("Usage: python scripts/test_neon_db.py [--seed] <postgresql://...neon.tech/...>")
        print("Or set NEON_DATABASE_URL / DATABASE_URL in your environment or .env file.")
        sys.exit(1)

    success = test_neon_connection(target_url, do_seed=do_seed)
    sys.exit(0 if success else 1)

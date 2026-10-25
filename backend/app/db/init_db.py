import os
import sys
from pathlib import Path
from sqlalchemy import inspect, text

# Ensure backend is on sys.path
repo_root = Path(__file__).resolve().parent.parent.parent.parent
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from backend.app.db.session import engine, Base, get_database_url
from backend.app.db import models  # noqa: F401 - ensure models are registered with Base.metadata


def init_db():
    """
    Creates all database tables defined in SQLAlchemy models against DATABASE_URL
    and ensures schema columns are synchronized.
    """
    db_url = get_database_url()
    print(f"[*] Initializing database tables against DATABASE_URL...")
    
    if not engine:
        raise RuntimeError("SQLAlchemy engine is not initialized.")

    # 1. Create all tables defined in Base.metadata
    Base.metadata.create_all(bind=engine)
    print("[+] Base.metadata.create_all() completed.")

    # 2. Add columns if not exists (for Postgres / SQLite compatibility)
    is_postgres = "postgres" in db_url.lower()

    if is_postgres:
        with engine.connect() as conn:
            migration_queries = [
                # projects table new columns
                "ALTER TABLE projects ADD COLUMN IF NOT EXISTS organization_id VARCHAR(50);",
                "ALTER TABLE projects ADD COLUMN IF NOT EXISTS rera_registration_no VARCHAR(100);",
                "ALTER TABLE projects ADD COLUMN IF NOT EXISTS promoter_name VARCHAR(255);",
                "ALTER TABLE projects ADD COLUMN IF NOT EXISTS proposed_completion_date VARCHAR(50);",
                "ALTER TABLE projects ADD COLUMN IF NOT EXISTS number_of_basements INTEGER DEFAULT 0;",
                "ALTER TABLE projects ADD COLUMN IF NOT EXISTS base_rate_per_sqft DOUBLE PRECISION DEFAULT 2400.0;",
                "ALTER TABLE projects ADD COLUMN IF NOT EXISTS total_project_cost DOUBLE PRECISION DEFAULT 0.0;",
                "ALTER TABLE projects ADD COLUMN IF NOT EXISTS wbs_data JSON;",
                "ALTER TABLE projects ADD COLUMN IF NOT EXISTS schedule_data JSON;",
                "ALTER TABLE projects ADD COLUMN IF NOT EXISTS optimizer_data JSON;",
                "ALTER TABLE projects ADD COLUMN IF NOT EXISTS benchmark_data JSON;",
                "ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_by_id VARCHAR(50);",
                
                # tasks table columns
                "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id VARCHAR(50);",
                "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS name VARCHAR(255);",
                "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 1;",
                "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS normal_cost DOUBLE PRECISION DEFAULT 0.0;",
                "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS crash_cost DOUBLE PRECISION DEFAULT 0.0;",
                "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS crash_duration INTEGER;",
                "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS predecessors JSON;",
                "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS resource_demands JSON;",
                "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_critical BOOLEAN DEFAULT FALSE;",
                "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS total_float INTEGER DEFAULT 0;",
                "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS free_float INTEGER DEFAULT 0;",
                "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS progress_percent DOUBLE PRECISION DEFAULT 0.0;",
                "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'NOT_STARTED';",
                "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS actual_start VARCHAR(50);",
                "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS actual_finish VARCHAR(50);",

                # material_logs table columns
                "ALTER TABLE material_logs ADD COLUMN IF NOT EXISTS item_description TEXT;",
                "ALTER TABLE material_logs ADD COLUMN IF NOT EXISTS wbs_code VARCHAR(50);",
                "ALTER TABLE material_logs ADD COLUMN IF NOT EXISTS logged_by_id VARCHAR(50);",

                # site_photos table columns
                "ALTER TABLE site_photos ADD COLUMN IF NOT EXISTS detected_features JSON;",
                "ALTER TABLE site_photos ADD COLUMN IF NOT EXISTS notes TEXT;",
                "ALTER TABLE site_photos ADD COLUMN IF NOT EXISTS uploaded_by_id VARCHAR(50);",

                # delay_recovery_evaluations columns
                "ALTER TABLE delay_recovery_evaluations ADD COLUMN IF NOT EXISTS crashing_actions JSON;",
            ]

            for query in migration_queries:
                try:
                    conn.execute(text(query))
                except Exception as ex:
                    print(f"    Migration notice ({query[:40]}...): {ex}")
            conn.commit()
            print("[+] Checked and applied column migrations.")

    # 3. Confirm tables exist
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    expected_tables = [
        "organizations",
        "users",
        "projects",
        "project_members",
        "tasks",
        "material_logs",
        "project_drawings",
        "rera_certificates",
        "site_photos",
        "delay_recovery_evaluations",
    ]

    print("\n--- Database Tables Verification ---")
    all_present = True
    for table in expected_tables:
        if table in existing_tables:
            print(f"  [PASS] Table '{table}' exists.")
        else:
            print(f"  [FAIL] Table '{table}' is missing!")
            all_present = False

    print(f"\nTotal tables in database: {len(existing_tables)} -> {existing_tables}")
    return all_present, existing_tables


if __name__ == "__main__":
    success, tables = init_db()
    if success:
        print("\n[SUCCESS] All OptiBuild database tables successfully initialized and confirmed.")
        sys.exit(0)
    else:
        print("\n[ERROR] Some tables failed to be created.")
        sys.exit(1)

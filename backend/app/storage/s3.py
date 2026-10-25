import os
from pathlib import Path
from typing import Optional
import boto3
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"


class S3StorageManager:
    """
    S3-compatible object storage abstraction supporting Cloudflare R2, AWS S3, and MinIO,
    with local disk fallback when cloud S3 credentials are not configured or network fails.
    LOCKED RULES ENFORCEMENT:
    - Architect files: attach-only, stored for human viewing, NEVER parsed.
    - Bill photos: stored as unparsed documentary evidence only.
    """

    def __init__(self):
        self.endpoint_url = os.getenv("S3_ENDPOINT_URL", "http://localhost:9000")
        self.access_key = os.getenv("S3_ACCESS_KEY", "mock_access_key")
        self.secret_key = os.getenv("S3_SECRET_KEY", "mock_secret_key")
        self.bucket_name = os.getenv("S3_BUCKET_NAME", "optibuild-artifacts")
        self.region = os.getenv("S3_REGION", "ap-south-1")

        try:
            self.client = boto3.client(
                "s3",
                endpoint_url=self.endpoint_url,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                region_name=self.region,
            )
        except Exception:
            self.client = None

    def _save_local_fallback(self, file_bytes: bytes, category: str, file_name: str) -> str:
        target_dir = UPLOAD_DIR / category
        target_dir.mkdir(parents=True, exist_ok=True)
        target_path = target_dir / file_name
        with open(target_path, "wb") as f:
            f.write(file_bytes)
        return f"/uploads/{category}/{file_name}"

    def upload_file(self, file_bytes: bytes, category: str, file_name: str, metadata: Optional[dict] = None) -> str:
        key = f"{category}/{file_name}"
        if self.client:
            try:
                kwargs = {
                    "Bucket": self.bucket_name,
                    "Key": key,
                    "Body": file_bytes,
                }
                if metadata:
                    kwargs["Metadata"] = metadata
                self.client.put_object(**kwargs)
                return f"{self.endpoint_url}/{self.bucket_name}/{key}"
            except Exception as e:
                # If network/auth failure occurs during live run, fallback locally
                pass

        return self._save_local_fallback(file_bytes, category, file_name)

    def upload_architect_drawing(self, file_bytes: bytes, file_name: str) -> str:
        """
        Stores an architectural CAD/PDF drawing for human viewing only.
        LOCKED RULE: Never parse or OCR architectural drawings.
        """
        return self.upload_file(
            file_bytes=file_bytes,
            category="architect_drawings",
            file_name=file_name,
            metadata={"type": "architect_drawing_attach_only", "unparsed": "true"},
        )

    def upload_bill_evidence(self, file_bytes: bytes, file_name: str) -> str:
        """
        Stores material invoice receipt photo as unparsed evidence.
        LOCKED RULE: Bill photos are stored as unparsed evidence only.
        """
        return self.upload_file(
            file_bytes=file_bytes,
            category="bill_evidence",
            file_name=file_name,
            metadata={"type": "unparsed_bill_evidence", "unparsed": "true"},
        )

    def upload_rera_pdf(self, file_bytes: bytes, file_name: str) -> str:
        """
        Stores original MahaRERA certificate PDF.
        """
        return self.upload_file(
            file_bytes=file_bytes,
            category="rera_certificates",
            file_name=file_name,
            metadata={"type": "maharera_certificate_raw"},
        )

    def upload_site_photo(self, file_bytes: bytes, file_name: str) -> str:
        """
        Stores site photo for progress tracking.
        """
        return self.upload_file(
            file_bytes=file_bytes,
            category="site_photos",
            file_name=file_name,
            metadata={"type": "site_photo"},
        )


storage = S3StorageManager()

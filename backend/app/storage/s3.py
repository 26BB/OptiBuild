import os
from typing import Optional
import boto3
from botocore.exceptions import ClientError


class S3StorageManager:
    """
    S3-compatible object storage abstraction supporting Cloudflare R2, AWS S3, and MinIO.
    LOCKED RULES ENFORCEMENT:
    - Architect files: attach-only, stored for human viewing, NEVER parsed.
    - Bill photos: stored as unparsed documentary evidence only.
    """

    def __init__(self):
        self.endpoint_url = os.getenv("S3_ENDPOINT_URL", "http://localhost:9000")
        self.access_key = os.getenv("S3_ACCESS_KEY", "optibuild_minio_admin")
        self.secret_key = os.getenv("S3_SECRET_KEY", "optibuild_minio_secret")
        self.bucket_name = os.getenv("S3_BUCKET_NAME", "optibuild-artifacts")
        self.region = os.getenv("S3_REGION", "us-east-1")

        self.client = boto3.client(
            "s3",
            endpoint_url=self.endpoint_url if self.endpoint_url else None,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name=self.region,
        )

    def ensure_bucket_exists(self) -> None:
        try:
            self.client.head_bucket(Bucket=self.bucket_name)
        except ClientError:
            try:
                self.client.create_bucket(Bucket=self.bucket_name)
            except Exception:
                pass

    def upload_architect_drawing(self, file_bytes: bytes, file_name: str) -> str:
        """
        Stores an architectural CAD/PDF drawing for human viewing only.
        LOCKED RULE: Never parse or OCR architectural drawings.
        """
        key = f"architect_drawings/{file_name}"
        self.client.put_object(
            Bucket=self.bucket_name,
            Key=key,
            Body=file_bytes,
            Metadata={"type": "architect_drawing_attach_only", "unparsed": "true"},
        )
        return f"{self.endpoint_url}/{self.bucket_name}/{key}"

    def upload_bill_evidence(self, file_bytes: bytes, file_name: str) -> str:
        """
        Stores material invoice receipt photo as unparsed evidence.
        LOCKED RULE: Bill photos are stored as unparsed evidence only.
        """
        key = f"bill_evidence/{file_name}"
        self.client.put_object(
            Bucket=self.bucket_name,
            Key=key,
            Body=file_bytes,
            Metadata={"type": "unparsed_bill_evidence", "unparsed": "true"},
        )
        return f"{self.endpoint_url}/{self.bucket_name}/{key}"


storage = S3StorageManager()

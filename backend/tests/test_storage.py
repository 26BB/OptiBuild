import os
import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from backend.app.storage.s3 import S3StorageManager, sanitize_filename, validate_file_content


def test_filename_sanitization():
    """Verifies path traversal removal, unsafe characters sanitization, and length capping."""
    # 1. Path traversal stripped
    assert sanitize_filename("../../../secret/file.pdf") == "file.pdf"
    assert sanitize_filename("..\\..\\windows\\system32\\calc.exe") == "calc.exe"

    # 2. Dangerous characters replaced
    sanitized = sanitize_filename("my drawing *&^%$#@! name.dwg")
    assert "*" not in sanitized and "&" not in sanitized and " " not in sanitized
    assert sanitized.endswith(".dwg")

    # 3. Length capped at 100 preserving extension
    long_name = "a" * 120 + ".pdf"
    capped = sanitize_filename(long_name)
    assert len(capped) <= 100
    assert capped.endswith(".pdf")


def test_magic_bytes_and_size_limits():
    """Validates magic byte enforcement and size limits returning 400 and 413."""
    # MahaRERA: must start with %PDF- and <= 10 MB
    with pytest.raises(HTTPException) as exc:
        validate_file_content("maharera", b"NOT_A_PDF_CONTENT", "cert.pdf")
    assert exc.value.status_code == 400
    assert "Expected a valid PDF document" in exc.value.detail

    with pytest.raises(HTTPException) as exc:
        oversized_pdf = b"%PDF-" + b"0" * (10 * 1024 * 1024 + 1)
        validate_file_content("maharera", oversized_pdf, "cert.pdf")
    assert exc.value.status_code == 413

    # Photos: must be JPEG, PNG, or WebP and <= 5 MB
    with pytest.raises(HTTPException) as exc:
        validate_file_content("site_photo", b"EXE_OR_SCRIPT_BYTES", "photo.jpg")
    assert exc.value.status_code == 400

    with pytest.raises(HTTPException) as exc:
        oversized_jpg = b"\xff\xd8\xff" + b"0" * (5 * 1024 * 1024 + 1)
        validate_file_content("bill_photo", oversized_jpg, "bill.jpg")
    assert exc.value.status_code == 413

    # Architect drawing: must be PDF, DWG, or image and <= 20 MB
    with pytest.raises(HTTPException) as exc:
        validate_file_content("architect_drawing", b"RANDOM_EXE_BYTES", "drawing.exe")
    assert exc.value.status_code == 400

    with pytest.raises(HTTPException) as exc:
        oversized_dwg = b"%PDF-" + b"0" * (20 * 1024 * 1024 + 1)
        validate_file_content("architect_drawing", oversized_dwg, "blueprint.pdf")
    assert exc.value.status_code == 413


def test_s3_storage_architect_file_unparsed_and_key_format():
    """Verifies {project_id}/{category}/{uuid4}_{filename} key structure, 10-min signed URL, and locked rule."""
    with patch("boto3.client") as mock_boto:
        mock_s3 = MagicMock()
        mock_boto.return_value = mock_s3
        mock_s3.generate_presigned_url.return_value = "https://s3.signed.url/drawing?token=signed600s"

        storage = S3StorageManager()
        test_bytes = b"%PDF-1.4 architectural drawing blueprint dummy content"
        url = storage.upload_architect_drawing(test_bytes, "floor_plan_rev3.dwg", project_id="proj-123")

        mock_s3.put_object.assert_called_once()
        call_kwargs = mock_s3.put_object.call_args[1]
        key = call_kwargs["Key"]

        # Validate key format: {project_id}/{category}/{uuid4}_{sanitized_filename}
        parts = key.split("/")
        assert parts[0] == "proj-123"
        assert parts[1] == "architect_drawings"
        assert parts[2].endswith("_floor_plan_rev3.dwg")
        assert len(parts[2].split("_")[0]) == 32  # uuid4 hex length

        # Locked rule: attach-only, unparsed
        assert call_kwargs["Metadata"]["type"] == "architect_drawing_attach_only"
        assert call_kwargs["Metadata"]["unparsed"] == "true"

        # Presigned 10-minute download URL
        mock_s3.generate_presigned_url.assert_called_once_with(
            "get_object",
            Params={"Bucket": storage.bucket_name, "Key": key},
            ExpiresIn=600,
        )
        assert url == "https://s3.signed.url/drawing?token=signed600s"


def test_s3_storage_bill_evidence_unparsed():
    """Verifies bill evidence key format, unparsed metadata, and 10-min signed download URL."""
    with patch("boto3.client") as mock_boto:
        mock_s3 = MagicMock()
        mock_boto.return_value = mock_s3
        mock_s3.generate_presigned_url.return_value = "https://s3.signed.url/bill?token=signed600s"

        storage = S3StorageManager()
        test_bytes = b"\xff\xd8\xff JPEG_IMAGE_RAW_BINARY_DATA"
        url = storage.upload_bill_evidence(test_bytes, "cement_invoice_8821.jpg", project_id="proj-456")

        mock_s3.put_object.assert_called_once()
        call_kwargs = mock_s3.put_object.call_args[1]
        key = call_kwargs["Key"]

        parts = key.split("/")
        assert parts[0] == "proj-456"
        assert parts[1] == "bill_evidence"
        assert parts[2].endswith("_cement_invoice_8821.jpg")

        # Locked rule: bill photos are stored as unparsed evidence only
        assert call_kwargs["Metadata"]["type"] == "unparsed_bill_evidence"
        assert call_kwargs["Metadata"]["unparsed"] == "true"
        assert url == "https://s3.signed.url/bill?token=signed600s"


def test_max_project_storage_quota_rejection():
    """Verifies that uploads exceeding MAX_PROJECT_STORAGE_MB are rejected with 413."""
    with patch("boto3.client") as mock_boto:
        mock_s3 = MagicMock()
        mock_boto.return_value = mock_s3

        storage = S3StorageManager()
        # Mock project already having 199 MB used
        with patch.object(storage, "get_project_storage_bytes", return_value=199 * 1024 * 1024):
            # Attempting to upload 2 MB when limit is 200 MB -> total 201 MB > 200 MB -> 413
            with pytest.raises(HTTPException) as exc:
                storage.check_project_quota("proj-test", new_bytes=2 * 1024 * 1024)
            assert exc.value.status_code == 413
            assert "Project storage limit exceeded" in exc.value.detail

import pytest
from unittest.mock import MagicMock, patch
from backend.app.storage.s3 import S3StorageManager

def test_s3_storage_architect_file_unparsed():
    with patch("boto3.client") as mock_boto:
        mock_s3 = MagicMock()
        mock_boto.return_value = mock_s3

        storage = S3StorageManager()
        test_bytes = b"%PDF-1.4 architectural drawing blueprint dummy content"
        url = storage.upload_architect_drawing(test_bytes, "floor_plan_rev3.dwg")

        mock_s3.put_object.assert_called_once()
        call_kwargs = mock_s3.put_object.call_args[1]
        assert call_kwargs["Key"] == "architect_drawings/floor_plan_rev3.dwg"
        assert call_kwargs["Body"] == test_bytes
        # Verify LOCKED RULE: attach-only, unparsed
        assert call_kwargs["Metadata"]["type"] == "architect_drawing_attach_only"
        assert call_kwargs["Metadata"]["unparsed"] == "true"
        assert "architect_drawings/floor_plan_rev3.dwg" in url

def test_s3_storage_bill_evidence_unparsed():
    with patch("boto3.client") as mock_boto:
        mock_s3 = MagicMock()
        mock_boto.return_value = mock_s3

        storage = S3StorageManager()
        test_bytes = b"JPEG_IMAGE_RAW_BINARY_DATA"
        url = storage.upload_bill_evidence(test_bytes, "cement_invoice_8821.jpg")

        mock_s3.put_object.assert_called_once()
        call_kwargs = mock_s3.put_object.call_args[1]
        assert call_kwargs["Key"] == "bill_evidence/cement_invoice_8821.jpg"
        assert call_kwargs["Body"] == test_bytes
        # Verify LOCKED RULE: bill photos are stored as unparsed evidence only
        assert call_kwargs["Metadata"]["type"] == "unparsed_bill_evidence"
        assert call_kwargs["Metadata"]["unparsed"] == "true"
        assert "bill_evidence/cement_invoice_8821.jpg" in url

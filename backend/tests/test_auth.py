import pytest
from starlette.testclient import TestClient
from backend.app.main import app
from backend.app.core.auth import hash_password, verify_password, create_access_token, decode_access_token

client = TestClient(app)

DEMO_ACCOUNTS = [
    ("admin@optibuild.io", "Admin@123", "admin"),
    ("pm@optibuild.io", "Pm@123", "project_manager"),
    ("engineer@optibuild.io", "Engineer@123", "site_engineer"),
    ("store@optibuild.io", "Store@123", "store_keeper"),
    ("architect@optibuild.io", "Architect@123", "architect"),
    ("accountant@optibuild.io", "Accountant@123", "accountant"),
    ("owner@optibuild.io", "Owner@123", "owner"),
]


def test_password_hashing():
    pw = "SecretPass#2026"
    hashed = hash_password(pw)
    assert hashed != pw
    assert verify_password(pw, hashed) is True
    assert verify_password("WrongPass", hashed) is False


def test_jwt_token_encode_decode():
    data = {"sub": "usr-123", "email": "test@optibuild.io", "role": "project_manager"}
    token = create_access_token(data)
    decoded = decode_access_token(token)
    assert decoded["sub"] == "usr-123"
    assert decoded["email"] == "test@optibuild.io"
    assert decoded["role"] == "project_manager"
    assert "exp" in decoded


@pytest.mark.parametrize("email,password,expected_role", DEMO_ACCOUNTS)
def test_login_all_demo_roles(email, password, expected_role):
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"
    assert body["user"]["email"] == email
    assert body["user"]["role"] == expected_role
    assert "access_token" in response.cookies


def test_login_invalid_password():
    response = client.post("/api/v1/auth/login", json={"email": "pm@optibuild.io", "password": "WrongPassword"})
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_login_nonexistent_user():
    response = client.post("/api/v1/auth/login", json={"email": "nobody@nowhere.com", "password": "AnyPassword"})
    assert response.status_code == 401


def test_auth_me_endpoint():
    # Login as PM
    login_resp = client.post("/api/v1/auth/login", json={"email": "pm@optibuild.io", "password": "Pm@123"})
    token = login_resp.json()["access_token"]

    # Call /me with Bearer token
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    data = me_resp.json()
    assert data["user"]["email"] == "pm@optibuild.io"
    assert data["user"]["role"] == "project_manager"


def test_logout_endpoint():
    response = client.post("/api/v1/auth/logout")
    assert response.status_code == 200
    assert response.json()["message"] == "Logged out successfully."


def test_verify_password_rejects_casing_variants():
    # Passwords must match strictly and reject casing variants
    hashed = hash_password("Pm@123")
    assert verify_password("Pm@123", hashed) is True
    assert verify_password("PM@123", hashed) is False
    assert verify_password("pm@123", hashed) is False


def test_jwt_secret_validation_rejects_short_or_missing(monkeypatch):
    from backend.app.core.config import Settings
    # Short secret
    monkeypatch.setenv("JWT_SECRET", "too-short")
    with pytest.raises(RuntimeError) as exc_info:
        Settings()
    assert "at least 32 characters" in str(exc_info.value)

    # Missing secret
    monkeypatch.delenv("JWT_SECRET", raising=False)
    with pytest.raises(RuntimeError) as exc_info:
        Settings()
    assert "missing or shorter than 32 characters" in str(exc_info.value)



def test_register_new_user_success():
    import uuid
    random_email = f"user_{uuid.uuid4().hex[:8]}@optibuild.io"
    payload = {
        "email": random_email,
        "password": "SecurePassword123",
        "full_name": "Test Site Engineer",
        "role": "site_engineer"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    body = response.json()
    assert "access_token" in body
    assert body["user"]["email"] == random_email
    assert body["user"]["role"] == "site_engineer"
    assert body["user"]["full_name"] == "Test Site Engineer"


def test_register_duplicate_email_fails():
    payload = {
        "email": "pm@optibuild.io",
        "password": "AnotherPassword123",
        "full_name": "Duplicate PM",
        "role": "project_manager"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_register_invalid_role_fails():
    import uuid
    payload = {
        "email": f"bad_role_{uuid.uuid4().hex[:6]}@optibuild.io",
        "password": "Password123",
        "full_name": "Bad Role User",
        "role": "superman"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "Invalid role" in response.json()["detail"]

import os
from datetime import datetime
from uuid import UUID

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=os.getenv("CORS_ORIGIN", "http://localhost:3000"))

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


def _admin_headers():
    return {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    }


def _error(message, status):
    return jsonify({"error": message}), status


def _require_admin():
    authorization = request.headers.get("Authorization", "")
    if not authorization.startswith("Bearer "):
        return _error("Authentication required.", 401)

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        return _error("Authentication required.", 401)

    try:
        response = requests.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={"apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": f"Bearer {token}"},
            timeout=15,
        )
        user = response.json() if response.ok else {}
    except (requests.RequestException, ValueError):
        return _error("Authentication service unavailable.", 503)

    if not user:
        return _error("Authentication required.", 401)
    if user.get("app_metadata", {}).get("role") != "admin":
        return _error("Administrator access required.", 403)
    return None


def _valid_update(payload):
    if not isinstance(payload, dict) or not payload:
        return None
    if set(payload) - {"email", "status", "createdAt"}:
        return None
    if "email" in payload and (not isinstance(payload["email"], str) or "@" not in payload["email"]):
        return None
    if "status" in payload and payload["status"] not in {"active", "invited", "suspended"}:
        return None
    if "createdAt" in payload:
        try:
            datetime.fromisoformat(payload["createdAt"].replace("Z", "+00:00"))
        except (AttributeError, ValueError):
            return None
    return payload


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/users")
def list_users():
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        return _error("Supabase admin credentials not configured.", 500)
    if error := _require_admin():
        return error

    try:
        response = requests.get(f"{SUPABASE_URL}/auth/v1/admin/users", headers=_admin_headers(), timeout=15)
    except requests.RequestException:
        return _error("Supabase request failed.", 502)
    if not response.ok:
        return _error("Supabase request failed.", response.status_code)

    try:
        payload = response.json()
    except ValueError:
        return _error("Supabase request failed.", 502)
    users = payload.get("users", []) if isinstance(payload, dict) else payload
    normalized = []
    for user in users:
        email = user.get("email") or ""
        user_metadata = user.get("user_metadata") or {}
        app_metadata = user.get("app_metadata") or {}
        normalized.append(
            {
                "id": user.get("id"),
                "email": email,
                "createdAt": user_metadata.get("createdAt") or user.get("created_at"),
                "status": app_metadata.get("status", "active"),
                "role": app_metadata.get("role", "member"),
                "username": user_metadata.get("username") or email.split("@")[0],
            }
        )

    return jsonify({"users": normalized})


@app.patch("/users/<user_id>")
def update_user(user_id: str):
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        return _error("Supabase admin credentials not configured.", 500)
    if error := _require_admin():
        return error
    try:
        UUID(user_id)
    except ValueError:
        return _error("Invalid user id.", 400)

    payload = _valid_update(request.get_json(silent=True))
    if payload is None:
        return _error("Invalid user update.", 400)
    update_payload = {}

    email = payload.get("email")
    if email:
        update_payload["email"] = email

    status = payload.get("status")
    created_at = payload.get("createdAt")
    user_metadata = {}
    app_metadata = {}
    if status:
        app_metadata["status"] = status
    if created_at:
        user_metadata["createdAt"] = created_at

    if app_metadata:
        update_payload["app_metadata"] = app_metadata
    if user_metadata:
        update_payload["user_metadata"] = user_metadata

    try:
        response = requests.put(
            f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}",
            headers={"Content-Type": "application/json", **_admin_headers()},
            json=update_payload,
            timeout=15,
        )
    except requests.RequestException:
        return _error("Supabase request failed.", 502)

    if not response.ok:
        return _error("Supabase request failed.", response.status_code)

    try:
        return jsonify(response.json())
    except ValueError:
        return _error("Supabase request failed.", 502)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

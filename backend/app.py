import os
import datetime
from functools import wraps

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from sqlalchemy import text, func
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from passlib.hash import pbkdf2_sha256 as hasher
import jwt

from db import Base, engine, SessionLocal, wait_for_db
from models import Document, User

# -------------------- Config --------------------
load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
JWT_ALG = "HS256"

# -------------------- DB init --------------------
def init_db():
    """Wait for MySQL, create tables, FULLTEXT index, and seed admin."""
    wait_for_db()
    Base.metadata.create_all(bind=engine, checkfirst=True)

    # Add FULLTEXT index (ignore if exists)
    with engine.begin() as conn:
        try:
            conn.execute(text(
                "ALTER TABLE documents ADD FULLTEXT ft_title_body (title, body)"
            ))
        except Exception:
            pass

    # Seed default admin when the users table is empty
    s = SessionLocal()
    try:
        if s.query(User).count() == 0:
            admin = User(
                username="admin",
                password_hash=hasher.hash("admin123"),
                role="admin",
            )
            s.add(admin)
            s.commit()
            print("[init] Seeded default admin user (admin / admin123)")
    finally:
        s.close()

init_db()

# -------------------- JWT helpers --------------------
def create_token(payload: dict, exp_minutes=120):
    payload = {
        **payload,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=exp_minutes),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def decode_token(token: str):
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])


def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "Missing token"}), 401
        token = auth.split(" ", 1)[1].strip()
        try:
            user = decode_token(token)
            request.user = user
        except Exception:
            return jsonify({"error": "Invalid token"}), 401
        return fn(*args, **kwargs)
    return wrapper


def roles_required(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = getattr(request, "user", None)
            if not user or user.get("role") not in roles:
                return jsonify({"error": "Forbidden"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

# -------------------- Health --------------------
@app.get("/api/health")
def health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

# -------------------- Auth --------------------
@app.post("/api/login")
def login():
    data = request.get_json(force=True)
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()
    if not username or not password:
        return jsonify({"error": "Missing credentials"}), 401

    s = SessionLocal()
    try:
        user = s.query(User).filter_by(username=username).first()
        if not user or not hasher.verify(password, user.password_hash):
            return jsonify({"error": "Invalid credentials"}), 401
        token = create_token({"id": user.id, "username": user.username, "role": user.role})
        return jsonify({"token": token, "role": user.role})
    finally:
        s.close()

# Admin creates users (keep existing)
@app.post("/api/users")
@auth_required
@roles_required("admin")
def create_user():
    data = request.get_json(force=True)
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()
    role = data.get("role", "user")
    if not username or not password:
        return jsonify({"error": "username/password required"}), 400

    s = SessionLocal()
    try:
        if s.query(User).filter_by(username=username).first():
            return jsonify({"error": "user exists"}), 409
        user = User(username=username, password_hash=hasher.hash(password), role=role)
        s.add(user)
        s.commit()
        return jsonify({"id": user.id}), 201
    finally:
        s.close()

# -------------------- Admin Dashboard APIs --------------------
def _admin_count(session: Session) -> int:
    return session.query(func.count(User.id)).filter(User.role == "admin").scalar() or 0


@app.get("/api/users/me")
@auth_required
def me():
    return jsonify(request.user)


@app.get("/api/users")
@auth_required
@roles_required("admin")
def users_list():
    s = SessionLocal()
    try:
        rows = (
            s.query(User.id, User.username, User.role, User.created_at)
            .order_by(User.id.asc())
            .all()
        )
        data = [
            {
                "id": r.id,
                "username": r.username,
                "role": r.role,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ]
        return jsonify(data)
    finally:
        s.close()


@app.patch("/api/users/<int:user_id>")
@auth_required
@roles_required("admin")
def users_update(user_id: int):
    payload = request.get_json(force=True)
    new_role = payload.get("role")
    new_password = payload.get("password")

    s = SessionLocal()
    try:
        u = s.query(User).get(user_id)
        if not u:
            return jsonify({"error": "not found"}), 404

        if new_role and u.role == "admin" and new_role != "admin":
            if _admin_count(s) <= 1:
                return jsonify({"error": "Cannot demote the last admin"}), 400

        if new_role:
            u.role = new_role
        if new_password:
            u.password_hash = hasher.hash(new_password)

        s.commit()
        return jsonify({"ok": True})
    finally:
        s.close()


@app.delete("/api/users/<int:user_id>")
@auth_required
@roles_required("admin")
def users_delete(user_id: int):
    acting = request.user
    s = SessionLocal()
    try:
        u = s.query(User).get(user_id)
        if not u:
            return jsonify({"error": "not found"}), 404

        if acting["id"] == u.id:
            return jsonify({"error": "Admins cannot delete themselves"}), 400

        if u.role == "admin" and _admin_count(s) <= 1:
            return jsonify({"error": "Cannot delete the last admin"}), 400

        s.delete(u)
        s.commit()
        return jsonify({"ok": True})
    finally:
        s.close()

# -------------------- Documents --------------------
@app.get("/api/docs")
@auth_required
def list_docs():
    s = SessionLocal()
    try:
        q = s.query(Document).order_by(Document.id.desc()).limit(50)
        data = [
            {
                "id": d.id,
                "title": d.title,
                "role": d.role,
                "created_at": d.created_at.isoformat() if d.created_at else None,
            }
            for d in q
        ]
        return jsonify(data)
    finally:
        s.close()


@app.post("/api/docs")
@auth_required
def create_doc():
    payload = request.get_json(force=True)
    title = payload.get("title", "Untitled")
    body = payload.get("body", "")
    role = payload.get("role", "user")
    s = SessionLocal()
    try:
        user = request.user
        doc = Document(title=title, body=body, role=role, user_id=user["id"])
        s.add(doc)
        s.commit()
        return jsonify({"id": doc.id}), 201
    finally:
        s.close()

# -------------------- Search --------------------
@app.get("/api/search")
@auth_required
def search_docs():
    q = (request.args.get("q") or "").strip()
    if not q:
        return jsonify([])
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                "SELECT id, title, role, created_at "
                "FROM documents WHERE MATCH(title, body) "
                "AGAINST (:q IN BOOLEAN MODE) "
                "ORDER BY id DESC LIMIT 50"
            ),
            {"q": q},
        ).mappings().all()
        data = [
            {
                "id": r["id"],
                "title": r["title"],
                "role": r["role"],
                "created_at": r["created_at"].isoformat() if r["created_at"] else None,
            }
            for r in rows
        ]
        return jsonify(data)

# -------------------- Run --------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)

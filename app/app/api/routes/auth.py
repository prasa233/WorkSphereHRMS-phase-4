
import os
import sqlite3
import hashlib
import hmac
import secrets
from pathlib import Path
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from jose import jwt

from fastapi.security import HTTPBearer

bearer_scheme = HTTPBearer()

router = APIRouter(prefix="/auth", tags=["Authentication"])

JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
TOKEN_MINUTES = 60

DB_PATH = os.getenv(
    "AUTH_DB_PATH",
    str(Path(__file__).resolve().parent / "auth.db"),
)


# -------------------- DATABASE --------------------

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'employee',
                created_at TEXT NOT NULL
            )
        """)


# -------------------- PASSWORD --------------------

def hash_password(password: str, salt: str) -> str:
    return hashlib.scrypt(
        password.encode("utf-8"),
        salt=bytes.fromhex(salt),
        n=2**14,
        r=8,
        p=1,
        dklen=32,
    ).hex()


# -------------------- JWT TOKEN --------------------

def create_access_token(user):
    if not JWT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="JWT_SECRET is not configured",
        )

    now = datetime.now(timezone.utc)

    return jwt.encode(
        {
            "sub": str(user["id"]),
            "email": user["email"],
            "role": user["role"],
            "iat": now,
            "exp": now + timedelta(minutes=TOKEN_MINUTES),
        },
        JWT_SECRET,
        algorithm=ALGORITHM,
    )


def authenticate_user(email: str, password: str):
    email = email.strip().lower()

    with get_connection() as conn:
        user = conn.execute(
            "SELECT * FROM users WHERE email = ?",
            (email,),
        ).fetchone()

    if user is None:
        return None

    password_hash = hash_password(password, user["salt"])

    if not hmac.compare_digest(
        password_hash,
        user["password_hash"],
    ):
        return None

    return user


# -------------------- REQUEST MODELS --------------------

class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


# -------------------- REGISTRATION JSON API --------------------

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest):
    name = data.name.strip()
    email = str(data.email).strip().lower()

    salt = secrets.token_hex(16)
    password_hash = hash_password(data.password, salt)

    try:
        with get_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO users
                (name, email, password_hash, salt, role, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    name,
                    email,
                    password_hash,
                    salt,
                    "employee",
                    datetime.now(timezone.utc).isoformat(),
                ),
            )
            user_id = cursor.lastrowid

    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists",
        )

    return {
        "message": "Registration successful",
        "user": {
            "id": user_id,
            "name": name,
            "email": email,
            "role": "employee",
        },
    }


# -------------------- LOGIN JSON API --------------------

@router.post("/login")
def login(data: LoginRequest):
    user = authenticate_user(
        str(data.email),
        data.password,
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(user)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
        },
    }


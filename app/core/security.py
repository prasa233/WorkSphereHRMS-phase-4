

import logging
from types import SimpleNamespace

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.db.session import get_db

logger = logging.getLogger(__name__)
bearer_scheme = HTTPBearer()

import os
import sqlite3
from pathlib import Path
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")

JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET is missing from backend/.env")

AUTH_DB_PATH = Path(
    os.getenv(
        "AUTH_DB_PATH",
        BACKEND_DIR / "app" / "app" / "api" / "routes" / "auth.db",
    )
).resolve()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials are missing",
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET,
            algorithms=["HS256"],
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(401, "Invalid authentication token")

        with sqlite3.connect(str(AUTH_DB_PATH)) as connection:
            connection.row_factory = sqlite3.Row

            columns = {
                row["name"]
                for row in connection.execute("PRAGMA table_info(users)")
            }
            employee_column = ", employee_id" if "employee_id" in columns else ""

            user = connection.execute(
                f"""
                SELECT id, name, email, role{employee_column}
                FROM users
                WHERE id = ?
                """,
                (user_id,),
            ).fetchone()

        if user is None:
            raise HTTPException(401, "User not found")

        return SimpleNamespace(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            role=user["role"],
            employee_id=user["employee_id"] if "employee_id" in columns else None,
        )

    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid authentication token")
    except sqlite3.Error as exc:
        logger.exception("SQLite user lookup failed")
        raise HTTPException(
            status_code=503,
            detail="Authentication database unavailable",
        ) from exc
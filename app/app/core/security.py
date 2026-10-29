
import os
import sqlite3
from pathlib import Path
from passlib.context import CryptContext
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from dotenv import load_dotenv

# security.py is located in backend/app/app/core/
# Go up four levels to reach the backend folder.
BACKEND_DIR = Path(__file__).resolve().parents[3]
ENV_FILE = BACKEND_DIR / ".env"

# Explicitly load backend/.env
load_dotenv(dotenv_path=ENV_FILE)

JWT_SECRET = os.getenv("JWT_SECRET")

if not JWT_SECRET:
    raise RuntimeError(
        f"JWT_SECRET is missing or empty. "
        f"Please configure it in: {ENV_FILE}"
    )

# JWT configuration
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"

if not JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET is not configured. Set it in your environment."
    )

bearer_scheme = HTTPBearer(auto_error=False)

# Database path
DB_PATH = Path(
    os.getenv(
        "AUTH_DB_PATH",
        Path(__file__).resolve().parents[1] / "api" / "routes" / "auth.db",
    )
).resolve()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Decode JWT and return the authenticated user as a dictionary."""

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials are missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub") or payload.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token does not contain a user ID",
        )

    connection = None

    try:
        connection = sqlite3.connect(str(DB_PATH))
        connection.row_factory = sqlite3.Row

        cursor = connection.cursor()

        # IMPORTANT: SQL must be inside a Python string.
        cursor.execute(
    """
    SELECT id, name, email, role, employee_id
    FROM users
    WHERE id = ?
    """,
    (user_id,),
)
        row = cursor.fetchone()
        if row is None:
            raise HTTPException(status_code=401, detail="User not found")
        return dict(row)
    except HTTPException:
        raise
    except sqlite3.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while retrieving user",
        ) from exc
    finally:
        if connection is not None:
            connection.close()
 

# Password hashing configuration
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def hash_password(password: str) -> str:
    """Hash a plain-text password."""
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """Verify a plain-text password against its stored hash."""
    return pwd_context.verify(
        plain_password,
        hashed_password,
    )           
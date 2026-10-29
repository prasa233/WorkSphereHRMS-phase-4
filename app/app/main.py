from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.app.core.config import settings
from app.app.api.routes.phase4 import router as phase4_router
from app.app.api.routes.profile import router as profile_router
from app.app.api.routes.integrations import router as integrations_router
from app.app.api.routes.auth import router as auth_router
import logging
from app.app.database import get_db
from app.core.db.session import Base, engine
from app.models import phase4 as phase4_models
from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.app.database import Base, engine, get_db
from app.app.models import User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Creates tables for this small example.
# For a production app, use database migrations instead.
Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    try:
        user = db.execute(
            select(User).where(User.id == user_id)
        ).scalar_one_or_none()
    except SQLAlchemyError:
        # Full error goes to the server log, not the API response.
        logger.exception("Database error while retrieving user_id=%s", user_id)
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve user right now. Please try again later.",
        )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail=f"User with id {user_id} was not found.",
        )

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
    }
app = FastAPI(
    title="WorkSphere HRMS",
    version="4.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth_router)
app.include_router(phase4_router)
app.include_router(profile_router)
app.include_router(integrations_router)


@app.get("/")
def root():
    return {
        "application": "WorkSphere HRMS",
        "phase": 4,
        "status": "running",
    }
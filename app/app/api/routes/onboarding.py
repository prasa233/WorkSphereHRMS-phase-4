from fastapi import Depends
from app.app.core.security import get_current_user

@router.post("/onboarding")
def create_onboarding(
    data: OnboardingRequest,
    current_user=Depends(get_current_user),
):
    # Continue with your existing onboarding logic.
    # Use current_user["id"] if the route expects the user's ID.

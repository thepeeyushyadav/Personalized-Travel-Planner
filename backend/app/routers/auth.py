from fastapi import APIRouter, HTTPException, status
from app.models.schemas import UserRegister, UserLogin, TokenResponse
from app.config.database import get_client

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    """Register a new user with Supabase Auth."""
    try:
        supabase = get_client()
        response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {"data": {"full_name": user_data.full_name}}
        })

        if response.user is None:
            raise HTTPException(status_code=400, detail="Registration failed. Email may already be in use.")

        return TokenResponse(
            access_token=response.session.access_token if response.session else "",
            user_id=str(response.user.id),
            email=response.user.email,
            full_name=user_data.full_name
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login with email and password."""
    try:
        supabase = get_client()
        response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })

        if response.user is None:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        full_name = ""
        if response.user.user_metadata:
            full_name = response.user.user_metadata.get("full_name", "")

        return TokenResponse(
            access_token=response.session.access_token,
            user_id=str(response.user.id),
            email=response.user.email,
            full_name=full_name
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password.")


@router.post("/logout")
async def logout():
    """Logout current user."""
    try:
        supabase = get_client()
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        return {"message": "Logged out"}


@router.get("/me")
async def get_me(token: str):
    """Get current user profile."""
    try:
        supabase = get_client()
        user = supabase.auth.get_user(token)
        if user.user is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {
            "user_id": str(user.user.id),
            "email": user.user.email,
            "full_name": user.user.user_metadata.get("full_name", "")
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

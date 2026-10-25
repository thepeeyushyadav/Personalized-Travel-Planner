from fastapi import APIRouter, HTTPException, Header
from app.config.database import get_service_client

router = APIRouter()


def get_user_from_token(authorization: str) -> str:
    from app.config.database import get_client
    try:
        token = authorization.replace("Bearer ", "")
        supabase = get_client()
        user = supabase.auth.get_user(token)
        return str(user.user.id)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.get("/")
async def get_trip_history(authorization: str = Header(...)):
    """Get all trip history for the user."""
    user_id = get_user_from_token(authorization)
    try:
        supabase = get_service_client()
        result = supabase.table("trip_history").select(
            "*, trips(title, destination, start_date, end_date)"
        ).eq("user_id", user_id).order("created_at", desc=True).execute()
        return {"history": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trips")
async def get_completed_trips(authorization: str = Header(...)):
    """Get all trips (past and present) for the user."""
    user_id = get_user_from_token(authorization)
    try:
        supabase = get_service_client()
        result = supabase.table("trips").select(
            "*, itineraries(day_number, estimated_cost)"
        ).eq("user_id", user_id).order("created_at", desc=True).execute()
        return {"trips": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, HTTPException, Header
from typing import List
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


@router.get("/{trip_id}")
async def get_itinerary(trip_id: str, authorization: str = Header(...)):
    """Get full itinerary for a trip."""
    user_id = get_user_from_token(authorization)
    try:
        supabase = get_service_client()
        # Verify trip belongs to user
        trip = supabase.table("trips").select("id, user_id, is_shared").eq("id", trip_id).single().execute()
        if not trip.data:
            raise HTTPException(status_code=404, detail="Trip not found")
        if trip.data["user_id"] != user_id and not trip.data["is_shared"]:
            raise HTTPException(status_code=403, detail="Access denied")

        result = supabase.table("itineraries").select("*").eq("trip_id", trip_id).order("day_number").execute()
        return {"trip_id": trip_id, "days": result.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/shared/{share_token}")
async def get_shared_itinerary(share_token: str):
    """Get itinerary via share token (public access)."""
    try:
        supabase = get_service_client()
        trip = supabase.table("trips").select("*").eq("share_token", share_token).eq("is_shared", True).single().execute()
        if not trip.data:
            raise HTTPException(status_code=404, detail="Shared itinerary not found")

        itinerary = supabase.table("itineraries").select("*").eq("trip_id", trip.data["id"]).order("day_number").execute()
        return {"trip": trip.data, "days": itinerary.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

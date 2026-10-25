from fastapi import APIRouter, HTTPException, Header
from typing import List
from app.models.schemas import SavedPlaceCreate, SavedPlaceResponse
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


@router.post("/", response_model=SavedPlaceResponse)
async def save_place(place: SavedPlaceCreate, authorization: str = Header(...)):
    """Save a new place."""
    user_id = get_user_from_token(authorization)
    try:
        supabase = get_service_client()
        data = place.model_dump()
        data["user_id"] = user_id
        result = supabase.table("saved_places").insert(data).execute()
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to save place")
        return SavedPlaceResponse(**result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[SavedPlaceResponse])
async def get_saved_places(authorization: str = Header(...)):
    """Get all saved places for the user."""
    user_id = get_user_from_token(authorization)
    try:
        supabase = get_service_client()
        result = supabase.table("saved_places").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return [SavedPlaceResponse(**p) for p in result.data]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{place_id}")
async def delete_saved_place(place_id: str, authorization: str = Header(...)):
    """Delete a saved place."""
    user_id = get_user_from_token(authorization)
    try:
        supabase = get_service_client()
        supabase.table("saved_places").delete().eq("id", place_id).eq("user_id", user_id).execute()
        return {"message": "Place removed from saved places"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

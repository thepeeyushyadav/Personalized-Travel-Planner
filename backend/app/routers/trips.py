from fastapi import APIRouter, HTTPException, Header
from typing import List, Optional
from app.models.schemas import TripCreate, TripUpdate, TripResponse, ItineraryGenerateRequest
from app.config.database import get_client, get_service_client
from app.services.ai_service import generate_itinerary
import secrets

router = APIRouter()


def get_user_from_token(authorization: str) -> str:
    """Extract user ID from Supabase JWT token."""
    try:
        token = authorization.replace("Bearer ", "")
        supabase = get_client()
        user = supabase.auth.get_user(token)
        return str(user.user.id)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.post("/", response_model=TripResponse)
async def create_trip(trip: TripCreate, authorization: str = Header(...)):
    """Create a new trip."""
    user_id = get_user_from_token(authorization)
    try:
        supabase = get_service_client()
        data = trip.model_dump()
        data["user_id"] = user_id
        data["start_date"] = str(data["start_date"])
        data["end_date"] = str(data["end_date"])
        data["status"] = "draft"
        data["is_shared"] = False

        result = supabase.table("trips").insert(data).execute()
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to create trip")
        return TripResponse(**result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[TripResponse])
async def get_trips(authorization: str = Header(...)):
    """Get all trips for the current user."""
    user_id = get_user_from_token(authorization)
    try:
        supabase = get_service_client()
        result = supabase.table("trips").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return [TripResponse(**trip) for trip in result.data]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(trip_id: str, authorization: str = Header(...)):
    """Get a specific trip by ID."""
    user_id = get_user_from_token(authorization)
    try:
        supabase = get_service_client()
        result = supabase.table("trips").select("*").eq("id", trip_id).eq("user_id", user_id).single().execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Trip not found")
        return TripResponse(**result.data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{trip_id}", response_model=TripResponse)
async def update_trip(trip_id: str, update: TripUpdate, authorization: str = Header(...)):
    """Update a trip."""
    user_id = get_user_from_token(authorization)
    try:
        supabase = get_service_client()
        data = {k: v for k, v in update.model_dump().items() if v is not None}
        if "start_date" in data:
            data["start_date"] = str(data["start_date"])
        if "end_date" in data:
            data["end_date"] = str(data["end_date"])

        result = supabase.table("trips").update(data).eq("id", trip_id).eq("user_id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Trip not found")
        return TripResponse(**result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{trip_id}")
async def delete_trip(trip_id: str, authorization: str = Header(...)):
    """Delete a trip."""
    user_id = get_user_from_token(authorization)
    try:
        supabase = get_service_client()
        supabase.table("trips").delete().eq("id", trip_id).eq("user_id", user_id).execute()
        return {"message": "Trip deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{trip_id}/generate")
async def generate_trip_itinerary(trip_id: str, authorization: str = Header(...)):
    """Generate AI itinerary for a trip."""
    user_id = get_user_from_token(authorization)
    try:
        supabase = get_service_client()

        # Get trip data
        trip_result = supabase.table("trips").select("*").eq("id", trip_id).eq("user_id", user_id).single().execute()
        if not trip_result.data:
            raise HTTPException(status_code=404, detail="Trip not found")

        trip_data = trip_result.data

        # Generate itinerary with AI
        ai_result = await generate_itinerary(trip_data)

        # Save each day to database
        itinerary_days = ai_result.get("itinerary", [])
        saved_days = []

        # Delete existing itinerary days for regeneration
        supabase.table("itineraries").delete().eq("trip_id", trip_id).execute()

        for day in itinerary_days:
            day_record = {
                "trip_id": trip_id,
                "day_number": day.get("day", 1),
                "date": day.get("date"),
                "morning_activities": day.get("morning", []),
                "afternoon_activities": day.get("afternoon", []),
                "evening_activities": day.get("evening", []),
                "accommodation": day.get("accommodation", {}),
                "meals": day.get("meals", {}),
                "transportation": {"tips": day.get("transportation", "")},
                "estimated_cost": day.get("daily_cost_estimate", 0),
                "notes": day.get("day_highlights", "")
            }
            result = supabase.table("itineraries").insert(day_record).execute()
            if result.data:
                saved_days.append(result.data[0])

        # Update trip status to active
        supabase.table("trips").update({"status": "active"}).eq("id", trip_id).execute()

        # Log to history
        supabase.table("trip_history").insert({
            "trip_id": trip_id,
            "user_id": user_id,
            "action": "itinerary_generated",
            "details": {"total_days": len(itinerary_days), "total_cost": ai_result.get("total_estimated_cost", 0)}
        }).execute()

        return {
            "trip_id": trip_id,
            "itinerary": saved_days,
            "trip_summary": ai_result.get("trip_summary", ""),
            "total_estimated_cost": ai_result.get("total_estimated_cost", 0),
            "tips": ai_result.get("tips", [])
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{trip_id}/share")
async def share_trip(trip_id: str, authorization: str = Header(...)):
    """Generate a shareable link for the trip."""
    user_id = get_user_from_token(authorization)
    try:
        supabase = get_service_client()
        share_token = secrets.token_urlsafe(16)
        result = supabase.table("trips").update({
            "is_shared": True,
            "share_token": share_token
        }).eq("id", trip_id).eq("user_id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Trip not found")
        return {"share_token": share_token, "message": "Trip is now shareable"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

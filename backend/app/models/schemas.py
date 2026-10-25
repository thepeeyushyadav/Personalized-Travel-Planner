from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID


# ─────────────────────────────────────────────
# AUTH SCHEMAS
# ─────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=2)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: Optional[str] = None


# ─────────────────────────────────────────────
# TRIP SCHEMAS
# ─────────────────────────────────────────────

class TripCreate(BaseModel):
    title: str = Field(min_length=2)
    destination: str = Field(min_length=2)
    start_date: date
    end_date: date
    budget: Optional[float] = None
    currency: str = "USD"
    group_size: int = Field(default=1, ge=1, le=50)
    travel_style: Optional[str] = "moderate"
    vibe: Optional[str] = "culture"
    interests: Optional[List[str]] = []
    dietary_restrictions: Optional[List[str]] = []
    mobility_concerns: Optional[str] = None


class TripUpdate(BaseModel):
    title: Optional[str] = None
    destination: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[float] = None
    currency: Optional[str] = None
    group_size: Optional[int] = None
    travel_style: Optional[str] = None
    vibe: Optional[str] = None
    interests: Optional[List[str]] = None
    dietary_restrictions: Optional[List[str]] = None
    mobility_concerns: Optional[str] = None
    status: Optional[str] = None


class TripResponse(BaseModel):
    id: str
    user_id: str
    title: str
    destination: str
    start_date: str
    end_date: str
    budget: Optional[float] = None
    currency: str
    group_size: int
    travel_style: Optional[str] = None
    vibe: Optional[str] = None
    interests: Optional[List[str]] = []
    dietary_restrictions: Optional[List[str]] = []
    mobility_concerns: Optional[str] = None
    status: str
    is_shared: bool
    share_token: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


# ─────────────────────────────────────────────
# ITINERARY SCHEMAS
# ─────────────────────────────────────────────

class ItineraryGenerateRequest(BaseModel):
    trip_id: str


class ItineraryDayResponse(BaseModel):
    id: str
    trip_id: str
    day_number: int
    date: Optional[str] = None
    morning_activities: list = []
    afternoon_activities: list = []
    evening_activities: list = []
    accommodation: dict = {}
    meals: dict = {}
    transportation: dict = {}
    estimated_cost: Optional[float] = None
    notes: Optional[str] = None


# ─────────────────────────────────────────────
# SAVED PLACES SCHEMAS
# ─────────────────────────────────────────────

class SavedPlaceCreate(BaseModel):
    name: str
    location: str
    category: Optional[str] = "other"
    description: Optional[str] = None
    rating: Optional[float] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None
    coordinates: Optional[dict] = {}


class SavedPlaceResponse(BaseModel):
    id: str
    user_id: str
    name: str
    location: str
    category: Optional[str]
    description: Optional[str]
    rating: Optional[float]
    image_url: Optional[str]
    notes: Optional[str]
    coordinates: Optional[dict]
    created_at: Optional[str]

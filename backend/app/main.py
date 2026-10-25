from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from app.routers import auth, trips, itineraries, places, history

app = FastAPI(
    title="Personalized Travel Itinerary Planner API",
    description="AI-powered travel itinerary generation with FastAPI, Supabase, and Groq",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS Configuration
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(trips.router, prefix="/api/trips", tags=["Trips"])
app.include_router(itineraries.router, prefix="/api/itineraries", tags=["Itineraries"])
app.include_router(places.router, prefix="/api/places", tags=["Saved Places"])
app.include_router(history.router, prefix="/api/history", tags=["Trip History"])


@app.get("/")
async def root():
    return {
        "message": "Personalized Travel Itinerary Planner API",
        "version": "1.0.0",
        "docs": "/api/docs"
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "travel-planner-api"}

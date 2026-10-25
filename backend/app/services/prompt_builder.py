from typing import Dict, Any


def build_itinerary_prompt(trip_data: Dict[str, Any]) -> str:
    """
    Constructs a dynamic AI prompt from user trip inputs.
    Acts as the prompt-engineering layer between FastAPI and LLM providers.
    """
    destination = trip_data.get("destination", "")
    start_date = trip_data.get("start_date", "")
    end_date = trip_data.get("end_date", "")
    budget = trip_data.get("budget", "flexible")
    currency = trip_data.get("currency", "USD")
    group_size = trip_data.get("group_size", 1)
    travel_style = trip_data.get("travel_style", "moderate")
    vibe = trip_data.get("vibe", "culture")
    interests = trip_data.get("interests", [])
    dietary = trip_data.get("dietary_restrictions", [])
    mobility = trip_data.get("mobility_concerns", "")

    # Pacing instructions
    pacing_map = {
        "relaxed": "Keep the schedule relaxed with few activities per day, plenty of rest time, and no rushing.",
        "moderate": "Balance activities with some downtime. Aim for 3-4 activities per day.",
        "fast": "Pack in as many experiences as possible. Optimize routes to minimize travel time."
    }
    pacing_instruction = pacing_map.get(travel_style, pacing_map["moderate"])

    # Vibe instructions
    vibe_map = {
        "adventure": "Focus on outdoor activities, hiking, extreme sports, and nature experiences.",
        "luxury": "Recommend premium hotels, fine dining, private tours, and exclusive experiences.",
        "budget": "Prioritize free attractions, budget-friendly restaurants, hostels, and public transport.",
        "romantic": "Suggest intimate restaurants, scenic viewpoints, couples activities, and cozy stays.",
        "family": "Include family-friendly activities, child-safe venues, and diverse dining options.",
        "culture": "Emphasize museums, historical sites, local festivals, traditional food, and art."
    }
    vibe_instruction = vibe_map.get(vibe, vibe_map["culture"])

    interests_str = ", ".join(interests) if interests else "general tourism"
    dietary_str = ", ".join(dietary) if dietary else "no restrictions"
    mobility_str = f"Mobility concerns: {mobility}." if mobility else ""

    prompt = f"""You are an expert travel planner. Create a detailed, day-by-day travel itinerary.

TRIP DETAILS:
- Destination: {destination}
- Travel Dates: {start_date} to {end_date}
- Budget: {budget} {currency} total
- Group Size: {group_size} person(s)
- Travel Style: {travel_style}
- Vibe/Theme: {vibe}
- Interests: {interests_str}
- Dietary Restrictions: {dietary_str}
{mobility_str}

INSTRUCTIONS:
{pacing_instruction}
{vibe_instruction}

For EACH day, provide:
1. Morning activities (2-3 items with time, location, description, estimated cost)
2. Afternoon activities (2-3 items with time, location, description, estimated cost)
3. Evening activities (1-2 items with time, location, description, estimated cost)
4. Recommended lunch and dinner (name, cuisine, price range, location)
5. Accommodation suggestion (name, type, price per night)
6. Transportation tips for the day
7. Total estimated cost for the day

FORMAT your response as valid JSON with this structure:
{{
  "itinerary": [
    {{
      "day": 1,
      "date": "YYYY-MM-DD",
      "morning": [
        {{"time": "09:00", "activity": "name", "location": "address", "description": "details", "cost": 0, "duration": "1h"}}
      ],
      "afternoon": [...],
      "evening": [...],
      "meals": {{
        "lunch": {{"name": "restaurant", "cuisine": "type", "price_range": "$10-20", "location": "address"}},
        "dinner": {{"name": "restaurant", "cuisine": "type", "price_range": "$20-40", "location": "address"}}
      }},
      "accommodation": {{"name": "hotel", "type": "hotel/hostel/airbnb", "price_per_night": 0, "location": "address"}},
      "transportation": "tips for the day",
      "daily_cost_estimate": 0,
      "day_highlights": "1-2 sentence summary of the day"
    }}
  ],
  "trip_summary": "overall trip summary",
  "total_estimated_cost": 0,
  "tips": ["tip1", "tip2", "tip3"]
}}

Generate a complete, realistic itinerary now. Respond ONLY with valid JSON."""

    return prompt


SYSTEM_PROMPT = """You are an expert travel planner with 20 years of experience. 
You provide accurate, realistic, and personalized travel itineraries. 
You always respond with valid JSON format. 
You consider budget constraints, travel pace, and personal preferences.
You suggest both popular attractions and hidden gems."""

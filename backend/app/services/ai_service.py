import os
import json
import re
from typing import Dict, Any
from dotenv import load_dotenv

from app.services.llm_providers import GroqProvider, HuggingFaceProvider, OllamaProvider, LLMProvider
from app.services.prompt_builder import build_itinerary_prompt, SYSTEM_PROMPT

load_dotenv()


def get_llm_provider() -> LLMProvider:
    """Factory function to get the configured LLM provider."""
    provider = os.getenv("LLM_PROVIDER", "groq").lower()

    if provider == "groq":
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not configured")
        return GroqProvider(api_key=api_key)

    elif provider == "huggingface":
        api_key = os.getenv("HUGGINGFACE_API_KEY")
        if not api_key:
            raise ValueError("HUGGINGFACE_API_KEY not configured")
        return HuggingFaceProvider(api_key=api_key)

    elif provider == "ollama":
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        model = os.getenv("OLLAMA_MODEL", "llama3")
        return OllamaProvider(base_url=base_url, model=model)

    else:
        raise ValueError(f"Unknown LLM_PROVIDER: {provider}")


async def generate_itinerary(trip_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main AI orchestration function.
    Connects prompt templates with LLM provider to produce dynamic itineraries.
    """
    try:
        provider = get_llm_provider()
        prompt = build_itinerary_prompt(trip_data)
        raw_response = await provider.generate(prompt, SYSTEM_PROMPT)

        # Extract JSON from response
        json_match = re.search(r'\{.*\}', raw_response, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group())
            return parsed
        else:
            # Try parsing the entire response as JSON
            return json.loads(raw_response)

    except json.JSONDecodeError:
        # Return structured fallback if JSON parsing fails
        return _generate_fallback_itinerary(trip_data)
    except Exception as e:
        raise Exception(f"AI generation failed: {str(e)}")


def _generate_fallback_itinerary(trip_data: Dict[str, Any]) -> Dict[str, Any]:
    """Fallback itinerary template if AI generation fails."""
    destination = trip_data.get("destination", "your destination")
    return {
        "itinerary": [
            {
                "day": 1,
                "date": str(trip_data.get("start_date", "")),
                "morning": [
                    {
                        "time": "09:00",
                        "activity": f"Explore {destination} City Center",
                        "location": f"{destination} Downtown",
                        "description": "Start your journey by exploring the city center and main landmarks.",
                        "cost": 0,
                        "duration": "2h"
                    }
                ],
                "afternoon": [
                    {
                        "time": "14:00",
                        "activity": "Local Market Visit",
                        "location": f"{destination} Market",
                        "description": "Experience local culture and cuisine at the famous market.",
                        "cost": 15,
                        "duration": "2h"
                    }
                ],
                "evening": [
                    {
                        "time": "19:00",
                        "activity": "Sunset Viewpoint",
                        "location": f"{destination} Viewpoint",
                        "description": "Enjoy a beautiful sunset over the city.",
                        "cost": 0,
                        "duration": "1h"
                    }
                ],
                "meals": {
                    "lunch": {"name": "Local Restaurant", "cuisine": "Local", "price_range": "$10-20", "location": destination},
                    "dinner": {"name": "City Bistro", "cuisine": "International", "price_range": "$20-40", "location": destination}
                },
                "accommodation": {"name": "City Hotel", "type": "hotel", "price_per_night": 80, "location": destination},
                "transportation": "Use local buses and walking for short distances.",
                "daily_cost_estimate": 120,
                "day_highlights": f"First day exploring {destination}'s main attractions and getting oriented."
            }
        ],
        "trip_summary": f"A wonderful trip to {destination}.",
        "total_estimated_cost": trip_data.get("budget", 500),
        "tips": [
            "Book accommodations in advance",
            "Carry local currency",
            "Learn a few phrases in the local language"
        ]
    }

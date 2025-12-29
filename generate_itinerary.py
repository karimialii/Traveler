#!/usr/bin/env python3
"""
Travel Itinerary Generator using Google Gemini
Generates personalized travel plans based on destination and dates
"""

import json
import sys
import os
from datetime import datetime, timedelta
from google import genai

# Initialize Gemini client
client = genai.Client(api_key=os.getenv("GOOGLE_GEMINI_KEY"))


def generate_itinerary(travel_data: dict) -> list:
    """
    Generate a travel itinerary using Google Gemini AI.
    
    Args:
        travel_data: Dictionary containing:
            - destination: str
            - departureDate: str (YYYY-MM-DD)
            - departureTime: str (HH:MM)
            - arrivalDate: str (YYYY-MM-DD)
            - arrivalTime: str (HH:MM)
            - returnDate: str (YYYY-MM-DD)
            - returnTime: str (HH:MM)
            - hotels: list of hotel info
    
    Returns:
        List of itinerary items with date, time, activity, location, description, type
    """
    
    destination = travel_data.get("destination", "")
    arrival_date = travel_data.get("arrivalDate", "")
    arrival_time = travel_data.get("arrivalTime", "12:00")
    return_date = travel_data.get("returnDate", "")
    return_time = travel_data.get("returnTime", "18:00")
    hotels = travel_data.get("hotels", [])
    
    # Build hotel info for context
    hotel_info = ""
    if hotels:
        hotel_info = "\n".join([
            f"- {h.get('name', 'Hotel')} at {h.get('location', 'Unknown')} (Check-in: {h.get('checkInDate')}, Check-out: {h.get('checkOutDate')})"
            for h in hotels
        ])
    
    # Create prompt for Gemini
    prompt = f"""Generate a detailed day-by-day travel itinerary for a trip with these details:

TRIP DETAILS:
- Destination: {destination}
- Arrival: {arrival_date} at {arrival_time}
- Return: {return_date} at {return_time}

HOTELS:
{hotel_info if hotel_info else "No specific hotels"}

Generate a JSON array of itinerary items. Each item must have:
- date (YYYY-MM-DD format)
- time (HH:MM format)
- activity (short activity name)
- location (where in {destination})
- description (detailed description)
- type (one of: 'accommodation', 'activity', 'dining', 'transport')

Start with arrival on {arrival_date} at {arrival_time}.
Include hotel check-ins/check-outs on the specified dates.
Include a mix of activities, dining experiences, and sightseeing specific to {destination}.
End with return departure on {return_date} at {return_time}.
Make suggestions realistic and varied.

Return ONLY valid JSON array, no other text."""

    try:
        # Call Gemini API
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        
        # Parse response
        response_text = response.text.strip()
        
        # Clean up markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        response_text = response_text.strip()
        itinerary = json.loads(response_text)
        
        return itinerary
    
    except json.JSONDecodeError as e:
        print(f"Error parsing Gemini response: {e}", file=sys.stderr)
        return []
    except Exception as e:
        print(f"Error calling Gemini API: {e}", file=sys.stderr)
        return []


def main():
    """Read travel data from stdin and output itinerary."""
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        travel_data = json.loads(input_data)
        
        # Generate itinerary
        itinerary = generate_itinerary(travel_data)
        
        # Output as JSON
        print(json.dumps(itinerary))
    
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON input: {e}"}), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

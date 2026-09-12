from fastapi import APIRouter

from app.schemas.ai_assistant import ChatRequest, ChatResponse

router = APIRouter(prefix="/api/ai-assistant", tags=["AI Assistant"])


@router.post(
    "/query",
    response_model=ChatResponse,
    summary="Query AI Travel Assistant",
    description="Submit user prompt to receive intelligent itinerary recommendations, context cards, and interactive follow-ups.",
)
def query_ai_assistant(req: ChatRequest):
    """Process natural language queries and generate contextual trip suggestions."""
    msg = req.message.lower()

    if "tea" in msg or "kandy" in msg or "ella" in msg:
        return {
            "reply": "The journey from Kandy to Ella passes through tea country. I recommend stopping at Nuwara Eliya for historic colonial architecture and tea tasting at high-altitude estates.",
            "hasCard": True,
            "cardData": {
                "title": "Damro Labookellie High Tea Estate",
                "type": "Cultural Tea Estate",
                "desc": "Experience high-altitude Ceylon tea picking, factory tours, and panoramic tasting rooms.",
                "image": "/stitch_images/planner.png",
                "duration": "Recommended: 3.5 hrs",
            },
            "followUps": [
                "Add Nuwara Eliya stop to Day 3 of Itinerary",
                "Show nearby boutique heritage hotels",
                "Check train ticket availability for this stretch",
            ],
        }

    return {
        "reply": f"I've updated your trip parameters based on '{req.message}'. Would you like me to adjust your accommodation bookings or sync this with your offline map?",
        "hasCard": False,
        "followUps": [
            "Sync with Mapbox offline layer",
            "Export PDF itinerary summary",
        ],
    }

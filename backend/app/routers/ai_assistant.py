from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/api/ai-assistant", tags=["AI Assistant"])

class ChatRequest(BaseModel):
    message: str

class CardData(BaseModel):
    title: str
    type: str
    desc: str
    image: str
    duration: str

class ChatResponse(BaseModel):
    reply: str
    hasCard: bool = False
    cardData: Optional[CardData] = None
    followUps: List[str] = []

@router.post("/query", response_model=ChatResponse)
def query_ai_assistant(req: ChatRequest):
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
                "duration": "Recommended: 3.5 hrs"
            },
            "followUps": [
                "Add Nuwara Eliya stop to Day 3 of Itinerary",
                "Show nearby boutique heritage hotels",
                "Check train ticket availability for this stretch"
            ]
        }
    
    return {
        "reply": f"I've updated your trip parameters based on '{req.message}'. Would you like me to adjust your accommodation bookings or sync this with your offline map?",
        "hasCard": False,
        "followUps": [
            "Sync with Mapbox offline layer",
            "Export PDF itinerary summary"
        ]
    }

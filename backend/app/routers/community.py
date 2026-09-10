from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/community", tags=["Community Feed"])

class Post(BaseModel):
    id: int
    author: str
    role: str
    avatar: str
    time: str
    verified: bool
    location: str
    image: str
    caption: str
    tags: List[str]
    ecoPoints: int
    commentsCount: int

@router.get("/posts", response_model=List[Post])
def get_community_posts():
    return [
        {
            "id": 1,
            "author": "Chaminda Perera",
            "role": "Local Guide",
            "avatar": "/stitch_images/discover.png",
            "time": "2 hours ago",
            "verified": True,
            "location": "Ella, Uva Province",
            "image": "/stitch_images/discover.png",
            "caption": "Discovered this secret vantage point just past the second tea bungalow. The mist cleared right at 6:15 AM, revealing Little Adam's Peak!",
            "tags": ["#EllaRock", "#HiddenVistas", "#CeylonTeaTrails"],
            "ecoPoints": 248,
            "commentsCount": 32,
        },
        {
            "id": 2,
            "author": "Clara Dupont",
            "role": "Explorer",
            "avatar": "/stitch_images/planner.png",
            "time": "5 hours ago",
            "verified": False,
            "location": "Polonnaruwa Ancient City",
            "image": "/stitch_images/map.png",
            "caption": "Renting a bicycle to explore the ancient irrigation tanks and stone stupas was the best decision.",
            "tags": ["#CulturalTriangle", "#HeritageSites", "#BikeTour"],
            "ecoPoints": 184,
            "commentsCount": 19,
        },
    ]

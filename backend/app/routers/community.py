from fastapi import APIRouter

from app.schemas.community import Post

router = APIRouter(prefix="/api/community", tags=["Community Feed"])


@router.get(
    "/posts",
    response_model=list[Post],
    summary="Get community feed posts",
    description="Retrieve verified explorer posts, eco-guide updates, and hidden travel discoveries.",
)
def get_community_posts():
    """Fetch recent community social posts and eco contributions."""
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

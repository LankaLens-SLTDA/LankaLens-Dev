import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.supabase_client import supabase  # noqa: E402

SEED_COMMUNITY_POSTS = [
    {
        "id": 1,
        "author": "Chaminda Perera",
        "role": "Local Guide",
        "avatar": "/stitch_images/discover.png",
        "time": "2 hours ago",
        "verified": True,
        "location": "Ella Nine Arch Bridge, Uva Province",
        "destination_id": 1,
        "latitude": 6.8768,
        "longitude": 81.0608,
        "rating": 5.0,
        "image": "/stitch_images/discover.png",
        "caption": "Discovered this secret vantage point just past the second tea bungalow. The morning mist cleared right at 6:15 AM, revealing the blue passenger train crossing Nine Arch Bridge! Bring sturdy boots.",
        "tags": ["#EllaRock", "#HiddenVistas", "#CeylonTeaTrails", "#NineArchBridge"],
        "ecoPoints": 248,
        "likes_count": 248,
        "commentsCount": 4,
        "comments_count": 4,
        "saves_count": 92,
        "comments": [
            {
                "id": 101,
                "author": "Kavinda Silva",
                "avatar": "/stitch_images/planner.png",
                "text": "Stunning photo Chaminda! What exact time does the morning train pass?",
                "time": "1 hour ago",
            },
            {
                "id": 102,
                "author": "Elena Rostova",
                "avatar": "/stitch_images/map.png",
                "text": "Saved to my Ella itinerary for next week! Thanks for the tip.",
                "time": "45 mins ago",
            },
            {
                "id": 103,
                "author": "Chaminda Perera",
                "avatar": "/stitch_images/discover.png",
                "text": "@Kavinda The morning express usually passes between 6:20 AM and 6:35 AM!",
                "time": "30 mins ago",
            },
            {
                "id": 104,
                "author": "Marcus Brody",
                "avatar": "/stitch_images/sustainability.png",
                "text": "Clean trail and zero plastic waste noted along the path. Excellent local conservation!",
                "time": "15 mins ago",
            },
        ],
    },
    {
        "id": 2,
        "author": "Clara Dupont",
        "role": "Explorer",
        "avatar": "/stitch_images/planner.png",
        "time": "5 hours ago",
        "verified": True,
        "location": "Sigiriya Ancient Citadel, Central Province",
        "destination_id": 5,
        "latitude": 7.9570,
        "longitude": 80.7600,
        "rating": 4.9,
        "image": "/stitch_images/planner.png",
        "caption": "Climbing Sigiriya Rock at 7:00 AM before the heat and crowd build up. The frescoes are impeccably preserved and the wind at the lion paw plateau is refreshing!",
        "tags": ["#CulturalTriangle", "#HeritageSites", "#SigiriyaFortress"],
        "ecoPoints": 184,
        "likes_count": 184,
        "commentsCount": 2,
        "comments_count": 2,
        "saves_count": 64,
        "comments": [
            {
                "id": 201,
                "author": "Nihal Jayasinghe",
                "avatar": "/stitch_images/discover.png",
                "text": "Early morning is definitely best! Also visit the water gardens at the base.",
                "time": "3 hours ago",
            },
            {
                "id": 202,
                "author": "Sarah Jenkins",
                "avatar": "/stitch_images/map.png",
                "text": "Are water bottles permitted on the climbing staircase?",
                "time": "2 hours ago",
            },
        ],
    },
    {
        "id": 3,
        "author": "Tariq Mansoor",
        "role": "Ranger Guide",
        "avatar": "/stitch_images/sustainability.png",
        "time": "8 hours ago",
        "verified": True,
        "location": "Yala Block I Lagoon, Southern Province",
        "destination_id": 12,
        "latitude": 6.3725,
        "longitude": 81.5165,
        "rating": 5.0,
        "image": "/stitch_images/sustainability.png",
        "caption": "Early morning safari dispatch from Yala Block I. Spotted a female Sri Lankan leopard lounging on a palu tree near Patanangala beach!",
        "tags": ["#YalaSafari", "#LeopardSpotted", "#WildlifeConservation"],
        "ecoPoints": 310,
        "likes_count": 310,
        "commentsCount": 3,
        "comments_count": 3,
        "saves_count": 128,
        "comments": [
            {
                "id": 301,
                "author": "David Chen",
                "avatar": "/stitch_images/planner.png",
                "text": "Unbelievable shot Tariq! Was this during the 6 AM safari entrance?",
                "time": "6 hours ago",
            },
            {
                "id": 302,
                "author": "Tariq Mansoor",
                "avatar": "/stitch_images/sustainability.png",
                "text": "@David Yes, right at 6:40 AM near the water lagoon crossing.",
                "time": "5 hours ago",
            },
        ],
    },
    {
        "id": 4,
        "author": "Anushka Fernando",
        "role": "Local Guide",
        "avatar": "/stitch_images/map.png",
        "time": "12 hours ago",
        "verified": True,
        "location": "Pidurangala Rock, Central Province",
        "destination_id": 6,
        "latitude": 7.9672,
        "longitude": 80.7681,
        "rating": 4.95,
        "image": "/stitch_images/map.png",
        "caption": "Sunrise from Pidurangala Rock offers the single best view of Sigiriya Fortress. The 30-minute boulder scramble is 100% worth every step!",
        "tags": ["#Pidurangala", "#SigiriyaSunrise", "#HiddenGem"],
        "ecoPoints": 275,
        "likes_count": 275,
        "commentsCount": 1,
        "comments_count": 1,
        "saves_count": 110,
        "comments": [
            {
                "id": 401,
                "author": "Hannah Weber",
                "avatar": "/stitch_images/discover.png",
                "text": "Much less crowded than expected! Thanks for advocating this alternative route.",
                "time": "9 hours ago",
            }
        ],
    },
    {
        "id": 5,
        "author": "Dilshan Ranasinghe",
        "role": "Explorer",
        "avatar": "/stitch_images/planner.png",
        "time": "1 day ago",
        "verified": False,
        "location": "Galle Dutch Fort Ramparts, Southern Province",
        "destination_id": 9,
        "latitude": 6.0269,
        "longitude": 80.2170,
        "rating": 4.85,
        "image": "/stitch_images/discover.png",
        "caption": "Sunset strolling along the Flag Rock ramparts of Galle Fort. Local divers were performing dramatic dives into the ocean as the sky turned orange.",
        "tags": ["#GalleFort", "#DutchHeritage", "#SunsetRamparts"],
        "ecoPoints": 195,
        "likes_count": 195,
        "commentsCount": 2,
        "comments_count": 2,
        "saves_count": 76,
        "comments": [],
    },
    {
        "id": 6,
        "author": "Subashini Nair",
        "role": "Local Guide",
        "avatar": "/stitch_images/map.png",
        "time": "1 day ago",
        "verified": True,
        "location": "Jaffna Nallur Kovil, Northern Province",
        "destination_id": 17,
        "latitude": 9.6745,
        "longitude": 80.0298,
        "description": "Witnessed the evening puja at Nallur Kovil. The golden Dravidian gopuram and nadaswaram music create an unforgettable spiritual atmosphere.",
        "caption": "Witnessed the evening puja ceremony at Nallur Kovil. The golden Dravidian gopuram and live nadaswaram music create an unforgettable spiritual atmosphere.",
        "tags": ["#JaffnaHeritage", "#NallurKovil", "#NorthernSriLanka"],
        "ecoPoints": 215,
        "likes_count": 215,
        "commentsCount": 1,
        "comments_count": 1,
        "saves_count": 88,
        "comments": [],
    },
    {
        "id": 7,
        "author": "Ruwan Weerasinghe",
        "role": "Ranger Guide",
        "avatar": "/stitch_images/sustainability.png",
        "time": "2 days ago",
        "verified": True,
        "location": "Horton Plains World's End, Central Province",
        "destination_id": 16,
        "latitude": 6.8028,
        "longitude": 80.8091,
        "rating": 4.9,
        "image": "/stitch_images/sustainability.png",
        "caption": "Clear mist-free skies at World's End drop-off today! Arrived at 6:45 AM before cloud cover rolled in. Spotted a herd of endemic sambar deer near Baker's Falls.",
        "tags": ["#HortonPlains", "#WorldsEnd", "#HighlandCloudForest"],
        "ecoPoints": 290,
        "likes_count": 290,
        "commentsCount": 3,
        "comments_count": 3,
        "saves_count": 135,
        "comments": [],
    },
]


def seed_community_database():
    """Seeds the community discovery feed dataset."""
    print(f"Seeding {len(SEED_COMMUNITY_POSTS)} community dispatches...")

    if supabase:
        try:
            res = (
                supabase.table("community_posts").upsert(SEED_COMMUNITY_POSTS).execute()
            )
            print(
                f"[LankaLens Supabase Seed] Upserted {len(res.data or [])} community posts!"
            )
            return res.data
        except Exception as e:
            print(f"[LankaLens Supabase Community Seed Warning] {e}")

    print("[LankaLens Seed] Community feed dataset initialized in-memory.")
    return SEED_COMMUNITY_POSTS


if __name__ == "__main__":
    seed_community_database()

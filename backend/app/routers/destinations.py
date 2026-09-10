from fastapi import APIRouter, Query
from typing import Optional
from app.schemas.destinations import DestinationResponse, Destination
from app.supabase_client import supabase

router = APIRouter(prefix="/api/destinations", tags=["Destinations"])

MOCK_DESTINATIONS = [
    {
        "id": 1,
        "title": "Sigiriya Ancient Rock Fortress",
        "category": "temple",
        "region": "Cultural Triangle",
        "rating": 4.9,
        "reviews": 320,
        "desc": "5th-century royal citadel towering 200 meters over emerald jungle, famous for frescoes and water gardens.",
        "image": "/stitch_images/planner.png",
        "coords": {"x": "28%", "y": "22%"},
        "elevation": "349 m",
        "distance": "165 km from Colombo",
    },
    {
        "id": 2,
        "title": "Ella Nine Arch Bridge & Demodara",
        "category": "nature",
        "region": "Hill Country",
        "rating": 4.9,
        "reviews": 512,
        "desc": "Iconic colonial viaduct tucked into dense tea hills, where blue trains cross scenic mountain valleys.",
        "image": "/stitch_images/discover.png",
        "coords": {"x": "52%", "y": "48%"},
        "elevation": "1,041 m",
        "distance": "200 km from Colombo",
    },
    {
        "id": 3,
        "title": "Mirissa Coconut Tree Hill & Secret Beach",
        "category": "beach",
        "region": "Southern Coast",
        "rating": 4.8,
        "reviews": 240,
        "desc": "Dramatic red-clay headland lined with coconut palms overlooking turquoise Indian Ocean waves.",
        "image": "/stitch_images/map.png",
        "coords": {"x": "70%", "y": "75%"},
        "elevation": "15 m",
        "distance": "150 km from Colombo",
    },
    {
        "id": 4,
        "title": "Yala National Park Safari",
        "category": "wildlife",
        "region": "Southern Province",
        "rating": 4.9,
        "reviews": 410,
        "desc": "World famous leopard habitat with dense jungle lagoons and herds of Asian elephants.",
        "image": "/stitch_images/sustainability.png",
        "coords": {"x": "65%", "y": "80%"},
        "elevation": "30 m",
        "distance": "290 km from Colombo",
    },
]

@router.get("", response_model=DestinationResponse)
def get_destinations(
    category: Optional[str] = Query(None, description="Filter by category"),
    region: Optional[str] = Query(None, description="Filter by region"),
    q: Optional[str] = Query(None, description="Search query")
):
    # Try fetching from Supabase if connected
    if supabase:
        try:
            query = supabase.table("destinations").select("*")
            if category and category != "all":
                query = query.eq("category", category)
            if region:
                query = query.ilike("region", f"%{region}%")
            if q:
                query = query.or_(f"title.ilike.%{q}%,description.ilike.%{q}%")
            
            res = query.execute()
            if res.data:
                formatted = [
                    {
                        "id": d["id"],
                        "title": d["title"],
                        "category": d["category"],
                        "region": d["region"],
                        "rating": float(d.get("rating", 4.5)),
                        "reviews": d.get("reviews", 0),
                        "desc": d.get("description", ""),
                        "image": d.get("image_url", "/stitch_images/discover.png"),
                        "coords": {"x": d.get("coord_x", "50%"), "y": d.get("coord_y", "50%")},
                        "elevation": d.get("elevation", "N/A"),
                        "distance": d.get("distance_from_colombo", "N/A"),
                    }
                    for d in res.data
                ]
                return {"destinations": formatted, "total": len(formatted)}
        except Exception as e:
            print(f"[LankaLens Supabase Query Error] {e}, falling back to static dataset.")

    # Static fallback
    results = MOCK_DESTINATIONS
    if category and category != "all":
        results = [d for d in results if d["category"] == category]
    if region:
        results = [d for d in results if region.lower() in d["region"].lower()]
    if q:
        results = [d for d in results if q.lower() in d["title"].lower() or q.lower() in d["desc"].lower()]
    
    return {"destinations": results, "total": len(results)}

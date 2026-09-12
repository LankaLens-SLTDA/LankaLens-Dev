from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.community import (
    InteractionRequest,
    LeaderboardContributor,
    Post,
    PostCreate,
)
from app.seed_community import SEED_COMMUNITY_POSTS
from app.supabase_client import supabase

router = APIRouter(prefix="/api/community", tags=["Community Feed"])

# In-memory store initialized with seed dataset
IN_MEMORY_POSTS: list[dict] = [dict(item) for item in SEED_COMMUNITY_POSTS]


def format_post_record(raw: dict) -> dict:
    """Formats raw database or seed record into complete Post schema compatibility."""
    comments_list = raw.get("comments") or []
    likes = int(raw.get("likes_count") or raw.get("ecoPoints") or 0)
    comments_cnt = int(
        raw.get("comments_count") or raw.get("commentsCount") or len(comments_list)
    )

    return {
        "id": raw["id"],
        "author": raw.get("author_name") or raw.get("author") or "Explorer",
        "role": raw.get("author_role") or raw.get("role") or "Explorer",
        "avatar": raw.get("author_avatar")
        or raw.get("avatar")
        or "/stitch_images/discover.png",
        "time": raw.get("time") or "Recent",
        "verified": bool(
            raw.get("is_ai_verified")
            if "is_ai_verified" in raw
            else raw.get("verified", True)
        ),
        "location": raw.get("location_name") or raw.get("location") or "Sri Lanka",
        "destination_id": raw.get("destination_id"),
        "latitude": float(raw["latitude"]) if raw.get("latitude") is not None else None,
        "longitude": (
            float(raw["longitude"]) if raw.get("longitude") is not None else None
        ),
        "rating": float(raw.get("rating", 5.0)),
        "image": raw.get("image_url")
        or raw.get("image")
        or "/stitch_images/discover.png",
        "caption": raw.get("caption") or "",
        "tags": raw.get("tags") or ["#LankaLens", "#ExploreSriLanka"],
        "ecoPoints": likes,
        "likes_count": likes,
        "commentsCount": comments_cnt,
        "comments_count": comments_cnt,
        "saves_count": int(raw.get("saves_count") or 0),
        "comments": comments_list,
        "liked": bool(raw.get("liked", False)),
        "saved": bool(raw.get("saved", False)),
    }


@router.get(
    "/posts",
    response_model=list[Post],
    summary="Get community discovery feed",
    description="Retrieve community posts filtered by ranking (latest, trending, top_eco), destination ID, or verification status.",
)
def get_community_posts(
    sort_by: str | None = Query(
        "latest", description="Sort ranking: 'latest', 'trending', 'top_eco'"
    ),
    destination_id: int | None = Query(
        None, description="Filter posts linked to specific destination ID"
    ),
    verified_only: bool | None = Query(
        False, description="Filter only AI-verified posts"
    ),
    tag: str | None = Query(None, description="Filter by hashtag"),
):
    """Fetch community posts from Supabase or fallback store."""
    sort_by = sort_by if isinstance(sort_by, str) else "latest"
    destination_id = destination_id if isinstance(destination_id, int) else None
    verified_only = verified_only if isinstance(verified_only, bool) else False
    tag = tag if isinstance(tag, str) else None

    results: list[dict] = []

    if supabase:
        try:
            query = supabase.table("community_posts").select("*")
            if destination_id:
                query = query.eq("destination_id", destination_id)
            if verified_only:
                query = query.eq("is_ai_verified", True)

            res = query.execute()
            if res.data and len(res.data) > 0:
                results = [format_post_record(p) for p in res.data]
        except Exception as e:
            print(f"[LankaLens Supabase Community Posts Fallback] {e}")

    if not results:
        results = [format_post_record(p) for p in IN_MEMORY_POSTS]

    # Filter in-memory results
    if destination_id:
        results = [p for p in results if p.get("destination_id") == destination_id]
    if verified_only:
        results = [p for p in results if p.get("verified") is True]
    if tag:
        tag_lower = tag.lower()
        results = [
            p for p in results if any(tag_lower in t.lower() for t in p.get("tags", []))
        ]

    # Sorting
    if sort_by == "trending" or sort_by == "top_eco":
        results.sort(key=lambda x: x["ecoPoints"], reverse=True)
    elif sort_by == "latest":
        results.sort(key=lambda x: x["id"], reverse=True)

    return results


@router.get(
    "/destinations/{destination_id}/posts",
    response_model=list[Post],
    summary="Get community posts for a destination",
    description="Retrieve all crowdsourced user contributions and dispatches associated with a destination.",
)
def get_destination_posts(destination_id: int):
    """Get posts linked to a specific destination."""
    return get_community_posts(destination_id=destination_id)


@router.get(
    "/posts/{id}",
    response_model=Post,
    summary="Get single community post details",
    description="Retrieve post details, full text caption, and user comments list.",
)
def get_community_post(id: int):
    """Get post by ID."""
    for p in IN_MEMORY_POSTS:
        if p["id"] == id:
            return format_post_record(p)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Community post with ID {id} not found.",
    )


@router.post(
    "/posts",
    response_model=Post,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new community dispatch",
    description="Submit a geo-tagged community post, discovery photo, or trail note.",
)
def create_community_post(payload: PostCreate):
    """Submit a new community dispatch."""
    new_id = max([p["id"] for p in IN_MEMORY_POSTS] or [0]) + 1
    record = {
        "id": new_id,
        "author": payload.author,
        "author_name": payload.author,
        "role": payload.role,
        "author_role": payload.role,
        "avatar": "/stitch_images/planner.png",
        "author_avatar": "/stitch_images/planner.png",
        "time": "Just now",
        "verified": False,
        "is_ai_verified": False,
        "location": payload.location,
        "location_name": payload.location,
        "destination_id": payload.destination_id,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "rating": payload.rating,
        "image": payload.image,
        "image_url": payload.image,
        "caption": payload.caption,
        "tags": payload.tags if payload.tags else ["#LankaLens", "#Exploration"],
        "ecoPoints": 50,  # Award 50 eco-points for contribution
        "likes_count": 0,
        "commentsCount": 0,
        "comments_count": 0,
        "saves_count": 0,
        "comments": [],
    }

    formatted = format_post_record(record)
    IN_MEMORY_POSTS.insert(0, formatted)

    if supabase:
        try:
            supabase.table("community_posts").insert(record).execute()
        except Exception as e:
            print(f"[LankaLens Supabase post create error] {e}")

    return formatted


@router.post(
    "/posts/{id}/interact",
    response_model=Post,
    summary="Interact with a community post",
    description="Like/Unlike post, Save/Unsave to watchlist, or submit user comment.",
)
def interact_with_post(id: int, payload: InteractionRequest):
    """Handle Likes, Saves, and Comments on community posts."""
    target_idx = None
    for idx, p in enumerate(IN_MEMORY_POSTS):
        if p["id"] == id:
            target_idx = idx
            break

    if target_idx is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post with ID {id} not found.",
        )

    post = IN_MEMORY_POSTS[target_idx]
    action = payload.action.lower()

    if action == "like":
        if not post.get("liked"):
            post["liked"] = True
            post["ecoPoints"] = int(post.get("ecoPoints", 0)) + 1
            post["likes_count"] = int(post.get("likes_count", 0)) + 1
    elif action == "unlike":
        if post.get("liked"):
            post["liked"] = False
            post["ecoPoints"] = max(0, int(post.get("ecoPoints", 0)) - 1)
            post["likes_count"] = max(0, int(post.get("likes_count", 0)) - 1)
    elif action == "save":
        if not post.get("saved"):
            post["saved"] = True
            post["saves_count"] = int(post.get("saves_count", 0)) + 1
    elif action == "unsave":
        if post.get("saved"):
            post["saved"] = False
            post["saves_count"] = max(0, int(post.get("saves_count", 0)) - 1)
    elif action == "comment":
        if not payload.comment_text or not payload.comment_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Comment text cannot be empty.",
            )
        comments = post.get("comments") or []
        new_comment_id = max([c["id"] for c in comments] or [100]) + 1
        new_comment = {
            "id": new_comment_id,
            "author": payload.author_name or "Explorer",
            "avatar": "/stitch_images/planner.png",
            "text": payload.comment_text.strip(),
            "time": "Just now",
        }
        comments.append(new_comment)
        post["comments"] = comments
        post["commentsCount"] = len(comments)
        post["comments_count"] = len(comments)

    formatted = format_post_record(post)
    IN_MEMORY_POSTS[target_idx] = formatted
    return formatted


@router.get(
    "/leaderboard",
    response_model=list[LeaderboardContributor],
    summary="Get top community contributors leaderboard",
    description="Retrieve ranking of top local guides and community explorers by eco-points.",
)
def get_leaderboard():
    """Retrieve community leaderboard ranking."""
    return [
        {
            "name": "Chaminda Perera",
            "role": "Local Guide",
            "avatar": "/stitch_images/discover.png",
            "eco_points": 1240,
            "verified_count": 142,
        },
        {
            "name": "Clara Dupont",
            "role": "Explorer",
            "avatar": "/stitch_images/planner.png",
            "eco_points": 980,
            "verified_count": 89,
        },
        {
            "name": "Tariq Mansoor",
            "role": "Ranger Guide",
            "avatar": "/stitch_images/sustainability.png",
            "eco_points": 860,
            "verified_count": 74,
        },
        {
            "name": "Anushka Fernando",
            "role": "Local Guide",
            "avatar": "/stitch_images/map.png",
            "eco_points": 740,
            "verified_count": 61,
        },
    ]

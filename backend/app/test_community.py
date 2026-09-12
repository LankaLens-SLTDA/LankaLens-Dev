import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.routers.community import (  # noqa: E402
    create_community_post,
    get_community_posts,
    get_leaderboard,
    interact_with_post,
)
from app.schemas.community import InteractionRequest, PostCreate  # noqa: E402


def test_community_feed():
    print("1. Testing GET /api/community/posts (Full feed)...")
    posts = get_community_posts()
    print(f"   Returned {len(posts)} community posts.")
    assert len(posts) >= 7, "Expected at least 7 posts in seed dataset"

    print("\n2. Testing filter by destination_id=1 (Nine Arch Bridge)...")
    dest1_posts = get_community_posts(destination_id=1)
    print(f"   Returned {len(dest1_posts)} posts for Nine Arch Bridge.")
    assert len(dest1_posts) >= 1, "Expected at least 1 post for destination ID 1"
    assert dest1_posts[0]["destination_id"] == 1

    print("\n3. Testing sorting by 'trending' (most ecoPoints)...")
    trending_posts = get_community_posts(sort_by="trending")
    assert trending_posts[0]["ecoPoints"] >= trending_posts[1]["ecoPoints"]
    print(f"   Top trending post ecoPoints: {trending_posts[0]['ecoPoints']}")

    print("\n4. Testing POST /api/community/posts (Create new dispatch)...")
    new_post_payload = PostCreate(
        author="Saman Kumara",
        role="Local Guide",
        location="Mirissa Coconut Tree Hill, Southern Province",
        destination_id=3,
        latitude=5.9470,
        longitude=80.4578,
        rating=5.0,
        caption="Secret sunset spot just below Coconut Tree Hill. The waves hit the red rocks right at 6:15 PM!",
        tags=["#Mirissa", "#SunsetSpot"],
    )
    created_post = create_community_post(new_post_payload)
    print(
        f"   Created post ID {created_post['id']}: '{created_post['caption'][:40]}...'"
    )
    assert created_post["author"] == "Saman Kumara"

    print(
        "\n5. Testing POST /api/community/posts/{id}/interact (Like, Save & Comment)..."
    )
    post_id = created_post["id"]

    # Like action
    liked_res = interact_with_post(post_id, InteractionRequest(action="like"))
    print(
        f"   Liked post {post_id}: ecoPoints = {liked_res['ecoPoints']}, liked = {liked_res['liked']}"
    )
    assert liked_res["liked"] is True

    # Save action
    saved_res = interact_with_post(post_id, InteractionRequest(action="save"))
    print(
        f"   Saved post {post_id}: saves_count = {saved_res['saves_count']}, saved = {saved_res['saved']}"
    )
    assert saved_res["saved"] is True

    # Comment action
    comment_res = interact_with_post(
        post_id,
        InteractionRequest(
            action="comment",
            comment_text="Amazing sunset recommendation! Adding this to my trip.",
            author_name="Nimali Perera",
        ),
    )
    print(f"   Added comment: total comments = {comment_res['commentsCount']}")
    assert len(comment_res["comments"]) == 1
    assert (
        comment_res["comments"][0]["text"]
        == "Amazing sunset recommendation! Adding this to my trip."
    )

    print("\n6. Testing GET /api/community/leaderboard...")
    leaderboard = get_leaderboard()
    print(
        f"   Top contributor: {leaderboard[0]['name']} ({leaderboard[0]['eco_points']} pts)"
    )
    assert len(leaderboard) >= 4

    print("\nAll Community Feed API tests passed successfully!")


if __name__ == "__main__":
    test_community_feed()

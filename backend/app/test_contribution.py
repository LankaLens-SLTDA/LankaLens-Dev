import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.routers.contribution import (  # noqa: E402
    extract_photo_metadata,
    get_user_submissions,
    moderate_contribution,
    report_content,
    submit_contribution,
)
from app.schemas.contribution import (  # noqa: E402
    ContributionCreate,
    ModerationRequest,
    ReportRequest,
)


def test_contribution_pipeline():
    print("1. Testing EXIF & GPS metadata extraction...")
    exif = extract_photo_metadata(
        filename="ella_secret_view.jpg", lat=6.8768, lng=81.0608
    )
    print(f"   Camera: {exif.camera}, GPS: {exif.latitude}, {exif.longitude}")
    assert exif.latitude == 6.8768
    assert exif.has_gps is True

    print(
        "\n2. Testing POST /api/contribution/submit (Valid Sri Lanka Contribution)..."
    )
    payload = ContributionCreate(
        author_name="Nihal Perera",
        title="Secret Vantage Point at Little Adam's Peak",
        category="Nature",
        destination_id=3,
        description="Found this quiet rocky outcrop 200m off the main staircase. Offers unobstructed views of Ella Gap at sunrise.",
        alt_text="Green tea slopes and mountain ridge at sunrise in Ella Sri Lanka.",
        tags=["#EllaRock", "#SecretVantage"],
        rating=5.0,
        latitude=6.8624,
        longitude=81.0583,
        image_url="/stitch_images/planner.png",
    )

    contrib = submit_contribution(payload)
    print(f"   Contribution ID {contrib['id']} submitted.")
    print(f"   AI Confidence Score: {contrib['ai_confidence_score']}")
    print(f"   Status: {contrib['status']}")
    print(f"   Reputation Points Awarded: {contrib['reputation_points_awarded']}")

    assert contrib["status"] == "approved"
    assert contrib["reputation_points_awarded"] == 50

    print("\n3. Testing Geofence Violation (Coordinates outside Sri Lanka)...")
    invalid_payload = ContributionCreate(
        author_name="Test User",
        title="Invalid Location Test",
        category="Nature",
        description="Testing geofence check with coordinates in Europe.",
        alt_text="A mountain view somewhere in Europe.",
        latitude=48.8566,  # Paris latitude
        longitude=2.3522,  # Paris longitude
    )
    invalid_contrib = submit_contribution(invalid_payload)
    print(f"   AI Confidence Score: {invalid_contrib['ai_confidence_score']}")
    print(f"   Status: {invalid_contrib['status']}")
    assert invalid_contrib["status"] != "approved"

    print("\n4. Testing GET /api/contribution/submissions...")
    history = get_user_submissions()
    print(f"   Total submissions in history: {len(history)}")
    assert len(history) >= 2

    print("\n5. Testing Content Reporting / Flagging...")
    report_res = report_content(
        ReportRequest(
            target_type="contribution",
            target_id=contrib["id"],
            reason="inaccurate_gps",
            description="The location pin is slightly off the main trail.",
        )
    )
    print(f"   Report result: {report_res['message']}")
    assert "flagged" in report_res["message"]

    print("\n6. Testing Admin Moderation Endpoint...")
    mod_res = moderate_contribution(contrib["id"], ModerationRequest(action="approve"))
    print(f"   Moderation result: status = {mod_res['status']}")
    assert mod_res["status"] == "approved"

    print("\nAll Verified Contribution Pipeline tests passed successfully!")


if __name__ == "__main__":
    test_contribution_pipeline()

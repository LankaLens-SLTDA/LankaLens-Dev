from fastapi import APIRouter, HTTPException, status

from app.routers.community import IN_MEMORY_POSTS
from app.routers.contribution import IN_MEMORY_CONTRIBUTIONS, IN_MEMORY_REPORTS
from app.routers.partners import IN_MEMORY_PARTNERS
from app.schemas.reputation import (
    ConvertedPartnerGuideResponse,
    EligibilityCheckResponse,
    GuideApplicationRequest,
    GuideApplicationResponse,
    GuideUpgradePayload,
    UserReputationProfile,
)
from app.services.reputation import ReputationEngine
from app.supabase_client import supabase

router = APIRouter(prefix="/api/reputation", tags=["Trust, Reputation & Gamification"])

# In-memory stores for guide applications
IN_MEMORY_GUIDE_APPLICATIONS: list[dict] = []

# Default seed authors for leaderboard
SEED_AUTHORS = [
    "Chaminda Perera",
    "Clara Dupont",
    "Tariq Mansoor",
    "Anushka Fernando",
    "Kusal Perera",
]


@router.get(
    "/profile/{author_name}",
    response_model=UserReputationProfile,
    summary="Get contributor reputation profile",
    description="Retrieve contributor recognition ladder rank, badges, AI pass rate, eco-points, and guide upgrade eligibility.",
)
def get_user_reputation_profile(author_name: str):
    """Retrieve contributor reputation profile."""
    profile = ReputationEngine.compute_user_profile(
        author_name=author_name,
        contributions=IN_MEMORY_CONTRIBUTIONS,
        community_posts=IN_MEMORY_POSTS,
        reports=IN_MEMORY_REPORTS,
        guide_applications=IN_MEMORY_GUIDE_APPLICATIONS,
    )
    return profile


@router.get(
    "/leaderboard",
    response_model=list[UserReputationProfile],
    summary="Get community contributor leaderboard",
    description="Retrieve real-time leaderboard ranking top local guides and explorers by reputation score and eco-points.",
)
def get_reputation_leaderboard():
    """Retrieve dynamic contributor leaderboard."""
    # Gather distinct author names from contributions and posts
    authors = set(SEED_AUTHORS)
    for c in IN_MEMORY_CONTRIBUTIONS:
        if c.get("author_name"):
            authors.add(c["author_name"].strip())
    for p in IN_MEMORY_POSTS:
        if p.get("author"):
            authors.add(p["author"].strip())

    profiles = [
        ReputationEngine.compute_user_profile(
            author_name=author,
            contributions=IN_MEMORY_CONTRIBUTIONS,
            community_posts=IN_MEMORY_POSTS,
            reports=IN_MEMORY_REPORTS,
            guide_applications=IN_MEMORY_GUIDE_APPLICATIONS,
        )
        for author in authors
    ]

    # Sort leaderboard by reputation_score descending, then eco_points descending
    profiles.sort(key=lambda p: (p.reputation_score, p.eco_points), reverse=True)
    return profiles


@router.post(
    "/guide-upgrade",
    response_model=GuideApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Apply for SLTDA Guide Marketplace Onboarding",
    description="Allows Trusted Guide eligible contributors to apply for certified guide marketplace onboarding.",
)
def apply_for_guide_upgrade(payload: GuideApplicationRequest):
    """Submit application to upgrade to a certified Marketplace Guide."""
    profile = ReputationEngine.compute_user_profile(
        author_name=payload.author_name,
        contributions=IN_MEMORY_CONTRIBUTIONS,
        community_posts=IN_MEMORY_POSTS,
        reports=IN_MEMORY_REPORTS,
        guide_applications=IN_MEMORY_GUIDE_APPLICATIONS,
    )

    if not profile.is_guide_eligible:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Author '{payload.author_name}' is not currently eligible for Guide Marketplace onboarding. "
                "Requires 'Trusted Guide' rank (750+ Eco-Points, >=90% AI Pass Rate, >=10 Approved Contributions)."
            ),
        )

    app_id = len(IN_MEMORY_GUIDE_APPLICATIONS) + 1
    app_record = {
        "id": app_id,
        "author_name": payload.author_name,
        "contact_number": payload.contact_number,
        "sltda_license_number": payload.sltda_license_number,
        "niche_specialization": payload.niche_specialization,
        "bio_summary": payload.bio_summary,
        "portfolio_links": payload.portfolio_links,
        "status": "pending_verification",
        "created_at": "Just now",
    }

    IN_MEMORY_GUIDE_APPLICATIONS.append(app_record)

    if supabase:
        try:
            supabase.table("guide_applications").insert(app_record).execute()
        except Exception as e:
            print(f"[LankaLens Supabase guide application submit error] {e}")

    return GuideApplicationResponse(
        application_id=app_id,
        status="pending_verification",
        message=f"Congratulations {payload.author_name}! Your Guide Marketplace application #{app_id} has been submitted for SLTDA verification.",
    )


@router.get(
    "/eligibility/{author_name}",
    response_model=EligibilityCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="Check automatic guide marketplace eligibility for contributor",
    description="Evaluates contributor Eco-Points, AI pass rate, approved contributions, and reputation score to compute itemized guide eligibility.",
)
def check_guide_eligibility(author_name: str) -> EligibilityCheckResponse:
    """Calculates automatic multi-factor guide marketplace eligibility checklist."""
    return ReputationEngine.check_guide_eligibility(
        author_name=author_name,
        contributions=IN_MEMORY_CONTRIBUTIONS,
        community_posts=IN_MEMORY_POSTS,
        reports=IN_MEMORY_REPORTS,
        guide_applications=IN_MEMORY_GUIDE_APPLICATIONS,
    )


@router.post(
    "/upgrade-to-partner",
    response_model=ConvertedPartnerGuideResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upgrade high-trust contributor to listed Local Partner Guide",
    description="Converts eligible community contributor into a listed Local Partner Network guide with retained reputation history & 5% preferential fee tier.",
)
def upgrade_contributor_to_partner(
    payload: GuideUpgradePayload,
) -> ConvertedPartnerGuideResponse:
    """Upgrades eligible contributor into listed Partner Network guide."""
    check = ReputationEngine.check_guide_eligibility(
        author_name=payload.author_name,
        contributions=IN_MEMORY_CONTRIBUTIONS,
        community_posts=IN_MEMORY_POSTS,
        reports=IN_MEMORY_REPORTS,
        guide_applications=IN_MEMORY_GUIDE_APPLICATIONS,
    )

    if not check.is_eligible:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Author '{payload.author_name}' is not currently eligible for Partner Guide onboarding. {check.message}",
        )

    return ReputationEngine.upgrade_contributor_to_partner(
        payload=payload,
        contributions=IN_MEMORY_CONTRIBUTIONS,
        community_posts=IN_MEMORY_POSTS,
        reports=IN_MEMORY_REPORTS,
        guide_applications=IN_MEMORY_GUIDE_APPLICATIONS,
        partner_dataset=IN_MEMORY_PARTNERS,
    )

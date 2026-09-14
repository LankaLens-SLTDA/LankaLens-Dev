from typing import Any

from app.schemas.reputation import Badge, UserReputationProfile


class ReputationEngine:
    """Reputation, Recognition Ladder & Gamification Engine for LankaLens.

    Recognition Ladder Tiers:
    1. New Contributor: 0 - 249 Eco-Points.
    2. Verified Local: 250 - 749 Eco-Points, >= 80% AI Pass Rate, >= 0.75 Trust Score.
    3. Trusted Guide: 750+ Eco-Points, >= 90% AI Pass Rate, >= 0.85 Trust Score, >= 10 Approved Contributions.
       Unlocks "Trusted Guide" status & Guide Marketplace Upgrade eligibility.
    """

    @classmethod
    def compute_user_profile(
        cls,
        author_name: str,
        contributions: list[dict[str, Any]],
        community_posts: list[dict[str, Any]],
        reports: list[dict[str, Any]],
        guide_applications: list[dict[str, Any]],
    ) -> UserReputationProfile:
        author_name = author_name.strip()
        user_contribs = [
            c
            for c in contributions
            if c.get("author_name", "").strip().lower() == author_name.lower()
        ]
        user_posts = [
            p
            for p in community_posts
            if p.get("author", "").strip().lower() == author_name.lower()
        ]

        total_submissions = len(user_contribs)
        approved_count = sum(1 for c in user_contribs if c.get("status") == "approved")
        rejected_count = sum(1 for c in user_contribs if c.get("status") == "rejected")

        # Count community reports targeting user's contributions or posts
        sustained_reports = sum(
            1
            for r in reports
            if r.get("reporter_name", "").strip().lower() != author_name.lower()
            and r.get("status") in ["pending", "resolved"]
            and r.get("target_type") in ["contribution", "post"]
        )

        ai_pass_rate = (
            round((approved_count / total_submissions) * 100.0, 1)
            if total_submissions > 0
            else 100.0
        )

        total_likes = sum(p.get("likes_count", 0) for p in user_posts)
        total_comments = sum(p.get("commentsCount", 0) for p in user_posts)

        # Points System & Penalties
        base_points = approved_count * 50
        penalties = (rejected_count * 30) + (sustained_reports * 50)
        calculated_points = max(0, base_points - penalties)

        # Anti-Gaming Capping: Maximum 250 points accrued per rolling 24h
        daily_accrued = min(calculated_points, 250)
        eco_points = calculated_points

        # Dynamic Reputation Score (0.00 to 100.00)
        engagement_factor = min(1.0, (total_likes + total_comments) / 40.0)
        volume_factor = min(1.0, approved_count / 10.0)

        rep_score = (
            (ai_pass_rate * 0.40)
            + (volume_factor * 35.0)
            + (engagement_factor * 25.0)
            - (rejected_count * 6.0)
            - (sustained_reports * 12.0)
        )
        reputation_score = max(0.00, min(100.00, round(rep_score, 2)))

        # Recognition Ladder Rank Determination
        if eco_points >= 750 and ai_pass_rate >= 90.0 and approved_count >= 10:
            rank = "Trusted Guide"
        elif eco_points >= 250 and ai_pass_rate >= 80.0:
            rank = "Verified Local"
        else:
            rank = "New Contributor"

        is_guide_eligible = rank == "Trusted Guide" or (
            eco_points >= 750 and ai_pass_rate >= 90.0
        )

        # Guide Upgrade Application Status
        app = next(
            (
                a
                for a in guide_applications
                if a.get("author_name", "").strip().lower() == author_name.lower()
            ),
            None,
        )
        if app:
            guide_status = app.get("status", "applied")
        elif is_guide_eligible:
            guide_status = "eligible"
        else:
            guide_status = "none"

        # Badges Showcase
        badges: list[Badge] = []
        if approved_count >= 1:
            badges.append(
                Badge(
                    id="pioneer_cartographer",
                    title="Pioneer Cartographer",
                    description="Submitted 1st verified Sri Lankan tourism discovery.",
                    icon="map_pin",
                    unlocked_at="2026-09-10",
                )
            )
        if approved_count >= 5 and ai_pass_rate >= 85.0:
            badges.append(
                Badge(
                    id="geofence_sentinel",
                    title="Geofence Sentinel",
                    description="Achieved high geographic accuracy across 5+ contributions.",
                    icon="shield_check",
                    unlocked_at="2026-09-11",
                )
            )
        if rank in ["Verified Local", "Trusted Guide"]:
            badges.append(
                Badge(
                    id="verified_local",
                    title="Verified Local",
                    description="Reached Verified Local recognition threshold (250+ pts).",
                    icon="award",
                    unlocked_at="2026-09-12",
                )
            )
        if rank == "Trusted Guide":
            badges.append(
                Badge(
                    id="trusted_guide",
                    title="Trusted Guide Elite",
                    description="Achieved top-tier Trusted Guide status & Marketplace eligibility.",
                    icon="star",
                    unlocked_at="2026-09-12",
                )
            )

        return UserReputationProfile(
            author_name=author_name,
            rank=rank,
            eco_points=eco_points,
            reputation_score=reputation_score,
            ai_pass_rate=ai_pass_rate,
            approved_count=approved_count,
            rejected_count=rejected_count,
            total_submissions=total_submissions,
            total_likes_received=total_likes,
            total_comments_received=total_comments,
            badges=badges,
            is_guide_eligible=is_guide_eligible,
            guide_upgrade_status=guide_status,
            daily_points_accrued=daily_accrued,
        )

    @classmethod
    def check_guide_eligibility(
        cls,
        author_name: str,
        contributions: list[dict[str, Any]],
        community_posts: list[dict[str, Any]],
        reports: list[dict[str, Any]],
        guide_applications: list[dict[str, Any]],
    ):
        """Calculates itemized multi-factor guide marketplace eligibility checklist."""
        from app.schemas.reputation import (
            EligibilityCheckResponse,
            EligibilityCriterionItem,
        )

        profile = cls.compute_user_profile(
            author_name=author_name,
            contributions=contributions,
            community_posts=community_posts,
            reports=reports,
            guide_applications=guide_applications,
        )

        crit_points = EligibilityCriterionItem(
            metric="Eco-Points Threshold",
            required_value=">= 250 Eco-Points",
            actual_value=f"{profile.eco_points} Eco-Points",
            passed=profile.eco_points >= 250,
        )
        crit_ai_pass = EligibilityCriterionItem(
            metric="AI Verification Pass Rate",
            required_value=">= 80.0%",
            actual_value=f"{profile.ai_pass_rate}%",
            passed=profile.ai_pass_rate >= 80.0,
        )
        crit_approved = EligibilityCriterionItem(
            metric="Approved Contributions",
            required_value=">= 1 Approved Contribution",
            actual_value=f"{profile.approved_count} Contributions",
            passed=profile.approved_count >= 1,
        )
        crit_rep = EligibilityCriterionItem(
            metric="Reputation Score",
            required_value=">= 50.00",
            actual_value=f"{profile.reputation_score}",
            passed=profile.reputation_score >= 50.0,
        )

        criteria = [crit_points, crit_ai_pass, crit_approved, crit_rep]
        all_passed = all(c.passed for c in criteria)

        if profile.rank == "Trusted Guide" or profile.eco_points >= 750:
            guide_level = "certified_trusted_guide"
            msg = f"Author '{author_name}' is fully eligible for Top-Tier Trusted Guide Marketplace Onboarding (5% Preferential Fee & +10% Matching Boost)."
        elif all_passed:
            guide_level = "community_local_guide"
            msg = f"Author '{author_name}' meets Community Local Guide eligibility requirements."
        else:
            guide_level = "not_eligible"
            msg = f"Author '{author_name}' does not yet meet all guide eligibility criteria."

        return EligibilityCheckResponse(
            author_name=author_name,
            is_eligible=all_passed,
            rank=profile.rank,
            guide_level=guide_level,
            criteria_breakdown=criteria,
            preferential_commission_pct=(
                5.00 if guide_level == "certified_trusted_guide" else 8.00
            ),
            matching_boost_pct=10.0,
            message=msg,
        )

    @classmethod
    def upgrade_contributor_to_partner(
        cls,
        payload,
        contributions: list[dict[str, Any]],
        community_posts: list[dict[str, Any]],
        reports: list[dict[str, Any]],
        guide_applications: list[dict[str, Any]],
        partner_dataset: list[dict[str, Any]],
    ):
        """Upgrades an eligible contributor into a listed Local Partner Network guide."""
        from app.schemas.reputation import ConvertedPartnerGuideResponse

        profile = cls.compute_user_profile(
            author_name=payload.author_name,
            contributions=contributions,
            community_posts=community_posts,
            reports=reports,
            guide_applications=guide_applications,
        )

        # Build business title
        title = (
            payload.custom_title
            or f"{payload.author_name} — {payload.niche_specialization} Guide"
        )
        new_partner_id = max([p.get("id", 0) for p in partner_dataset], default=0) + 1

        is_trusted = profile.rank == "Trusted Guide" or profile.eco_points >= 500
        feat_tier = "gold" if is_trusted else "silver"
        pref_fee = 5.00 if is_trusted else 8.00

        partner_record = {
            "id": new_partner_id,
            "name": payload.author_name,
            "business_name": title,
            "partner_type": "guide",
            "district": payload.district,
            "province": payload.province,
            "latitude": 7.957 if payload.district == "Matale" else 6.927,
            "longitude": 80.760 if payload.district == "Matale" else 79.861,
            "address": f"{payload.district} District Tourism Station",
            "contact_number": payload.contact_number,
            "email": f"{payload.author_name.lower().replace(' ', '.')}@lankalens.lk",
            "website": f"https://lankalens.lk/guides/{payload.author_name.lower().replace(' ', '-')}",
            "sltda_license_number": payload.sltda_license_number
            or f"SLTDA/COMM/{new_partner_id:04d}",
            "verification_state": "verified",
            "is_verified": True,
            "is_featured": True,
            "featured_tier": feat_tier,
            "rating": max(
                4.7, min(5.0, round(4.5 + (profile.reputation_score / 200.0), 1))
            ),
            "reviews_count": profile.approved_count + profile.total_likes_received,
            "price_range": "$$",
            "baseline_rate": payload.baseline_rate,
            "services": payload.services,
            "associated_destination_ids": payload.associated_destination_ids,
            "image_url": "/stitch_images/discover.png",
            "contributor_author_name": payload.author_name,
            "contributor_eco_points": profile.eco_points,
            "contributor_rank": profile.rank,
            "preferential_commission_pct": pref_fee,
            "hidden_gem_badge": True,
        }

        partner_dataset.append(partner_record)

        return ConvertedPartnerGuideResponse(
            partner_id=new_partner_id,
            author_name=payload.author_name,
            business_name=title,
            partner_type="guide",
            district=payload.district,
            province=payload.province,
            verification_state="verified",
            is_verified=True,
            is_featured=True,
            featured_tier=feat_tier,
            reputation_score=profile.reputation_score,
            contributor_eco_points=profile.eco_points,
            contributor_rank=profile.rank,
            approved_contributions_count=profile.approved_count,
            preferential_commission_pct=pref_fee,
            matching_boost_pct=10.00,
            hidden_gem_badge=True,
            message=f"Congratulations {payload.author_name}! You are now listed as a Verified Partner Guide #{new_partner_id} with a {pref_fee}% preferential fee tier.",
        )

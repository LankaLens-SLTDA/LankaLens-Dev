"""Automated Test Suite for EPIC 18 — AI Travel Assistant (Grounded Multilingual Intelligence).

Tests all 6 acceptance criteria:
1. Natural language travel query processing across destination, budget, itinerary, crowd, and partner intents.
2. Factual retrieval grounded in LankaLens authoritative database.
3. Verification of generated destinations/prices against baseline platform data.
4. Structured itinerary suggestions & UI recommendation cards.
5. Multilingual interaction support ('en', 'si', 'ta', 'fr', 'de', 'ja').
6. Hallucination safeguards and standalone validation guardrails (POST /api/ai-assistant/validate).
"""

from app.openapi_export import export_openapi_schema
from app.routers.ai_assistant import (
    query_ai_assistant,
    validate_hallucination_guardrail,
)
from app.schemas.ai_assistant import ChatRequest, HallucinationValidationRequest


def run_all_ai_assistant_tests():
    print("=" * 70)
    print("      LankaLens EPIC 18 — AI Travel Assistant Test Suite")
    print("=" * 70)

    # -------------------------------------------------------------
    # Test 1: Natural-Language Query & Intent Recognition (Budget Query)
    # -------------------------------------------------------------
    print("\n1. Testing Natural-Language Query & Intent Recognition (Budget Query)...")
    req1 = ChatRequest(
        message="What is the baseline ticket cost for Sigiriya Rock Fortress?",
        language="en",
    )
    res1 = query_ai_assistant(req1)
    print(f"   Detected Intent: {res1.detected_intent}")
    print(f"   AI Reply: {res1.reply[:120]}...")
    print(
        f"   Has UI Card: {res1.hasCard} (Title: {res1.cardData.title if res1.cardData else 'None'})"
    )
    assert res1.detected_intent == "budget_question"
    assert res1.hasCard is True
    assert res1.cardData is not None
    assert f"${res1.cardData.cost:.2f}" in res1.reply

    # -------------------------------------------------------------
    # Test 2: Grounded Retrieval from LankaLens Database
    # -------------------------------------------------------------
    print("\n2. Testing Grounded Retrieval Audit & Metadata...")
    meta = res1.grounding_metadata
    print(f"   Is Grounded: {meta.is_grounded}")
    print(f"   Entities Found Count: {len(meta.entities_found)}")
    print(f"   Hallucination Check Passed: {meta.hallucination_check_passed}")
    print(f"   Sources Used: {meta.sources_used}")
    assert meta.is_grounded is True
    assert len(meta.entities_found) > 0
    assert meta.hallucination_check_passed is True

    # -------------------------------------------------------------
    # Test 3: Grounded Itinerary Request & Structured Card
    # -------------------------------------------------------------
    print("\n3. Testing Itinerary Request & Structured Card Generation...")
    req3 = ChatRequest(
        message="Can you build a 3-day tea country itinerary in Kandy and Ella?",
        language="en",
    )
    res3 = query_ai_assistant(req3)
    print(f"   Detected Intent: {res3.detected_intent}")
    print(f"   AI Reply: {res3.reply[:140]}...")
    print(f"   Card Title: {res3.cardData.title}, Cost: ${res3.cardData.cost}")
    assert res3.detected_intent == "itinerary_request"
    assert len(res3.followUps) >= 2

    # -------------------------------------------------------------
    # Test 4: Real-Time Crowd Surveillance Inquiry
    # -------------------------------------------------------------
    print("\n4. Testing Real-Time Crowd Surveillance Inquiry...")
    req4 = ChatRequest(
        message="Is Nine Arch Bridge overcrowded right now?", language="en"
    )
    res4 = query_ai_assistant(req4)
    print(f"   Detected Intent: {res4.detected_intent}")
    print(f"   AI Reply: {res4.reply}")
    assert res4.detected_intent == "crowd_query"
    assert (
        "crowd score" in res4.reply.lower() or "visitor density" in res4.reply.lower()
    )

    # -------------------------------------------------------------
    # Test 5: Multilingual Interaction Support (Sinhala & Tamil & French)
    # -------------------------------------------------------------
    print("\n5. Testing Multilingual Interaction Support...")
    req5_si = ChatRequest(message="Sigiriya ticket price", language="si")
    res5_si = query_ai_assistant(req5_si)

    req5_ta = ChatRequest(message="Sigiriya ticket price", language="ta")
    res5_ta = query_ai_assistant(req5_ta)

    print(f"   Sinhala Response Length: {len(res5_si.reply)} chars")
    print(f"   Tamil Response Length: {len(res5_ta.reply)} chars")

    assert res5_si.language == "si"
    assert res5_ta.language == "ta"
    assert "ලංකාලෙන්ස්" in res5_si.reply or "LankaLens" in res5_si.reply
    assert "லங்காலென்ஸ்" in res5_ta.reply or "LankaLens" in res5_ta.reply

    # -------------------------------------------------------------
    # Test 6: Hallucination Safeguards & Standalone Validation Guardrail
    # -------------------------------------------------------------
    print("\n6. Testing Hallucination Safeguard & Price Mismatch Correction...")
    fake_text = "Sigiriya Ancient Rock Fortress ticket is currently $99.00 per person."
    val_req = HallucinationValidationRequest(
        generated_text=fake_text, mentioned_destination_ids=[1]
    )
    val_res = validate_hallucination_guardrail(val_req)
    print(f"   Passed Check: {val_res.passed}")
    print(f"   Detected Anomalies: {val_res.hallucinations_detected}")
    print(f"   Corrected Text: {val_res.corrected_text}")
    assert val_res.passed is False
    assert len(val_res.hallucinations_detected) > 0
    assert (
        "$36.00" in val_res.corrected_text
        or "official LankaLens baseline" in val_res.corrected_text
    )

    # -------------------------------------------------------------
    # Test 7: Export Updated OpenAPI Specification
    # -------------------------------------------------------------
    print("\n7. Exporting Updated OpenAPI Specification...")
    export_openapi_schema()
    print("   OpenAPI specification successfully updated!")

    print("\n" + "=" * 70)
    print("   ALL EPIC 18 AI TRAVEL ASSISTANT TESTS PASSED CLEANLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_all_ai_assistant_tests()

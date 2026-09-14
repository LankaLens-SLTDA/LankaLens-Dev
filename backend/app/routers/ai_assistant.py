"""FastAPI Router for EPIC 18 — AI Travel Assistant (Grounded Multilingual Intelligence)."""

from fastapi import APIRouter, status

from app.routers.destinations import IN_MEMORY_DESTINATIONS
from app.schemas.ai_assistant import (
    ChatRequest,
    ChatResponse,
    HallucinationValidationRequest,
    HallucinationValidationResponse,
)
from app.services.ai_assistant_service import GroundedAIAssistantService

router = APIRouter(prefix="/api/ai-assistant", tags=["AI Assistant"])

service = GroundedAIAssistantService()


@router.post(
    "/query",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Query Grounded Multilingual AI Travel Assistant",
    description=(
        "Processes natural language travel questions across destination, budget, itinerary, crowd, "
        "and partner queries. Retrieves authoritative LankaLens database facts and enforces hallucination safeguards."
    ),
)
def query_ai_assistant(req: ChatRequest) -> ChatResponse:
    """Processes natural language travel query with grounded RAG retrieval and hallucination validation."""
    return service.process_query(req, IN_MEMORY_DESTINATIONS)


@router.post(
    "/validate",
    response_model=HallucinationValidationResponse,
    status_code=status.HTTP_200_OK,
    summary="Validate AI text against hallucination guardrails",
    description="Inspects generated travel text and corrects any hallucinated prices or destination names to official SLTDA data.",
)
def validate_hallucination_guardrail(
    req: HallucinationValidationRequest,
) -> HallucinationValidationResponse:
    """Standalone hallucination guardrail verification endpoint."""
    return service.validate_hallucinations(req, IN_MEMORY_DESTINATIONS)

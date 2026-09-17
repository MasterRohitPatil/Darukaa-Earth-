from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.models.database import get_db
from app.schemas.environmental_state import EnvironmentalState
from app.schemas.recommendation import DecisionResult, RecommendationContract, ReasoningStep
from app.services.state_manager import state_manager
from app.reasoning.engine import reasoning_engine
from app.retrieval.engine import retrieval_engine
from app.services.llm_service import llm_service
from app.data_sources.geo_enricher import geo_enricher

router = APIRouter()

class GeoEnrichRequest(BaseModel):
    latitude: float
    longitude: float

class SetKeyRequest(BaseModel):
    gemini_api_key: str

@router.post("/settings/key")
async def set_gemini_key_endpoint(request: SetKeyRequest):
    """
    Updates the Google Gemini API key dynamically and saves to .env.
    """
    from app.config import settings
    settings.GEMINI_API_KEY = request.gemini_api_key.strip()
    
    # Also update backend/.env
    import os
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        with open(env_path, "w", encoding="utf-8") as f:
            for line in lines:
                if line.startswith("GEMINI_API_KEY="):
                    f.write(f"GEMINI_API_KEY={settings.GEMINI_API_KEY}\n")
                else:
                    f.write(line)

    return {
        "status": "success",
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "key_preview": f"{settings.GEMINI_API_KEY[:8]}..." if settings.GEMINI_API_KEY else None
    }

@router.post("/geo/enrich")
async def geo_enrich_endpoint(request: GeoEnrichRequest):
    """
    Enriches geographic coordinates with soil, climate, and biodiversity occurrence indicators.
    Includes explicit scientific disclaimer and fallback source labeling.
    """
    enriched_data = geo_enricher.enrich_coordinates(request.latitude, request.longitude)
    return enriched_data

class PincodeLookupRequest(BaseModel):
    pincode: str

@router.post("/geo/pincode")
async def geo_pincode_endpoint(request: PincodeLookupRequest):
    """
    Resolves an Indian PIN code (e.g. 422001) or place name to GPS coordinates and region.
    """
    result = geo_enricher.lookup_pincode_or_place(request.pincode)
    if not result:
        raise HTTPException(
            status_code=404, 
            detail=f"Location or PIN code '{request.pincode}' could not be resolved. Please try a valid 6-digit Indian PIN code (e.g. 422001) or district name."
        )
    return result

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    structured_data: Optional[Dict[str, Any]] = None

class ScenarioRequest(BaseModel):
    state: EnvironmentalState
    scenario_type: str  # "cover_crops", "hedgerows", "agroforestry", "ipm"

@router.post("/chat")
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Main conversational endpoint:
    - Maintains multi-turn session memory
    - Parses ecological facts from message or accepts structured input
    - Asks clarifying questions if critical variables are missing
    - Reasons across at least 3 environmental variables when sufficient
    - Returns structured recommendations with scientific evidence traces
    """
    session_id, current_state = state_manager.get_or_create_state(request.session_id, db)
    
    # 1. Parse environmental facts from user message
    extracted_facts = state_manager.parse_text_facts(request.message)
    
    # 2. Merge structured data if provided
    if request.structured_data:
        extracted_facts.update(request.structured_data)
        
    updated_state = current_state.merge_update(extracted_facts)
    state_manager.save_state(session_id, updated_state, db)
    state_manager.record_message(session_id, "user", request.message, request.structured_data, db)

    # 3. Check sufficiency & critical missing variables
    is_sufficient = updated_state.is_sufficient_for_reasoning()
    clarifying_questions = state_manager.generate_clarifying_questions(updated_state) if not is_sufficient else []

    reasoning_steps: List[ReasoningStep] = []
    recommendations: List[RecommendationContract] = []
    retrieved_evidence = []

    if is_sufficient:
        recommendations, reasoning_steps = reasoning_engine.generate_recommendations(updated_state)
        # Pull supporting evidence for the query
        retrieved_evidence = retrieval_engine.retrieve(
            query=f"{request.message} {updated_state.land.crop or ''} {updated_state.soil.moisture or ''}",
            target_variables=["soil_organic_carbon", "soil_moisture", "monoculture"],
            ecosystem_hint=updated_state.climate.seasonality or "semi-arid",
            top_k=3
        )

    # 4. Synthesize explanation
    response_payload = llm_service.synthesize_response(
        user_message=request.message,
        state=updated_state,
        reasoning_steps=reasoning_steps,
        recommendations=recommendations,
        clarifying_questions=clarifying_questions,
        retrieved_evidence=retrieved_evidence
    )

    state_manager.record_message(session_id, "assistant", response_payload["explanation"], response_payload, db)

    return {
        "session_id": session_id,
        "state": updated_state.model_dump(),
        "completeness_score": updated_state.calculate_completeness_score(),
        "is_sufficient": is_sufficient,
        "explanation": response_payload["explanation"],
        "clarifying_questions": response_payload["clarifying_questions"],
        "reasoning_steps": [s.model_dump() for s in reasoning_steps],
        "recommendations": [r.model_dump() for r in recommendations],
        "evidence": response_payload["evidence"],
        "validation_warnings": response_payload["validation_warnings"]
    }

@router.get("/state/{session_id}")
async def get_state_endpoint(session_id: str, db: Session = Depends(get_db)):
    _, state = state_manager.get_or_create_state(session_id, db)
    history = state_manager.get_chat_history(session_id, db)
    return {
        "session_id": session_id,
        "state": state.model_dump(),
        "completeness_score": state.calculate_completeness_score(),
        "chat_history": history
    }

@router.post("/reason")
async def direct_reason_endpoint(state: EnvironmentalState):
    """
    Direct multi-metric reasoning endpoint for structured JSON input.
    """
    recs, steps = reasoning_engine.generate_recommendations(state)
    return {
        "state_summary": state.model_dump(),
        "is_sufficient": state.is_sufficient_for_reasoning(),
        "missing_critical_variables": state.get_missing_critical_variables(),
        "reasoning_chain": [s.model_dump() for s in steps],
        "recommendations": [r.model_dump() for r in recs]
    }

@router.get("/evidence")
async def list_evidence_endpoint(query: Optional[str] = None):
    """
    Retrieve knowledge records with metadata and citation data.
    """
    if query:
        docs = retrieval_engine.retrieve(query=query, top_k=6)
    else:
        docs = retrieval_engine.documents
    return {"count": len(docs), "evidence": [d.model_dump() for d in docs]}

@router.post("/scenario")
async def scenario_endpoint(request: ScenarioRequest):
    """
    Lightweight What-If scenario comparator comparing current state against proposed interventions.
    """
    current_recs, current_steps = reasoning_engine.generate_recommendations(request.state)
    
    # Project state change under scenario
    scenario_mods = {}
    if request.scenario_type == "cover_crops":
        scenario_mods = {
            "soil": {"organic_carbon_percent": min(2.5, (request.state.soil.organic_carbon_percent or 0.4) + 0.25), "moisture": "adequate"},
            "land": {"habitat_diversity": "moderate"}
        }
        title = "Scenario: Establish Legume-Grass Cover Crops"
        expected_mechanism = "Continuous root exudates and biomass mulch elevate soil organic carbon and conserve moisture."
    elif request.scenario_type == "hedgerows":
        scenario_mods = {
            "land": {"habitat_diversity": "high", "monoculture": False},
            "human_impact": {"pesticide_pressure": "low"}
        }
        title = "Scenario: Native Perennial Floral Hedgerows"
        expected_mechanism = "Non-crop perennial flowering margins provide pollinator forage and biological pest suppression."
    elif request.scenario_type == "agroforestry":
        scenario_mods = {
            "climate": {"temperature": max(20.0, (request.state.climate.temperature or 30.0) - 2.5)},
            "land": {"canopy_cover_percent": 25, "habitat_diversity": "high"}
        }
        title = "Scenario: Boundary Agroforestry Shelterbelts"
        expected_mechanism = "Multi-strata tree belts moderate wind speed, reduce evapotranspiration, and build vertical biodiversity corridors."
    else:
        title = "Scenario: Status Quo"
        expected_mechanism = "No management adjustment."

    simulated_state = request.state.merge_update(scenario_mods)
    sim_recs, sim_steps = reasoning_engine.generate_recommendations(simulated_state)

    return {
        "title": title,
        "scenario_type": request.scenario_type,
        "mechanism": expected_mechanism,
        "original_state": request.state.model_dump(),
        "simulated_state": simulated_state.model_dump(),
        "baseline_pressures": [s.ecological_pressure for s in current_steps],
        "remaining_pressures": [s.ecological_pressure for s in sim_steps],
        "projected_improvements": [
            {"metric": "Soil Resilience", "change": "Elevated (+0.25% SOC)" if "cover" in request.scenario_type else "Maintained"},
            {"metric": "Pollinator Abundance", "change": "+50% documented wild pollinator richness" if "hedgerow" in request.scenario_type else "Neutral"},
            {"metric": "Microclimate Thermal Buffer", "change": "-2 to -3°C buffer under peak heat" if "agroforestry" in request.scenario_type else "Unchanged"}
        ]
    }

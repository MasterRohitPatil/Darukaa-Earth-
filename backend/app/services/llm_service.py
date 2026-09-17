import json
import logging
from typing import List, Dict, Any, Optional
import httpx
from app.config import settings
from app.schemas.environmental_state import EnvironmentalState
from app.schemas.recommendation import RecommendationContract, ReasoningStep
from app.schemas.evidence import EvidenceRecord
from app.services.evidence_validator import evidence_validator

logger = logging.getLogger(__name__)

class LLMExplanationService:
    """
    Manages LLM conversational explanations and clarification prompts.
    Uses Google Gemini API when configured, and falls back to a deterministic,
    scientifically grounded synthesizer when in offline/testing mode.
    """
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = httpx.Client(timeout=15.0)

    def synthesize_response(
        self,
        user_message: str,
        state: EnvironmentalState,
        reasoning_steps: List[ReasoningStep],
        recommendations: List[RecommendationContract],
        clarifying_questions: List[str],
        retrieved_evidence: List[EvidenceRecord]
    ) -> Dict[str, Any]:
        """
        Coordinates either Gemini API or deterministic synthesis to produce
        the final validated conversational response.
        """
        # Validate recommendations against retrieved evidence
        sanitized_recs = []
        validation_warnings = []
        for rec in recommendations:
            clean_rec, warns = evidence_validator.validate_and_sanitize(rec, retrieved_evidence)
            sanitized_recs.append(clean_rec)
            validation_warnings.extend(warns)

        # If clarifying questions are needed (insufficient data), generate conversational question prompt
        if clarifying_questions and not state.is_sufficient_for_reasoning():
            explanation = self._generate_clarification_dialog(user_message, state, clarifying_questions)
            return {
                "explanation": explanation,
                "needs_clarification": True,
                "clarifying_questions": clarifying_questions,
                "reasoning_steps": [],
                "recommendations": [],
                "evidence": [],
                "validation_warnings": []
            }

        # If sufficient data, generate full scientific decision explanation
        if self.api_key and not settings.ALLOW_MOCK_FALLBACK:
            try:
                gemini_text = self._call_gemini(user_message, state, reasoning_steps, sanitized_recs, retrieved_evidence)
                if gemini_text:
                    return {
                        "explanation": gemini_text,
                        "needs_clarification": False,
                        "clarifying_questions": [],
                        "reasoning_steps": reasoning_steps,
                        "recommendations": sanitized_recs,
                        "evidence": [e.model_dump() for e in retrieved_evidence],
                        "validation_warnings": validation_warnings
                    }
            except Exception as e:
                logger.warning(f"Gemini API call failed, falling back to deterministic synthesis: {e}")

        # Deterministic synthesis (offline / resilient mode)
        synth_text = self._deterministic_synthesize(state, reasoning_steps, sanitized_recs)
        return {
            "explanation": synth_text,
            "needs_clarification": False,
            "clarifying_questions": [],
            "reasoning_steps": reasoning_steps,
            "recommendations": sanitized_recs,
            "evidence": [e.model_dump() for e in retrieved_evidence],
            "validation_warnings": validation_warnings
        }

    def _generate_clarification_dialog(self, user_message: str, state: EnvironmentalState, questions: List[str]) -> str:
        region = state.location.region or "your site"
        intro = f"Thank you for sharing your ecological observation regarding {region}. "
        reason = (
            "To deliver an evidence-grounded diagnosis rather than a generic recommendation, "
            "we need to assess how key environmental variables interact (such as soil organic matter, water availability, and land management). "
        )
        q_list = "\n".join([f"• {q}" for q in questions])
        outro = "\n\nCould you clarify any of these details so we can run a rigorous multi-metric analysis?"
        return intro + reason + "\n\n" + q_list + outro

    def _deterministic_synthesize(
        self,
        state: EnvironmentalState,
        steps: List[ReasoningStep],
        recommendations: List[RecommendationContract]
    ) -> str:
        parts = []
        loc = state.location.region or "the monitored parcel"
        crop = state.land.crop or state.land.land_use or "cultivated land"
        
        parts.append(f"### Multi-Variable Ecological Assessment for {loc} ({crop.title()})\n")
        parts.append(
            "Based on the environmental data analyzed, our deterministic reasoning engine evaluated the cross-domain "
            "interactions across soil health, climate hydrology, and landscape biodiversity.\n"
        )

        parts.append("#### Key Ecological Pressures Identified:")
        for s in steps:
            parts.append(f"- **{s.ecological_pressure}**: {s.observation}. *Implication*: {s.implication}")

        if recommendations:
            parts.append("\n#### Evidence-Grounded Priority Interventions:")
            for idx, r in enumerate(recommendations, 1):
                orgs = ", ".join({e.organization for e in r.evidence})
                parts.append(f"**{idx}. {r.recommendation}** ({r.time_horizon.upper()} Horizon | Confidence: {r.confidence.upper()})")
                parts.append(f"- *Mechanism*: {r.why_it_works}")
                parts.append(f"- *Variables Examined*: {', '.join(r.variables_used)}")
                parts.append(f"- *Scientific Sources*: {orgs}")
                parts.append(f"- *Uncertainty & Boundaries*: {r.uncertainty}\n")

        return "\n".join(parts)

    def _call_gemini(
        self,
        user_message: str,
        state: EnvironmentalState,
        steps: List[ReasoningStep],
        recommendations: List[RecommendationContract],
        retrieved_evidence: List[EvidenceRecord]
    ) -> Optional[str]:
        # Using Gemini 2.5 Flash / 1.5 Flash via REST
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        
        prompt = f"""
You are EcoReason, an evidence-grounded AI environmental scientist and decision intelligence system.
Explain the ecological findings and recommendations to the user in professional, accessible scientific language.

RULES:
1. Ground every claim strictly in the provided reasoning steps and retrieved evidence.
2. DO NOT invent quantitative numbers (% or multipliers) that are not in the retrieved evidence.
3. Explicitly state the variables analyzed ({', '.join([s.observation for s in steps])}).
4. Highlight uncertainty and site-specific dependencies.

User Message: {user_message}
Environmental State: {state.model_dump_json()}
Reasoning Pressures: {[s.model_dump() for s in steps]}
Recommendations: {[r.model_dump() for r in recommendations]}
Retrieved Evidence: {[e.text for e in retrieved_evidence]}
"""
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "maxOutputTokens": 1000}
        }
        
        response = self.client.post(url, params={"key": self.api_key}, json=payload, timeout=12.0)
        if response.status_code == 200:
            data = response.json()
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text")
        return None

llm_service = LLMExplanationService()

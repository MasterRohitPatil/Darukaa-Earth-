import json
import re
import uuid
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from app.schemas.environmental_state import EnvironmentalState, LocationState, SoilState, ClimateState, LandState, HumanImpactState
from app.models.entities import SessionEntity, EnvironmentalStateEntity, ChatMessageEntity
from app.models.database import SessionLocal

class EnvironmentalStateManager:
    """
    Maintains conversational memory, tracks missing critical environmental variables,
    and handles incremental multi-turn state updates.
    """
    def __init__(self):
        pass

    def get_or_create_state(self, session_id: Optional[str], db: Session) -> Tuple[str, EnvironmentalState]:
        if not session_id:
            session_id = str(uuid.uuid4())
            session_entity = SessionEntity(session_id=session_id)
            db.add(session_entity)
            
            init_state = EnvironmentalState(session_id=session_id)
            state_entity = EnvironmentalStateEntity(
                session_id=session_id,
                state_json=init_state.model_dump_json(),
                completeness_score=0.0
            )
            db.add(state_entity)
            db.commit()
            return session_id, init_state

        state_entity = db.query(EnvironmentalStateEntity).filter_by(session_id=session_id).order_by(EnvironmentalStateEntity.id.desc()).first()
        if not state_entity:
            init_state = EnvironmentalState(session_id=session_id)
            state_entity = EnvironmentalStateEntity(
                session_id=session_id,
                state_json=init_state.model_dump_json(),
                completeness_score=0.0
            )
            db.add(state_entity)
            db.commit()
            return session_id, init_state

        state_data = json.loads(state_entity.state_json)
        return session_id, EnvironmentalState(**state_data)

    def save_state(self, session_id: str, state: EnvironmentalState, db: Session):
        state_json = state.model_dump_json()
        score = state.calculate_completeness_score()
        state_entity = EnvironmentalStateEntity(
            session_id=session_id,
            state_json=state_json,
            completeness_score=score
        )
        db.add(state_entity)
        db.commit()

    def record_message(self, session_id: str, role: str, content: str, structured_payload: Optional[Dict[str, Any]], db: Session):
        def _json_serializer(o):
            if hasattr(o, "model_dump"):
                return o.model_dump()
            return str(o)

        entity = ChatMessageEntity(
            session_id=session_id,
            role=role,
            content=content,
            structured_payload=json.dumps(structured_payload, default=_json_serializer) if structured_payload else None
        )
        db.add(entity)
        db.commit()

    def get_chat_history(self, session_id: str, db: Session) -> List[Dict[str, Any]]:
        messages = db.query(ChatMessageEntity).filter_by(session_id=session_id).order_by(ChatMessageEntity.created_at.asc()).all()
        return [
            {
                "role": m.role,
                "content": m.content,
                "structured_payload": json.loads(m.structured_payload) if m.structured_payload else None,
                "created_at": m.created_at.isoformat() if m.created_at else None
            }
            for m in messages
        ]

    def parse_text_facts(self, text: str) -> Dict[str, Any]:
        """
        Deterministic extraction of ecological observations from natural language.
        Extracts numbers, percentages, crop types, locations, and irrigation contexts.
        """
        lower = text.lower()
        extracted: Dict[str, Any] = {
            "location": {},
            "soil": {},
            "climate": {},
            "land": {},
            "human_impact": {}
        }

        # 1. Soil Organic Carbon % (e.g. 0.3% soil organic carbon, 0.3% organic carbon, 0.45% soc)
        carbon_match = re.search(r'(\d+(?:\.\d+)?)\s*%\s*(?:soil\s+)?(?:organic\s+carbon|soc|carbon)', lower) or \
                       re.search(r'(?:soil\s+)?(?:organic\s+carbon|soc)\s*(?:is|of|around|about|at)?\s*(\d+(?:\.\d+)?)\s*%', lower) or \
                       re.search(r'(?:soil\s+)?carbon(?:\s*percent)?\s*(?:is|:)?\s*(\d+(?:\.\d+)?)', lower)
        if carbon_match:
            try:
                extracted["soil"]["organic_carbon_percent"] = float(carbon_match.group(1))
            except ValueError:
                pass

        # 2. Soil Texture & Moisture
        for texture in ["sandy loam", "sandy", "clay loam", "clay", "loam", "silt"]:
            if texture in lower:
                extracted["soil"]["texture"] = texture
                break

        if any(w in lower for w in ["dry soil", "low moisture", "arid soil", "water stress"]):
            extracted["soil"]["moisture"] = "low"
        elif any(w in lower for w in ["waterlogged", "marshy", "excess moisture"]):
            extracted["soil"]["moisture"] = "waterlogged"

        # 3. Rainfall & Climate (e.g. 450mm, 500 mm rainfall, low rainfall)
        rain_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:mm|millimeters)\s*(?:rain|rainfall)?', lower) or \
                     re.search(r'rainfall\s*(?:is|of|around|about)?\s*(\d+(?:\.\d+)?)\s*mm', lower)
        if rain_match:
            try:
                extracted["climate"]["rainfall"] = float(rain_match.group(1))
            except ValueError:
                pass
        elif "low rainfall" in lower or "dryland" in lower or "semi-arid" in lower:
            extracted["climate"]["seasonality"] = "semi-arid"
            if extracted["climate"].get("rainfall") is None:
                extracted["climate"]["rainfall"] = 450.0  # Representative low baseline indicator

        if "semi-arid" in lower or "arid" in lower:
            extracted["climate"]["seasonality"] = "semi-arid"
        elif "monsoon" in lower or "tropical" in lower:
            extracted["climate"]["seasonality"] = "tropical monsoon"

        # 4. Land Use & Crop Types
        known_crops = [
            "grapes", "grapevine", "vineyard", "wheat", "cotton", "soybean", "rice", "paddy",
            "maize", "corn", "sugarcane", "banana", "groundnut", "peanut", "millet",
            "jowar", "sorghum", "bajra", "pulses", "mustard", "onion", "chili", "chilli"
        ]
        for crop in known_crops:
            if crop in lower:
                extracted["land"]["crop"] = "grapes" if crop in ["grapevine", "vineyard"] else ("rice" if crop == "paddy" else ("maize" if crop == "corn" else crop))
                extracted["land"]["land_use"] = "cropland"
                break

        if any(w in lower for w in ["monoculture", "single crop", "only crop", "solely", "one crop", "single-crop"]):
            extracted["land"]["monoculture"] = True
        elif any(w in lower for w in ["polyculture", "intercropped", "mixed crop", "diversified"]):
            extracted["land"]["monoculture"] = False

        if any(w in lower for w in ["low biodiversity", "bare edges", "no trees", "no hedgerow", "very low diversity"]):
            extracted["land"]["habitat_diversity"] = "very_low"

        # 5. Location hints (e.g. near Nashik, in Maharashtra, Punjab)
        loc_match = re.search(r'(?:near|in|around|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', text)
        if loc_match:
            extracted["location"]["region"] = loc_match.group(1).strip()

        # 6. Pesticide Pressure
        if any(w in lower for w in ["heavy pesticide", "high pesticide", "frequent spraying", "chemical spray", "pesticides"]):
            extracted["human_impact"]["pesticide_pressure"] = "high"
        elif any(w in lower for w in ["certified organic", "organic farm", "organic agriculture", "no spray", "chemical free", "low pesticide"]):
            extracted["human_impact"]["pesticide_pressure"] = "low"

        # Clean empty dicts
        return {k: v for k, v in extracted.items() if v}

    def generate_clarifying_questions(self, state: EnvironmentalState) -> List[str]:
        """
        Generates targeted, highly useful clarifying questions to gather the minimum
        critical variables needed before rushing to a diagnosis.
        """
        questions = []
        missing = state.get_missing_critical_variables()

        if any("land_use" in m for m in missing):
            questions.append("What is your primary crop or land use (e.g., vineyard/grapes, wheat, orchard, or pasture)?")
        
        if any("crop_diversity" in m for m in missing):
            questions.append("Is the land managed as a single-crop monoculture, or are there field margins, intercrops, or trees present?")

        if any("climate_water" in m for m in missing):
            questions.append("What is your approximate annual rainfall or irrigation method (e.g. rainfed, drip, or canal)?")

        if any("soil_health" in m for m in missing):
            questions.append("Do you have recent soil test figures (such as Organic Carbon % or pH), or general observations of soil moisture and texture?")

        if not state.location.region and state.location.latitude is None:
            questions.append("Which geographic region or nearest district is this land located in?")

        # Cap at the 3 most critical questions to avoid overwhelming the user
        return questions[:3]

# Singleton instance
state_manager = EnvironmentalStateManager()

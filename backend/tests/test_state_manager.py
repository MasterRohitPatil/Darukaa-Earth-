import pytest
from app.services.state_manager import EnvironmentalStateManager
from app.models.database import SessionLocal, init_db
from app.schemas.environmental_state import EnvironmentalState

def test_parse_text_facts():
    manager = EnvironmentalStateManager()
    
    # Test turn 1: Vague problem + location
    text1 = "Biodiversity is declining on my farm near Nashik."
    facts1 = manager.parse_text_facts(text1)
    assert facts1.get("location", {}).get("region") == "Nashik"

    # Test turn 2: Crop + monoculture + soil carbon + rainfall
    text2 = "It is a wheat monoculture, soil organic carbon is 0.35%, and annual rainfall is around 480mm."
    facts2 = manager.parse_text_facts(text2)
    assert facts2.get("land", {}).get("crop") == "wheat"
    assert facts2.get("land", {}).get("monoculture") is True
    assert facts2.get("soil", {}).get("organic_carbon_percent") == 0.35
    assert facts2.get("climate", {}).get("rainfall") == 480.0

def test_clarifying_questions_incomplete_input():
    manager = EnvironmentalStateManager()
    state = EnvironmentalState()  # completely empty
    questions = manager.generate_clarifying_questions(state)
    assert len(questions) > 0
    assert len(questions) <= 3
    # Check that questions target crop, climate, and soil
    joined_q = " ".join(questions).lower()
    assert "crop" in joined_q or "soil" in joined_q or "rainfall" in joined_q

def test_multi_turn_session_memory():
    init_db()
    db = SessionLocal()
    manager = EnvironmentalStateManager()

    # 1. First turn: user gives region
    session_id, state1 = manager.get_or_create_state(None, db)
    facts1 = manager.parse_text_facts("My farm is located near Nashik in Maharashtra.")
    state2 = state1.merge_update(facts1)
    manager.save_state(session_id, state2, db)
    manager.record_message(session_id, "user", "My farm is located near Nashik in Maharashtra.", None, db)

    # 2. Second turn: user gives crop and irrigation/rainfall
    session_id_retrieved, state_turn2 = manager.get_or_create_state(session_id, db)
    assert state_turn2.location.region == "Nashik"  # Retained from turn 1!

    facts2 = manager.parse_text_facts("We grow grapes as a monoculture with 450mm rainfall.")
    state3 = state_turn2.merge_update(facts2)
    manager.save_state(session_id, state3, db)

    # 3. Third check: state has both Nashik AND grapes AND 450mm
    _, final_state = manager.get_or_create_state(session_id, db)
    db.close()
    
    assert final_state.location.region == "Nashik"
    assert final_state.land.crop == "grapes"
    assert final_state.land.monoculture is True
    assert final_state.climate.rainfall == 450.0

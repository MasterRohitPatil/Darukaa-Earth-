import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_demo_scenario_1_incomplete_input_to_clarification_flow():
    """
    Scenario 1 from brief:
    User: 'Biodiversity is declining on my land.'
    Expected: system asks targeted clarifying questions, stores answers,
    then analyzes the completed state across turns.
    """
    # Turn 1: Vague statement
    resp1 = client.post("/api/chat", json={"message": "Biodiversity is declining on my land near Nashik."})
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["is_sufficient"] is False
    assert len(data1["clarifying_questions"]) > 0
    assert len(data1["recommendations"]) == 0
    session_id = data1["session_id"]
    assert data1["state"]["location"]["region"] == "Nashik"

    # Turn 2: Providing the missing variables
    resp2 = client.post("/api/chat", json={
        "session_id": session_id,
        "message": "It is a wheat monoculture, rainfall is around 450mm, and soil organic carbon is 0.35%."
    })
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["is_sufficient"] is True
    assert len(data2["recommendations"]) >= 1
    # Check that region from turn 1 was preserved
    assert data2["state"]["location"]["region"] == "Nashik"
    assert data2["state"]["land"]["crop"] == "wheat"
    assert data2["state"]["climate"]["rainfall"] == 450.0

def test_demo_scenario_2_structured_environmental_case():
    """
    Scenario 2 from brief:
    Soil organic carbon: 0.3%, Rainfall: low (450mm), Crop: monoculture wheat, Region: semi-arid
    Expected: multi-variable reasoning, specific intervention(s), affected metrics, time horizon, evidence, uncertainty.
    """
    resp = client.post("/api/chat", json={
        "message": "Semi-arid wheat monoculture farm with 450mm rainfall and 0.3% soil organic carbon."
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_sufficient"] is True
    assert len(data["reasoning_steps"]) >= 2
    assert len(data["recommendations"]) >= 1

    rec = data["recommendations"][0]
    # Check output contract requirements:
    assert "recommendation" in rec
    assert "why_it_works" in rec
    assert len(rec["variables_used"]) >= 3
    assert len(rec["impacted_metrics"]) >= 1
    assert rec["time_horizon"] in ["short", "medium", "long"]
    assert rec["confidence"] in ["low", "medium", "high"]
    assert len(rec["evidence"]) >= 1
    assert len(rec["uncertainty"]) > 10

def test_demo_scenario_3_geo_enabled_case():
    """
    Scenario 3 from brief:
    User supplies coordinates. System enriches the state with available soil/climate/species context,
    clearly labels data sources and limitations, then produces evidence-backed recommendations.
    """
    # 1. Geo enrich coordinates
    geo_resp = client.post("/api/geo/enrich", json={"latitude": 19.99, "longitude": 73.78})
    assert geo_resp.status_code == 200
    geo_data = geo_resp.json()
    assert "data_sources" in geo_data
    assert "scientific_disclaimer" in geo_data

    # 2. Chat with enriched state
    chat_resp = client.post("/api/chat", json={
        "message": "Enriched coordinates near Nashik. Grapes monoculture with 520mm rainfall and 0.42% soil organic carbon.",
        "structured_data": geo_data
    })
    assert chat_resp.status_code == 200
    chat_data = chat_resp.json()
    assert chat_data["is_sufficient"] is True
    assert len(chat_data["recommendations"]) >= 1
    assert any("FAO" in e["source_organization"] or "IPBES" in e["source_organization"] or "ISRIC" in e["source_organization"] for e in chat_data["evidence"])

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.evidence_validator import evidence_validator
from app.schemas.recommendation import RecommendationContract, ImpactedMetric, EvidenceCitation
from app.schemas.evidence import EvidenceRecord

client = TestClient(app)

def test_chat_incomplete_triggers_clarification():
    response = client.post("/api/chat", json={
        "message": "Biodiversity is declining on my farm."
    })
    assert response.status_code == 200
    data = response.json()
    assert data["is_sufficient"] is False
    assert len(data["clarifying_questions"]) > 0
    assert "clarify" in data["explanation"].lower() or "environmental" in data["explanation"].lower()
    assert len(data["recommendations"]) == 0

def test_chat_complete_returns_recommendations():
    response = client.post("/api/chat", json={
        "message": "My farm is near Nashik. We grow grapes as a monoculture with 450mm rainfall, low moisture, and soil organic carbon of 0.35%."
    })
    assert response.status_code == 200
    data = response.json()
    assert data["is_sufficient"] is True
    assert len(data["reasoning_steps"]) >= 1
    assert len(data["recommendations"]) >= 1
    rec = data["recommendations"][0]
    assert len(rec["variables_used"]) >= 3
    assert len(rec["evidence"]) >= 1

def test_direct_reason_endpoint():
    payload = {
        "soil": {"organic_carbon_percent": 0.3, "moisture": "low"},
        "climate": {"rainfall": 420.0, "seasonality": "semi-arid"},
        "land": {"crop": "wheat", "monoculture": True, "habitat_diversity": "very_low"}
    }
    response = client.post("/api/reason", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_sufficient"] is True
    assert len(data["reasoning_chain"]) >= 2
    assert len(data["recommendations"]) >= 1

def test_geo_enrichment():
    # Nashik coordinates
    response = client.post("/api/geo/enrich", json={"latitude": 19.99, "longitude": 73.78})
    assert response.status_code == 200
    data = response.json()
    assert "location" in data
    assert "soil" in data
    assert "climate" in data
    assert "scientific_disclaimer" in data
    assert len(data["data_sources"]) > 0

def test_evidence_endpoint():
    response = client.get("/api/evidence")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 5

def test_scenario_comparator():
    payload = {
        "state": {
            "soil": {"organic_carbon_percent": 0.3, "moisture": "low"},
            "climate": {"rainfall": 450.0},
            "land": {"crop": "wheat", "monoculture": True, "habitat_diversity": "very_low"}
        },
        "scenario_type": "cover_crops"
    }
    response = client.post("/api/scenario", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Cover Crops" in data["title"]
    assert len(data["projected_improvements"]) > 0

def test_evidence_validator_anti_hallucination():
    fake_rec = RecommendationContract(
        recommendation="Test intervention",
        why_it_works="This technique miraculously increases biodiversity by 99% and crop yields by 85%.",
        variables_used=["soil", "water", "crop"],
        impacted_metrics=[ImpactedMetric(metric="biodiversity", direction="increase")],
        time_horizon="short",
        confidence="high",
        evidence=[
            EvidenceCitation(
                title="Unknown fake source",
                organization="Fabricated Org",
                claim_supported="Fake claim",
                url="https://fake-link.org"
            )
        ],
        uncertainty=""
    )
    
    clean_rec, warnings = evidence_validator.validate_and_sanitize(fake_rec, [])
    assert len(warnings) > 0
    # Unsupported numbers should be sanitized or flagged
    assert "99%" not in clean_rec.why_it_works
    assert len(clean_rec.uncertainty) > 15

import pytest
from app.schemas.environmental_state import EnvironmentalState, LocationState, SoilState, ClimateState, LandState
from app.schemas.evidence import EvidenceRecord
from app.schemas.recommendation import RecommendationContract, ImpactedMetric, EvidenceCitation
from app.models import init_db, engine, Base

def test_environmental_state_missing_variables():
    # Empty state should have all critical variables missing
    empty_state = EnvironmentalState()
    missing = empty_state.get_missing_critical_variables()
    assert len(missing) >= 3
    assert not empty_state.is_sufficient_for_reasoning()
    assert empty_state.calculate_completeness_score() == 0.0

    # Populated state with 3+ variables
    populated = EnvironmentalState(
        soil=SoilState(organic_carbon_percent=0.35, moisture="low"),
        climate=ClimateState(rainfall=450.0, seasonality="semi-arid"),
        land=LandState(crop="wheat", monoculture=True, habitat_diversity="very_low")
    )
    assert populated.is_sufficient_for_reasoning()
    assert populated.calculate_completeness_score() > 0.5
    # Since organic_carbon, moisture, rainfall, seasonality, crop, monoculture are provided:
    remaining_missing = populated.get_missing_critical_variables()
    assert len(remaining_missing) == 0

def test_environmental_state_merge_update():
    state = EnvironmentalState(
        location=LocationState(region="Nashik"),
        soil=SoilState(organic_carbon_percent=0.4)
    )
    # Update with new crop without destroying soil organic carbon
    updated = state.merge_update({
        "land": {"crop": "grapes", "monoculture": True},
        "soil": {"moisture": "low"}
    })
    assert updated.location.region == "Nashik"
    assert updated.soil.organic_carbon_percent == 0.4
    assert updated.soil.moisture == "low"
    assert updated.land.crop == "grapes"
    assert updated.land.monoculture is True

def test_evidence_record_validation():
    ev = EvidenceRecord(
        id="fao-2023-test",
        title="Conservation Agriculture Assessment",
        source_organization="FAO",
        year=2023,
        topic="soil health",
        variables=["soil_organic_carbon", "soil_moisture"],
        intervention="cover_crops",
        ecosystem="semi-arid agriculture",
        mechanism="Ground cover reduces evaporation and increases microbial activity.",
        effect_direction={"soil_organic_carbon": "increase", "soil_moisture": "increase"},
        time_horizon="medium",
        evidence_strength="high",
        text="Field measurements demonstrate consistent increases in soil organic carbon.",
        source_url="https://www.fao.org/soils"
    )
    assert ev.id == "fao-2023-test"
    assert ev.evidence_strength == "high"

def test_recommendation_contract_validation():
    rec = RecommendationContract(
        recommendation="Establish Drought-Tolerant Legume-Grass Cover Crops",
        why_it_works="Root exudates restore soil organic matter and preserve sub-surface moisture.",
        variables_used=["soil organic carbon", "rainfall", "monoculture wheat"],
        impacted_metrics=[
            ImpactedMetric(metric="soil organic carbon", direction="increase"),
            ImpactedMetric(metric="soil water retention", direction="increase")
        ],
        time_horizon="medium",
        confidence="high",
        evidence=[
            EvidenceCitation(
                title="FAO Conservation Agriculture Guidelines",
                organization="FAO",
                claim_supported="Increases carbon retention and reduces soil erosion",
                url="https://fao.org/soils"
            )
        ],
        uncertainty="Impact magnitude depends on seasonal winter precipitation timing."
    )
    assert len(rec.variables_used) == 3
    assert rec.confidence == "high"

def test_database_init():
    init_db()
    # Verify tables created
    table_names = list(Base.metadata.tables.keys())
    assert "sessions" in table_names
    assert "environmental_states" in table_names
    assert "chat_messages" in table_names
    assert "scientific_evidence" in table_names

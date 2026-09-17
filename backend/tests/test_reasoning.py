import pytest
from app.schemas.environmental_state import EnvironmentalState, SoilState, ClimateState, LandState, HumanImpactState
from app.reasoning.engine import EnvironmentalReasoningEngine

def test_multi_metric_reasoning_scenario_wheat():
    # Scenario 2 from hackathon brief:
    # Soil organic carbon: 0.3%, Rainfall: low (450mm), Crop: monoculture wheat, Region: semi-arid
    state = EnvironmentalState(
        soil=SoilState(organic_carbon_percent=0.3, moisture="low", texture="sandy loam"),
        climate=ClimateState(rainfall=450.0, seasonality="semi-arid"),
        land=LandState(crop="wheat", monoculture=True, habitat_diversity="very_low"),
        human_impact=HumanImpactState(pesticide_pressure="moderate")
    )
    
    engine = EnvironmentalReasoningEngine()
    recommendations, steps = engine.generate_recommendations(state)
    
    # Must have evaluated at least 3 variables
    assert len(steps) >= 2
    assert any("soil.organic_carbon_percent" in s.variables for s in steps)
    assert any("land.monoculture" in s.variables for s in steps)
    
    # Must produce actionable recommendations backed by evidence
    assert len(recommendations) >= 1
    top_rec = recommendations[0]
    assert len(top_rec.variables_used) >= 3
    assert len(top_rec.impacted_metrics) >= 2
    assert len(top_rec.evidence) >= 1
    assert top_rec.confidence in ["low", "medium", "high"]
    assert top_rec.time_horizon in ["short", "medium", "long"]
    assert len(top_rec.uncertainty) > 10
    
    # Scientific citations must have organization and URL
    assert top_rec.evidence[0].organization in ["FAO", "IPCC", "IPBES", "ISRIC"]
    assert top_rec.evidence[0].url.startswith("http")

def test_vineyard_pesticide_reasoning():
    # Vineyard with high pesticide pressure and pollinator deficit
    state = EnvironmentalState(
        soil=SoilState(organic_carbon_percent=0.5, moisture="medium"),
        climate=ClimateState(rainfall=650.0, seasonality="tropical wet-dry"),
        land=LandState(crop="grapes", monoculture=True, habitat_diversity="low"),
        human_impact=HumanImpactState(pesticide_pressure="high")
    )
    engine = EnvironmentalReasoningEngine()
    recs, steps = engine.generate_recommendations(state)
    assert len(recs) >= 1
    # Check that beneficial insects or hedgerows or IPM are recommended
    rec_texts = " ".join([r.recommendation.lower() + " " + r.why_it_works.lower() for r in recs])
    assert "hedgerow" in rec_texts or "pest" in rec_texts or "floral" in rec_texts or "cover" in rec_texts

import pytest
from app.retrieval.engine import KnowledgeRetrievalEngine
from app.models.database import SessionLocal, init_db
from app.models.entities import ScientificEvidenceEntity

def test_knowledge_retrieval_engine_loading():
    engine = KnowledgeRetrievalEngine()
    assert len(engine.documents) >= 5
    assert all(any(org in doc.source_organization for org in ["FAO", "IPCC", "IPBES", "ISRIC"]) for doc in engine.documents)

def test_hybrid_retrieval_cover_crops():
    engine = KnowledgeRetrievalEngine()
    results = engine.retrieve(
        query="low soil organic carbon dryland cover crops and water conservation",
        target_variables=["soil_organic_carbon", "soil_moisture"],
        ecosystem_hint="semi-arid agriculture",
        top_k=2
    )
    assert len(results) > 0
    top_doc = results[0]
    assert "cover" in top_doc.intervention.lower() or "soil" in top_doc.topic.lower()
    assert top_doc.evidence_strength in ["high", "medium"]
    assert top_doc.source_url.startswith("http")

def test_hybrid_retrieval_pollinators():
    engine = KnowledgeRetrievalEngine()
    results = engine.retrieve(
        query="monoculture vineyard pollinator decline high pesticide pressure floral hedgerow",
        target_variables=["habitat_diversity", "pesticide_pressure"],
        ecosystem_hint="intensive cropland",
        top_k=2
    )
    assert len(results) > 0
    # Top result should relate to pollinators or beneficial insects or IPM
    interventions = [r.intervention for r in results]
    assert any("hedgerow" in i or "pest" in i for i in interventions)

def test_db_seeding():
    init_db()
    db = SessionLocal()
    count = db.query(ScientificEvidenceEntity).count()
    db.close()
    assert count >= 5

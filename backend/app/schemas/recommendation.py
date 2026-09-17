from typing import List, Literal, Optional
from pydantic import BaseModel, Field

class ImpactedMetric(BaseModel):
    metric: str
    direction: Literal["increase", "decrease", "stabilize", "restore"]
    details: Optional[str] = None

class EvidenceCitation(BaseModel):
    title: str
    organization: str
    claim_supported: str
    url: str
    year: Optional[int] = None
    evidence_strength: Optional[str] = None

class RecommendationContract(BaseModel):
    recommendation: str = Field(..., description="Specific, actionable ecological intervention")
    why_it_works: str = Field(..., description="Scientific mechanism grounding the intervention")
    variables_used: List[str] = Field(..., description="At least three environmental variables analyzed")
    impacted_metrics: List[ImpactedMetric] = Field(..., description="List of environmental metrics impacted")
    time_horizon: Literal["short", "medium", "long"] = Field(..., description="Implementation time horizon")
    confidence: Literal["low", "medium", "high"] = Field(..., description="Confidence level based on evidence strength")
    evidence: List[EvidenceCitation] = Field(..., description="Scientific citations supporting the claims")
    uncertainty: str = Field(..., description="Explicit limitations and context dependencies")

class ReasoningStep(BaseModel):
    step_number: int
    variables: List[str]
    observation: str
    ecological_pressure: str
    implication: str

class DecisionResult(BaseModel):
    state_summary: dict
    reasoning_chain: List[ReasoningStep]
    recommendations: List[RecommendationContract]
    clarifying_questions: List[str] = Field(default_factory=list)
    scenario_comparison: Optional[dict] = None

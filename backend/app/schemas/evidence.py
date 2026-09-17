from typing import List, Dict, Optional, Literal
from pydantic import BaseModel, Field

class EvidenceRecord(BaseModel):
    id: str = Field(..., description="Unique evidence ID e.g. fao-soil-2023-covercrop")
    title: str = Field(..., description="Title of scientific report or study")
    source_organization: str = Field(..., description="FAO, IPCC, IPBES, CGIAR, or peer-reviewed journal")
    year: int = Field(..., description="Publication year")
    topic: str = Field(..., description="Broad topic e.g. soil cover, pollinator corridors, agroforestry")
    variables: List[str] = Field(default_factory=list, description="Environmental variables analyzed e.g. soil_organic_carbon, rainfall")
    intervention: str = Field(..., description="Specific intervention name e.g. cover_crops, agroforestry_buffer")
    ecosystem: str = Field(..., description="Ecosystem context e.g. semi-arid agriculture, temperate cropland")
    mechanism: str = Field(..., description="Underlying biophysical or ecological mechanism")
    effect_direction: Dict[str, str] = Field(
        default_factory=dict, 
        description="Direction of impact on metrics e.g. {'soil_organic_carbon': 'increase', 'erosion': 'decrease'}"
    )
    time_horizon: Literal["short", "medium", "long"] = Field(..., description="Expected timeline for impact")
    evidence_strength: Literal["low", "medium", "high"] = Field(..., description="Methodological rigor & institutional consensus")
    text: str = Field(..., description="Exact chunked evidence text or empirical summary")
    source_url: str = Field(..., description="Link to authoritative source")
    doi: Optional[str] = None

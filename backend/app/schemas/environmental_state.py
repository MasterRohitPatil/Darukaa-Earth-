from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class LocationState(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    region: Optional[str] = None
    country: Optional[str] = None

class SoilState(BaseModel):
    ph: Optional[float] = None
    organic_carbon_percent: Optional[float] = None
    moisture: Optional[str] = None  # e.g. "low", "medium", "adequate", "waterlogged"
    texture: Optional[str] = None   # e.g. "sandy", "loam", "clay", "sandy loam"

class ClimateState(BaseModel):
    rainfall: Optional[float] = None  # Annual or seasonal mm
    temperature: Optional[float] = None  # Average Celsius
    seasonality: Optional[str] = None  # e.g. "semi-arid", "tropical monsoon", "temperate"

class LandState(BaseModel):
    land_use: Optional[str] = None  # e.g. "cropland", "pasture", "orchard", "agroforestry"
    crop: Optional[str] = None      # e.g. "grapes", "wheat", "cotton"
    monoculture: Optional[bool] = None
    habitat_diversity: Optional[str] = None  # e.g. "very_low", "low", "moderate", "high"

class BiodiversityState(BaseModel):
    species_richness: Optional[int] = None
    species_occurrence_indicator: Optional[int] = None  # GBIF proxy count

class HumanImpactState(BaseModel):
    pollution: Optional[str] = None
    pesticide_pressure: Optional[str] = None  # e.g. "low", "moderate", "high"
    deforestation: Optional[str] = None

class EnvironmentalState(BaseModel):
    session_id: Optional[str] = None
    location: LocationState = Field(default_factory=LocationState)
    soil: SoilState = Field(default_factory=SoilState)
    climate: ClimateState = Field(default_factory=ClimateState)
    land: LandState = Field(default_factory=LandState)
    biodiversity: BiodiversityState = Field(default_factory=BiodiversityState)
    human_impact: HumanImpactState = Field(default_factory=HumanImpactState)

    def get_missing_critical_variables(self) -> List[str]:
        """
        Identifies critical variables necessary to make an evidence-grounded recommendation.
        At least 3 core domains (soil, climate, land) must have key variables specified.
        """
        missing = []
        if self.soil.organic_carbon_percent is None and self.soil.moisture is None:
            missing.append("soil_health (organic carbon % or moisture level)")
        if self.climate.rainfall is None and self.climate.seasonality is None:
            missing.append("climate_water (annual rainfall mm or seasonality)")
        if self.land.land_use is None and self.land.crop is None:
            missing.append("land_use (land use type or main crop)")
        if self.land.monoculture is None and self.land.habitat_diversity is None:
            missing.append("crop_diversity (monoculture vs polyculture or habitat diversity)")
        return missing

    def calculate_completeness_score(self) -> float:
        """
        Calculates the completeness ratio (0.0 to 1.0) across all high-value variables.
        """
        key_fields = [
            self.soil.organic_carbon_percent is not None,
            self.soil.ph is not None,
            self.soil.moisture is not None,
            self.climate.rainfall is not None,
            self.climate.seasonality is not None,
            self.land.land_use is not None or self.land.crop is not None,
            self.land.monoculture is not None,
            self.land.habitat_diversity is not None,
            self.location.region is not None or (self.location.latitude is not None and self.location.longitude is not None)
        ]
        return round(sum(1 for f in key_fields if f) / len(key_fields), 2)

    def is_sufficient_for_reasoning(self) -> bool:
        """
        Verifies whether at least 3 environmental variables are known across domains.
        """
        variables_known = 0
        if self.soil.organic_carbon_percent is not None or self.soil.moisture is not None or self.soil.ph is not None:
            variables_known += 1
        if self.climate.rainfall is not None or self.climate.seasonality is not None:
            variables_known += 1
        if self.land.land_use is not None or self.land.crop is not None or self.land.monoculture is not None:
            variables_known += 1
        if self.biodiversity.species_richness is not None or self.biodiversity.species_occurrence_indicator is not None:
            variables_known += 1
        if self.human_impact.pesticide_pressure is not None:
            variables_known += 1
        return variables_known >= 3

    def merge_update(self, new_data: Dict[str, Any]) -> "EnvironmentalState":
        """
        Deep merges new environmental facts without overwriting existing non-null data with null.
        """
        current_dict = self.model_dump()
        for section, values in new_data.items():
            if section in current_dict and isinstance(values, dict):
                for k, v in values.items():
                    if v is not None:
                        current_dict[section][k] = v
            elif values is not None and section in current_dict:
                current_dict[section] = values
        return EnvironmentalState(**current_dict)

export interface LocationState {
  latitude?: number | null;
  longitude?: number | null;
  region?: string | null;
  country?: string | null;
}

export interface SoilState {
  ph?: number | null;
  organic_carbon_percent?: number | null;
  moisture?: string | null;
  texture?: string | null;
}

export interface ClimateState {
  rainfall?: number | null;
  temperature?: number | null;
  seasonality?: string | null;
}

export interface LandState {
  land_use?: string | null;
  crop?: string | null;
  monoculture?: boolean | null;
  canopy_cover_percent?: number | null;
  habitat_diversity?: string | null;
}

export interface BiodiversityState {
  species_richness?: number | null;
  species_occurrence_indicator?: number | null;
}

export interface HumanImpactState {
  pollution?: string | null;
  pesticide_pressure?: string | null;
  deforestation?: string | null;
}

export interface EnvironmentalState {
  session_id?: string;
  location: LocationState;
  soil: SoilState;
  climate: ClimateState;
  land: LandState;
  biodiversity: BiodiversityState;
  human_impact: HumanImpactState;
}

export interface ImpactedMetric {
  metric: string;
  direction: 'increase' | 'decrease' | 'stabilize' | 'restore';
  details?: string;
}

export interface EvidenceCitation {
  title: string;
  organization: string;
  claim_supported: string;
  url: string;
  year?: number;
  evidence_strength?: string;
}

export interface RecommendationContract {
  recommendation: string;
  why_it_works: string;
  variables_used: string[];
  impacted_metrics: ImpactedMetric[];
  time_horizon: 'short' | 'medium' | 'long';
  confidence: 'low' | 'medium' | 'high';
  evidence: EvidenceCitation[];
  uncertainty: string;
}

export interface ReasoningStep {
  step_number: number;
  variables: string[];
  observation: string;
  ecological_pressure: string;
  implication: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  clarifyingQuestions?: string[];
  recommendations?: RecommendationContract[];
  reasoningSteps?: ReasoningStep[];
  evidence?: any[];
}

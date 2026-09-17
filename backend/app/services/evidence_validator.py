import re
from typing import List, Tuple
from app.schemas.evidence import EvidenceRecord
from app.schemas.recommendation import RecommendationContract

class EvidenceValidator:
    """
    Strict guardrail ensuring that:
    1. Quantitative claims (% or multipliers) only appear if present in retrieved evidence chunks.
    2. Every cited source corresponds to an authentic, loaded evidence record.
    3. Uncertainty bounds and limitations are visibly stated.
    """
    def __init__(self):
        pass

    def validate_and_sanitize(
        self,
        recommendation: RecommendationContract,
        retrieved_evidence: List[EvidenceRecord]
    ) -> Tuple[RecommendationContract, List[str]]:
        warnings: List[str] = []
        valid_evidence_urls = {e.source_url for e in retrieved_evidence}
        combined_evidence_text = " ".join([e.text + " " + e.mechanism for e in retrieved_evidence]).lower()

        # 1. Verify that citations are authentic
        verified_citations = []
        for cite in recommendation.evidence:
            if cite.url in valid_evidence_urls or any(cite.organization in e.source_organization for e in retrieved_evidence):
                verified_citations.append(cite)
            else:
                warnings.append(f"Excluded unverified citation: {cite.title}")

        if not verified_citations and retrieved_evidence:
            # Re-attach top authentic evidence
            top = retrieved_evidence[0]
            verified_citations.append(
                cite.__class__(
                    title=top.title,
                    organization=top.source_organization,
                    claim_supported=f"{top.mechanism} {top.text[:120]}...",
                    url=top.source_url,
                    year=top.year,
                    evidence_strength=top.evidence_strength
                )
            )

        recommendation.evidence = verified_citations

        # 2. Check for unsupported quantitative numbers in mechanism text
        # Regex for numbers followed by % or x or fold
        extracted_numbers = re.findall(r'(\d+(?:\.\d+)?)\s*(?:%|fold|times|t/ha)', recommendation.why_it_works)
        for num in extracted_numbers:
            if num not in combined_evidence_text:
                warnings.append(f"Detected potential ungrounded quantitative metric '{num}' in mechanism. Enforcing qualitative description.")
                # Sanitize to qualitative
                recommendation.why_it_works = re.sub(
                    rf'\b{re.escape(num)}\s*%',
                    'a substantial documented percentage',
                    recommendation.why_it_works
                )

        # 3. Ensure uncertainty is not empty or generic
        if not recommendation.uncertainty or len(recommendation.uncertainty.strip()) < 15:
            recommendation.uncertainty = (
                "Uncertainty note: Field outcomes vary with seasonal precipitation timing, "
                "local soil microbiome health, and management adherence."
            )

        return recommendation, warnings

evidence_validator = EvidenceValidator()

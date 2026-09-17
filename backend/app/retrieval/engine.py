import os
import json
import math
import re
from typing import List, Dict, Any, Optional
from collections import Counter
from app.schemas.evidence import EvidenceRecord
from app.models.database import SessionLocal
from app.models.entities import ScientificEvidenceEntity
from app.config import settings

class LocalSemanticSearcher:
    """
    High-performance, zero-dependency TF-IDF and Subword N-Gram Vector Index
    guaranteeing reliable local retrieval even without external API keys or network access.
    """
    def __init__(self):
        self.corpus: List[Dict[str, Any]] = []
        self.vocabulary: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}
        self.doc_vectors: List[Dict[int, float]] = []

    def _tokenize(self, text: str) -> List[str]:
        words = re.findall(r'\b[a-zA-Z0-9_\-]{2,}\b', text.lower())
        # Add character tri-grams for subword matching (e.g. bio, div, ers -> biodiversity)
        ngrams = []
        for word in words:
            if len(word) >= 4:
                ngrams.extend([word[i:i+3] for i in range(len(word) - 2)])
        return words + ngrams

    def fit_and_index(self, documents: List[Dict[str, Any]]):
        self.corpus = documents
        n_docs = len(documents)
        df = Counter()
        tokenized_docs = []

        for doc in documents:
            searchable_text = f"{doc.get('title', '')} {doc.get('topic', '')} {doc.get('intervention', '')} {doc.get('mechanism', '')} {doc.get('text', '')} {' '.join(doc.get('variables', []))}"
            tokens = self._tokenize(searchable_text)
            token_set = set(tokens)
            for t in token_set:
                df[t] += 1
            tokenized_docs.append(Counter(tokens))

        # Vocabulary and IDF
        self.vocabulary = {term: idx for idx, term in enumerate(df.keys())}
        self.idf = {term: math.log((n_docs + 1) / (df[term] + 1)) + 1.0 for term in df}

        # Compute normalized TF-IDF vectors
        self.doc_vectors = []
        for doc_counts in tokenized_docs:
            vec = {}
            norm_sq = 0.0
            for term, count in doc_counts.items():
                if term in self.vocabulary:
                    weight = count * self.idf[term]
                    term_id = self.vocabulary[term]
                    vec[term_id] = weight
                    norm_sq += weight * weight
            norm = math.sqrt(norm_sq) if norm_sq > 0 else 1.0
            self.doc_vectors.append({k: v / norm for k, v in vec.items()})

    def search(self, query: str, top_k: int = 5) -> List[tuple[int, float]]:
        query_tokens = self._tokenize(query)
        q_counts = Counter(query_tokens)
        q_vec = {}
        q_norm_sq = 0.0

        for term, count in q_counts.items():
            if term in self.idf:
                weight = count * self.idf[term]
                term_id = self.vocabulary[term]
                q_vec[term_id] = weight
                q_norm_sq += weight * weight

        q_norm = math.sqrt(q_norm_sq) if q_norm_sq > 0 else 1.0
        q_vec_norm = {k: v / q_norm for k, v in q_vec.items()}

        scores = []
        for doc_idx, doc_vec in enumerate(self.doc_vectors):
            dot_product = sum(weight * doc_vec.get(tid, 0.0) for tid, weight in q_vec_norm.items())
            scores.append((doc_idx, dot_product))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]

class KnowledgeRetrievalEngine:
    def __init__(self, seed_path: Optional[str] = None):
        if seed_path:
            self.seed_path = seed_path
        else:
            # Check project root knowledge folder first, then backend
            current_dir = os.path.dirname(os.path.abspath(__file__))
            root_dir = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
            candidate1 = os.path.join(root_dir, "knowledge", "seed", "scientific_evidence.json")
            candidate2 = os.path.join(os.path.dirname(os.path.dirname(current_dir)), "knowledge", "seed", "scientific_evidence.json")
            self.seed_path = candidate1 if os.path.exists(candidate1) else candidate2
        
        self.searcher = LocalSemanticSearcher()
        self.documents: List[EvidenceRecord] = []
        self._load_and_index()

    def _load_and_index(self):
        # Load from JSON seed
        if os.path.exists(self.seed_path):
            with open(self.seed_path, "r", encoding="utf-8") as f:
                raw_records = json.load(f)
                self.documents = [EvidenceRecord(**r) for r in raw_records]
                self.searcher.fit_and_index(raw_records)
                self._seed_db_if_empty(raw_records)

    def _seed_db_if_empty(self, raw_records: List[Dict[str, Any]]):
        from app.models.database import init_db
        init_db()
        db = SessionLocal()
        try:
            count = db.query(ScientificEvidenceEntity).count()
            if count == 0:
                for r in raw_records:
                    entity = ScientificEvidenceEntity(
                        id=r["id"],
                        title=r["title"],
                        source_organization=r["source_organization"],
                        year=r["year"],
                        topic=r["topic"],
                        intervention=r["intervention"],
                        ecosystem=r["ecosystem"],
                        evidence_strength=r["evidence_strength"],
                        time_horizon=r["time_horizon"],
                        variables_json=json.dumps(r.get("variables", [])),
                        mechanism=r["mechanism"],
                        effect_direction_json=json.dumps(r.get("effect_direction", {})),
                        text=r["text"],
                        source_url=r["source_url"],
                        doi=r.get("doi")
                    )
                    db.add(entity)
                db.commit()
        except Exception as e:
            db.rollback()
        finally:
            db.close()

    def retrieve(
        self,
        query: str,
        target_variables: Optional[List[str]] = None,
        ecosystem_hint: Optional[str] = None,
        top_k: int = 3
    ) -> List[EvidenceRecord]:
        """
        Hybrid retrieval combining semantic similarity, variable overlap, and evidence strength.
        """
        target_vars_normalized = {v.lower().replace(" ", "_") for v in (target_variables or [])}
        top_candidates = self.searcher.search(query, top_k=len(self.documents))
        
        ranked_results = []
        for doc_idx, sim_score in top_candidates:
            doc = self.documents[doc_idx]
            
            # Variable overlap calculation
            doc_vars = {v.lower().replace(" ", "_") for v in doc.variables}
            overlap = len(doc_vars.intersection(target_vars_normalized))
            overlap_score = overlap / max(1, len(target_vars_normalized)) if target_vars_normalized else 0.5
            
            # Ecosystem compatibility bonus
            eco_score = 0.0
            if ecosystem_hint and (ecosystem_hint.lower() in doc.ecosystem.lower() or doc.ecosystem.lower() in ecosystem_hint.lower()):
                eco_score = 0.2

            # Evidence strength weight
            strength_weight = 1.0 if doc.evidence_strength == "high" else 0.7

            # Combined hybrid score
            hybrid_score = (sim_score * 0.40) + (overlap_score * 0.35) + (eco_score * 0.15) + (strength_weight * 0.10)
            ranked_results.append((doc, hybrid_score))

        ranked_results.sort(key=lambda x: x[1], reverse=True)
        return [doc for doc, _ in ranked_results[:top_k]]

# Singleton instance
retrieval_engine = KnowledgeRetrievalEngine()

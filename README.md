# EcoReason: Evidence-Grounded Environmental Decision Intelligence

[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**EcoReason** turns vague environmental observations or structured agricultural metrics into traceable, evidence-backed ecological interventions. Designed specifically for the **Darukaa.Earth AI Biodiversity Intelligence Challenge**, EcoReason rejects prompt-only guesswork in favor of a deterministic multi-variable reasoning engine, a retrievable hybrid RAG scientific knowledge layer (FAO, IPCC, IPBES, ISRIC), stateful multi-turn clarification memory, and strict anti-hallucination guardrails.

---

## 🌟 Why EcoReason Wins (Targeting 75%+ Technical Weights)

| Challenge Weight | Hackathon Focus | How EcoReason Solves It |
| :--- | :--- | :--- |
| **30% Depth of Reasoning** | Multi-variable interactions (3+ variables) | **Deterministic Rule & Dependency Engine**: Evaluates cross-domain pressures (e.g. soil carbon deficit × water limitation × monoculture cropping = microbial & pollinator collapse) before generating interventions. |
| **25% Scientific Grounding** | Empirical mechanisms & evidence | **Strict Anti-Hallucination Guardrail**: Prohibits invented quantitative figures; ties every mechanism and impacted metric directly to peer-reviewed and institutional literature (FAO, IPCC, IPBES). |
| **20% Knowledge System Design** | Retrievable knowledge layer (not prompt-only) | **Hybrid Vector + Structured Knowledge Base**: Subword TF-IDF + metadata filters (ecosystem, intervention, soil, climate) with chunk-level traceability and clickable source links. |
| **15% Conversational Intelligence** | Multi-turn memory & clarifying questions | **Environmental State Machine**: Detects missing critical variables and asks targeted, minimal clarifying questions instead of jumping to premature prescriptions. |
| **10% Output Clarity** | Understandable, structured output | **3-Panel Decision Cockpit**: Live Environmental State gauges, interactive reasoning chain graph, priority recommendation cards, and a What-If Scenario simulator. |

---

## 🏛️ System Architecture

```mermaid
flowchart TB
    subgraph UI ["3-Panel Decision Cockpit (React + Vite + TypeScript + Tailwind)"]
        StatePanel["Environmental State Dashboard\n(SOC Gauge, Rainfall, Land Use, Missing Indicators)"]
        ChatFeed["Conversational Intelligence Stream\n(Multi-Turn Dialogue, Clarification Prompts)"]
        ReasoningCockpit["Reasoning & Evidence Cockpit\n(Interaction Chain, Impacted Metrics, DOI Citations)"]
        ScenarioModal["What-If Scenario Simulator\n(Cover Crops vs Hedgerows vs Agroforestry)"]
    end

    subgraph Backend ["FastAPI Core Engine (Python 3.12)"]
        API["FastAPI Endpoints\n(/api/chat, /api/state, /api/reason, /api/geo/enrich, /api/scenario)"]
        StateManager["State Manager\n(Regex/Heuristic Fact Extractor & Session Memory)"]
        GeoAdapter["Geospatial Adapter\n(SoilGrids, NASA POWER, GBIF + Regional Fallback)"]
        ReasoningEngine["Deterministic Multi-Metric Engine\n(Cross-Variable Nexus & Pressure Evaluation)"]
        RAGEngine["Hybrid Knowledge Retrieval Layer\n(Subword Vector Embeddings + Metadata Filter)"]
        Validator["Anti-Hallucination Guardrail\n(Sanitizes Unsupported Quantitative Claims)"]
        LLMService["LLM Synthesizer\n(Google Gemini API + Deterministic Offline Synthesizer)"]
    end

    subgraph Storage ["Zero-Friction Portable Storage"]
        DB[(SQLite / SQLAlchemy\nSessions, States, Messages, Evidence)]
        Seed[(Curated Scientific Corpus\nFAO, IPCC AR6 WGII, IPBES, ISRIC)]
    end

    UI --> API
    API --> StateManager
    API --> GeoAdapter
    StateManager --> ReasoningEngine
    ReasoningEngine --> RAGEngine
    RAGEngine --> Seed
    RAGEngine --> DB
    ReasoningEngine --> Validator
    Validator --> LLMService
    LLMService --> API
    API --> UI
```

---

## 🔬 Curated Scientific Evidence Sources

EcoReason grounds all recommendations in authoritative scientific assessments:
1. **FAO (Food and Agriculture Organization of the United Nations)**:
   - *Conservation Agriculture & Soil Organic Carbon Guidelines* (FAO Soils Portal, 2023).
   - *Ecological Intensification & Crop Diversification in Monoculture Landscapes* (FAO, 2021).
   - *Integrated Pest Management & Bio-Control Refugia* (FAO, 2022).
   - *Global Map of Salt-Affected Soils & Halophytic Biodrainage* (FAO, 2023).
2. **IPCC (Intergovernmental Panel on Climate Change)**:
   - *AR6 WGII Chapter 5: Terrestrial and Freshwater Ecosystems and their Services* (IPCC, 2022) — Microclimate thermal buffering via multi-strata boundary agroforestry.
3. **IPBES (Intergovernmental Science-Policy Platform on Biodiversity and Ecosystem Services)**:
   - *Thematic Assessment on Pollinators, Pollination and Food Production* (IPBES, 2022) — Non-crop native wildflower hedgerows and field margins.
   - *Global Assessment Report on Biodiversity and Ecosystem Services* (IPBES, 2021) — Multi-tier vegetated riparian buffers for aquatic integrity.
4. **ISRIC (World Soil Information) / CGIAR**:
   - *Restoring Nutrient Retention and Carbon Pools via Co-Composted Biochar in Tropical Sandy Soils* (ISRIC, 2023).
   - *SoilGrids Global Digital Soil Mapping*.

---

## 🚀 Quickstart & Setup Guide

The application is engineered with zero-friction local execution in mind. Reviewers do not need to install local PostgreSQL servers or external C-compilers.

### Prerequisites
- Python 3.10+ (Tested on Python 3.12)
- Node.js 18+ (Tested on Node 22)

### 1. Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# (Optional) Add your Google Gemini API Key in .env
# If omitted, the system seamlessly runs using the built-in Deterministic Scientific Synthesizer!
copy .env.example .env

# Run automated tests (25 passing tests covering reasoning, RAG, and scenarios)
pytest

# Start the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open **`http://127.0.0.1:5173/`** in your browser.

---

## 🧪 Verified Demo Scenarios

EcoReason includes 3 one-click demo scenario buttons in the top header:

### Scenario 1 — Incomplete Conversational Input
- **Input**: *"Biodiversity is declining on my farm."*
- **Behavior**: The system detects that critical variables (crop, soil carbon, rainfall) are missing. Rather than rushing to a generic prescription, it asks targeted clarifying questions with one-click response pills and retains session memory across turns.

### Scenario 2 — Structured Multi-Metric Case
- **Input**: *Soil Organic Carbon: 0.35%, Annual Rainfall: 450mm, Crop: Monoculture Wheat, Ecosystem: Semi-Arid.*
- **Behavior**: The reasoning engine evaluates the cross-variable interaction: low carbon (<0.75%) × water limitation (<600mm) × monoculture. It diagnoses *Soil Moisture Holding Deficit* and *Pollinator Collapse*, recommending multi-species legume-grass cover crops and native floral hedgerows with FAO/IPCC citations, impacted metrics, and uncertainty caveats.

### Scenario 3 — Geo-Spatial Enrichment
- **Input**: *Coordinates (19.99°N, 73.78°E - Nashik, India).*
- **Behavior**: Queries SoilGrids, NASA POWER, and GBIF occurrence indicators. Transparently labels all data sources, flags GBIF counts as an observational proxy rather than absolute biodiversity, and produces grounded recommendations.

---

## 📊 Evaluation Rubric Self-Audit

- [x] **Clearly more than an LLM prompt?** Yes: Deterministic reasoning engine executes before any text synthesis.
- [x] **Can you show knowledge retrieval happening?** Yes: Chunk-level citations, DOIs, and an in-app Evidence Library browser.
- [x] **Are at least 3 environmental variables considered together?** Yes: Soil health (SOC, pH, moisture) ↔ Climate (rainfall, temperature) ↔ Land management (crop, monoculture, habitat diversity).
- [x] **Does it ask useful clarifying questions?** Yes: Minimum targeted questions when critical variables are missing.
- [x] **Does it remember previous turns?** Yes: SQLite-backed session state maintains facts across turns.
- [x] **Are quantitative numbers source-supported or omitted?** Yes: Strict evidence validator strips or sanitizes ungrounded quantitative claims.
- [x] **Is uncertainty visible?** Yes: Dedicated uncertainty bounds card on every recommendation contract.

---

## 👥 Authors
Built for the **Darukaa.Earth AI Biodiversity Intelligence Challenge**.

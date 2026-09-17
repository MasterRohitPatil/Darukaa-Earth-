# EcoReason: User Guide & Evaluator Demo Playbook

Welcome to **EcoReason — Evidence-Grounded Environmental Decision Intelligence**. This guide walks you through the system architecture, the 3-panel decision cockpit, and a step-by-step demo script to showcase the platform to evaluators and leadership.

---

## 🧭 1. Understanding the 3-Panel Cockpit

EcoReason replaces generic chatbots with an integrated ecological cockpit designed like a mission-control room for environmental scientists:

```
┌───────────────────────────┬───────────────────────────┬───────────────────────────┐
│     LEFT PANEL            │       CENTER PANEL        │       RIGHT PANEL         │
│  Environmental State      │  Conversational Stream    │  Reasoning & Evidence     │
│                           │                           │                           │
│ • Completeness Meter (%)  │ • Multi-turn active memory│ • Priority Interventions  │
│ • Interactive Leaflet Map │ • Targeted clarifications │ • Scientific Mechanisms   │
│ • Soil Health Gauges      │ • Quick response pills    │ • Impacted Metrics Matrix │
│ • Climate & Rainfall      │ • Natural language chat   │ • FAO / IPCC Citations    │
│ • Raw JSON Toggle         │                           │ • Causal Nexus Visualizer │
└───────────────────────────┴───────────────────────────┴───────────────────────────┘
```

### A. Left Panel — Environmental State & Geo Inspector
- **Data Completeness Meter**: Displays the percentage of critical variables known. If crucial data is missing, a warning banner appears listing the missing factors.
- **Interactive Leaflet Map**: Shows your monitored site. Click anywhere in the world to drop an animated pin and automatically enrich the parcel with SoilGrids, NASA POWER, and GBIF data.
- **Biophysical Threshold Gauges**: Color-coded progress meters showing Soil Organic Carbon (SOC) health bands (<0.75% Severe Deficit, 0.75–1.2% Sub-optimal, >1.2% Optimal Regenerative) and rainfall regimes.
- **JSON Button**: Toggle between the visual card dashboard and the raw normalized `EnvironmentalState` JSON schema.

### B. Center Panel — Conversational Intelligence Feed
- **Dialogue Feed**: Shows the conversation history between you and the EcoReason AI scientist.
- **Targeted Clarification Cards**: When you provide incomplete information, the system highlights what is missing and presents 1-click quick response pills.
- **Input Bar**: Type natural observations (e.g. *"Our wheat crops are suffering from water stress in Nashik"*) or provide structured numbers.

### C. Right Panel — Reasoning Cockpit & Evidence Trace
Has 3 switchable views at the top:
1. **Interventions Tab**: Displays actionable ecological recommendations with:
   - Time horizon badge (Short / Medium / Long) & Confidence rating (High / Medium)
   - Clear scientific mechanism ("Why It Works")
   - Impacted Environmental Metrics Matrix with directional arrows (↑ Increase, ↓ Decrease, ⇄ Stabilize)
   - Authentic literature citations with direct links to FAO, IPCC, IPBES, and ISRIC documents
   - Explicit uncertainty and site-specific limitation bounds
2. **Reasoning Steps Tab**: Breaks down the step-by-step biophysical deductions made across your variables.
3. **Causal Nexus Tab**: A visual node-and-arrow diagram mapping:
   `[Input Variables]` ──▶ `[Compounding Pressure]` ──▶ `[Mapped Intervention]`.

---

## 🎬 2. Step-by-Step Demo Scenarios (The 3 Golden Paths)

In the top navigation bar, there are 3 quick-loader buttons corresponding to the official hackathon test cases:

### 🌟 Scenario 1: The Incomplete Query (Clarification Flow)
*Goal: Show that EcoReason does NOT hallucinate or guess when data is missing; it asks targeted questions.*

1. In the top bar, click the button **`1. Clarification`** (or type *"Biodiversity is declining on my farm"* in the chat).
2. **Observe Center Panel**:
   - The assistant does not jump to a prescription.
   - It explains that multi-variable interactions are required for scientific grounding.
   - It lists 2–3 precise questions (e.g., *"What is your primary crop?"*, *"What is your typical rainfall or irrigation?"*).
3. **Observe Left Panel**:
   - The Completeness Meter is low (~15%).
   - The "Missing Critical Variables" banner warns that Soil, Climate, and Land use data are needed.
4. **Take Action**:
   - Click the quick-reply pill: `🌾 Wheat Monoculture (0.35% SOC, 450mm rain)`.
   - Watch the state update instantly and transition into Scenario 2!

---

### 🌾 Scenario 2: Multi-Metric Structured Case (Core Reasoning)
*Goal: Show deterministic reasoning evaluating 3+ variables (Soil Carbon + Rainfall + Monoculture).*

1. Click the button **`2. Multi-Metric Case`** in the top bar.
2. **Observe Left Panel**:
   - Soil Organic Carbon updates to `0.35%` (Critical Deficit, Red).
   - Annual Rainfall updates to `450 mm` (Dryland Regime).
   - Primary Crop sets to `Wheat` with `Monoculture: Yes`.
   - Completeness Meter jumps to `80%+`.
3. **Observe Right Panel**:
   - **Intervention #1**: *Establish Legume-Grass Cover Crops* (Medium Horizon | High Confidence).
     - *Mechanism*: Continuous living roots exude carbon compounds that feed mycorrhizal fungi while surface mulch reduces evaporative loss.
     - *Impacted Metrics*: Soil Organic Carbon ↑, Soil Moisture Retention ↑, Microbial Biomass ↑, Soil Erosion ↓.
     - *Evidence Trace*: Direct citations to FAO (2023) Conservation Agriculture Guidelines with clickable links.
     - *Uncertainty*: Outlines dependence on winter rainfall timing and local soil texture.
4. **Click the `Causal Nexus` Tab**:
   - See the visual diagram showing how Low SOC (0.35%) + Low Rain (450mm) compound into *Soil Desiccation & Thermal Evapotranspiration Pressure*, which directly justifies the Cover Crop intervention.

---

### 🗺️ Scenario 3: Geospatial Enrichment
*Goal: Show coordinate-based automated environmental enrichment.*

1. Click the button **`3. Geo-Enriched`** in the top bar (or click anywhere on the Leaflet map in the Left Panel).
2. **Observe Left Panel**:
   - A pulsing green pin drops at the coordinates (`19.99°N, 73.78°E` - Nashik, Maharashtra).
   - The system automatically calls the geo-enricher and queries ISRIC SoilGrids, NASA POWER, and GBIF occurrence indicators.
   - Data sources are transparently labeled in the chat feed.
   - Note the scientific disclaimer: GBIF occurrences are explicitly labeled as an *observational proxy*, not an absolute species richness measure.
3. **Observe Right Panel**:
   - Specific recommendations for the Nashik agro-climatic zone (e.g., *Native Floral Hedgerows* and *IPM Beetle Banks* to mitigate intensive vineyard pesticide pressure).

---

## 🛠️ 3. Special Features & Modals

### 🔮 What-If Scenario Simulator
1. In the top bar, click **`What-If Simulator`**.
2. A comparison modal appears.
3. Select an intervention:
   - `🌱 Cover Crops`: Simulates soil organic carbon elevation (+0.25% SOC) and moisture buffering.
   - `🌸 Floral Hedgerows`: Simulates habitat diversification and 40–70% increase in wild pollinator richness.
   - `🌳 Agroforestry Belts`: Simulates microclimate thermal buffering (-2 to -3°C under peak heat).
4. View the **Baseline Pressures** vs. **Projected Scenario Outcomes** side-by-side.

### 📚 Scientific Evidence Library
1. In the top bar, click **`Evidence Library`**.
2. A modal opens showing the indexed literature database (FAO, IPCC AR6 WGII, IPBES, ISRIC).
3. Use the search bar to filter by variables (e.g. `salinity`, `pollinators`, `cover crops`).
4. Click **Inspect Source** on any card to open the authoritative publication or DOI.

### 📄 One-Click Executive Dossier Export
1. In the top bar, click **`Export Dossier`**.
2. EcoReason compiles a publication-grade scientific briefing document formatted with:
   - Environmental baseline tables
   - Multi-variable reasoning chains
   - Grounded intervention roadmap with directional metric impacts
   - Complete bibliography with DOIs and organizations
3. Click **`Copy Text`** to paste into an email/report, or **`Download Markdown (.md)`** to save the file locally.

---

## 🎙️ 4. Evaluator / Interview Pitch Script

If asked to explain how EcoReason works under the hood, use this concise 60-second explanation:

> *"Most applicants submitted a standard LLM wrapper that asks ChatGPT to 'act as an environmental scientist.' EcoReason is fundamentally different. It is an **evidence-grounded decision intelligence platform**.*
> 
> *First, it normalizes user observations into an **Environmental State** and checks for completeness. If key variables are missing, it asks targeted clarifying questions instead of guessing.*
> 
> *Second, our **deterministic multi-variable reasoning engine** computes biophysical interaction pressures (like low soil carbon multiplied by low rainfall and monoculture) before any AI generation occurs.*
> 
> *Third, our **hybrid RAG knowledge layer** retrieves peer-reviewed and institutional evidence chunks from FAO, IPCC, and IPBES. Our strict **anti-hallucination guardrails** forbid invented quantitative numbers.*
> 
> *Finally, the system outputs a traceable **Recommendation Contract** complete with scientific mechanisms, directional metric impacts, uncertainty bounds, and clickable source DOIs."*

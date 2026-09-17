import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EnvironmentalStatePanel } from './components/EnvironmentalStatePanel';
import { ChatArea } from './components/ChatArea';
import { ReasoningCockpit } from './components/ReasoningCockpit';
import { ScenarioComparatorModal } from './components/ScenarioComparatorModal';
import { EvidenceLibraryModal } from './components/EvidenceLibraryModal';
import { DossierExportModal } from './components/DossierExportModal';
import { SettingsModal } from './components/SettingsModal';
import { HelpSidebar } from './components/HelpSidebar';
import { api } from './services/api';
import type { 
  EnvironmentalState, 
  ChatMessage, 
  RecommendationContract, 
  ReasoningStep 
} from './types';

const INITIAL_STATE: EnvironmentalState = {
  location: { latitude: null, longitude: null, region: null, country: null },
  soil: { ph: null, organic_carbon_percent: null, moisture: null, texture: null },
  climate: { rainfall: null, temperature: null, seasonality: null },
  land: { land_use: null, crop: null, monoculture: null, canopy_cover_percent: null, habitat_diversity: null },
  biodiversity: { species_richness: null, species_occurrence_indicator: null },
  human_impact: { pollution: null, pesticide_pressure: null, deforestation: null }
};

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ecoreason_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'light';
  });

  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [environmentalState, setEnvironmentalState] = useState<EnvironmentalState>(INITIAL_STATE);
  const [completenessScore, setCompletenessScore] = useState<number>(0);
  const [geminiActive, setGeminiActive] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ecoreason_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    api.healthCheck().then((res) => {
      if (res && res.gemini_configured) {
        setGeminiActive(true);
      }
    }).catch(() => {});
  }, []);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 
        "Welcome to EcoReason — Evidence-Grounded Biodiversity Decision Intelligence.\n\n" +
        "I assess ecosystem challenges using a deterministic multi-variable reasoning engine grounded in FAO, IPCC, IPBES, and ISRIC scientific literature.\n\n" +
        "You can describe your parcel's condition in natural language, pick a Demo Scenario from the top bar, or click anywhere on the interactive map to enrich coordinates.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationContract[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  // Modals
  const [isScenarioOpen, setIsScenarioOpen] = useState(false);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // Send message to backend
  const handleSendMessage = async (userText: string, structuredOverride?: Partial<EnvironmentalState>) => {
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const data = await api.sendMessage(userText, sessionId, structuredOverride);
      
      setSessionId(data.session_id);
      setEnvironmentalState(data.state);
      setCompletenessScore(data.completeness_score);
      setReasoningSteps(data.reasoning_steps || []);
      setRecommendations(data.recommendations || []);

      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: data.explanation,
        clarifyingQuestions: data.clarifying_questions,
        recommendations: data.recommendations,
        reasoningSteps: data.reasoning_steps,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: `Error processing request: ${err.message}. Please check backend connection.`,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Geo enrichment handler
  const handleEnrichGeo = async (latitude: number, longitude: number) => {
    setGeoLoading(true);
    try {
      const geoData = await api.enrichCoordinates(latitude, longitude);
      
      const enrichedMsg = `Identified coordinates (${latitude.toFixed(2)}, ${longitude.toFixed(2)}) in ${geoData.location.region}. Enriched soil organic carbon (${geoData.soil.organic_carbon_percent}%), rainfall (${geoData.climate.rainfall}mm), and crop profile (${geoData.land.crop}). Data sources: ${geoData.data_sources.join(', ')}.`;
      
      handleSendMessage(enrichedMsg, {
        location: geoData.location,
        soil: geoData.soil,
        climate: geoData.climate,
        land: geoData.land,
        biodiversity: geoData.biodiversity,
        human_impact: geoData.human_impact
      });
    } catch (err) {
      console.error(err);
    } finally {
      setGeoLoading(false);
    }
  };

  // Demo Scenarios Loader (Scenario 1, 2, 3 as defined in the Brief)
  const handleLoadScenario = (scenarioNum: number) => {
    if (scenarioNum === 1) {
      // Scenario 1 — Incomplete conversational input (triggers targeted clarification questions)
      handleSendMessage("Biodiversity is declining on my farm.");
    } else if (scenarioNum === 2) {
      // Scenario 2 — Structured environmental case (Low carbon + low rainfall + monoculture wheat)
      handleSendMessage(
        "Our farm is located in a semi-arid zone. We grow wheat as a single-crop monoculture with 450mm rainfall, low soil moisture, sandy loam texture, and our recent soil test shows organic carbon is at 0.35%."
      );
    } else if (scenarioNum === 3) {
      // Scenario 3 — Geo-enabled case (Nashik coordinates 19.99°N, 73.78°E)
      handleEnrichGeo(19.99, 73.78);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors">
      {/* Top Header & Demo Controls */}
      <Header
        onLoadScenario={handleLoadScenario}
        onOpenScenarioModal={() => setIsScenarioOpen(true)}
        onOpenEvidenceLibrary={() => setIsEvidenceOpen(true)}
        onOpenDossierModal={() => setIsDossierOpen(true)}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        geminiActive={geminiActive}
      />

      {/* Main 3-Panel Cockpit */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
        {/* Left Panel: Environmental State & Geo Inspector (3 cols) */}
        <section className="lg:col-span-3 h-full min-h-0">
          <EnvironmentalStatePanel
            state={environmentalState}
            completenessScore={completenessScore}
            onEnrichGeo={handleEnrichGeo}
            geoLoading={geoLoading}
            onQuickPreset={(preset) => handleSendMessage(`Preset loaded: ${preset.name}`, preset)}
          />
        </section>

        {/* Center Panel: Conversational Intelligence Stream (5 cols) */}
        <section className="lg:col-span-5 h-full min-h-0">
          <ChatArea
            messages={messages}
            onSendMessage={(msg) => handleSendMessage(msg)}
            isLoading={isLoading}
            onQuickPillClick={(pill) => handleSendMessage(pill)}
          />
        </section>

        {/* Right Panel: Reasoning Cockpit & Evidence Trace (4 cols) */}
        <section className="lg:col-span-4 h-full min-h-0">
          <ReasoningCockpit
            reasoningSteps={reasoningSteps}
            recommendations={recommendations}
            onOpenEvidenceLibrary={() => setIsEvidenceOpen(true)}
          />
        </section>
      </main>

      {/* Help & Guide Slideout Drawer */}
      <HelpSidebar
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Modals */}
      <ScenarioComparatorModal
        isOpen={isScenarioOpen}
        onClose={() => setIsScenarioOpen(false)}
        currentState={environmentalState}
      />

      <EvidenceLibraryModal
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
      />

      <DossierExportModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        state={environmentalState}
        reasoningSteps={reasoningSteps}
        recommendations={recommendations}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onKeySaved={() => setGeminiActive(true)}
      />
    </div>
  );
}

export default App;

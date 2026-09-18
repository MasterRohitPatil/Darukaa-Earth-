import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Sparkles, 
  MapPin, 
  Layers, 
  MessageSquare, 
  ShieldCheck, 
  Activity, 
  BookOpen, 
  ArrowRight,
  Compass,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'quickstart' | 'panels' | 'metrics' | 'engine' | 'demos';

export const HelpSidebar: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<TabType>('quickstart');

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 md:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl max-h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-all animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 m-0">
                  Darukaa Advance AI Model — Orientation
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Decision Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 m-0">
                Understand how the multi-variable reasoning engine and India geospatial tools work
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orientation Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-cyan-950/40 border-b border-emerald-200 dark:border-emerald-800/60 px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 animate-pulse" />
            <span>
              <strong>First time here?</strong> Follow this 1-minute visual guide to explore the platform like an expert.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer shadow-xs transition flex items-center gap-1"
          >
            <span>Start Exploring</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Visual Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950 px-3 pt-2 gap-1 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveSection('quickstart')}
            className={`px-3 py-2 rounded-t-xl font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSection === 'quickstart'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 border-t-2 border-t-emerald-500 border-x border-slate-200 dark:border-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>1. Quickstart</span>
          </button>

          <button
            onClick={() => setActiveSection('panels')}
            className={`px-3 py-2 rounded-t-xl font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSection === 'panels'
                ? 'bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 border-t-2 border-t-cyan-500 border-x border-slate-200 dark:border-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>2. The 3 Panels</span>
          </button>

          <button
            onClick={() => setActiveSection('metrics')}
            className={`px-3 py-2 rounded-t-xl font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSection === 'metrics'
                ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 border-t-2 border-t-amber-500 border-x border-slate-200 dark:border-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>3. Metrics Glossary</span>
          </button>

          <button
            onClick={() => setActiveSection('engine')}
            className={`px-3 py-2 rounded-t-xl font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSection === 'engine'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border-t-2 border-t-indigo-500 border-x border-slate-200 dark:border-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>4. Reasoning Engine</span>
          </button>

          <button
            onClick={() => setActiveSection('demos')}
            className={`px-3 py-2 rounded-t-xl font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSection === 'demos'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 border-t-2 border-t-purple-500 border-x border-slate-200 dark:border-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>5. Demo Scenarios</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          
          {/* TAB 1: QUICKSTART */}
          {activeSection === 'quickstart' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 m-0 mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  What makes Darukaa Advance AI Model different?
                </h3>
                <p className="m-0 text-slate-700 dark:text-slate-300 text-[12px] leading-relaxed">
                  Darukaa Advance AI Model is an <strong>evidence-grounded environmental decision intelligence system</strong>. Instead of generating vague or hallucinated chatbot advice, it evaluates cross-domain biophysical interactions across <strong>Soil Health</strong>, <strong>Climate Hydrology</strong>, and <strong>Land Diversity</strong> using authoritative literature from <strong>FAO, IPCC, and IPBES</strong>.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Simple 4-Step Workflow:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Step 1 */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-bold flex items-center justify-center text-xs">
                        1
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        Select an Indian Parcel
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] m-0">
                      Type any <strong>6-digit Indian PIN Code</strong> (e.g. <code>422001</code> for Nashik), click a preset, or open the <strong>Wide Screen Map</strong> to click anywhere in India.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center text-xs">
                        2
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        Describe Land Observations
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] m-0">
                      Tell the AI about your crops or problem. If critical variables are missing, the system will ask <strong>targeted clarifying questions</strong> before prescribing.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                        3
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        Review Reasoning Cockpit
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] m-0">
                      Watch the right panel generate prioritized interventions, time horizons (Immediate/Medium), confidence scores, and direct citations to research studies.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                        4
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        Export Full Assessment Report
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] m-0">
                      Click <strong>"Export Report"</strong> in the top header to generate a print-ready briefing document, download Markdown, or save as a PDF.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THE 3 PANELS */}
          {activeSection === 'panels' && (
            <div className="space-y-3">
              <p className="m-0 text-slate-500 dark:text-slate-400 text-xs">
                The screen is organized into 3 purpose-built panels so you always maintain complete visibility over data, conversation, and reasoning:
              </p>

              {/* Left Panel */}
              <div className="p-4 bg-cyan-50/50 dark:bg-cyan-950/20 border-2 border-cyan-200 dark:border-cyan-800/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-900 dark:text-cyan-200 text-xs flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    Left Panel — Environmental State & India GIS Map
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 rounded font-mono font-bold">
                    Input & Grounding
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 m-0">
                  Maintains the active profile of the land parcel: Soil Organic Carbon (SOC), annual rainfall, crop type, and data completeness. Features an <strong>Indian PIN Code search bar</strong> and a <strong>Wide Screen ⛶</strong> button for high-precision map exploration.
                </p>
              </div>

              {/* Center Panel */}
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Center Panel — Conversational Intelligence Feed
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded font-mono font-bold">
                    Dialogue & Clarification
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 m-0">
                  Where you converse with Darukaa Advance AI Model. If your input lacks crucial information, the AI stops to ask targeted questions (e.g. <em>"What is your rainfall regime?"</em>) and provides one-click answer pills so you can respond effortlessly.
                </p>
              </div>

              {/* Right Panel */}
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-800/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Right Panel — Reasoning Cockpit & Evidence Trace
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 rounded font-mono font-bold">
                    Scientific Output
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 m-0">
                  Displays the multi-variable reasoning steps, priority ecological interventions, biological mechanisms (why it works), projected trajectory impacts, and clickable citations directly linking to FAO, IPCC, and IPBES studies.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: METRICS GLOSSARY */}
          {activeSection === 'metrics' && (
            <div className="space-y-3">
              <p className="m-0 text-slate-500 dark:text-slate-400 text-xs">
                Key environmental parameters evaluated by the reasoning engine:
              </p>

              {/* SOC Card */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                    Soil Organic Carbon (SOC)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Core Soil Health Indicator
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 m-0">
                  Percentage of decomposed biological matter in the top 0-30cm of soil. Governs water retention, nutrient cycling, and microbial resilience.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-900 text-[10px]">
                    <span className="font-bold text-red-800 dark:text-red-300 block">&lt; 0.75% (Critical)</span>
                    <span className="text-red-700 dark:text-red-400">Severe erosion risk & low water holding</span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-900 text-[10px]">
                    <span className="font-bold text-amber-800 dark:text-amber-300 block">0.75% - 1.2%</span>
                    <span className="text-amber-700 dark:text-amber-400">Moderate health; needs organic mulches</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-900 text-[10px]">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block">&gt; 1.2% (Healthy)</span>
                    <span className="text-emerald-700 dark:text-emerald-400">Optimal microbial activity & retention</span>
                  </div>
                </div>
              </div>

              {/* Rainfall Card */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                    Annual Precipitation & Aridity Regime
                  </span>
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                    NASA POWER Grounding
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 m-0">
                  Annual precipitation in millimeters. Areas with &lt; 500mm (e.g. parts of Maharashtra, Rajasthan, Telangana) require drought-hardy living legume mulches rather than high-evapotranspiration tree planting.
                </p>
              </div>

              {/* Monoculture Card */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                    Monoculture Cropping & Habitat Fragmentation
                  </span>
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                    IPBES Biodiversity Framework
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 m-0">
                  Continuous single-species cropping (e.g. wheat-only or cotton-only) concentrates pest populations, encourages chemical overuse, and eliminates predatory beneficial insects and pollinators.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: REASONING ENGINE */}
          {activeSection === 'engine' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Why Deterministic Scientific Reasoning?
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 m-0 leading-relaxed">
                  Most conversational chatbots generate plausible-sounding but ungrounded advice. Darukaa Advance AI Model uses a deterministic reasoning engine that cross-references <strong>at least 3 interacting environmental variables</strong> before formulating recommendations.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Anti-Hallucination Guardrails
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 m-0 leading-relaxed">
                  The system validates all claims against retrieved literature. If an AI mentions an unsupported percentage (e.g. <em>"boosts yield by 89%"</em>) without grounding, it sanitizes the claim to a qualitative direction (<em>"substantially increases"</em>) and attaches uncertainty boundaries.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Authoritative Grounding Knowledge Bases
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <strong>FAO</strong>: Soil conservation, living cover crops, and agroecology guidelines.
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <strong>IPCC AR6</strong>: Thermal microclimatic stress buffers & drought adaptation.
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <strong>IPBES</strong>: Pollinator assessment, beneficial insect habitat corridors.
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <strong>ISRIC / NASA POWER</strong>: Standardized global soil carbon and agro-meteorological grids.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DEMO SCENARIOS */}
          {activeSection === 'demos' && (
            <div className="space-y-3">
              <p className="m-0 text-slate-500 dark:text-slate-400 text-xs">
                To test the system immediately without manual typing, use the 3 highlighted buttons in the top header:
              </p>

              {/* Demo 1 */}
              <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/80 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 dark:text-amber-200 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Demo 1: Intelligent Clarification Flow
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-amber-200/60 dark:bg-amber-900 text-amber-900 dark:text-amber-200 rounded font-mono font-bold">
                    Vague Input Test
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 m-0">
                  Sends <em>"Biodiversity is declining on my farm."</em> Notice how the system detects incomplete data and asks 3 specific clarifying questions with one-click answer pills rather than making assumptions.
                </p>
              </div>

              {/* Demo 2 */}
              <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/80 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Demo 2: Multi-Metric Scientific Reasoning
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-200/60 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 rounded font-mono font-bold">
                    3-Variable Reasoning
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 m-0">
                  Evaluates Low Carbon (0.35%) + Low Rainfall (450mm) + Monoculture Wheat. Generates a 3-pressure causal chain and prioritizes legume-grass cover crops with FAO citations.
                </p>
              </div>

              {/* Demo 3 */}
              <div className="p-3.5 bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-300 dark:border-cyan-800/80 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-900 dark:text-cyan-200 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    Demo 3: Geospatial Enrichment (Nashik, India)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-cyan-200/60 dark:bg-cyan-900 text-cyan-900 dark:text-cyan-200 rounded font-mono font-bold">
                    India GIS Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 m-0">
                  Enriches live coordinates in Nashik, Maharashtra (19.99° N, 73.78° E). Auto-populates soil properties, precipitation, and regional crop profiles directly into the state engine.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Darukaa Advance AI Model v1.0 • Grounded in FAO, IPCC, IPBES, & ISRIC</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition shadow-xs flex items-center gap-1.5"
          >
            <span>Got It, Let's Begin!</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

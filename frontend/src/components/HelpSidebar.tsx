import React, { useState } from 'react';
import { X, HelpCircle, Info } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSidebar: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'tour' | 'metrics' | 'science' | 'scenarios'>('tour');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden transition-transform animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">
                EcoReason User Guide & Glossary
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0">
                Quick Orientation & Decision Intelligence Reference
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
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800/80 px-4 py-2.5 flex items-center justify-between gap-2 text-xs">
          <div className="text-emerald-900 dark:text-emerald-200">
            <span className="font-bold">👋 First time here?</span> Read this 1-minute guide to see how the system reasons.
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shrink-0 cursor-pointer shadow-xs transition"
          >
            Got It! Explore App →
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950 px-2 pt-2 gap-1 text-xs">
          <button
            onClick={() => setActiveSection('tour')}
            className={`px-3 py-2 rounded-t-lg font-medium transition cursor-pointer ${
              activeSection === 'tour'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-t border-x border-slate-200 dark:border-slate-800'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            How It Works
          </button>
          <button
            onClick={() => setActiveSection('metrics')}
            className={`px-3 py-2 rounded-t-lg font-medium transition cursor-pointer ${
              activeSection === 'metrics'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-t border-x border-slate-200 dark:border-slate-800'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Metrics Glossary
          </button>
          <button
            onClick={() => setActiveSection('science')}
            className={`px-3 py-2 rounded-t-lg font-medium transition cursor-pointer ${
              activeSection === 'science'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-t border-x border-slate-200 dark:border-slate-800'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Reasoning Engine
          </button>
          <button
            onClick={() => setActiveSection('scenarios')}
            className={`px-3 py-2 rounded-t-lg font-medium transition cursor-pointer ${
              activeSection === 'scenarios'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-t border-x border-slate-200 dark:border-slate-800'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Demo Guide
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          
          {/* TAB 1: HOW IT WORKS */}
          {activeSection === 'tour' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3.5 rounded-xl">
                <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 m-0 mb-1 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  What is EcoReason?
                </h3>
                <p className="m-0 text-emerald-800 dark:text-emerald-200 text-[12px]">
                  EcoReason is an <strong>environmental decision intelligence system</strong>. It is not just a chatbot. It connects structured soil, climate, and crop metrics with scientific evidence from FAO, IPCC, and IPBES to generate verifiable interventions.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider mb-2">
                  The 3 Screen Panels Explained:
                </h4>
                
                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                      1. Left Panel — Environmental State
                    </span>
                    Shows the active measurements of your land parcel: Soil Organic Carbon (SOC), annual rainfall, crop type, and data completeness. You can click on the map to automatically fill this with global satellite and soil data.
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                      2. Center Panel — Conversational Intelligence
                    </span>
                    Where you converse with the system. If your inquiry is vague (e.g. <em>"Biodiversity is dropping"</em>), the system detects missing factors and asks targeted clarifying questions before jumping to a diagnosis.
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                      3. Right Panel — Reasoning & Evidence Cockpit
                    </span>
                    Displays the prioritized interventions, scientific mechanisms, directional impacts (e.g. SOC ↑, Erosion ↓), and exact clickable citations to FAO, IPCC, and IPBES literature.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: METRICS GLOSSARY */}
          {activeSection === 'metrics' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-xs block mb-1">
                  Soil Organic Carbon (SOC)
                </span>
                <p className="m-0 text-slate-600 dark:text-slate-400">
                  Measures the organic matter stored in the top 0-30cm of soil.
                  <br />• <strong>&lt; 0.75% (Critical Red)</strong>: Severe depletion. Soil cannot retain moisture or sustain microbes.
                  <br />• <strong>0.75% - 1.2% (Sub-optimal)</strong>: Moderate resilience.
                  <br />• <strong>&gt; 1.2% (Healthy Green)</strong>: Robust water-holding capacity and microbial health.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-xs block mb-1">
                  Annual Rainfall & Aridity
                </span>
                <p className="m-0 text-slate-600 dark:text-slate-400">
                  Annual precipitation in millimeters. Areas with &lt; 500mm are drylands/semi-arid and require drought-hardy, low-water interventions (such as living legume mulches) rather than water-demanding agroforestry.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-xs block mb-1">
                  Monoculture Cropping
                </span>
                <p className="m-0 text-slate-600 dark:text-slate-400">
                  Farming a single crop species across large contiguous parcels. Causes pest specialization, depletion of specific nutrient bands, and loss of predatory beneficial insects.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-xs block mb-1">
                  GBIF Occurrence Indicator
                </span>
                <p className="m-0 text-slate-600 dark:text-slate-400">
                  Local species observation records from the Global Biodiversity Information Facility. <strong>Scientific Notice</strong>: This is an observational proxy/indicator and does not represent true absolute species richness.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: REASONING ENGINE */}
          {activeSection === 'science' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-xs block mb-1">
                  Why Deterministic Reasoning Matters:
                </span>
                <p className="m-0 text-slate-600 dark:text-slate-400 leading-relaxed">
                  General-purpose AI models are prone to hallucinating numbers and recommending generic practices. EcoReason uses a deterministic rule engine that analyzes <strong>at least 3 interacting environmental domains</strong> (Soil × Water × Land Use) before synthesizing output.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-xs block mb-1">
                  The Anti-Hallucination Guardrail:
                </span>
                <p className="m-0 text-slate-600 dark:text-slate-400 leading-relaxed">
                  The system scans every generated statement. If an AI mentions a quantitative percentage (e.g. <em>"increases yield by 60%"</em>) that is not supported by retrieved literature chunks, it sanitizes the claim to a qualitative direction (<em>"substantially increases"</em>) and appends uncertainty bounds.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-xs block mb-1">
                  Authoritative Grounding Sources:
                </span>
                <p className="m-0 text-slate-600 dark:text-slate-400">
                  • <strong>FAO</strong>: Soil conservation, agroecology, cover crops.<br />
                  • <strong>IPCC AR6 WGII</strong>: Microclimate buffers & climate adaptation.<br />
                  • <strong>IPBES</strong>: Pollinator assessments & beneficial insect corridors.<br />
                  • <strong>ISRIC</strong>: Global soil property profiles.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: DEMO GUIDE */}
          {activeSection === 'scenarios' && (
            <div className="space-y-3">
              <p className="m-0 text-slate-500">
                To test the system like an evaluator, use the 3 preset buttons in the header:
              </p>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">
                  1. Clarification Demo:
                </span>
                Click <strong>"1. Clarification"</strong>. See how the system asks targeted questions for missing variables and provides quick-answer pills.
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                  2. Multi-Metric Case:
                </span>
                Click <strong>"2. Multi-Metric Case"</strong>. Evaluates Low Carbon (0.35%) + Low Rainfall (450mm) + Monoculture Wheat to produce priority interventions with FAO citations.
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="font-bold text-cyan-600 dark:text-cyan-400 block mb-1">
                  3. Geo-Enriched Case:
                </span>
                Click <strong>"3. Geo-Enriched"</strong> (or click anywhere on the Leaflet map). Enriches live coordinates with NASA POWER, SoilGrids, and GBIF.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between text-[11px] text-slate-400">
          <span>EcoReason v1.0 • Evidence-Grounded</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer transition shadow-xs"
          >
            Got It, Let's Begin!
          </button>
        </div>
      </div>
    </div>
  );
};

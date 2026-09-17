import React from 'react';
import { Leaf, Sparkles, Database } from 'lucide-react';

interface HeaderProps {
  onLoadScenario: (scenarioNum: number) => void;
  onOpenScenarioModal: () => void;
  onOpenEvidenceLibrary: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadScenario,
  onOpenScenarioModal,
  onOpenEvidenceLibrary,
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Positioning */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white m-0 leading-none">
                EcoReason
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                Decision Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Evidence-Grounded Biodiversity & Multi-Variable Environmental Reasoning
            </p>
          </div>
        </div>

        {/* Demo Scenario Switcher & Tools */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">
            Demo Scenarios:
          </span>
          <button
            onClick={() => onLoadScenario(1)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            title="Scenario 1: Vague input triggers intelligent clarifying questions"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            1. Clarification
          </button>
          <button
            onClick={() => onLoadScenario(2)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            title="Scenario 2: Low carbon + dryland + monoculture wheat"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            2. Multi-Metric Case
          </button>
          <button
            onClick={() => onLoadScenario(3)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            title="Scenario 3: Geo-enriched coordinates (Nashik, India)"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            3. Geo-Enriched
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1"></div>

          {/* Action Modals */}
          <button
            onClick={onOpenScenarioModal}
            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-800 transition flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            What-If Simulator
          </button>

          <button
            onClick={onOpenEvidenceLibrary}
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 transition flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            Evidence Library
          </button>
        </div>
      </div>
    </header>
  );
};

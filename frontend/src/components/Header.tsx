import React from 'react';
import { Leaf, Sparkles, Database, FileDown, Key, HelpCircle, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onLoadScenario: (scenarioNum: number) => void;
  onOpenScenarioModal: () => void;
  onOpenEvidenceLibrary: () => void;
  onOpenDossierModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenHelp: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  geminiActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadScenario,
  onOpenScenarioModal,
  onOpenEvidenceLibrary,
  onOpenDossierModal,
  onOpenSettingsModal,
  onOpenHelp,
  theme,
  onToggleTheme,
  geminiActive
}) => {
  return (
    <header className="bg-white/95 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 py-3 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Positioning */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white m-0 leading-none">
                EcoReason
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60">
                Decision Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Evidence-Grounded Biodiversity & Multi-Variable Environmental Reasoning
            </p>
          </div>
        </div>

        {/* Demo Scenario Switcher & Tools */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">
            Demo Scenarios:
          </span>
          <button
            onClick={() => onLoadScenario(1)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition flex items-center gap-1.5 cursor-pointer font-medium"
            title="Scenario 1: Vague input triggers intelligent clarifying questions"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            1. Clarification
          </button>
          <button
            onClick={() => onLoadScenario(2)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition flex items-center gap-1.5 cursor-pointer font-medium"
            title="Scenario 2: Low carbon + dryland + monoculture wheat"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            2. Multi-Metric Case
          </button>
          <button
            onClick={() => onLoadScenario(3)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition flex items-center gap-1.5 cursor-pointer font-medium"
            title="Scenario 3: Geo-enriched coordinates (Nashik, India)"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            3. Geo-Enriched
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

          {/* Action Modals */}
          <button
            onClick={onOpenScenarioModal}
            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 transition flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Simulator
          </button>

          <button
            onClick={onOpenEvidenceLibrary}
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 transition flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Evidence
          </button>

          <button
            onClick={onOpenDossierModal}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 border border-slate-300 dark:border-emerald-800/60 transition flex items-center gap-1.5 font-medium cursor-pointer"
            title="Export full executive ecological briefing report"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Dossier
          </button>

          {/* Help & Guide Button */}
          <button
            onClick={onOpenHelp}
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Open comprehensive user guide & metrics glossary"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Guide & Help</span>
          </button>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={onToggleTheme}
            className="text-xs p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Gemini API Key */}
          <button
            onClick={onOpenSettingsModal}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition flex items-center gap-1 font-medium cursor-pointer ${
              geminiActive
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900'
            }`}
            title="Configure Google Gemini API Key"
          >
            <Key className={`w-3.5 h-3.5 ${geminiActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
            {geminiActive ? 'Gemini: Active' : 'API Key'}
          </button>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import type { RecommendationContract, ReasoningStep } from '../types';
import { 
  CheckCircle, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertCircle,
  BookOpen,
  Activity,
  GitFork,
  ArrowRight
} from 'lucide-react';

interface Props {
  reasoningSteps: ReasoningStep[];
  recommendations: RecommendationContract[];
  onOpenEvidenceLibrary: () => void;
}

export const ReasoningCockpit: React.FC<Props> = ({
  reasoningSteps,
  recommendations,
  onOpenEvidenceLibrary
}) => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'reasoning_graph' | 'causal_nexus'>('recommendations');

  const renderDirectionIcon = (dir: string) => {
    switch (dir) {
      case 'increase':
      case 'restore':
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
      case 'decrease':
        return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <Minus className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col h-full overflow-y-auto shadow-xs transition-colors">
      {/* Tab Switcher Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'recommendations'
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Interventions ({recommendations.length})
          </button>
          
          <button
            onClick={() => setActiveTab('reasoning_graph')}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'reasoning_graph'
                ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            Reasoning Steps ({reasoningSteps.length})
          </button>

          <button
            onClick={() => setActiveTab('causal_nexus')}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'causal_nexus'
                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <GitFork className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Causal Nexus
          </button>
        </div>

        <button
          onClick={onOpenEvidenceLibrary}
          className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer font-medium"
          title="Browse Full Evidence Corpus"
        >
          <BookOpen className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          Corpus
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'recommendations' ? (
        <div className="space-y-4 flex-1">
          {recommendations.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Activity className="w-8 h-8 text-slate-400 dark:text-slate-700 mx-auto mb-2 animate-pulse" />
              <p className="font-medium">Awaiting sufficient multi-variable environmental input.</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-1">
                Provide at least 3 variables (soil, climate, land use) to trigger deterministic reasoning.
              </p>
            </div>
          ) : (
            recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="bg-slate-50/90 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                {/* Card Title & Badges */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80">
                      Priority Intervention #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                        <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        {rec.time_horizon.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase text-[10px]">
                        Confidence: {rec.confidence}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight m-0">
                    {rec.recommendation}
                  </h3>
                </div>

                {/* Variables Examined */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 self-center mr-1 font-medium">Variables Used:</span>
                  {rec.variables_used.map((v, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono"
                    >
                      {v}
                    </span>
                  ))}
                </div>

                {/* Scientific Mechanism */}
                <div className="bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800/80">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Why It Works (Scientific Mechanism)
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed m-0">
                    {rec.why_it_works}
                  </p>
                </div>

                {/* Impacted Metrics Matrix */}
                <div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    Impacted Environmental Metrics:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {rec.impacted_metrics.map((metric, i) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{metric.metric}</span>
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          {renderDirectionIcon(metric.direction)}
                          <span className="capitalize text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                            {metric.direction}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evidence Trace Accordion */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center justify-between">
                    <span>Evidence Trace (FAO / IPCC / IPBES Citations):</span>
                  </div>
                  <div className="space-y-2">
                    {rec.evidence.map((ev, i) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-300">{ev.organization} ({ev.year || 2023})</span>
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 flex items-center gap-1 text-[11px] font-medium"
                          >
                            Inspect Source <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="text-slate-800 dark:text-slate-300 font-medium">{ev.title}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                          "{ev.claim_supported}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Uncertainty & Limitations */}
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-2.5 rounded-lg text-xs text-amber-900 dark:text-amber-200">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300 mb-1 text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Uncertainty & Boundaries:
                  </div>
                  <p className="text-[11px] text-amber-800/90 dark:text-amber-200/90 leading-relaxed m-0">
                    {rec.uncertainty}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'reasoning_graph' ? (
        /* Reasoning Chain Step View */
        <div className="space-y-3 flex-1">
          {reasoningSteps.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <p>No active interaction chain calculated yet.</p>
            </div>
          ) : (
            reasoningSteps.map((step) => (
              <div
                key={step.step_number}
                className="bg-slate-50/90 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 relative pl-6 shadow-2xs"
              >
                {/* Step Connector Indicator */}
                <div className="absolute left-2.5 top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyan-600 to-emerald-600 dark:from-cyan-500 dark:to-emerald-500 rounded"></div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-700 dark:text-cyan-400 font-mono text-[11px]">
                    STEP {step.step_number}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Cross-Variable Synthesis
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {step.ecological_pressure}
                </div>

                <div className="bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
                    Observation & Interacting Variables:
                  </span>
                  {step.observation}
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold block mb-0.5">
                    Biological Implication:
                  </span>
                  {step.implication}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Visual Causal Nexus Diagram View */
        <div className="space-y-4 flex-1">
          {reasoningSteps.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <GitFork className="w-8 h-8 text-slate-400 dark:text-slate-700 mx-auto mb-2" />
              <p>Causal nexus visualizer requires active multi-variable state.</p>
            </div>
          ) : (
            <div className="space-y-6 py-2">
              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-indigo-700 dark:text-indigo-300 font-semibold block mb-1">
                  🌐 Multi-Variable Ecological Causal Nexus:
                </span>
                Demonstrates how observed baseline variables combine non-linearly into compounding ecological pressures, directly mapping to scientifically grounded interventions.
              </div>

              {reasoningSteps.map((step, idx) => (
                <div key={idx} className="bg-slate-50/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-2xs">
                  {/* Layer 1: Observed Variables */}
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">
                      Input Variable Nodes (Observed):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {step.variables.map((v, i) => (
                        <div key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-800 dark:text-blue-300 text-xs font-mono font-medium">
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex items-center justify-center text-slate-400 dark:text-slate-600">
                    <span className="text-[10px] uppercase font-bold font-mono mr-1 text-slate-500">Compounding Nexus</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  </div>

                  {/* Layer 2: Ecological Pressure */}
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-red-700 dark:text-red-400 block mb-1">
                      Synthesized Ecological Pressure:
                    </span>
                    <div className="text-xs font-bold text-red-800 dark:text-red-200">
                      {step.ecological_pressure}
                    </div>
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 mt-1">
                      {step.implication}
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex items-center justify-center text-slate-400 dark:text-slate-600">
                    <span className="text-[10px] uppercase font-bold font-mono mr-1 text-slate-500">Alleviated by</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  {/* Layer 3: Mapped Intervention */}
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                      Targeted FAO / IPCC Intervention:
                    </span>
                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                      {recommendations[idx]?.recommendation || 'Grounded Soil & Biodiversity Enhancement'}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                      {recommendations[idx]?.why_it_works || 'Root exudates and biological corridors buffer against calculated pressures.'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

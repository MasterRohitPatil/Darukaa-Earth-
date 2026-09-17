import React, { useState } from 'react';
import type { EnvironmentalState } from '../types';
import { api } from '../services/api';
import { X, Sparkles, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentState: EnvironmentalState;
}

export const ScenarioComparatorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentState
}) => {
  const [scenarioType, setScenarioType] = useState('cover_crops');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const runSimulation = async (type: string) => {
    setScenarioType(type);
    setLoading(true);
    try {
      const data = await api.runScenario(currentState, type);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white m-0">
              What-If Ecological Scenario Simulator
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Scenario Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Select an Ecological Management Intervention to Simulate:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => runSimulation('cover_crops')}
                className={`text-xs p-3 rounded-xl border text-left transition cursor-pointer ${
                  scenarioType === 'cover_crops'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-500 dark:text-emerald-200 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
              >
                <div className="font-semibold mb-0.5">🌱 Cover Crops</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">SOC & Moisture Buffer</div>
              </button>

              <button
                onClick={() => runSimulation('hedgerows')}
                className={`text-xs p-3 rounded-xl border text-left transition cursor-pointer ${
                  scenarioType === 'hedgerows'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 dark:bg-amber-950/80 dark:border-amber-500 dark:text-amber-200 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
              >
                <div className="font-semibold mb-0.5">🌸 Floral Hedgerows</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Pollinators & IPM Refugia</div>
              </button>

              <button
                onClick={() => runSimulation('agroforestry')}
                className={`text-xs p-3 rounded-xl border text-left transition cursor-pointer ${
                  scenarioType === 'agroforestry'
                    ? 'bg-cyan-50 border-cyan-500 text-cyan-900 dark:bg-cyan-950/80 dark:border-cyan-500 dark:text-cyan-200 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
              >
                <div className="font-semibold mb-0.5">🌳 Agroforestry Belts</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Microclimate Thermal Buffer</div>
              </button>
            </div>
          </div>

          {/* Results Comparison */}
          {loading ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs animate-pulse">
              Simulating multi-variable biophysical trajectory...
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{result.title}</div>
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{result.mechanism}</div>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/90 dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider text-[10px]">
                    Current Baseline Pressures
                  </div>
                  <div className="space-y-1.5">
                    {result.baseline_pressures.length === 0 ? (
                      <div className="text-xs text-slate-400 italic">No baseline pressures detected</div>
                    ) : (
                      result.baseline_pressures.map((p: string, i: number) => (
                        <div key={i} className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/40">
                          ⚠ {p}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-slate-50/90 dark:bg-slate-950/80 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2 uppercase tracking-wider text-[10px]">
                    Projected Scenario Outcomes
                  </div>
                  <div className="space-y-1.5">
                    {result.projected_improvements.map((item: any, i: number) => (
                      <div key={i} className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
                        <span className="font-medium">{item.metric}:</span>
                        <span className="text-[11px] font-bold">{item.change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-3 rounded-lg flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Scientific Decision Support Disclaimer: This simulator provides qualitative comparative trajectories derived from FAO/IPCC empirical benchmarks, not deterministic predictive forecasts.
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <button
                onClick={() => runSimulation('cover_crops')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                Run Baseline vs Scenario Simulation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

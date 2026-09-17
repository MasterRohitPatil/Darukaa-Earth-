import React, { useState } from 'react';
import type { EnvironmentalState, RecommendationContract, ReasoningStep } from '../types';
import { X, FileText, Copy, Download, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  state: EnvironmentalState;
  reasoningSteps: ReasoningStep[];
  recommendations: RecommendationContract[];
}

export const DossierExportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  state,
  reasoningSteps,
  recommendations
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateDossierText = () => {
    const lines: string[] = [];
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    lines.push('# EXECUTIVE ECOLOGICAL DECISION INTELLIGENCE DOSSIER');
    lines.push(`**System**: EcoReason Decision Intelligence Platform`);
    lines.push(`**Generated**: ${dateStr}`);
    lines.push(`**Target Location**: ${state.location.region || 'Unspecified Regional Zone'} (${state.location.country || 'Global'})`);
    lines.push(`**Coordinates**: Lat ${state.location.latitude ?? 'N/A'}, Lon ${state.location.longitude ?? 'N/A'}`);
    lines.push('\n---\n');

    lines.push('## 1. ENVIRONMENTAL BASELINE PROFILE');
    lines.push(`- **Soil Health (ISRIC Grounding)**:`);
    lines.push(`  • Soil Organic Carbon (SOC): ${state.soil.organic_carbon_percent ? `${state.soil.organic_carbon_percent}%` : 'Not tested'} (Threshold: >1.2% optimal)`);
    lines.push(`  • Soil Moisture Level: ${state.soil.moisture || 'Unspecified'}`);
    lines.push(`  • Soil pH: ${state.soil.ph ?? 'Unspecified'}`);
    lines.push(`  • Texture Matrix: ${state.soil.texture || 'Unspecified'}`);
    lines.push(`- **Climate Hydrology (NASA POWER Grounding)**:`);
    lines.push(`  • Annual Precipitation: ${state.climate.rainfall ? `${state.climate.rainfall} mm` : 'Unspecified'}`);
    lines.push(`  • Mean Temperature: ${state.climate.temperature ? `${state.climate.temperature}°C` : 'Unspecified'}`);
    lines.push(`  • Seasonality Regime: ${state.climate.seasonality || 'Unspecified'}`);
    lines.push(`- **Land Management Matrix**:`);
    lines.push(`  • Target Crop / Land Use: ${state.land.crop || state.land.land_use || 'Unspecified'}`);
    lines.push(`  • Cropping Regime: ${state.land.monoculture ? 'Monoculture (Single crop)' : 'Diversified polyculture'}`);
    lines.push(`  • Habitat Diversity: ${state.land.habitat_diversity || 'Unspecified'}`);
    lines.push(`  • Pesticide Pressure: ${state.human_impact.pesticide_pressure || 'Unspecified'}`);
    lines.push('\n---\n');

    lines.push('## 2. DETERMINISTIC CROSS-VARIABLE REASONING CHAIN');
    if (reasoningSteps.length === 0) {
      lines.push('No critical cross-variable interaction pressures flagged.');
    } else {
      reasoningSteps.forEach((s) => {
        lines.push(`### Step ${s.step_number}: ${s.ecological_pressure}`);
        lines.push(`- **Observation**: ${s.observation}`);
        lines.push(`- **Variables Interacting**: ${s.variables.join(', ')}`);
        lines.push(`- **Biophysical Implication**: ${s.implication}\n`);
      });
    }

    lines.push('## 3. EVIDENCE-GROUNDED PRIORITY INTERVENTIONS');
    if (recommendations.length === 0) {
      lines.push('Awaiting sufficient multi-variable input to formulate prioritized interventions.');
    } else {
      recommendations.forEach((rec, i) => {
        lines.push(`### ${i + 1}. ${rec.recommendation} [Time Horizon: ${rec.time_horizon.toUpperCase()} | Confidence: ${rec.confidence.toUpperCase()}]`);
        lines.push(`- **Scientific Mechanism**: ${rec.why_it_works}`);
        lines.push(`- **Variables Used**: ${rec.variables_used.join(', ')}`);
        lines.push(`- **Projected Metric Trajectories**:`);
        rec.impacted_metrics.forEach((m) => {
          lines.push(`  • ${m.metric}: ${m.direction.toUpperCase()} (${m.details || 'Documented effect'})`);
        });
        lines.push(`- **Supporting Authoritative Literature**:`);
        rec.evidence.forEach((ev) => {
          lines.push(`  • [${ev.organization}] *${ev.title}* (${ev.year || 2023}) — "${ev.claim_supported}" [URL: ${ev.url}]`);
        });
        lines.push(`- **Risk & Uncertainty Caveats**: ${rec.uncertainty}\n`);
      });
    }

    lines.push('## 4. SCIENTIFIC & METHODOLOGICAL DISCLAIMER');
    lines.push('This dossier is generated as evidence-grounded decision intelligence to support trained environmental specialists and agronomists. It does not replace on-site physical soil core sampling or localized micro-topographical surveys.');

    return lines.join('\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateDossierText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generateDossierText()], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `EcoReason_Dossier_${state.location.region?.replace(/\s+/g, '_') || 'Assessment'}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white m-0">
                Executive Ecological Dossier
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Publication-Grade Briefing Document for Environmental Scientists & Agronomists
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {recommendations.length} verified interventions ready for export
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition cursor-pointer font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard' : 'Copy Text'}
            </button>
            <button
              onClick={handleDownload}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download Markdown (.md)
            </button>
          </div>
        </div>

        {/* Dossier Preview */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-950/70 font-mono text-xs text-slate-800 dark:text-slate-300 whitespace-pre-wrap leading-relaxed border-t border-slate-100 dark:border-transparent">
          {generateDossierText()}
        </div>
      </div>
    </div>
  );
};

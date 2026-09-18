import React, { useState, useEffect } from 'react';
import type { EnvironmentalState } from '../types';
import { InteractiveMap } from './InteractiveMap';
import { 
  Compass, 
  Layers, 
  CloudRain, 
  Trees, 
  Code, 
  MapPin, 
  Sliders, 
  Sparkles, 
  BarChart3, 
  Droplet, 
  Sprout, 
  Activity 
} from 'lucide-react';

interface Props {
  state: EnvironmentalState;
  completenessScore: number;
  onEnrichGeo: (lat: number, lng: number, crop?: string) => void;
  geoLoading: boolean;
  onQuickPreset: (preset: any) => void;
}

export const EnvironmentalStatePanel: React.FC<Props> = ({
  state,
  completenessScore,
  onEnrichGeo,
  geoLoading,
  onQuickPreset
}) => {
  const [activeTab, setActiveTab] = useState<'location' | 'matrix' | 'calibrate'>('location');
  const [showJson, setShowJson] = useState(false);
  
  const [sliderSoc, setSliderSoc] = useState<number>(state.soil.organic_carbon_percent ?? 0.35);
  const [sliderRain, setSliderRain] = useState<number>(state.climate.rainfall ?? 450);
  const [sliderMonoculture, setSliderMonoculture] = useState<boolean>(state.land.monoculture ?? true);
  const [sliderCrop, setSliderCrop] = useState<string>(state.land.crop || 'cotton');

  const [selectedLat, setSelectedLat] = useState<number>(state.location.latitude ?? 19.99);
  const [selectedLng, setSelectedLng] = useState<number>(state.location.longitude ?? 73.78);

  useEffect(() => {
    if (state.soil.organic_carbon_percent !== null && state.soil.organic_carbon_percent !== undefined) {
      setSliderSoc(state.soil.organic_carbon_percent);
    }
    if (state.climate.rainfall !== null && state.climate.rainfall !== undefined) {
      setSliderRain(state.climate.rainfall);
    }
    if (state.land.monoculture !== null && state.land.monoculture !== undefined) {
      setSliderMonoculture(state.land.monoculture);
    }
    if (state.land.crop) {
      setSliderCrop(state.land.crop);
    }
    if (state.location.latitude !== null && state.location.latitude !== undefined) {
      setSelectedLat(state.location.latitude);
    }
    if (state.location.longitude !== null && state.location.longitude !== undefined) {
      setSelectedLng(state.location.longitude);
    }
  }, [state]);

  const handleApplyCalibration = () => {
    const updatedState = {
      ...state,
      soil: { ...state.soil, organic_carbon_percent: sliderSoc },
      climate: { ...state.climate, rainfall: sliderRain },
      land: { ...state.land, monoculture: sliderMonoculture, crop: sliderCrop }
    };
    onQuickPreset({
      name: `Calibrated Parcel (${sliderCrop}, ${sliderSoc}% SOC, ${sliderRain}mm Rain, ${sliderMonoculture ? 'Monoculture' : 'Polyculture'})`,
      ...updatedState
    });
    setActiveTab('matrix');
  };

  const handleLocateAndAnalyze = (targetLat: number, targetLng: number, targetCrop: string, _placeName?: string) => {
    setSliderCrop(targetCrop);
    onEnrichGeo(targetLat, targetLng, targetCrop);
    setActiveTab('matrix');
  };

  const soc = state.soil.organic_carbon_percent;
  const rainfall = state.climate.rainfall;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex flex-col h-full shadow-xs transition-colors overflow-hidden">
      
      {/* 1. Header & Data Completeness */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 m-0 leading-tight">
              Environmental State
            </h2>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[180px]">
              {state.location.region || 'Regional Parcel'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Completeness Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono">
            <span className="text-[10px] text-slate-400">Data:</span>
            <span className={`font-bold ${completenessScore >= 0.6 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {Math.round(completenessScore * 100)}%
            </span>
          </div>

          <button
            onClick={() => setShowJson(!showJson)}
            className="text-[10px] text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded cursor-pointer transition"
            title="Toggle Raw JSON View"
          >
            <Code className="w-3 h-3" />
            {showJson ? 'Dashboard' : 'JSON'}
          </button>
        </div>
      </div>

      {/* 2. RICH COLOR-CODED DIFFERENTIATION BOXES (High-Contrast Thematic Colors!) */}
      <div className="grid grid-cols-4 gap-1.5 my-2">
        {/* BOX 1: Soil Carbon (Warm Earthy Amber Theme) */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 dark:from-amber-950/40 dark:to-orange-950/20 p-2 rounded-xl border-2 border-amber-300 dark:border-amber-700/80 text-center shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[9px] uppercase font-bold tracking-wider text-amber-800 dark:text-amber-300">
            <Compass className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">Soil Carbon</span>
          </div>
          <div className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-100 flex items-center justify-center gap-1 mt-0.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${soc !== null && soc !== undefined ? (soc < 0.75 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500') : 'bg-slate-400'}`}></span>
            <span>{soc !== null && soc !== undefined ? `${soc}%` : '—'}</span>
          </div>
          <div className="text-[8px] font-bold text-amber-700 dark:text-amber-400 mt-0.5 truncate">
            {soc !== null && soc !== undefined ? (soc < 0.75 ? 'Critical Deficit' : 'Optimal SOC') : 'ISRIC'}
          </div>
        </div>

        {/* BOX 2: Rainfall (Crisp Hydrology Sky Blue Theme) */}
        <div className="bg-gradient-to-br from-sky-50 to-blue-50/70 dark:from-sky-950/40 dark:to-blue-950/20 p-2 rounded-xl border-2 border-sky-300 dark:border-sky-700/80 text-center shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[9px] uppercase font-bold tracking-wider text-sky-800 dark:text-sky-300">
            <Droplet className="w-2.5 h-2.5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="truncate">Rainfall</span>
          </div>
          <div className="text-xs sm:text-sm font-black text-sky-950 dark:text-sky-100 mt-0.5 truncate">
            {rainfall !== null && rainfall !== undefined ? `${rainfall}mm` : '—'}
          </div>
          <div className="text-[8px] font-bold text-sky-700 dark:text-sky-400 mt-0.5 truncate">
            {rainfall && rainfall < 500 ? 'Water-Limited' : 'NASA POWER'}
          </div>
        </div>

        {/* BOX 3: Target Crop (Agro Emerald Green Theme) */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/70 dark:from-emerald-950/40 dark:to-teal-950/20 p-2 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 text-center shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[9px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-300">
            <Sprout className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">Target Crop</span>
          </div>
          <div className="text-xs sm:text-sm font-black text-emerald-950 dark:text-emerald-100 capitalize truncate mt-0.5">
            {state.land.crop || 'Cotton'}
          </div>
          <div className="text-[8px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 truncate">
            {state.land.monoculture ? 'Monoculture' : 'Diversified'}
          </div>
        </div>

        {/* BOX 4: GBIF Proxy (Royal Violet / Purple Theme) */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50/70 dark:from-purple-950/40 dark:to-violet-950/20 p-2 rounded-xl border-2 border-purple-300 dark:border-purple-700/80 text-center shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[9px] uppercase font-bold tracking-wider text-purple-800 dark:text-purple-300">
            <Activity className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="truncate">GBIF Proxy</span>
          </div>
          <div className="text-xs sm:text-sm font-black text-purple-950 dark:text-purple-100 mt-0.5 truncate">
            {state.biodiversity.species_occurrence_indicator ? `${state.biodiversity.species_occurrence_indicator}` : '—'}
          </div>
          <div className="text-[8px] font-bold text-purple-700 dark:text-purple-400 mt-0.5 truncate">
            Species Obs
          </div>
        </div>
      </div>

      {/* 3. ZERO-SCROLL 3-TAB SEGMENTED CONTROLLER (Location First!) */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 mb-2 border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('location')}
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'location'
              ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>Location & Map</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Scientific Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calibrate')}
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'calibrate'
              ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Calibrate</span>
        </button>
      </div>

      {/* 4. TAB CONTENTS */}
      {showJson ? (
        <pre className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 overflow-y-auto flex-1">
          {JSON.stringify(state, null, 2)}
        </pre>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* TAB 1: SCIENTIFIC MATRIX */}
          {activeTab === 'matrix' && (
            <div className="space-y-2 overflow-y-auto flex-1 pr-0.5">
              {/* Soil System Card (Warm Amber Tinted Card) */}
              <div className="bg-amber-50/40 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800/60 rounded-xl p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-200">
                  <span className="flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Soil System (ISRIC SoilGrids Grounding)
                  </span>
                  <span className="text-[9px] text-amber-700 dark:text-amber-300 uppercase font-mono">0-30cm Depth</span>
                </div>

                {/* SOC Threshold Band Bar */}
                {soc !== null && soc !== undefined && (
                  <div className="bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800/80">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">SOC Threshold:</span>
                      <span className={`font-bold ${soc < 0.75 ? 'text-red-600 dark:text-red-400' : soc < 1.2 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {soc < 0.75 ? 'Severe Deficit (<0.75%)' : soc < 1.2 ? 'Sub-optimal (0.75-1.2%)' : 'Optimal (>1.2%)'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          soc < 0.75 ? 'bg-red-500' : soc < 1.2 ? 'bg-amber-400' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (soc / 2.0) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-amber-200/80 dark:border-amber-900/60 text-center">
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">Moisture</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                      {state.soil.moisture || 'low'}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-amber-200/80 dark:border-amber-900/60 text-center">
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">Soil pH</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {state.soil.ph !== null ? state.soil.ph : '7.2'}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-amber-200/80 dark:border-amber-900/60 text-center">
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">Texture</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 capitalize truncate">
                      {state.soil.texture || 'clay loam'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Climate Hydrology Card (Sky Blue Tinted Card) */}
              <div className="bg-sky-50/40 dark:bg-sky-950/20 border-2 border-sky-200 dark:border-sky-800/60 rounded-xl p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-sky-900 dark:text-sky-200">
                  <span className="flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    Climate Hydrology (NASA POWER Grounding)
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-200 font-bold">
                    {rainfall && rainfall < 500 ? 'Dryland Zone' : 'Adequate'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-sky-200/80 dark:border-sky-900/60 text-center">
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">Annual Precipitation</div>
                    <div className="font-bold text-sky-700 dark:text-sky-300">
                      {rainfall !== null && rainfall !== undefined ? `${rainfall} mm` : '520 mm'}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-sky-200/80 dark:border-sky-900/60 text-center">
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">Seasonality Regime</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 capitalize truncate">
                      {state.climate.seasonality || 'semi-arid'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Land Use & Biodiversity Card (Emerald / Purple Tinted Card) */}
              <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-800/60 rounded-xl p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 dark:text-emerald-200">
                  <span className="flex items-center gap-1">
                    <Trees className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Land Use & Biodiversity Matrix
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold border border-purple-300 dark:border-purple-800">
                    GBIF Proxy
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-emerald-200/80 dark:border-emerald-900/60">
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">Target Crop</div>
                    <div className="font-bold text-emerald-700 dark:text-emerald-300 capitalize truncate">
                      {state.land.crop || 'Cotton'}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-emerald-200/80 dark:border-emerald-900/60">
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">Cropping System</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {state.land.monoculture ? (
                        <span className="text-amber-600 dark:text-amber-400">Monoculture</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">Diversified</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-emerald-200/80 dark:border-emerald-900/60">
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">GBIF Proxy Observations</div>
                    <div className="font-bold text-purple-700 dark:text-purple-300">
                      {state.biodiversity.species_occurrence_indicator ?? 48} records
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-emerald-200/80 dark:border-emerald-900/60">
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">Pesticide Pressure</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                      {state.human_impact.pesticide_pressure || 'high'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('location')}
                  className="flex-1 text-[11px] py-1.5 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/80 dark:hover:bg-cyan-900 border border-cyan-300 dark:border-cyan-800 text-cyan-800 dark:text-cyan-200 rounded-lg transition font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3 h-3 text-cyan-600" />
                  View Map / Change Location
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('calibrate')}
                  className="flex-1 text-[11px] py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/80 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 rounded-lg transition font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sliders className="w-3 h-3 text-amber-600" />
                  Adjust Sliders
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LOCATION & MAP (EXPANSIVE MAP CANVAS, NO PRESET CLUTTER) */}
          {activeTab === 'location' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <InteractiveMap
                latitude={selectedLat}
                longitude={selectedLng}
                onSelectCoordinates={(newLat, newLng) => {
                  setSelectedLat(newLat);
                  setSelectedLng(newLng);
                }}
                onLocateAndAnalyze={handleLocateAndAnalyze}
                isLoading={geoLoading}
                regionName={state.location.region}
                targetCrop={sliderCrop}
                onCropChange={(c) => setSliderCrop(c)}
              />
            </div>
          )}

          {/* TAB 3: CALIBRATE SLIDERS */}
          {activeTab === 'calibrate' && (
            <div className="bg-slate-50/90 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-3 overflow-y-auto flex-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Sliders className="w-3.5 h-3.5 text-amber-500" />
                Agronomic Lab Calibration (Sliders)
              </div>

              {/* SOC Slider */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Soil Organic Carbon (SOC):</span>
                  <span className={`font-mono font-bold ${sliderSoc < 0.75 ? 'text-red-600 dark:text-red-400' : sliderSoc < 1.2 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {sliderSoc.toFixed(2)}% ({sliderSoc < 0.75 ? 'Critical' : sliderSoc < 1.2 ? 'Sub-optimal' : 'Optimal'})
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.5"
                  step="0.05"
                  value={sliderSoc}
                  onChange={(e) => setSliderSoc(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 dark:accent-emerald-400 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-0.5 font-mono">
                  <span>0.1% (Severe)</span>
                  <span>0.75% (Threshold)</span>
                  <span>1.2%+ (Healthy)</span>
                </div>
              </div>

              {/* Rainfall Slider */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Annual Precipitation:</span>
                  <span className={`font-mono font-bold ${sliderRain < 500 ? 'text-amber-600 dark:text-amber-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
                    {sliderRain} mm ({sliderRain < 500 ? 'Dryland' : 'Adequate'})
                  </span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="1400"
                  step="25"
                  value={sliderRain}
                  onChange={(e) => setSliderRain(parseInt(e.target.value))}
                  className="w-full accent-cyan-600 dark:accent-cyan-400 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-0.5 font-mono">
                  <span>150mm</span>
                  <span>500mm (Aridity Line)</span>
                  <span>1400mm</span>
                </div>
              </div>

              {/* Primary Crop Selection */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Primary Crop:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                    {sliderCrop}
                  </span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {['cotton', 'banana', 'wheat', 'grapes', 'maize', 'soybean', 'sugarcane'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSliderCrop(c)}
                      className={`text-[10px] px-2 py-0.5 rounded border capitalize transition cursor-pointer ${
                        sliderCrop.toLowerCase() === c
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monoculture Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Cropping Regimen:</span>
                <button
                  type="button"
                  onClick={() => setSliderMonoculture(!sliderMonoculture)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition cursor-pointer ${
                    sliderMonoculture
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  }`}
                >
                  {sliderMonoculture ? '🌾 Monoculture' : '🌿 Diversified'}
                </button>
              </div>

              {/* Apply Button */}
              <button
                type="button"
                onClick={handleApplyCalibration}
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Apply Lab Calibration & Re-Analyze
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

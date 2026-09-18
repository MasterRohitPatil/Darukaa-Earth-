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
  RefreshCw,
  Sliders,
  Sparkles,
  BarChart3,
  ChevronDown,
  ChevronUp
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
  const [activeTab, setActiveTab] = useState<'matrix' | 'location' | 'calibrate'>('matrix');
  const [showJson, setShowJson] = useState(false);
  const [showManualCoords, setShowManualCoords] = useState(false);
  
  const [lat, setLat] = useState(state.location.latitude?.toString() || '19.99');
  const [lng, setLng] = useState(state.location.longitude?.toString() || '73.78');

  const [sliderSoc, setSliderSoc] = useState<number>(state.soil.organic_carbon_percent ?? 0.35);
  const [sliderRain, setSliderRain] = useState<number>(state.climate.rainfall ?? 450);
  const [sliderMonoculture, setSliderMonoculture] = useState<boolean>(state.land.monoculture ?? true);
  const [sliderCrop, setSliderCrop] = useState<string>(state.land.crop || 'cotton');

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
    if (state.location.latitude) {
      setLat(state.location.latitude.toString());
    }
    if (state.location.longitude) {
      setLng(state.location.longitude.toString());
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

  const handleManualGeoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      onEnrichGeo(latNum, lngNum, sliderCrop);
      setActiveTab('matrix');
    }
  };

  const handleLocateAndAnalyze = (targetLat: number, targetLng: number, targetCrop: string) => {
    setLat(targetLat.toString());
    setLng(targetLng.toString());
    setSliderCrop(targetCrop);
    onEnrichGeo(targetLat, targetLng, targetCrop);
    setActiveTab('matrix');
  };

  const soc = state.soil.organic_carbon_percent;
  const rainfall = state.climate.rainfall;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col h-full shadow-xs transition-colors overflow-hidden">
      
      {/* 1. Header & Data Completeness */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 m-0 leading-tight">
              Environmental State
            </h2>
            <div className="text-[10px] text-slate-400 font-medium truncate max-w-[180px]">
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

      {/* 2. PERSISTENT 4-KPI GLANCEABLE BAR (Always visible above the fold!) */}
      <div className="grid grid-cols-4 gap-1.5 my-2.5">
        {/* SOC Tile */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
          <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Soil Carbon</div>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${soc !== null && soc !== undefined ? (soc < 0.75 ? 'bg-red-500' : 'bg-emerald-500') : 'bg-slate-400'}`}></span>
            {soc !== null && soc !== undefined ? `${soc}%` : '—'}
          </div>
        </div>

        {/* Rainfall Tile */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
          <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Rainfall</div>
          <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
            {rainfall !== null && rainfall !== undefined ? `${rainfall}mm` : '—'}
          </div>
        </div>

        {/* Target Crop Tile */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
          <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Target Crop</div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 capitalize truncate mt-0.5">
            {state.land.crop || 'Cotton'}
          </div>
        </div>

        {/* Biodiversity Tile */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
          <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">GBIF Proxy</div>
          <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
            {state.biodiversity.species_occurrence_indicator ? `${state.biodiversity.species_occurrence_indicator} obs` : '—'}
          </div>
        </div>
      </div>

      {/* 3. ZERO-SCROLL 3-TAB SEGMENTED CONTROLLER */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 mb-2.5 border border-slate-200 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Scientific Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('location')}
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'location'
              ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Location & Crop</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calibrate')}
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'calibrate'
              ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Calibrate</span>
        </button>
      </div>

      {/* 4. TAB CONTENTS (Optimized to avoid vertical scrolling) */}
      {showJson ? (
        <pre className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 overflow-y-auto flex-1">
          {JSON.stringify(state, null, 2)}
        </pre>
      ) : (
        <div className="flex-1 overflow-y-auto pr-0.5">
          {/* TAB 1: SCIENTIFIC MATRIX (COMPACT, GLANCEABLE) */}
          {activeTab === 'matrix' && (
            <div className="space-y-2">
              {/* Soil System Card */}
              <div className="bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Soil System (ISRIC SoilGrids Grounding)
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-mono">0-30cm Depth</span>
                </div>

                {/* SOC Threshold Band Bar */}
                {soc !== null && soc !== undefined && (
                  <div className="bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 dark:text-slate-400">SOC Status:</span>
                      <span className={`font-semibold ${soc < 0.75 ? 'text-red-600 dark:text-red-400' : soc < 1.2 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
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
                  <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                    <div className="text-[9px] text-slate-400">Moisture</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                      {state.soil.moisture || 'low'}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                    <div className="text-[9px] text-slate-400">pH Level</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {state.soil.ph !== null ? state.soil.ph : '7.2'}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                    <div className="text-[9px] text-slate-400">Texture</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 capitalize truncate">
                      {state.soil.texture || 'clay loam'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Climate Hydrology Card */}
              <div className="bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Climate Hydrology (NASA POWER Grounding)
                  </span>
                  <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold">
                    {rainfall && rainfall < 500 ? 'Water-Limited' : 'Adequate'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                    <div className="text-[9px] text-slate-400">Annual Rainfall</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {rainfall !== null && rainfall !== undefined ? `${rainfall} mm` : '520 mm'}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                    <div className="text-[9px] text-slate-400">Seasonality / Zone</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 capitalize truncate">
                      {state.climate.seasonality || 'semi-arid'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Land Use & Biodiversity Card */}
              <div className="bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Trees className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Land Use & Biodiversity Matrix
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-medium">
                    GBIF Proxy
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="text-[9px] text-slate-400">Primary Crop</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 capitalize truncate">
                      {state.land.crop || 'Cotton'}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="text-[9px] text-slate-400">Cropping Regimen</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {state.land.monoculture ? (
                        <span className="text-amber-600 dark:text-amber-400">Single Monoculture</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">Diversified</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="text-[9px] text-slate-400">GBIF Proxy Records</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {state.biodiversity.species_occurrence_indicator ?? 48} observations
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="text-[9px] text-slate-400">Pesticide Pressure</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                      {state.human_impact.pesticide_pressure || 'high'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick action buttons to edit location or calibrate */}
              <div className="flex gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('location')}
                  className="flex-1 text-[11px] py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3 h-3 text-cyan-500" />
                  Change Location or Crop
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('calibrate')}
                  className="flex-1 text-[11px] py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sliders className="w-3 h-3 text-amber-500" />
                  Adjust Sliders
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LOCATION & CROP SETUP (UNIFIED WORKFLOW) */}
          {activeTab === 'location' && (
            <div className="space-y-2.5">
              <InteractiveMap
                latitude={state.location.latitude}
                longitude={state.location.longitude}
                onSelectCoordinates={(newLat, newLng) => {
                  setLat(newLat.toString());
                  setLng(newLng.toString());
                }}
                onLocateAndAnalyze={handleLocateAndAnalyze}
                isLoading={geoLoading}
                regionName={state.location.region}
                targetCrop={sliderCrop}
                onCropChange={(c) => setSliderCrop(c)}
              />

              {/* Manual Coordinates Toggle (Secondary) */}
              <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowManualCoords(!showManualCoords)}
                  className="w-full text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-between cursor-pointer py-1"
                >
                  <span>Manual Latitude / Longitude Input</span>
                  {showManualCoords ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showManualCoords && (
                  <form onSubmit={handleManualGeoSubmit} className="grid grid-cols-2 gap-2 mt-1.5">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5 font-medium">Latitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5 font-medium">Longitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <button
                        type="submit"
                        disabled={geoLoading}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${geoLoading ? 'animate-spin' : ''}`} />
                        {geoLoading ? 'Enriching...' : 'Enrich Coordinates'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CALIBRATE SLIDERS */}
          {activeTab === 'calibrate' && (
            <div className="bg-slate-50/90 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-3">
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

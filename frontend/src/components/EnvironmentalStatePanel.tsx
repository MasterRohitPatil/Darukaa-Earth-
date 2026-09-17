import React, { useState, useEffect } from 'react';
import type { EnvironmentalState } from '../types';
import { InteractiveMap } from './InteractiveMap';
import { 
  Compass, 
  Layers, 
  CloudRain, 
  Trees, 
  AlertTriangle, 
  Code, 
  MapPin, 
  RefreshCw,
  HelpCircle,
  Map as MapIcon,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles
} from 'lucide-react';

interface Props {
  state: EnvironmentalState;
  completenessScore: number;
  onEnrichGeo: (lat: number, lng: number) => void;
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
  const [showJson, setShowJson] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [showCalibration, setShowCalibration] = useState(false);
  const [lat, setLat] = useState(state.location.latitude?.toString() || '19.99');
  const [lng, setLng] = useState(state.location.longitude?.toString() || '73.78');

  const [sliderSoc, setSliderSoc] = useState<number>(state.soil.organic_carbon_percent ?? 0.35);
  const [sliderRain, setSliderRain] = useState<number>(state.climate.rainfall ?? 450);
  const [sliderMonoculture, setSliderMonoculture] = useState<boolean>(state.land.monoculture ?? true);

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
  }, [state]);

  const handleApplyCalibration = () => {
    const updatedState = {
      ...state,
      soil: { ...state.soil, organic_carbon_percent: sliderSoc },
      climate: { ...state.climate, rainfall: sliderRain },
      land: { ...state.land, monoculture: sliderMonoculture }
    };
    onQuickPreset({
      name: `Calibrated Parcel (${sliderSoc}% SOC, ${sliderRain}mm Rain, ${sliderMonoculture ? 'Monoculture' : 'Polyculture'})`,
      ...updatedState
    });
  };

  const handleGeoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      onEnrichGeo(latNum, lngNum);
    }
  };

  const missingVariables = [];
  if (state.soil.organic_carbon_percent === null && state.soil.moisture === null) {
    missingVariables.push('Soil Health (Carbon % / Moisture)');
  }
  if (state.climate.rainfall === null && state.climate.seasonality === null) {
    missingVariables.push('Hydrology (Annual Rainfall / Seasonality)');
  }
  if (state.land.land_use === null && state.land.crop === null) {
    missingVariables.push('Land Use / Target Crop');
  }
  if (state.land.monoculture === null && state.land.habitat_diversity === null) {
    missingVariables.push('Crop Diversity / Field Margins');
  }

  const soc = state.soil.organic_carbon_percent;
  const rainfall = state.climate.rainfall;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col h-full overflow-y-auto shadow-xs transition-colors">
      {/* Panel Title & Completeness Meter */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200 m-0">
            Environmental State
          </h2>
        </div>
        <button
          onClick={() => setShowJson(!showJson)}
          className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2 py-1 rounded cursor-pointer transition"
          title="Toggle Raw JSON View"
        >
          <Code className="w-3 h-3" />
          {showJson ? 'Dashboard' : 'JSON'}
        </button>
      </div>

      {/* Completeness Meter */}
      <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
            Data Completeness
            <span title="Ratio of critical variables known for multi-metric reasoning">
              <HelpCircle className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            </span>
          </span>
          <span className={`font-mono font-semibold ${completenessScore >= 0.6 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {Math.round(completenessScore * 100)}%
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              completenessScore >= 0.6 ? 'bg-gradient-to-r from-emerald-600 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-yellow-400'
            }`}
            style={{ width: `${Math.max(5, completenessScore * 100)}%` }}
          />
        </div>

        {missingVariables.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/60">
            <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 font-medium mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Missing Critical Variables:
            </div>
            <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5 pl-5 list-disc m-0">
              {missingVariables.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showJson ? (
        <pre className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 overflow-x-auto flex-1">
          {JSON.stringify(state, null, 2)}
        </pre>
      ) : (
        <div className="space-y-3.5 flex-1">
          {/* Interactive Agronomic Calibration (Sliders for Real-World Lab Values) */}
          <div className="bg-slate-50/90 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Calibrate Soil & Climate Values
              </span>
              <button
                type="button"
                onClick={() => setShowCalibration(!showCalibration)}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                {showCalibration ? 'Collapse' : 'Adjust Sliders'}
                {showCalibration ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {showCalibration && (
              <div className="space-y-3 pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
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
                    {sliderMonoculture ? '🌾 Single Crop Monoculture' : '🌿 Diversified Polyculture'}
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

          {/* Interactive Geospatial Map & Coordinates */}
          <div className="bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-1.5 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Geospatial Context
              </span>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="text-[11px] text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                <MapIcon className="w-3 h-3" />
                {showMap ? 'Hide Map' : 'Show Map'}
                {showMap ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Region Label */}
            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mb-2 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Identified Region:</span>
              <span className="text-cyan-700 dark:text-cyan-300 font-semibold truncate max-w-[180px]">
                {state.location.region || 'Unspecified'}
              </span>
            </div>

            {/* Collapsible Leaflet Map */}
            {showMap && (
              <div className="mb-2.5">
                <InteractiveMap
                  latitude={state.location.latitude}
                  longitude={state.location.longitude}
                  onSelectCoordinates={(newLat, newLng) => {
                    setLat(newLat.toString());
                    setLng(newLng.toString());
                    onEnrichGeo(newLat, newLng);
                  }}
                  isLoading={geoLoading}
                />
              </div>
            )}

            {/* Manual Lat/Lng Form */}
            <form onSubmit={handleGeoSubmit} className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5 font-medium">Latitude</label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="19.99"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5 font-medium">Longitude</label>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="73.78"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div className="col-span-2 mt-1">
                <button
                  type="submit"
                  disabled={geoLoading}
                  className="w-full bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/80 dark:hover:bg-cyan-900 border border-cyan-300 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${geoLoading ? 'animate-spin' : ''}`} />
                  {geoLoading ? 'Enriching via SoilGrids/NASA POWER...' : 'Enrich Coordinates'}
                </button>
              </div>
            </form>
          </div>

          {/* Soil System Card & Biophysical Gauge */}
          <div className="bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Soil System (ISRIC Grounding)
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-mono">0-30cm Depth</span>
            </div>

            {/* Biophysical Threshold Meter for SOC */}
            {soc !== null && soc !== undefined && (
              <div className="bg-white dark:bg-slate-900/90 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">SOC Threshold Band:</span>
                  <span className={`font-semibold ${soc < 0.75 ? 'text-red-600 dark:text-red-400' : soc < 1.2 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {soc < 0.75 ? 'Severe Deficit (<0.75%)' : soc < 1.2 ? 'Sub-optimal (0.75-1.2%)' : 'Optimal Regenerative (>1.2%)'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      soc < 0.75 ? 'bg-red-500' : soc < 1.2 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (soc / 2.0) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Organic Carbon (SOC)</div>
                <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1 mt-0.5">
                  {soc !== null && soc !== undefined ? (
                    <>
                      <span>{soc}%</span>
                      <span className={`text-[10px] px-1 py-0.2 rounded font-medium ${soc < 0.6 ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'}`}>
                        {soc < 0.6 ? 'Critical' : 'Healthy'}
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400 italic">Not set</span>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Soil Moisture</div>
                <div className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5 capitalize">
                  {state.soil.moisture || <span className="text-slate-400 italic">Not set</span>}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Soil pH</div>
                <div className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                  {state.soil.ph !== null ? state.soil.ph : <span className="text-slate-400 italic">Not set</span>}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Texture</div>
                <div className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5 capitalize truncate">
                  {state.soil.texture || <span className="text-slate-400 italic">Not set</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Climate & Hydrology Card */}
          <div className="bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <CloudRain className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Climate Hydrology (NASA POWER Grounding)
            </div>

            {/* Rainfall Regime Meter */}
            {rainfall !== null && rainfall !== undefined && (
              <div className="bg-white dark:bg-slate-900/90 p-2 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Precipitation Regime:</span>
                  <span className={`font-semibold ${rainfall < 500 ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-cyan-400'}`}>
                    {rainfall < 500 ? 'Dryland / Water-Limited' : 'Adequate Precipitation'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, (rainfall / 1000) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Annual Rainfall</div>
                <div className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                  {rainfall !== null && rainfall !== undefined ? (
                    `${rainfall} mm`
                  ) : (
                    <span className="text-slate-400 italic">Not set</span>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Seasonality / Zone</div>
                <div className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5 capitalize truncate">
                  {state.climate.seasonality || <span className="text-slate-400 italic">Not set</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Land Use & Biodiversity Card */}
          <div className="bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <Trees className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Land Use & Biodiversity Matrix
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Primary Crop</div>
                <div className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5 capitalize">
                  {state.land.crop || state.land.land_use || <span className="text-slate-400 italic">Not set</span>}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Monoculture System</div>
                <div className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                  {state.land.monoculture !== null ? (
                    state.land.monoculture ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">Yes (Single crop)</span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">No (Diversified)</span>
                    )
                  ) : (
                    <span className="text-slate-400 italic">Not set</span>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">GBIF Occurrence Proxy</div>
                <div className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                  {state.biodiversity.species_occurrence_indicator !== null ? (
                    `${state.biodiversity.species_occurrence_indicator} records`
                  ) : (
                    <span className="text-slate-400 italic">Not set</span>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Pesticide Pressure</div>
                <div className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5 capitalize">
                  {state.human_impact.pesticide_pressure || <span className="text-slate-400 italic">Not set</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

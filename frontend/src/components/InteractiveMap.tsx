import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Navigation, Expand, Search, MapPin, Sparkles } from 'lucide-react';
import { WideMapModal } from './WideMapModal';
import { api } from '../services/api';

interface Props {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  onSelectCoordinates: (lat: number, lng: number) => void;
  onLocateAndAnalyze?: (lat: number, lng: number, crop: string) => void;
  isLoading: boolean;
  regionName?: string | null;
  targetCrop?: string;
  onCropChange?: (crop: string) => void;
}

const COMMON_CROPS = ['cotton', 'banana', 'wheat', 'grapes', 'maize', 'soybean', 'sugarcane'];

export const InteractiveMap: React.FC<Props> = ({
  latitude,
  longitude,
  onSelectCoordinates,
  onLocateAndAnalyze,
  isLoading,
  regionName,
  targetCrop = 'cotton',
  onCropChange
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isWideModalOpen, setIsWideModalOpen] = useState(false);

  // Indian PIN code search state
  const [pincodeQuery, setPincodeQuery] = useState('');
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [pincodeSearching, setPincodeSearching] = useState(false);
  const [resolvedPlace, setResolvedPlace] = useState<string | null>(null);

  // Selected crop state
  const [crop, setCrop] = useState<string>(targetCrop);
  const [isCustomCrop, setIsCustomCrop] = useState(false);

  useEffect(() => {
    if (targetCrop) {
      setCrop(targetCrop);
      if (!COMMON_CROPS.includes(targetCrop.toLowerCase())) {
        setIsCustomCrop(true);
      }
    }
  }, [targetCrop]);

  const handleCropSelect = (c: string) => {
    setCrop(c);
    setIsCustomCrop(false);
    if (onCropChange) onCropChange(c);
  };

  const currentLat = latitude ?? 19.99;
  const currentLng = longitude ?? 73.78;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map centered on India
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 6,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB &copy; OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      // Custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="
          background: #10b981;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid #ffffff;
          box-shadow: 0 0 10px #10b981;
          animation: pulse 2s infinite;
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([currentLat, currentLng], { icon: customIcon }).addTo(map);
      markerRef.current = marker;

      // Handle map clicks
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setResolvedPlace(null);
        onSelectCoordinates(Number(lat.toFixed(4)), Number(lng.toFixed(4)));
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker & view when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([currentLat, currentLng]);
      mapInstanceRef.current.setView([currentLat, currentLng], mapInstanceRef.current.getZoom(), {
        animate: true
      });
    }
  }, [currentLat, currentLng]);

  const handlePincodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeQuery.trim()) return;
    setPincodeSearching(true);
    setPincodeError(null);
    try {
      const res = await api.lookupPincode(pincodeQuery.trim());
      setResolvedPlace(res.display_name || res.region);
      onSelectCoordinates(res.latitude, res.longitude);
      if (mapInstanceRef.current && markerRef.current) {
        markerRef.current.setLatLng([res.latitude, res.longitude]);
        mapInstanceRef.current.setView([res.latitude, res.longitude], 8, { animate: true });
      }
    } catch (err: any) {
      setPincodeError(err.message || 'Location not found');
    } finally {
      setPincodeSearching(false);
    }
  };

  const handleAnalyzeSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let targetLat = currentLat;
    let targetLng = currentLng;

    // If pincode was entered and not yet resolved, resolve it first
    if (pincodeQuery.trim() && (!resolvedPlace || !resolvedPlace.includes(pincodeQuery.trim()))) {
      setPincodeSearching(true);
      setPincodeError(null);
      try {
        const res = await api.lookupPincode(pincodeQuery.trim());
        setResolvedPlace(res.display_name || res.region);
        targetLat = res.latitude;
        targetLng = res.longitude;
        onSelectCoordinates(res.latitude, res.longitude);
      } catch (err: any) {
        setPincodeError(err.message || 'Location not found');
        setPincodeSearching(false);
        return;
      } finally {
        setPincodeSearching(false);
      }
    }

    if (onLocateAndAnalyze) {
      onLocateAndAnalyze(targetLat, targetLng, crop);
    } else {
      onSelectCoordinates(targetLat, targetLng);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-2">
      {/* 1. Compact Unified Search Bar (PIN/City + Find Pin) */}
      <form onSubmit={handlePincodeSubmit} className="space-y-1">
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={pincodeQuery}
              onChange={(e) => setPincodeQuery(e.target.value)}
              placeholder="Enter 6-digit Indian PIN (e.g. 425401) or City..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg pl-7 pr-2.5 py-1.5 focus:outline-none focus:border-cyan-500 placeholder:text-slate-400 font-medium"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" />
          </div>
          <button
            type="submit"
            disabled={pincodeSearching || !pincodeQuery.trim()}
            className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 cursor-pointer shrink-0 shadow-2xs"
            title="Locate coordinates on map"
          >
            {pincodeSearching ? 'Locating...' : 'Find Pin'}
          </button>
        </div>

        {pincodeError && (
          <p className="text-[11px] text-red-600 dark:text-red-400 m-0 leading-tight">
            {pincodeError}
          </p>
        )}

        {resolvedPlace && (
          <p className="text-[11px] text-cyan-700 dark:text-cyan-300 m-0 truncate font-semibold flex items-center gap-1">
            <MapPin className="w-3 h-3 text-cyan-500 shrink-0" />
            <span>{resolvedPlace}</span>
          </p>
        )}
      </form>

      {/* 2. Compact Crop & Action Bar (One sleek row without presets clutter) */}
      <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between gap-1 text-[11px]">
          <span className="text-slate-600 dark:text-slate-400 font-semibold shrink-0">Target Crop:</span>
          
          {/* Quick Crop Selector Dropdown + Custom Button */}
          <div className="flex items-center gap-1 flex-1 justify-end">
            <select
              value={isCustomCrop ? 'custom' : crop.toLowerCase()}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setIsCustomCrop(true);
                } else {
                  handleCropSelect(e.target.value);
                }
              }}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-semibold rounded-md px-2 py-1 focus:outline-emerald-500 capitalize cursor-pointer"
            >
              {COMMON_CROPS.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
              <option value="custom">✏️ Other Crop...</option>
            </select>
          </div>
        </div>

        {/* Custom Crop input if selected */}
        {isCustomCrop && (
          <input
            type="text"
            placeholder="Type custom crop (e.g. jowar, bajra, turmeric)..."
            value={crop}
            onChange={(e) => {
              setCrop(e.target.value);
              if (onCropChange) onCropChange(e.target.value);
            }}
            className="w-full text-xs px-2 py-1 rounded-md border border-emerald-400 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
          />
        )}

        {/* Primary Action Button: Locate & Analyze Parcel */}
        <button
          type="button"
          onClick={() => handleAnalyzeSubmit()}
          disabled={isLoading || pincodeSearching}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          {isLoading ? (
            <span>Analyzing Parcel Data...</span>
          ) : (
            <span>Analyze Parcel ({crop})</span>
          )}
        </button>
      </div>

      {/* 3. The Map Canvas — Primary USP with generous height and zero scrolling! */}
      <div className="relative rounded-xl overflow-hidden border-2 border-slate-300 dark:border-slate-700 flex-1 min-h-[260px] shadow-sm">
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Helper overlay tag */}
        <div className="absolute top-2 left-2 z-[400] bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] text-slate-300 border border-slate-700 flex items-center gap-1.5 pointer-events-none shadow-md">
          <Navigation className="w-3 h-3 text-emerald-400 animate-pulse" />
          Click map to pin coordinates
        </div>

        {/* Wide Screen Expansion Button */}
        <button
          type="button"
          onClick={() => setIsWideModalOpen(true)}
          className="absolute top-2 right-2 z-[400] bg-cyan-600 hover:bg-cyan-700 text-white backdrop-blur px-2.5 py-1 rounded-lg text-[10px] border border-cyan-500 flex items-center gap-1 shadow-md cursor-pointer transition font-bold"
          title="Open wide full-screen map modal across your whole screen"
        >
          <Expand className="w-3 h-3" />
          <span>Wide Screen ⛶</span>
        </button>

        {isLoading && (
          <div className="absolute inset-0 z-[500] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center text-xs text-emerald-400 font-semibold gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Fetching SoilGrids & NASA POWER data...
          </div>
        )}
      </div>

      {/* Full-Screen Expansive Wide Map Modal */}
      <WideMapModal
        isOpen={isWideModalOpen}
        onClose={() => setIsWideModalOpen(false)}
        latitude={latitude}
        longitude={longitude}
        onSelectCoordinates={onSelectCoordinates}
        isLoading={isLoading}
        regionName={regionName}
      />
    </div>
  );
};

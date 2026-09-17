import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { X, MapPin, Navigation, Check, Compass } from 'lucide-react';

import { api } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  onSelectCoordinates: (lat: number, lng: number) => void;
  isLoading: boolean;
  regionName?: string | null;
}

const REGIONAL_PRESETS = [
  { name: '🍇 Nashik, Maharashtra (Semi-Arid)', lat: 19.99, lng: 73.78, pin: '422001' },
  { name: '🌾 Ludhiana, Punjab (Alluvial Wheat)', lat: 30.90, lng: 75.85, pin: '141001' },
  { name: '🌱 Warangal, Telangana (Red Soil Dryland)', lat: 17.38, lng: 78.48, pin: '506001' },
];

export const WideMapModal: React.FC<Props> = ({
  isOpen,
  onClose,
  latitude,
  longitude,
  onSelectCoordinates,
  isLoading,
  regionName
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [selectedLat, setSelectedLat] = useState<number>(latitude ?? 19.99);
  const [selectedLng, setSelectedLng] = useState<number>(longitude ?? 73.78);

  // Indian PIN code / district search
  const [pincodeInput, setPincodeInput] = useState<string>('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [resolvedPlaceName, setResolvedPlaceName] = useState<string | null>(null);

  useEffect(() => {
    if (latitude !== null && latitude !== undefined) {
      setSelectedLat(latitude);
    }
    if (longitude !== null && longitude !== undefined) {
      setSelectedLng(longitude);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure DOM modal container has mounted and rendered full width/height
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [selectedLat, selectedLng],
          zoom: 7,
          zoomControl: false
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; CartoDB &copy; OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map);

        const customIcon = L.divIcon({
          className: 'custom-wide-map-pin',
          html: `<div style="
            background: #06b6d4;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            border: 3px solid #ffffff;
            box-shadow: 0 0 15px #06b6d4;
            animation: pulse 2s infinite;
          "></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        });

        const marker = L.marker([selectedLat, selectedLng], { icon: customIcon }).addTo(map);
        markerRef.current = marker;

        map.on('click', (e: L.LeafletMouseEvent) => {
          const latRounded = Number(e.latlng.lat.toFixed(4));
          const lngRounded = Number(e.latlng.lng.toFixed(4));
          setSelectedLat(latRounded);
          setSelectedLng(lngRounded);
          marker.setLatLng([latRounded, lngRounded]);
        });

        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.setView([selectedLat, selectedLng], mapInstanceRef.current.getZoom(), {
          animate: true
        });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  const handlePincodeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeInput.trim()) return;
    setSearchLoading(true);
    setSearchError(null);
    try {
      const res = await api.lookupPincode(pincodeInput.trim());
      setResolvedPlaceName(res.display_name || res.region);
      handleSelectPreset(res.latitude, res.longitude);
    } catch (err: any) {
      setSearchError(err.message || 'Location not found');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectPreset = (lat: number, lng: number) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng], 8, { animate: true });
    }
  };

  const handleConfirm = () => {
    onSelectCoordinates(selectedLat, selectedLng);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 md:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-all animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-700 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 m-0">
                  Full-Screen Geospatial Parcel Selector
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                  India Focus
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 m-0">
                Enter your 6-digit PIN code, city/district, or click anywhere on the map
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isLoading ? 'Enriching...' : 'Select & Enrich Parcel'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: PIN Code Search & Indian Agricultural Presets */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Indian PIN Code / Place Search */}
          <form onSubmit={handlePincodeSearch} className="flex items-center gap-1.5 flex-1 min-w-[280px]">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 shrink-0 flex items-center gap-1">
              🇮🇳 PIN Code / City:
            </span>
            <input
              type="text"
              value={pincodeInput}
              onChange={(e) => setPincodeInput(e.target.value)}
              placeholder="Enter 6-digit Indian PIN (e.g. 422001) or City/District..."
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            />
            <button
              type="submit"
              disabled={searchLoading || !pincodeInput.trim()}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold text-xs transition disabled:opacity-50 cursor-pointer shrink-0"
            >
              {searchLoading ? 'Locating...' : 'Find Location'}
            </button>
          </form>

          {/* Quick Presets (Only 2-3 Indian Locations) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">Presets:</span>
            {REGIONAL_PRESETS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setPincodeInput(p.pin);
                  handleSelectPreset(p.lat, p.lng);
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer text-[11px] border ${
                  Math.abs(selectedLat - p.lat) < 0.05 && Math.abs(selectedLng - p.lng) < 0.05
                    ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-300 border-cyan-400 dark:border-cyan-700 font-bold'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {searchError && (
          <div className="px-4 py-1.5 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-[11px] border-b border-red-200 dark:border-red-800 flex items-center justify-between">
            <span>{searchError}</span>
            <button onClick={() => setSearchError(null)} className="underline font-bold cursor-pointer">Dismiss</button>
          </div>
        )}

        {resolvedPlaceName && (
          <div className="px-4 py-1 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 text-[11px] border-b border-cyan-200 dark:border-cyan-800 flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-cyan-600" />
            <span>Resolved Location: <strong>{resolvedPlaceName}</strong></span>
          </div>
        )}

        {/* Map Canvas (Expansive Width & Height) */}
        <div className="relative flex-1 w-full bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Floating Information Overlay */}
          <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl text-xs text-slate-200 border border-slate-700 shadow-xl flex items-center gap-2 pointer-events-none">
            <Navigation className="w-4 h-4 text-cyan-400 animate-pulse" />
            <div>
              <span className="font-bold text-white block">
                Selected Coordinates: {selectedLat.toFixed(4)}° N, {selectedLng.toFixed(4)}° E
              </span>
              <span className="text-[11px] text-slate-400">
                {regionName ? `Region: ${regionName}` : 'Click any location to reposition pin'}
              </span>
            </div>
          </div>

          {isLoading && (
            <div className="absolute inset-0 z-[500] bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-sm text-cyan-400 font-semibold gap-3">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Enriching coordinates via NASA POWER, SoilGrids, and GBIF...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-500" />
            Global Satellite Grid • DarkMatter CartoDB & OpenStreetMap Tiles
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold cursor-pointer transition shadow-xs flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Confirm Selection
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Navigation, Expand, Search, MapPin } from 'lucide-react';
import { WideMapModal } from './WideMapModal';
import { api } from '../services/api';

interface Props {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  onSelectCoordinates: (lat: number, lng: number) => void;
  isLoading: boolean;
  regionName?: string | null;
}

const REGIONAL_PRESETS = [
  { name: '🍇 Nashik (Semi-Arid)', lat: 19.99, lng: 73.78, pin: '422001' },
  { name: '🌾 Ludhiana (Punjab Wheat)', lat: 30.90, lng: 75.85, pin: '141001' },
  { name: '🌱 Warangal (Telangana Dryland)', lat: 17.38, lng: 78.48, pin: '506001' },
];

export const InteractiveMap: React.FC<Props> = ({
  latitude,
  longitude,
  onSelectCoordinates,
  isLoading,
  regionName
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

  return (
    <div className="space-y-2.5">
      {/* Search Bar for Indian PIN Code or Place Name */}
      <form onSubmit={handlePincodeSubmit} className="space-y-1">
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={pincodeQuery}
              onChange={(e) => setPincodeQuery(e.target.value)}
              placeholder="Enter 6-digit Indian PIN (e.g. 422001) or City..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg pl-7 pr-2.5 py-1.5 focus:outline-none focus:border-cyan-500 placeholder:text-slate-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" />
          </div>
          <button
            type="submit"
            disabled={pincodeSearching || !pincodeQuery.trim()}
            className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 cursor-pointer shrink-0 shadow-2xs"
            title="Locate coordinates using Indian PIN Code"
          >
            {pincodeSearching ? 'Finding...' : 'Locate'}
          </button>
        </div>

        {pincodeError && (
          <p className="text-[11px] text-red-600 dark:text-red-400 m-0 leading-tight">
            {pincodeError}
          </p>
        )}

        {resolvedPlace && (
          <p className="text-[11px] text-cyan-700 dark:text-cyan-300 m-0 truncate font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3 text-cyan-500 shrink-0" />
            <span>{resolvedPlace}</span>
          </p>
        )}
      </form>

      {/* Header: 2-3 Indian Presets & Full-Screen Wide View Button */}
      <div className="flex items-center justify-between gap-1 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Quick Presets:</span>
          {REGIONAL_PRESETS.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setPincodeQuery(preset.pin);
                setResolvedPlace(preset.name);
                onSelectCoordinates(preset.lat, preset.lng);
              }}
              className="text-[10px] bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition cursor-pointer font-medium"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Wide Screen View Button (Only expansion option) */}
        <button
          type="button"
          onClick={() => setIsWideModalOpen(true)}
          className="text-[10px] px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-1 font-bold transition cursor-pointer shadow-xs"
          title="Open wide full-screen map modal across your whole screen"
        >
          <Expand className="w-3 h-3" />
          <span>Wide Screen ⛶</span>
        </button>
      </div>

      {/* Map Canvas (Clean Default Standard Height) */}
      <div className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 h-52">
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Helper overlay tag */}
        <div className="absolute top-2 left-2 z-[400] bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] text-slate-300 border border-slate-700 flex items-center gap-1.5 pointer-events-none shadow-md">
          <Navigation className="w-3 h-3 text-emerald-400 animate-pulse" />
          Click anywhere to select parcel
        </div>

        {/* Wide Screen pill on overlay */}
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

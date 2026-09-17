import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Navigation, Maximize2, Minimize2, Expand } from 'lucide-react';
import { WideMapModal } from './WideMapModal';

interface Props {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  onSelectCoordinates: (lat: number, lng: number) => void;
  isLoading: boolean;
  regionName?: string | null;
}

const REGIONAL_PRESETS = [
  { name: '🍇 Nashik (Semi-Arid)', lat: 19.99, lng: 73.78 },
  { name: '🌾 Punjab (Alluvial)', lat: 30.90, lng: 75.85 },
  { name: '🌱 Telangana (Dryland)', lat: 17.38, lng: 78.48 },
  { name: '🫒 Andalusia (Mediterranean)', lat: 37.88, lng: -3.79 },
];

type MapSize = 'normal' | 'large' | 'xl';

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
  const [mapSize, setMapSize] = useState<MapSize>('normal');
  const [isWideModalOpen, setIsWideModalOpen] = useState(false);

  const currentLat = latitude ?? 19.99;
  const currentLng = longitude ?? 73.78;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map with DarkMatter tiles
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

  // When mapSize changes, smoothly invalidate Leaflet container dimensions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.panTo([currentLat, currentLng], { animate: true });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [mapSize, currentLat, currentLng]);

  return (
    <div className="space-y-2">
      {/* Map Size Controls & Header */}
      <div className="flex items-center justify-between gap-1 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Map Size:</span>
          <div className="flex items-center rounded-lg bg-slate-200 dark:bg-slate-800 p-0.5 border border-slate-300 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setMapSize('normal')}
              className={`text-[10px] px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                mapSize === 'normal'
                  ? 'bg-white dark:bg-slate-900 text-cyan-800 dark:text-cyan-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Default (192px)
            </button>
            <button
              type="button"
              onClick={() => setMapSize('large')}
              className={`text-[10px] px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                mapSize === 'large'
                  ? 'bg-white dark:bg-slate-900 text-cyan-800 dark:text-cyan-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Large (320px)
            </button>
            <button
              type="button"
              onClick={() => setMapSize('xl')}
              className={`text-[10px] px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                mapSize === 'xl'
                  ? 'bg-white dark:bg-slate-900 text-cyan-800 dark:text-cyan-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              XL View (460px)
            </button>
          </div>
        </div>

        {/* Action Buttons: Height Toggle + Wide Screen View */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMapSize(prev => prev === 'normal' ? 'large' : prev === 'large' ? 'xl' : 'normal')}
            className="text-[10px] px-2 py-0.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/70 hover:bg-cyan-100 dark:hover:bg-cyan-900 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 flex items-center gap-1 font-semibold transition cursor-pointer shadow-2xs"
            title="Click to toggle map height (Normal -> Large -> XL)"
          >
            {mapSize === 'normal' ? <Maximize2 className="w-3 h-3 text-cyan-600 dark:text-cyan-400" /> : <Minimize2 className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />}
            <span>{mapSize === 'normal' ? 'Height ↕' : mapSize === 'large' ? 'Height XL ↕' : 'Reset ↕'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsWideModalOpen(true)}
            className="text-[10px] px-2.5 py-0.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-1 font-bold transition cursor-pointer shadow-xs"
            title="Open wide full-screen map modal to inspect and pick parcel boundaries across the entire display"
          >
            <Expand className="w-3 h-3" />
            <span>Wide View ⛶</span>
          </button>
        </div>
      </div>

      {/* Quick Regional Preset Pills */}
      <div className="flex flex-wrap gap-1">
        {REGIONAL_PRESETS.map((preset, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelectCoordinates(preset.lat, preset.lng)}
            className="text-[10px] bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition cursor-pointer font-medium"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Map Canvas */}
      <div
        className={`relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 transition-all duration-300 ${
          mapSize === 'xl' ? 'h-[460px]' : mapSize === 'large' ? 'h-80' : 'h-48'
        }`}
      >
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Helper overlay tag */}
        <div className="absolute top-2 left-2 z-[400] bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] text-slate-300 border border-slate-700 flex items-center gap-1.5 pointer-events-none shadow-md">
          <Navigation className="w-3 h-3 text-emerald-400 animate-pulse" />
          Click anywhere to select & enrich parcel
        </div>

        {/* Overlay Buttons: Height Toggle & Wide View */}
        <div className="absolute top-2 right-2 z-[400] flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMapSize(prev => prev === 'normal' ? 'large' : prev === 'large' ? 'xl' : 'normal')}
            className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 backdrop-blur px-2 py-1 rounded-lg text-[10px] border border-slate-700 flex items-center gap-1 shadow-md cursor-pointer transition font-medium"
            title="Toggle inline map height"
          >
            {mapSize === 'normal' ? <Maximize2 className="w-3 h-3 text-cyan-400" /> : <Minimize2 className="w-3 h-3 text-amber-400" />}
            <span>{mapSize === 'normal' ? 'Height ↕' : 'Reset'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsWideModalOpen(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white backdrop-blur px-2.5 py-1 rounded-lg text-[10px] border border-cyan-500 flex items-center gap-1 shadow-md cursor-pointer transition font-bold"
            title="Open massive wide map modal across your whole screen"
          >
            <Expand className="w-3 h-3" />
            <span>Wide Screen ⛶</span>
          </button>
        </div>

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

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Navigation } from 'lucide-react';

interface Props {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  onSelectCoordinates: (lat: number, lng: number) => void;
  isLoading: boolean;
}

const REGIONAL_PRESETS = [
  { name: '🍇 Nashik (Semi-Arid)', lat: 19.99, lng: 73.78 },
  { name: '🌾 Punjab (Alluvial)', lat: 30.90, lng: 75.85 },
  { name: '🌱 Telangana (Dryland)', lat: 17.38, lng: 78.48 },
  { name: '🫒 Andalusia (Mediterranean)', lat: 37.88, lng: -3.79 },
];

export const InteractiveMap: React.FC<Props> = ({
  latitude,
  longitude,
  onSelectCoordinates,
  isLoading
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

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

  return (
    <div className="space-y-2">
      {/* Quick Regional Preset Pills */}
      <div className="flex flex-wrap gap-1">
        {REGIONAL_PRESETS.map((preset, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelectCoordinates(preset.lat, preset.lng)}
            className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-800 hover:border-slate-700 transition cursor-pointer"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Map Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 h-44">
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Helper overlay tag */}
        <div className="absolute top-2 left-2 z-[400] bg-slate-900/90 backdrop-blur px-2 py-1 rounded text-[10px] text-slate-400 border border-slate-800 flex items-center gap-1 pointer-events-none">
          <Navigation className="w-3 h-3 text-emerald-400" />
          Click anywhere to select coordinates
        </div>

        {isLoading && (
          <div className="absolute inset-0 z-[500] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center text-xs text-emerald-400 font-medium">
            Fetching SoilGrids & NASA POWER...
          </div>
        )}
      </div>
    </div>
  );
};

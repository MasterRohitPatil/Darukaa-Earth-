import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Navigation, Expand, Search, MapPin, Sparkles } from 'lucide-react';
import { WideMapModal } from './WideMapModal';
import { api } from '../services/api';

interface Props {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  onSelectCoordinates: (lat: number, lng: number) => void;
  onLocateAndAnalyze?: (lat: number, lng: number, crop: string, placeName?: string) => void;
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

  // Coordinates inputs
  const currentLat = latitude ?? 19.99;
  const currentLng = longitude ?? 73.78;
  const [latInput, setLatInput] = useState<string>(currentLat.toFixed(4));
  const [lngInput, setLngInput] = useState<string>(currentLng.toFixed(4));

  useEffect(() => {
    if (latitude !== null && latitude !== undefined) {
      setLatInput(latitude.toFixed(4));
    }
  }, [latitude]);

  useEffect(() => {
    if (longitude !== null && longitude !== undefined) {
      setLngInput(longitude.toFixed(4));
    }
  }, [longitude]);

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

  const handleLatChange = (val: string) => {
    setLatInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= -90 && parsed <= 90) {
      onSelectCoordinates(parsed, currentLng);
    }
  };

  const handleLngChange = (val: string) => {
    setLngInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= -180 && parsed <= 180) {
      onSelectCoordinates(currentLat, parsed);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map centered on India
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 7,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Clean OpenStreetMap tiles (no API key required, zero watermarks, reliable worldwide)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="
          background: #10b981;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid #ffffff;
          box-shadow: 0 0 12px #10b981;
          animation: pulse 2s infinite;
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = L.marker([currentLat, currentLng], { icon: customIcon }).addTo(map);
      markerRef.current = marker;

      // Handle map clicks — reactive coordinate update
      map.on('click', (e: L.LeafletMouseEvent) => {
        const newLat = Number(e.latlng.lat.toFixed(4));
        const newLng = Number(e.latlng.lng.toFixed(4));
        setResolvedPlace(null);
        setLatInput(newLat.toString());
        setLngInput(newLng.toString());
        marker.setLatLng([newLat, newLng]);
        onSelectCoordinates(newLat, newLng);
      });

      mapInstanceRef.current = map;

      // Ensure map tiles properly calculate container size after render
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
    }

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
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
      mapInstanceRef.current.invalidateSize();
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
      setLatInput(res.latitude.toFixed(4));
      setLngInput(res.longitude.toFixed(4));
      onSelectCoordinates(res.latitude, res.longitude);
      if (mapInstanceRef.current && markerRef.current) {
        markerRef.current.setLatLng([res.latitude, res.longitude]);
        mapInstanceRef.current.setView([res.latitude, res.longitude], 8, { animate: true });
        mapInstanceRef.current.invalidateSize();
      }
    } catch (err: any) {
      setPincodeError(err.message || 'Location not found');
    } finally {
      setPincodeSearching(false);
    }
  };

  const handleAnalyzeSubmit = (targetCrop?: string) => {
    const cropToUse = targetCrop || crop;
    const latToUse = parseFloat(latInput) || currentLat;
    const lngToUse = parseFloat(lngInput) || currentLng;
    if (onLocateAndAnalyze) {
      onLocateAndAnalyze(latToUse, lngToUse, cropToUse, resolvedPlace || undefined);
    } else {
      onSelectCoordinates(latToUse, lngToUse);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-1.5 min-h-0">
      {/* 1. Sleek Compact Control Toolbar (Row 1: Search + Crop Selector) */}
      <div className="flex items-center gap-1.5 shrink-0">
        <form onSubmit={handlePincodeSubmit} className="flex items-center gap-1 flex-1 min-w-0">
          <div className="relative flex-1">
            <input
              type="text"
              value={pincodeQuery}
              onChange={(e) => setPincodeQuery(e.target.value)}
              placeholder="Enter PIN (e.g. 425401) or City..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg pl-7 pr-2 py-1.5 focus:outline-none focus:border-cyan-500 placeholder:text-slate-400 font-medium"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" />
          </div>
          <button
            type="submit"
            disabled={pincodeSearching || !pincodeQuery.trim()}
            className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 cursor-pointer shrink-0 shadow-2xs"
            title="Locate coordinates on map"
          >
            {pincodeSearching ? '...' : 'Find'}
          </button>
        </form>

        {/* Target Crop Selector */}
        <div className="shrink-0">
          <select
            value={isCustomCrop ? 'custom' : crop.toLowerCase()}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                setIsCustomCrop(true);
              } else {
                handleCropSelect(e.target.value);
              }
            }}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg px-2 py-1.5 focus:outline-emerald-500 capitalize cursor-pointer"
            title="Target Crop"
          >
            {COMMON_CROPS.map((c) => (
              <option key={c} value={c}>
                🌾 {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
            <option value="custom">✏️ Other...</option>
          </select>
        </div>
      </div>

      {/* Custom Crop input if selected */}
      {isCustomCrop && (
        <input
          type="text"
          placeholder="Type crop name (e.g. jowar, bajra, turmeric)..."
          value={crop}
          onChange={(e) => {
            setCrop(e.target.value);
            if (onCropChange) onCropChange(e.target.value);
          }}
          className="w-full text-xs px-2 py-1 rounded-md border border-emerald-400 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-emerald-500 shrink-0"
        />
      )}

      {/* Status messages for search */}
      {pincodeError && (
        <p className="text-[11px] text-red-600 dark:text-red-400 m-0 leading-tight shrink-0">
          {pincodeError}
        </p>
      )}
      {resolvedPlace && (
        <p className="text-[11px] text-cyan-700 dark:text-cyan-300 m-0 truncate font-semibold flex items-center gap-1 shrink-0">
          <MapPin className="w-3 h-3 text-cyan-500 shrink-0" />
          <span>{resolvedPlace}</span>
        </p>
      )}

      {/* 2. Coordinates Display/Edit & Analyze Action Bar (Row 2: Compact single row) */}
      <div className="flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-lg bg-slate-100/90 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs shrink-0">
        <div className="flex items-center gap-1 font-mono text-[11px]">
          <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-medium">Lat:</span>
          <input
            type="number"
            step="0.0001"
            value={latInput}
            onChange={(e) => handleLatChange(e.target.value)}
            className="w-16 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1 py-0.5 text-slate-900 dark:text-slate-100 font-bold text-[11px] focus:outline-none focus:border-cyan-500 text-center"
            title="Click map or edit Latitude"
          />
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-medium ml-1">Lng:</span>
          <input
            type="number"
            step="0.0001"
            value={lngInput}
            onChange={(e) => handleLngChange(e.target.value)}
            className="w-16 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1 py-0.5 text-slate-900 dark:text-slate-100 font-bold text-[11px] focus:outline-none focus:border-cyan-500 text-center"
            title="Click map or edit Longitude"
          />
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={() => handleAnalyzeSubmit()}
          disabled={isLoading || pincodeSearching}
          className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
          title="Analyze this parcel with AI reasoning engine"
        >
          <Sparkles className="w-3 h-3 animate-pulse" />
          <span>{isLoading ? 'Analyzing...' : `Analyze (${crop})`}</span>
        </button>
      </div>

      {/* 3. Hero Map Canvas (Generous 250px height, smoothly scrollable, never cut off) */}
      <div className="relative rounded-xl overflow-hidden border-2 border-slate-300 dark:border-slate-700 h-[250px] w-full shrink-0 shadow-sm">
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Helper overlay tag */}
        <div className="absolute top-2 left-2 z-[400] bg-slate-900/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] text-slate-300 border border-slate-700 flex items-center gap-1.5 pointer-events-none shadow-md">
          <Navigation className="w-3 h-3 text-emerald-400 animate-pulse" />
          Click anywhere to pin coordinates
        </div>

        {/* Wide Screen Expansion Button */}
        <button
          type="button"
          onClick={() => setIsWideModalOpen(true)}
          className="absolute top-2 right-2 z-[400] bg-cyan-600 hover:bg-cyan-700 text-white backdrop-blur px-2 py-1 rounded-lg text-[10px] border border-cyan-500 flex items-center gap-1 shadow-md cursor-pointer transition font-bold"
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
        latitude={currentLat}
        longitude={currentLng}
        onSelectCoordinates={(lat, lng) => {
          setLatInput(lat.toFixed(4));
          setLngInput(lng.toFixed(4));
          onSelectCoordinates(lat, lng);
        }}
        isLoading={isLoading}
        regionName={regionName}
      />
    </div>
  );
};

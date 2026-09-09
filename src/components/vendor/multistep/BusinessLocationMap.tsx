import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Maximize2 } from 'lucide-react';

interface BusinessLocationMapProps {
  city: string;
  lat?: number;
  lng?: number;
  onCoordinatesChange?: (lat: number, lng: number) => void;
}

const CITY_COORDINATES: Record<string, [number, number]> = {
  'san francisco': [37.7749, -122.4194],
  'new york': [40.7128, -74.006],
  austin: [30.2672, -97.7431],
  chicago: [41.8781, -87.6298],
  seattle: [47.6062, -122.3321],
  'los angeles': [34.0522, -118.2437],
  miami: [25.7617, -80.1918],
  boston: [42.3601, -71.0589],
  denver: [39.7392, -104.9903],
};

export const BusinessLocationMap: React.FC<BusinessLocationMapProps> = ({
  city,
  lat = 37.7749,
  lng = -122.4194,
  onCoordinatesChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Auto-resolve city coords if available
  const activeLat =
    city && CITY_COORDINATES[city.toLowerCase().trim()]
      ? CITY_COORDINATES[city.toLowerCase().trim()][0]
      : lat;
  const activeLng =
    city && CITY_COORDINATES[city.toLowerCase().trim()]
      ? CITY_COORDINATES[city.toLowerCase().trim()][1]
      : lng;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [activeLat, activeLng],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // CartoDB Positron / OpenStreetMap lightweight tiles
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 19,
        subdomains: 'abcd',
      }
    ).addTo(map);

    // Custom pulse marker
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
          <span class="absolute w-8 h-8 rounded-full bg-blue-500/25 animate-ping"></span>
          <div class="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-lg border-2 border-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([activeLat, activeLng], { icon: customIcon }).addTo(map);
    markerRef.current = marker;

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      marker.setLatLng([clickLat, clickLng]);
      if (onCoordinatesChange) {
        onCoordinatesChange(clickLat, clickLng);
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [activeLat, activeLng]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([activeLat, activeLng], 12);
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Map Preview</h3>
        <button
          type="button"
          onClick={handleResetView}
          className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          title="Recenter location"
        >
          <MapPin className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Map stage container */}
      <div className="relative w-full h-[220px] sm:h-[240px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Zoom Controls (+ / -) matching Image 1 */}
        <div className="absolute top-3 left-3 z-10 flex flex-col bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-50 font-bold text-sm border-b border-slate-100 cursor-pointer"
            title="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-50 font-bold text-sm cursor-pointer"
            title="Zoom out"
          >
            −
          </button>
        </div>

        {/* Fullscreen icon top right matching Image 1 */}
        <div className="absolute top-3 right-3 z-10 bg-white rounded-lg border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={handleResetView}
            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
            title="Fit to view"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* OpenStreetMap Attribution badge matching Image 1 */}
        <div className="absolute bottom-1 right-2 z-10 bg-white/90 backdrop-blur-xs text-[10px] text-slate-500 px-1.5 py-0.5 rounded shadow-2xs border border-slate-200/60 font-sans pointer-events-none">
          <span className="font-semibold text-blue-600">Leaflet</span> | © OpenStreetMap contributors
        </div>
      </div>

      <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
        Click on the map to set coordinates or select a city to auto-locate.
      </p>
    </div>
  );
};

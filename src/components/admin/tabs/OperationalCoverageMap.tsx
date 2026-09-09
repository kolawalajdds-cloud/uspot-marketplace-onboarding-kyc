import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { OperationalRegion } from '../../../data/configurationData';
import { MapPin, Navigation, Layers, Info } from 'lucide-react';

interface OperationalCoverageMapProps {
  regions: OperationalRegion[];
  coverageType: 'Cities' | 'States' | 'Countries';
  mapStyle: 'Street' | 'Satellite' | 'Terrain' | 'Light';
  onSelectCoordinates?: (lat: number, lng: number) => void;
  isFullscreen?: boolean;
}

export const OperationalCoverageMap: React.FC<OperationalCoverageMapProps> = ({
  regions,
  coverageType,
  mapStyle,
  onSelectCoordinates,
  isFullscreen = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [clickedCoord, setClickedCoord] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent duplicate initialization
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [25, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 18,
      zoomControl: true,
      attributionControl: true,
    });

    mapInstanceRef.current = map;

    // Markers layer group
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    // Click handler for coordinates
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const formattedLat = parseFloat(lat.toFixed(4));
      const formattedLng = parseFloat(lng.toFixed(4));
      setClickedCoord({ lat: formattedLat, lng: formattedLng });

      if (onSelectCoordinates) {
        onSelectCoordinates(formattedLat, formattedLng);
      }
    });

    // ResizeObserver to handle tab changes and window resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when mapStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    let subdomains = 'abc';

    if (mapStyle === 'Light') {
      url = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      subdomains = 'abcd';
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
    } else if (mapStyle === 'Satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    } else if (mapStyle === 'Terrain') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      subdomains = 'abc';
      attribution = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>';
    }

    const newLayer = L.tileLayer(url, {
      attribution,
      subdomains,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [mapStyle]);

  // Update Markers based on regions and coverageType
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    regions.forEach((reg) => {
      // Custom modern HTML pin
      const pinHtml = `
        <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-full cursor-pointer group">
          <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold shadow-lg border border-slate-700 whitespace-nowrap mb-0.5 group-hover:bg-indigo-600 transition-colors">
            <span class="w-1.5 h-1.5 rounded-full ${reg.status === 'Active' ? 'bg-emerald-400' : 'bg-slate-400'}"></span>
            <span>${coverageType === 'Countries' ? reg.country : coverageType === 'States' ? reg.state : reg.city}</span>
          </div>
          <div class="w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-md flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: pinHtml,
        className: 'custom-map-pin',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        popupAnchor: [0, -28],
      });

      const marker = L.marker([reg.lat, reg.lng], { icon: customIcon }).addTo(markersGroup);

      // Rich popup
      const popupHtml = `
        <div class="p-1 text-slate-800 font-sans min-w-[180px]">
          <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-1.5">
            <strong class="text-xs font-black text-slate-900">${reg.city}, ${reg.state}</strong>
            <span class="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
              reg.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
            }">${reg.status}</span>
          </div>
          <p class="text-[11px] text-slate-500 mb-1 font-medium">${reg.country} (${reg.countryCode})</p>
          <p class="text-[10px] text-slate-400 font-mono mb-2">Coords: ${reg.lat.toFixed(4)}, ${reg.lng.toFixed(4)}</p>
          <div class="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span class="text-slate-500">Active Services:</span>
            <strong class="text-indigo-600 font-bold">${reg.serviceCount}</strong>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: false,
        className: 'custom-leaflet-popup',
      });
    });
  }, [regions, coverageType]);

  return (
    <div className={`relative w-full ${isFullscreen ? 'h-[75vh]' : 'h-80'} rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100`}>
      {/* Real Leaflet Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Clicked Coordinates Floating Chip */}
      {clickedCoord && (
        <div className="absolute top-3 right-3 z-1000 bg-white/95 backdrop-blur-xs border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-md text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <MapPin className="w-3.5 h-3.5 text-red-500" />
          <span className="text-slate-600">Selected:</span>
          <span className="font-mono font-bold text-slate-900">
            {clickedCoord.lat}, {clickedCoord.lng}
          </span>
          <button
            onClick={() => setClickedCoord(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-1 text-xs cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Map Helper Badge in Bottom Left */}
      <div className="absolute bottom-2 left-2 z-1000 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] text-slate-600 font-medium shadow-2xs flex items-center gap-1.5">
        <Navigation className="w-3 h-3 text-indigo-600" />
        <span>Click anywhere to inspect coordinates</span>
      </div>
    </div>
  );
};

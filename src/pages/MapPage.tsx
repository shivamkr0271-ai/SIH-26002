import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Layers, AlertTriangle, Truck, Navigation2, Search, Filter } from 'lucide-react';

// Component to handle map centering
function MapCenterer({ lat, lng, zoom }: { lat: number | null, lng: number | null, zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== null && lng !== null) {
      map.setView([lat, lng], zoom);
    }
  }, [lat, lng, zoom, map]);
  return null;
}

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (color: string, iconType: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px ${color};"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const incidentIcon = createCustomIcon('#ef4444', 'alert');
const vehicleIcon = createCustomIcon('#06b6d4', 'truck');
const warningIcon = createCustomIcon('#f59e0b', 'warning');
const reportIcon = createCustomIcon('#a855f7', 'report');

// Helper to generate a consistent pseudo-random coordinate based on string
function getCoordFromString(str: string, isLat: boolean): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const base = isLat ? 26.14 : 91.73;
  const spread = isLat ? 2.5 : 4.0;
  const normalized = (Math.abs(hash) % 1000) / 1000;
  return base + (normalized * spread) - (spread / 2);
}

// Some fake routes
const routeCoordinates: [number, number][] = [
  [26.14, 91.73], // Guwahati
  [25.56, 91.89], // Shillong
  [24.83, 92.77], // Silchar
  [23.72, 92.71], // Aizawl
];

const route2: [number, number][] = [
  [26.14, 91.73], // Guwahati
  [26.75, 94.20], // Jorhat
  [27.47, 94.91], // Dibrugarh
];

export default function MapPage() {
  const { vehicles, incidents, fieldReports } = useData();
  const [searchParams] = useSearchParams();
  const focusLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
  const focusLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
  const focusZoom = searchParams.get('zoom') ? parseInt(searchParams.get('zoom')!) : 9;

  const [layers, setLayers] = useState({
    incidents: true,
    vehicles: true,
    routes: true,
    reports: true,
  });

  const [activeVehicles, setActiveVehicles] = useState(vehicles);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVehicles(prev => prev.map(v => ({
        ...v,
        currentLocation: [
          v.currentLocation[0] + (Math.random() * 0.001 - 0.0005),
          v.currentLocation[1] + (Math.random() * 0.001 - 0.0005)
        ]
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] relative max-w-[1920px] mx-auto">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-wide uppercase">Interactive GIS Map</h1>
          <p className="text-[12px] text-cyan-500/80 uppercase tracking-widest font-bold mt-1">Real-time asset, incident, and route visualization</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-[#0a0c14] hover:bg-gray-200 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200 rounded-md text-sm transition-colors border border-gray-200 dark:border-white/5 shadow-inner">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400" />
            <input 
              type="text" 
              placeholder="Search location..." 
              className="pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#0a0c14] border border-gray-200 dark:border-white/5 rounded-md text-[13px] focus:outline-none focus:border-cyan-500/50 text-gray-800 dark:text-gray-200 w-64 transition-colors shadow-inner font-medium"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0 relative">
        <Card noPadding className="flex-1 relative z-0 border-gray-200 dark:border-white/5 overflow-hidden shadow-2xl bg-gray-50 dark:bg-[#0a0c14] rounded-xl">
          <MapContainer className="z-10" 
            center={[25.5, 92.5]} 
            zoom={7} 
            style={{ height: '100%', width: '100%', background: '#05070a' }}
            zoomControl={false}
          >
            <MapCenterer lat={focusLat} lng={focusLng} zoom={focusZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {layers.routes && (
              <>
                <Polyline positions={routeCoordinates} color="#06b6d4" weight={4} opacity={0.8} dashArray="8, 8" />
                <Polyline positions={route2} color="#f59e0b" weight={4} opacity={0.8} />
              </>
            )}

            {layers.incidents && incidents.map((inc) => (
              <Marker key={inc.id} position={inc.location as [number, number]} icon={inc.severity === 'CRITICAL' ? incidentIcon : warningIcon}>
                <Popup className="custom-popup">
                  <div className="p-2">
                    <div className="flex gap-2 items-center mb-3">
                       <Badge variant={inc.severity === 'CRITICAL' ? 'error' : 'warning'}>{inc.severity}</Badge>
                       <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{inc.type}</span>
                    </div>
                    <h3 className="font-bold text-[13px] mb-2 text-gray-900 dark:text-white">{inc.locationName}</h3>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-3 leading-snug">{inc.predictedImpact}</p>
                    <p className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">AI Confidence: 91%</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {layers.reports && fieldReports.map((report) => (
              <Marker key={report.id} position={[getCoordFromString(report.id, true), getCoordFromString(report.id, false)]} icon={reportIcon}>
                <Popup className="custom-popup">
                  <div className="p-2">
                    <div className="flex gap-2 items-center mb-3">
                       <Badge variant="info">Field Report</Badge>
                       <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{report.incidentType}</span>
                    </div>
                    <h3 className="font-bold text-[13px] mb-2 text-gray-900 dark:text-white">{report.locationName}</h3>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-3 leading-snug">{report.description}</p>
                    <p className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">By: {report.officerName}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {layers.vehicles && activeVehicles.map((veh) => (
              <Marker key={veh.id} position={veh.currentLocation as [number, number]} icon={vehicleIcon}>
                <Popup className="custom-popup">
                  <div className="p-2">
                    <Badge variant="info" className="mb-3 inline-block">{veh.id}</Badge>
                    <h3 className="font-bold text-[13px] mb-2 text-gray-900 dark:text-white">{veh.cargo}</h3>
                    <div className="text-[11px] text-gray-600 dark:text-gray-400 mb-2 font-medium">Route: {veh.origin} → {veh.destination}</div>
                    <div className="text-[11px] text-gray-600 dark:text-gray-400 mb-3 font-medium">Status: <span className="font-bold text-emerald-600 dark:text-emerald-400">{veh.status}</span></div>
                    <div className="w-full bg-white dark:bg-[#05070a] border border-gray-300 dark:border-white/10 h-2 rounded-full overflow-hidden">
                       <div className="bg-emerald-500 h-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${veh.progress}%` }}></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] pointer-events-none z-10" />

          {/* Floating Controls */}
          <div className="absolute top-6 right-6 z-[400] flex flex-col gap-4">
            <Card className="!p-4 bg-gray-50 dark:bg-[#0a0c14]/90 backdrop-blur-md shadow-2xl border-gray-300 dark:border-white/10 w-56 rounded-lg">
              <h3 className="text-[10px] font-bold uppercase text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-2 tracking-[0.2em]">
                <Layers className="w-4 h-4" /> Map Layers
              </h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setLayers(prev => ({ ...prev, incidents: !prev.incidents }))}>
                  <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${layers.incidents ? 'bg-red-500/20 border-red-500' : 'border-gray-300 dark:border-white/20 group-hover:border-gray-400 dark:border-white/40'}`}>
                    {layers.incidents && <div className="w-2 h-2 bg-red-500 rounded-sm shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div>}
                  </div>
                  <span className="text-[12px] font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:text-white transition-colors">Critical Incidents</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setLayers(prev => ({ ...prev, vehicles: !prev.vehicles }))}>
                  <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${layers.vehicles ? 'bg-cyan-500/20 border-cyan-500' : 'border-gray-300 dark:border-white/20 group-hover:border-gray-400 dark:border-white/40'}`}>
                    {layers.vehicles && <div className="w-2 h-2 bg-cyan-500 rounded-sm shadow-[0_0_5px_rgba(6,182,212,0.8)]"></div>}
                  </div>
                  <span className="text-[12px] font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:text-white transition-colors">Active Fleet</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setLayers(prev => ({ ...prev, routes: !prev.routes }))}>
                  <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${layers.routes ? 'bg-emerald-500/20 border-emerald-500' : 'border-gray-300 dark:border-white/20 group-hover:border-gray-400 dark:border-white/40'}`}>
                    {layers.routes && <div className="w-2 h-2 bg-emerald-500 rounded-sm shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>}
                  </div>
                  <span className="text-[12px] font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:text-white transition-colors">Logistics Routes</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setLayers(prev => ({ ...prev, reports: !prev.reports }))}>
                  <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${layers.reports ? 'bg-purple-500/20 border-purple-500' : 'border-gray-300 dark:border-white/20 group-hover:border-gray-400 dark:border-white/40'}`}>
                    {layers.reports && <div className="w-2 h-2 bg-purple-500 rounded-sm shadow-[0_0_5px_rgba(168,85,247,0.8)]"></div>}
                  </div>
                  <span className="text-[12px] font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:text-white transition-colors">Field Reports</span>
                </label>
              </div>
            </Card>

            <Card className="!p-4 bg-gray-50 dark:bg-[#0a0c14]/90 backdrop-blur-md shadow-2xl border-gray-300 dark:border-white/10 w-56 rounded-lg">
              <h3 className="text-[10px] font-bold uppercase text-gray-600 dark:text-gray-400 mb-4 tracking-[0.2em]">Legend</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div><span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">Accessible</span></div>
                <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div><span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">Restricted</span></div>
                <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div><span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">Blocked / Critical</span></div>
                <div className="flex items-center gap-3"><div className="w-4 h-0 border-t-2 border-emerald-500 border-dashed opacity-80"></div><span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">Safe Corridor</span></div>
              </div>
            </Card>
          </div>
        </Card>
      </div>
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background-color: #0a0c14;
          color: #f1f5f9;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          padding: 4px;
        }
        .custom-popup .leaflet-popup-tip {
          background-color: #0a0c14;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          border-right: 1px solid rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
}

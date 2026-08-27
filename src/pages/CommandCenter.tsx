import { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, Truck, Activity, Box, Map as MapIcon, CheckCircle2, Navigation, Navigation2, Layers, Search, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${color};"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const incidentIcon = createCustomIcon('#ef4444', 'alert');
const vehicleIcon = createCustomIcon('#3b82f6', 'truck');
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

const KPI_DATA = [
  { label: 'States Monitored', value: '8', icon: MapIcon, trend: '+0%', color: 'text-cyan-600 dark:text-cyan-400' },
  { label: 'Critical Corridors', value: '142', icon: Navigation, trend: '+2', color: 'text-amber-600 dark:text-amber-400' },
  { label: 'Active Vehicles', value: '1,284', icon: Truck, trend: '+45', color: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Network Access', value: '93.7%', icon: Activity, trend: '-1.2%', color: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Active Alerts', value: '37', icon: AlertTriangle, trend: '+5', color: 'text-red-600 dark:text-red-400' },
  { label: 'Emergency Drops', value: '86', icon: Box, trend: '+12', color: 'text-amber-600 dark:text-amber-400' },
  { label: 'Field Reports', value: '214', icon: CheckCircle2, trend: '+28', color: 'text-cyan-600 dark:text-cyan-400' },
  { label: 'High-Risk Zones', value: '18', icon: MapPin, trend: '+3', color: 'text-red-600 dark:text-red-400' },
];

const accessibilityData = [
  { time: '00:00', value: 98 },
  { time: '04:00', value: 97 },
  { time: '08:00', value: 95 },
  { time: '12:00', value: 91 },
  { time: '16:00', value: 93 },
  { time: '20:00', value: 93.7 },
];

const disruptionData = [
  { name: 'Landslide', count: 45 },
  { name: 'Flood', count: 32 },
  { name: 'Bridge', count: 18 },
  { name: 'Traffic', count: 65 },
  { name: 'Other', count: 10 },
];

export default function CommandCenter() {
  const navigate = useNavigate();

  const [accData, setAccData] = useState(accessibilityData);
  const [pulse, setPulse] = useState(false);
  const { vehicles, fieldReports, incidents, shipments, activities } = useData();

  useEffect(() => {
    const interval = setInterval(() => {
      setAccData(prev => {
        const last = prev[prev.length - 1];
        const newTime = parseInt(last.time.split(':')[0]) + 1;
        const formattedTime = `${newTime.toString().padStart(2, '0')}:00`;
        const newVal = Math.min(100, Math.max(80, last.value + (Math.random() * 4 - 2)));
        
        return [...prev.slice(1), { time: formattedTime.length > 5 ? '00:00' : formattedTime, value: Number(newVal.toFixed(1)) }];
      });
      setPulse(p => !p);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 pb-20 max-w-[1920px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-wide uppercase">NER Command Center</h1>
          <p className="text-[12px] text-cyan-500/80 uppercase tracking-widest font-bold mt-1">North Eastern Region Logistics & Monitoring Dashboard</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
        {[
          { label: 'States Monitored', value: '8', icon: MapIcon, trend: '+0%', color: 'text-cyan-600 dark:text-cyan-400' },
          { label: 'Critical Corridors', value: '142', icon: Navigation, trend: '+2', color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Active Vehicles', value: vehicles.length.toString(), icon: Truck, trend: '+1', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Network Access', value: '93.7%', icon: Activity, trend: '-1.2%', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Active Alerts', value: incidents.filter(i => i.status === 'ACTIVE').length.toString(), icon: AlertTriangle, trend: '+5', color: 'text-red-600 dark:text-red-400' },
          { label: 'Emergency Drops', value: shipments.length.toString(), icon: Box, trend: '+12', color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Field Reports', value: fieldReports.length.toString(), icon: CheckCircle2, trend: '+28', color: 'text-cyan-600 dark:text-cyan-400' },
          { label: 'High-Risk Zones', value: '18', icon: MapPin, trend: '+3', color: 'text-red-600 dark:text-red-400' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-gray-50 dark:bg-[#0a0c14] border border-gray-200 dark:border-white/5 rounded-lg p-5 flex flex-col justify-center gap-3 shadow-xl hover:bg-gray-200 dark:hover:bg-white/5 hover:border-gray-300 dark:border-white/10 transition-all relative overflow-hidden group">
            {/* Subtle left border accent */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${kpi.color.replace('text-', 'bg-')} opacity-50 group-hover:opacity-100 transition-opacity`} />
            
            <div className="flex justify-between items-start">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-tight w-2/3">{kpi.label}</p>
              <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${kpi.color.replace('text-', 'bg-').replace('400', '500/10')}`}>
                <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              </div>
            </div>
            <div className="flex items-end justify-between mt-1">
              <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white tracking-tight"><AnimatedCounter value={kpi.value} /></span>
              <span className={`text-[10px] font-bold ${kpi.trend.includes('-') ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{kpi.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Map Area */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <Card className="h-[600px] flex flex-col relative overflow-hidden group !p-0 border-gray-200 dark:border-white/5 shadow-2xl bg-gray-50 dark:bg-[#0a0c14]">
            <MapContainer className="z-10" 
              center={[25.5, 92.5]} 
              zoom={7} 
              style={{ height: '100%', width: '100%', background: '#05070a' }}
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              
              <Polyline positions={routeCoordinates} color="#06b6d4" weight={4} opacity={0.8} dashArray="8, 8" />
              <Polyline positions={route2} color="#f59e0b" weight={4} opacity={0.8} />

              {incidents.map((inc) => (
                <Marker key={inc.id} position={inc.location as [number, number]} icon={inc.severity === 'CRITICAL' ? incidentIcon : warningIcon}>
                  <Popup className="custom-popup">
                    <div className="p-2">
                      <div className="flex gap-2 items-center mb-3">
                         <Badge variant={inc.severity === 'CRITICAL' ? 'error' : 'warning'}>{inc.severity}</Badge>
                         <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{inc.type}</span>
                      </div>
                      <h3 className="font-bold text-[13px] mb-2 text-gray-900 dark:text-white">{inc.locationName}</h3>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-3 leading-snug">{inc.predictedImpact}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {fieldReports.map((report) => (
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
              {vehicles.map((veh) => (
                <Marker key={veh.id} position={veh.currentLocation as [number, number]} icon={vehicleIcon}>
                  <Popup className="custom-popup">
                    <div className="p-2">
                      <Badge variant="info" className="mb-3 inline-block">{veh.id}</Badge>
                      <h3 className="font-bold text-[13px] mb-2 text-gray-900 dark:text-white">{veh.cargo}</h3>
                      <div className="text-[11px] text-gray-600 dark:text-gray-400 mb-2 font-medium">Route: {veh.origin} → {veh.destination}</div>
                      <div className="text-[11px] text-gray-600 dark:text-gray-400 mb-3 font-medium">Status: <span className="font-bold text-emerald-600 dark:text-emerald-400">{veh.status}</span></div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-10" />
            <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] pointer-events-none z-10" />
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
               <button onClick={() => navigate('/map')} className="px-6 py-3 bg-black/80 hover:bg-black backdrop-blur-md border border-cyan-500/50 text-cyan-600 dark:text-cyan-400 text-[11px] font-bold uppercase tracking-[0.2em] rounded shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all flex items-center gap-2">
                 <Navigation2 className="w-4 h-4" /> Enter Full Interactive Map
               </button>
            </div>
            <div className="absolute top-6 left-6 z-20 flex gap-3">
              <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-gray-300 dark:border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest">Live Regional View</span>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-50 dark:bg-[#0a0c14] border-gray-200 dark:border-white/5 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">Accessibility Trend (24h)</CardTitle>
              </CardHeader>
              <div className="h-[200px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={accData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} domain={[80, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0c14', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff' }} />
                    <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorAcc)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="bg-gray-50 dark:bg-[#0a0c14] border-gray-200 dark:border-white/5 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">Disruption Types</CardTitle>
              </CardHeader>
              <div className="h-[200px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={disruptionData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} width={70} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0c14', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                      {
                        disruptionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index === 1 ? '#06b6d4' : index === 3 ? '#f59e0b' : '#334155'} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col flex-1 h-[600px] overflow-hidden !p-0 bg-gray-50 dark:bg-[#0a0c14] border-gray-200 dark:border-white/5 shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-gray-100 dark:bg-black/40 shrink-0">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-500" />
                <h3 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-widest">Recent Activity Feed</h3>
              </div>
              <span className="text-[9px] px-2 py-1 bg-cyan-500/20 text-cyan-500 rounded flex items-center gap-1 font-bold uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" /> Live
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {activities.length === 0 && (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-[11px] uppercase tracking-wider font-bold">
                  No recent activities
                </div>
              )}
              {activities.map((activity) => (
                <div key={activity.id} className="bg-white dark:bg-[#05070a] p-3 rounded-lg border-l-2 border-l-cyan-500 border border-gray-200 dark:border-white/5 flex flex-col gap-2 transition-all hover:bg-gray-100 dark:hover:bg-white/5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold tracking-wider text-cyan-500 uppercase">{activity.type}</span>
                    <span className="text-[10px] font-mono text-gray-500">
                      {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-700 dark:text-gray-300 leading-snug font-medium">{activity.action}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="!p-5 bg-gray-50 dark:bg-[#0a0c14] border-gray-200 dark:border-white/5 shadow-xl shrink-0">
             <div className="flex items-center justify-between mb-5">
                <h3 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-500" />
                  State Connectivity Status
                </h3>
              </div>
              <div className="space-y-4">
                 <div>
                   <div className="flex justify-between text-[11px] mb-1.5 font-bold uppercase tracking-wider">
                     <span className="text-gray-600 dark:text-gray-400">ASSAM</span>
                     <span className="text-emerald-600 dark:text-emerald-400">98.2%</span>
                   </div>
                   <div className="w-full h-2 bg-white dark:bg-[#05070a] border border-gray-200 dark:border-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 w-[98%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                   </div>
                 </div>
                 <div>
                   <div className="flex justify-between text-[11px] mb-1.5 font-bold uppercase tracking-wider">
                     <span className="text-gray-600 dark:text-gray-400">MEGHALAYA</span>
                     <span className="text-amber-600 dark:text-amber-400">78.5%</span>
                   </div>
                   <div className="w-full h-2 bg-white dark:bg-[#05070a] border border-gray-200 dark:border-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-amber-500 w-[78%] shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                   </div>
                 </div>
                 <div>
                   <div className="flex justify-between text-[11px] mb-1.5 font-bold uppercase tracking-wider">
                     <span className="text-gray-600 dark:text-gray-400">ARUNACHAL</span>
                     <span className="text-red-600 dark:text-red-400">64.2%</span>
                   </div>
                   <div className="w-full h-2 bg-white dark:bg-[#05070a] border border-gray-200 dark:border-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-red-500 w-[64%] shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                   </div>
                 </div>
              </div>
          </Card>
        </div>
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

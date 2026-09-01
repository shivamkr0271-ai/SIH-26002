import { useState, useEffect } from 'react';
import { 
  MapPin, AlertTriangle, Truck, Activity, Box, Map as MapIcon, 
  CheckCircle2, Navigation, Layers, ShieldAlert, Sparkles, 
  Flame, Radio, RefreshCw, Send, ChevronRight, ShieldCheck,
  AlertOctagon, Info, Crosshair, ArrowRight, Zap
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { api } from '@/services/api';
import { NER_LOCATIONS } from '@/data/nerLocations';

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
    html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px ${color};"><div style="width: 6px; height: 6px; border-radius: 50%; background: white;"></div></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

const incidentIcon = createCustomIcon('#ef4444', 'alert');
const blockedIcon = createCustomIcon('#dc2626', 'blocked');
const vehicleIcon = createCustomIcon('#3b82f6', 'truck');
const warningIcon = createCustomIcon('#f59e0b', 'warning');
const emergencyVehicleIcon = createCustomIcon('#10b981', 'emergency');

// Major NER Interstate Corridors
const nh6Corridor: [number, number][] = [
  [26.1445, 91.7362], // Guwahati
  [25.5788, 91.8933], // Shillong
  [25.4500, 92.2000], // Jowai
  [24.8333, 92.7789], // Silchar
  [23.7307, 92.7173], // Aizawl
];

const nh37Corridor: [number, number][] = [
  [26.1445, 91.7362], // Guwahati
  [26.3500, 92.6800], // Nagaon
  [26.7509, 94.2037], // Jorhat
  [27.4728, 94.9120], // Dibrugarh
];

const nh13Corridor: [number, number][] = [
  [26.1445, 91.7362], // Guwahati
  [26.6528, 92.7926], // Tezpur
  [27.0844, 93.6053], // Itanagar
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

const COMMODITIES = [
  'Medicines',
  'Food',
  'Emergency Supplies',
  'Construction Materials',
  'Agricultural Produce'
];

export default function CommandCenter() {
  const navigate = useNavigate();
  const [accData, setAccData] = useState(accessibilityData);
  const [pulse, setPulse] = useState(false);
  const { vehicles, fieldReports, incidents, shipments } = useData();

  // Layer filters
  const [showVehicles, setShowVehicles] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showCorridors, setShowCorridors] = useState(true);

  // Quick Route Modal State
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [modalOrigin, setModalOrigin] = useState('Guwahati');
  const [modalDestination, setModalDestination] = useState('Aizawl');

  // Emergency & Disaster Intelligence State
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [emergencySummary, setEmergencySummary] = useState<any>(null);
  const [criticalCorridors, setCriticalCorridors] = useState<any[]>([]);
  const [emergencyCommodity, setEmergencyCommodity] = useState('Medicines');
  const [emergencyOrigin, setEmergencyOrigin] = useState('Guwahati');
  const [emergencyDestination, setEmergencyDestination] = useState('Aizawl');
  const [emergencyRecommendation, setEmergencyRecommendation] = useState<any>(null);
  const [isCalculatingEmergency, setIsCalculatingEmergency] = useState(false);

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

  // Fetch Emergency Intelligence telemetry
  const fetchEmergencyData = () => {
    api.getEmergencySummary().then(res => {
      if (res.data) setEmergencySummary(res.data);
    }).catch(() => {});

    api.getCriticalCorridors().then(res => {
      if (res.data) setCriticalCorridors(res.data);
    }).catch(() => {});
  };

  useEffect(() => {
    fetchEmergencyData();
    const interval = setInterval(fetchEmergencyData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLaunchRoute = (orig = modalOrigin, dest = modalDestination) => {
    navigate(`/route?origin=${encodeURIComponent(orig)}&destination=${encodeURIComponent(dest)}`);
  };

  const handleCalculateEmergencyRoute = async () => {
    if (emergencyOrigin === emergencyDestination) return;
    setIsCalculatingEmergency(true);
    try {
      const res = await api.recommendEmergencyRoute({
        origin: emergencyOrigin,
        destination: emergencyDestination,
        commodity: emergencyCommodity
      });
      if (res.data) {
        setEmergencyRecommendation(res.data);
      }
    } catch (err) {
      console.error('Emergency route recommendation failed:', err);
    } finally {
      setIsCalculatingEmergency(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-[1920px] mx-auto">
      {/* Top Header & Emergency Controller */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-wide uppercase font-sans">
              NER Command Center
            </h1>
            {isEmergencyMode && (
              <span className="px-2.5 py-1 rounded bg-red-600/20 text-red-400 border border-red-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                <Flame className="w-3.5 h-3.5 text-red-500" /> DISASTER PROTOCOL ACTIVE
              </span>
            )}
          </div>
          <p className="text-[12px] text-cyan-600 dark:text-cyan-500/80 uppercase tracking-widest font-bold mt-1">
            North Eastern Region Logistics & Accessibility Intelligence
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Emergency Mode Toggle Button */}
          <button
            onClick={() => setIsEmergencyMode(!isEmergencyMode)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              isEmergencyMode
                ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] border border-red-400'
                : 'bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            {isEmergencyMode ? 'Deactivate Emergency Mode' : 'Activate Disaster Mode'}
          </button>

          <button 
            onClick={() => setRouteModalOpen(true)} 
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(8,145,178,0.4)] cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" /> Analyze Custom Route
          </button>

          <button 
            onClick={() => navigate('/supply')} 
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" /> Create Mission
          </button>
        </div>
      </div>

      {/* Emergency Operations Command Bar (When Emergency Mode is Active) */}
      {isEmergencyMode && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-red-900/20 to-black/40 border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.15)] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-500/20 pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Emergency Logistics & Disaster Accessibility Dashboard
              </span>
            </div>
            <span className="text-[10px] font-mono text-red-300">
              Live Priority Ingestion Active • Updated: {new Date().toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Active Alerts', val: emergencySummary?.activeEmergencies || 8, icon: AlertOctagon, color: 'text-red-400', path: '/alerts' },
              { label: 'Critical Corridors', val: emergencySummary?.criticalCorridors || 3, icon: Navigation, color: 'text-amber-400', path: '/route' },
              { label: 'Blocked Routes', val: emergencySummary?.blockedRoutes || 1, icon: Flame, color: 'text-red-500', path: '/route?origin=Guwahati&destination=Aizawl' },
              { label: 'High-Risk Zones', val: emergencySummary?.highRiskDistricts || 4, icon: MapPin, color: 'text-amber-300', path: '/districts' },
              { label: 'Delayed Essential Cargo', val: emergencySummary?.delayedEmergencyVehicles || 1, icon: Truck, color: 'text-cyan-400', path: '/fleet?status=DELAYED' },
              { label: 'Critical Priority Alerts', val: emergencySummary?.activeCriticalAlerts || 2, icon: ShieldCheck, color: 'text-emerald-400', path: '/alerts?tab=critical' }
            ].map((k, i) => (
              <button 
                key={i} 
                onClick={() => navigate(k.path)}
                className="p-3 rounded-lg bg-black/40 border border-red-500/20 flex flex-col justify-between text-left hover:border-red-400/60 hover:bg-red-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
              >
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-red-300 uppercase tracking-wider transition-colors">{k.label}</span>
                <div className="flex items-baseline justify-between mt-1 w-full">
                  <span className={`text-xl font-mono font-bold ${k.color}`}>{k.val}</span>
                  <k.icon className={`w-4 h-4 ${k.color} group-hover:scale-110 transition-transform`} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Corridor Selection Modal */}
      {routeModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0a0c14] border border-gray-200 dark:border-white/10 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-4 h-4 text-cyan-500" /> Corridor Selection
              </h3>
              <button 
                onClick={() => setRouteModalOpen(false)}
                className="text-gray-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Origin Point</label>
                <select 
                  value={modalOrigin}
                  onChange={e => setModalOrigin(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#05070a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
                >
                  {NER_LOCATIONS.map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.name} ({loc.district}, {loc.state})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Destination Hub</label>
                <select 
                  value={modalDestination}
                  onChange={e => setModalDestination(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#05070a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
                >
                  {NER_LOCATIONS.map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.name} ({loc.district}, {loc.state})</option>
                  ))}
                </select>
              </div>

              {/* Fast Corridor Presets */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Priority Corridors:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button 
                    onClick={() => { setModalOrigin('Guwahati'); setModalDestination('Aizawl'); }}
                    className="p-2 rounded bg-gray-100 dark:bg-white/5 text-left hover:border-cyan-500 border border-transparent text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
                  >
                    Guwahati → Aizawl
                  </button>
                  <button 
                    onClick={() => { setModalOrigin('Shillong'); setModalDestination('Imphal'); }}
                    className="p-2 rounded bg-gray-100 dark:bg-white/5 text-left hover:border-cyan-500 border border-transparent text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
                  >
                    Shillong → Imphal
                  </button>
                  <button 
                    onClick={() => { setModalOrigin('Guwahati'); setModalDestination('Itanagar'); }}
                    className="p-2 rounded bg-gray-100 dark:bg-white/5 text-left hover:border-cyan-500 border border-transparent text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
                  >
                    Guwahati → Itanagar
                  </button>
                  <button 
                    onClick={() => { setModalOrigin('Gangtok'); setModalDestination('Guwahati'); }}
                    className="p-2 rounded bg-gray-100 dark:bg-white/5 text-left hover:border-cyan-500 border border-transparent text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
                  >
                    Gangtok → Guwahati
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setRouteModalOpen(false)}
                className="w-1/2 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleLaunchRoute()}
                className="w-1/2 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(8,145,178,0.4)] cursor-pointer"
              >
                Launch Intelligence
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPIs with Drill-Down Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
        {[
          { label: 'States Monitored', value: '8', icon: MapIcon, trend: '+0%', color: 'text-cyan-600 dark:text-cyan-400', path: '/districts' },
          { label: 'Critical Corridors', value: (criticalCorridors.filter(c => c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL').length || 3).toString(), icon: Navigation, trend: '+2', color: 'text-amber-600 dark:text-amber-400', path: '/route' },
          { label: 'Active Vehicles', value: vehicles.length.toString(), icon: Truck, trend: '+1', color: 'text-emerald-600 dark:text-emerald-400', path: '/fleet' },
          { label: 'Network Access', value: '93.7%', icon: Activity, trend: '-1.2%', color: 'text-emerald-600 dark:text-emerald-400', path: '/districts' },
          { label: 'Active Alerts', value: incidents.filter(i => i.status === 'ACTIVE').length.toString(), icon: AlertTriangle, trend: '+5', color: 'text-red-600 dark:text-red-400', path: '/alerts?tab=critical' },
          { label: 'Emergency Drops', value: shipments.length.toString(), icon: Box, trend: '+12', color: 'text-amber-600 dark:text-amber-400', path: '/supply' },
          { label: 'Field Reports', value: fieldReports.length.toString(), icon: CheckCircle2, trend: '+28', color: 'text-cyan-600 dark:text-cyan-400', path: '/reports' },
          { label: 'High-Risk Zones', value: '18', icon: MapPin, trend: '+3', color: 'text-red-600 dark:text-red-400', path: '/map' },
        ].map((kpi, idx) => (
          <button 
            key={idx} 
            onClick={() => navigate(kpi.path)}
            className="bg-gray-50 dark:bg-[#0a0c14] border border-gray-200 dark:border-white/5 rounded-lg p-5 flex flex-col justify-between gap-3 shadow-xl hover:bg-gray-200 dark:hover:bg-white/5 hover:border-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group text-left cursor-pointer"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${kpi.color.replace('text-', 'bg-')} opacity-50 group-hover:opacity-100 transition-opacity`} />
            <div className="flex justify-between items-start w-full">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-tight w-2/3 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{kpi.label}</p>
              <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${kpi.color.replace('text-', 'bg-').replace('400', '500/10')}`}>
                <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              </div>
            </div>
            <div className="flex items-end justify-between mt-1 w-full">
              <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white tracking-tight"><AnimatedCounter value={kpi.value} /></span>
              <span className={`text-[10px] font-bold ${kpi.trend.includes('-') ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{kpi.trend}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Main Map & Critical Intelligence Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Map Area */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <Card className="h-[600px] flex flex-col relative overflow-hidden group !p-0 border-gray-200 dark:border-white/5 shadow-2xl bg-gray-50 dark:bg-[#0a0c14] rounded-xl">
            <MapContainer 
              className="w-full h-full z-0" 
              center={[25.7, 92.8]} 
              zoom={7} 
              style={{ height: '100%', width: '100%', background: '#05070a' }}
              zoomControl={true}
              dragging={true}
              scrollWheelZoom={true}
              doubleClickZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              
              {showCorridors && (
                <>
                  <Polyline positions={nh6Corridor} pathOptions={{ color: isEmergencyMode ? '#ef4444' : '#06b6d4', weight: isEmergencyMode ? 5 : 4, opacity: 0.85, dashArray: '8, 8' }}>
                    <Popup className="custom-popup">
                      <div className="p-1">
                        <div className="text-[10px] font-bold text-cyan-400 uppercase">NH-06 Trans-Barak Corridor</div>
                        <p className="text-xs text-white font-semibold">Guwahati ↔ Shillong ↔ Silchar ↔ Aizawl</p>
                        <p className="text-[10px] text-amber-400 mt-1">Accessibility: Restricted (Landslide warning)</p>
                        <button 
                          onClick={() => handleLaunchRoute('Guwahati', 'Aizawl')}
                          className="mt-2 w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Navigation className="w-3 h-3" /> Analyze Corridor
                        </button>
                      </div>
                    </Popup>
                  </Polyline>

                  <Polyline positions={nh37Corridor} pathOptions={{ color: '#10b981', weight: 4, opacity: 0.85 }}>
                    <Popup className="custom-popup">
                      <div className="p-1">
                        <div className="text-[10px] font-bold text-emerald-400 uppercase">NH-37 Upper Assam Arterial</div>
                        <p className="text-xs text-white font-semibold">Guwahati ↔ Nagaon ↔ Jorhat ↔ Dibrugarh</p>
                        <p className="text-[10px] text-gray-400 mt-1">Status: Open</p>
                        <button 
                          onClick={() => handleLaunchRoute('Guwahati', 'Dibrugarh')}
                          className="mt-2 w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Navigation className="w-3 h-3" /> Analyze Corridor
                        </button>
                      </div>
                    </Popup>
                  </Polyline>

                  <Polyline positions={nh13Corridor} pathOptions={{ color: '#f59e0b', weight: 4, opacity: 0.85 }}>
                    <Popup className="custom-popup">
                      <div className="p-1">
                        <div className="text-[10px] font-bold text-amber-400 uppercase">NH-13 Arunachal Frontier Highway</div>
                        <p className="text-xs text-white font-semibold">Guwahati ↔ Tezpur ↔ Itanagar</p>
                        <p className="text-[10px] text-gray-400 mt-1">Status: Caution (Rainfall runoff)</p>
                        <button 
                          onClick={() => handleLaunchRoute('Guwahati', 'Itanagar')}
                          className="mt-2 w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Navigation className="w-3 h-3" /> Analyze Corridor
                        </button>
                      </div>
                    </Popup>
                  </Polyline>
                </>
              )}

              {showIncidents && incidents.map((inc) => (
                <Marker key={inc.id} position={inc.location as [number, number]} icon={inc.severity === 'CRITICAL' ? blockedIcon : warningIcon}>
                  <Popup className="custom-popup">
                    <div className="p-2">
                      <div className="flex gap-2 items-center mb-2">
                         <Badge variant={inc.severity === 'CRITICAL' ? 'error' : 'warning'}>{inc.severity}</Badge>
                         <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{inc.type}</span>
                      </div>
                      <h3 className="font-bold text-[13px] mb-1 text-white">{inc.locationName}</h3>
                      <p className="text-[11px] text-gray-300 mb-2 leading-snug">{inc.predictedImpact}</p>
                      <p className="text-[10px] font-mono text-cyan-400">Route: {inc.affectedRoute}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {showVehicles && vehicles.map((v) => (
                <Marker key={v.id} position={v.currentLocation as [number, number]} icon={v.status === 'DELAYED' ? warningIcon : (v.cargoType === 'MEDICINES' || v.cargoType === 'FOOD') ? emergencyVehicleIcon : vehicleIcon}>
                  <Popup className="custom-popup">
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-white">{v.id}</span>
                        <Badge variant={v.status === 'DELAYED' ? 'error' : 'success'}>{v.status}</Badge>
                      </div>
                      <p className="text-xs text-gray-300 font-semibold">{v.cargo}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{v.origin} → {v.destination}</p>
                      <p className="text-[10px] font-mono text-cyan-400 mt-1">Speed: {v.speed} km/h | ETA: {v.eta}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Map Layer Controls */}
            <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2 bg-gray-900/90 backdrop-blur-md p-2 rounded-lg border border-gray-700 shadow-xl text-xs text-white">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">Layers</span>
              <label className="flex items-center gap-2 cursor-pointer hover:text-cyan-400">
                <input type="checkbox" checked={showCorridors} onChange={e => setShowCorridors(e.target.checked)} className="rounded text-cyan-500" />
                <span>Corridors</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-cyan-400">
                <input type="checkbox" checked={showIncidents} onChange={e => setShowIncidents(e.target.checked)} className="rounded text-cyan-500" />
                <span>Incidents</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-cyan-400">
                <input type="checkbox" checked={showVehicles} onChange={e => setShowVehicles(e.target.checked)} className="rounded text-cyan-500" />
                <span>Fleet Vehicles</span>
              </label>
            </div>
          </Card>

          {/* Critical Corridors Dynamic Matrix Table */}
          <Card className="bg-gray-50 dark:bg-[#0a0c14] border-gray-200 dark:border-white/10 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-cyan-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Critical Corridors Accessibility Matrix
                </h3>
              </div>
              <span className="text-[10px] font-mono text-gray-500">Live ML Risk + Blockades</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10 text-gray-400 uppercase text-[10px] font-bold">
                    <th className="pb-2">Corridor</th>
                    <th className="pb-2">Accessibility</th>
                    <th className="pb-2">ML Risk Score</th>
                    <th className="pb-2">Estimated Delay</th>
                    <th className="pb-2">Primary Risk Driver</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-sans">
                  {criticalCorridors.map((c, i) => (
                    <tr key={i} className="hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                      <td className="py-2.5 font-semibold text-gray-900 dark:text-white">
                        {c.corridor}
                      </td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          c.accessibilityStatus === 'BLOCKED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          c.accessibilityStatus === 'RESTRICTED' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          c.accessibilityStatus === 'CAUTION' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {c.accessibilityStatus}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono">
                        <span className={c.riskScore > 60 ? 'text-red-400 font-bold' : c.riskScore > 35 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                          {c.riskScore}/100 ({c.riskLevel})
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-gray-700 dark:text-gray-300">
                        +{c.estimatedDelayMinutes}m
                      </td>
                      <td className="py-2.5 text-gray-600 dark:text-gray-400 text-[11px] max-w-xs truncate">
                        {c.reason}
                      </td>
                      <td className="py-2.5">
                        <button
                          onClick={() => handleLaunchRoute(c.origin, c.destination)}
                          className="px-2.5 py-1 bg-cyan-600/80 hover:bg-cyan-500 text-white rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Analyze
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Emergency Route Recommender & Disaster Intelligence Tool */}
        <div className="flex flex-col gap-6">
          {/* Emergency Route Generator Card */}
          <Card className="bg-gray-50 dark:bg-[#0a0c14] border-gray-200 dark:border-white/10 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Emergency Route Advisor
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Commodity Routing
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Essential Commodity</label>
                <select
                  value={emergencyCommodity}
                  onChange={e => setEmergencyCommodity(e.target.value)}
                  className="w-full bg-white dark:bg-[#05070a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
                >
                  {COMMODITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Origin</label>
                  <select
                    value={emergencyOrigin}
                    onChange={e => setEmergencyOrigin(e.target.value)}
                    className="w-full bg-white dark:bg-[#05070a] border border-gray-300 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  >
                    {NER_LOCATIONS.map(l => (
                      <option key={l.id} value={l.name}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Destination</label>
                  <select
                    value={emergencyDestination}
                    onChange={e => setEmergencyDestination(e.target.value)}
                    className="w-full bg-white dark:bg-[#05070a] border border-gray-300 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  >
                    {NER_LOCATIONS.map(l => (
                      <option key={l.id} value={l.name}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleCalculateEmergencyRoute}
                disabled={isCalculatingEmergency || emergencyOrigin === emergencyDestination}
                className="w-full py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isCalculatingEmergency ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />}
                {isCalculatingEmergency ? 'Calculating Priority Route...' : `Recommend Route for ${emergencyCommodity}`}
              </button>

              {/* Recommendation Result */}
              {emergencyRecommendation && (
                <div className="p-3.5 rounded-lg bg-black/40 border border-cyan-500/30 space-y-2.5 mt-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-[10px] font-bold uppercase text-cyan-400">Emergency Recommendation</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                      {emergencyRecommendation.accessibilityStatus}
                    </span>
                  </div>

                  <p className="text-xs text-gray-200 leading-relaxed font-sans">
                    {emergencyRecommendation.justification}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 text-gray-300">
                    <div>Primary Risk: <span className="text-red-400 font-bold">{emergencyRecommendation.primaryRiskScore}/100</span></div>
                    <div>Bypass Risk: <span className="text-emerald-400 font-bold">{emergencyRecommendation.recommendedRiskScore}/100</span></div>
                    <div>Est. Transit: <span className="text-cyan-400">{emergencyRecommendation.estimatedTransitHours}</span></div>
                    <div>Delay: <span className="text-amber-400">+{emergencyRecommendation.predictedDelayMinutes}m</span></div>
                  </div>

                  <button
                    onClick={() => handleLaunchRoute(emergencyRecommendation.origin, emergencyRecommendation.destination)}
                    className="w-full py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Open in Route Intelligence <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Real-time Accessibility Trends Chart */}
          <Card className="bg-gray-50 dark:bg-[#0a0c14] border-gray-200 dark:border-white/10 rounded-xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-2">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-500" /> 24H Accessibility Index
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">93.7% Normal</span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={accData}>
                  <defs>
                    <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="time" stroke="#6b7280" fontSize={10} />
                  <YAxis domain={[75, 100]} stroke="#6b7280" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0a0c14', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#accGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Analyze Custom Route Modal */}
      {routeModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1017] border border-gray-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-cyan-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Analyze Custom Route
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setRouteModalOpen(false)}
                className="text-gray-400 hover:text-white text-sm p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Select origin and destination hubs in the North Eastern Region to perform GIS corridor intelligence analysis.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Origin Hub</label>
                <select 
                  value={modalOrigin} 
                  onChange={e => setModalOrigin(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#05070a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
                >
                  {NER_LOCATIONS.map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.name} ({loc.district}, {loc.state})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Destination Hub</label>
                <select 
                  value={modalDestination} 
                  onChange={e => setModalDestination(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#05070a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
                >
                  {NER_LOCATIONS.map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.name} ({loc.district}, {loc.state})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setRouteModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setRouteModalOpen(false);
                  handleLaunchRoute(modalOrigin, modalDestination);
                }}
                disabled={modalOrigin === modalDestination}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 shadow-[0_0_15px_rgba(8,145,178,0.4)] disabled:opacity-50 cursor-pointer"
              >
                Launch Intelligence <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

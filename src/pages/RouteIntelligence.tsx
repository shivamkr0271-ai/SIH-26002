import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { MapPin, Navigation, TrendingUp, AlertTriangle, ShieldAlert, CloudLightning, Activity, BarChart3, Wind, Zap, RefreshCw } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useData } from '@/contexts/DataContext';

export default function RouteIntelligence() {
  const { addActivity, addNotification } = useData();
  const [origin, setOrigin] = useState('Guwahati, Assam');
  const [destination, setDestination] = useState('Aizawl, Mizoram');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  // Dynamic deterministic stats based on string length to simulate AI processing
  const baseSeed = origin.length + destination.length;
  
  const distance = 150 + (baseSeed * 12);
  const eta = Math.floor(distance / 40);
  const risk = Math.min(98, 40 + (baseSeed * 2));
  const delay = Math.floor(baseSeed / 3);

  const locs: Record<string, [number, number]> = {
    'Guwahati, Assam': [26.1445, 91.7362],
    'Aizawl, Mizoram': [23.7307, 92.7173],
    'Shillong, Meghalaya': [25.5788, 91.8933],
    'Imphal, Manipur': [24.8170, 93.9368],
    'Itanagar, Arunachal': [27.0844, 93.6053],
    'Gangtok, Sikkim': [27.3389, 88.6065],
    'Kohima, Nagaland': [25.6751, 94.1086],
    'Agartala, Tripura': [23.8315, 91.2868]
  };

  const oCoords = locs[origin] || locs['Guwahati, Assam'];
  const dCoords = locs[destination] || locs['Aizawl, Mizoram'];

  // Generate intermediate points based on origin and dest
  const midLat = (oCoords[0] + dCoords[0]) / 2 + (baseSeed % 2 === 0 ? 0.5 : -0.5);
  const midLng = (oCoords[1] + dCoords[1]) / 2 + (baseSeed % 2 === 0 ? -0.5 : 0.5);

  const routePositions: [number, number][] = [
    oCoords,
    [midLat, midLng],
    dCoords
  ];

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
      addActivity(`Route analysis completed: ${origin} → ${destination}`, 'system');
      addNotification('Analysis Complete', `AI route analysis finished for ${destination}`, 'success');
    }, 1500);
  };

  return (
    <div className="max-w-[1920px] mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">AI Route Intelligence</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Predictive logistics routing and risk assessment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Route Configuration</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-10 bottom-10 w-0.5 bg-gray-300 dark:bg-white/10"></div>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-3 top-9 w-2.5 h-2.5 rounded-full bg-cyan-500 border-2 border-[#0a0c14] z-10"></div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-8">Origin</label>
                    <select value={origin} onChange={e => setOrigin(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-50 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 ml-2 max-w-[calc(100%-8px)]">
                      {Object.keys(locs).map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-9 w-2.5 h-2.5 rounded-full border-2 border-emerald-500 bg-gray-50 dark:bg-[#0a0c14] z-10"></div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-8">Destination</label>
                    <select value={destination} onChange={e => setDestination(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-50 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 ml-2 max-w-[calc(100%-8px)]">
                      {Object.keys(locs).map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-300 dark:border-gray-200 dark:border-white/5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cargo Profile</label>
                  <select className="w-full bg-gray-100 dark:bg-gray-50 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500">
                    <option>Standard Cargo</option>
                    <option>Medical Supplies</option>
                    <option>Heavy Machinery</option>
                    <option>Hazardous Material</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Priority</label>
                  <select className="w-full bg-gray-100 dark:bg-gray-50 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500">
                    <option>Normal</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleAnalyze} 
                disabled={analyzing || origin === destination}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold shadow-[0_0_15px_rgba(8,145,178,0.4)] transition-all flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {analyzing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                {analyzing ? 'Analyzing terrain & risk...' : 'Analyze Route'}
              </button>
            </div>
          </Card>

          {analyzed && (
            <Card className="border border-cyan-500/30 bg-cyan-950/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <ShieldAlert className="w-24 h-24 text-cyan-500" />
              </div>
              <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mb-2 flex items-center gap-2">
                <Activity className="w-5 h-5" /> AI Recommendation
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed relative z-10">
                Primary route via NH-6 is viable but shows elevated risk ({risk}% probability) of localized flooding near waypoint Alpha. Recommended adjusting departure to {eta + 2}00 hours to avoid incoming weather front.
              </p>
              
              <div className="mt-4 grid grid-cols-2 gap-3 relative z-10">
                <div className="bg-gray-50 dark:bg-[#0a0c14] border border-gray-200 dark:border-white/5 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 font-bold uppercase mb-1">Est. Distance</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{distance} km</div>
                </div>
                <div className="bg-gray-50 dark:bg-[#0a0c14] border border-gray-200 dark:border-white/5 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 font-bold uppercase mb-1">Travel Time</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{eta}h {delay}m</div>
                </div>
              </div>
            </Card>
          )}

        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card noPadding className="h-[400px] relative overflow-hidden group">
            <MapContainer 
              center={oCoords} 
              zoom={7} 
              className="w-full h-full z-0"
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              {analyzed && (
                <>
                  <Polyline positions={routePositions} pathOptions={{ color: '#06b6d4', weight: 4, dashArray: '10, 10' }} className="animate-pulse" />
                  <Marker position={oCoords} />
                  <Marker position={dCoords} />
                </>
              )}
            </MapContainer>
            
            <div className="absolute top-4 left-4 right-4 flex justify-between z-[1000] pointer-events-none">
              <div className="bg-gray-50 dark:bg-[#0a0c14]/90 border border-gray-300 dark:border-white/10 backdrop-blur px-4 py-2 rounded-lg pointer-events-auto">
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> SAT-LINK ACTIVE
                </div>
              </div>
            </div>
          </Card>

          {analyzed && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <CloudLightning className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">MODERATE</span>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Weather Risk</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{risk}%</div>
                </div>
              </Card>
              <Card className="p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Wind className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">CLEAR</span>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Accessibility</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{100 - risk}%</div>
                </div>
              </Card>
              <Card className="p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">DELAY</span>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Est. Delay</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">+{delay}m</div>
                </div>
              </Card>
              <Card className="p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-cyan-500" />
                  </div>
                  <span className="text-xs font-bold text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded">HIGH</span>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Reliability Score</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{99 - delay}%</div>
                </div>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

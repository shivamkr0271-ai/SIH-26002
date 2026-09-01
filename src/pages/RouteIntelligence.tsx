import { useState, useRef, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  MapPin, Navigation, TrendingUp, AlertTriangle, ShieldAlert, 
  CloudLightning, Activity, BarChart3, Wind, Zap, RefreshCw, 
  CheckCircle2, Clock, Truck, Layers, Info, ArrowRight, ShieldCheck,
  Thermometer, CloudRain, Eye
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { NER_LOCATIONS, NERLocation } from '@/data/nerLocations';
import { api } from '@/services/api';
import { RouteAnalysisResult } from '@/types';

export interface RouteRiskClassification {
  level: 'LOW' | 'MODERATE' | 'CRITICAL';
  label: string;
  color: string;
  badgeVariant: 'success' | 'warning' | 'error';
  lineColor: string;
  statusIcon: string;
  statusText: string;
}

/**
 * Shared Route Risk Classifier
 * LOW (<=35): GREEN (#10b981)
 * MODERATE (36-65): YELLOW/ORANGE (#f59e0b)
 * CRITICAL (>65): RED (#ef4444)
 */
export function classifyRouteRisk(riskScore: number): RouteRiskClassification {
  if (riskScore <= 35) {
    return {
      level: 'LOW',
      label: 'LOW RISK',
      color: '#10b981',
      badgeVariant: 'success',
      lineColor: '#10b981',
      statusIcon: '🟢',
      statusText: 'Safest / Low Risk'
    };
  } else if (riskScore <= 65) {
    return {
      level: 'MODERATE',
      label: 'MODERATE RISK',
      color: '#f59e0b',
      badgeVariant: 'warning',
      lineColor: '#f59e0b',
      statusIcon: '🟡',
      statusText: 'Moderate Risk'
    };
  } else {
    return {
      level: 'CRITICAL',
      label: 'CRITICAL RISK',
      color: '#ef4444',
      badgeVariant: 'error',
      lineColor: '#ef4444',
      statusIcon: '🔴',
      statusText: 'Critical / High Risk'
    };
  }
}

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createPinIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-route-pin',
    html: `
      <div style="
        background: ${color};
        color: black;
        font-weight: 800;
        font-size: 10px;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 15px ${color};
        text-transform: uppercase;
      ">${label}</div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

const incidentPin = L.divIcon({
  className: 'custom-incident-pin',
  html: `<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px #ef4444; animation: pulse 2s infinite;"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Component to dynamically fit map bounds to the calculated route
function MapBoundsFitter({ points }: { points: [number, number][] }) {
  const map = useMap();
  const prevBoundsRef = useRef<string>('');

  useEffect(() => {
    if (!points || points.length < 2) return;
    const key = `${points[0][0]},${points[0][1]}_${points[points.length - 1][0]},${points[points.length - 1][1]}_${points.length}`;
    if (prevBoundsRef.current === key) return;
    prevBoundsRef.current = key;

    try {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    } catch (e) {
      // ignore bounds calculation error
    }
  }, [points, map]);

  return null;
}

export default function RouteIntelligence() {
  const [searchParams] = useSearchParams();
  const originParam = searchParams.get('origin');
  const destParam = searchParams.get('destination');

  const [origin, setOrigin] = useState(() => {
    if (originParam) {
      const match = NER_LOCATIONS.find(l => 
        l.name.toLowerCase() === originParam.toLowerCase() || 
        `${l.name}, ${l.state}`.toLowerCase() === originParam.toLowerCase() ||
        originParam.toLowerCase().includes(l.name.toLowerCase()) ||
        l.id.toLowerCase() === originParam.toLowerCase()
      );
      if (match) return match.name;
    }
    return 'Guwahati';
  });

  const [destination, setDestination] = useState(() => {
    if (destParam) {
      const match = NER_LOCATIONS.find(l => 
        l.name.toLowerCase() === destParam.toLowerCase() || 
        `${l.name}, ${l.state}`.toLowerCase() === destParam.toLowerCase() ||
        destParam.toLowerCase().includes(l.name.toLowerCase()) ||
        l.id.toLowerCase() === destParam.toLowerCase()
      );
      if (match) return match.name;
    }
    return 'Aizawl';
  });

  useEffect(() => {
    if (originParam) {
      const match = NER_LOCATIONS.find(l => 
        l.name.toLowerCase() === originParam.toLowerCase() || 
        `${l.name}, ${l.state}`.toLowerCase() === originParam.toLowerCase() ||
        originParam.toLowerCase().includes(l.name.toLowerCase()) ||
        l.id.toLowerCase() === originParam.toLowerCase()
      );
      if (match) setOrigin(match.name);
    }
    if (destParam) {
      const match = NER_LOCATIONS.find(l => 
        l.name.toLowerCase() === destParam.toLowerCase() || 
        `${l.name}, ${l.state}`.toLowerCase() === destParam.toLowerCase() ||
        destParam.toLowerCase().includes(l.name.toLowerCase()) ||
        l.id.toLowerCase() === destParam.toLowerCase()
      );
      if (match) setDestination(match.name);
    }
  }, [originParam, destParam]);

  const [cargoType, setCargoType] = useState('Medical Supplies (Insulin, Vaccines)');
  const [vehicleType, setVehicleType] = useState('Standard 4x4 Logistics Carrier');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('CRITICAL');

  const [analyzing, setAnalyzing] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showPrimaryRoute, setShowPrimaryRoute] = useState(true);
  const [showAltRoute, setShowAltRoute] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);

  // In-flight guard to prevent duplicate API requests
  const isAnalyzingRef = useRef(false);

  // Group locations by state for organized select dropdown
  const groupedLocations = useMemo<Record<string, NERLocation[]>>(() => {
    return NER_LOCATIONS.reduce<Record<string, NERLocation[]>>((acc, loc) => {
      if (!acc[loc.state]) acc[loc.state] = [];
      acc[loc.state].push(loc);
      return acc;
    }, {});
  }, []);

  const originLoc = useMemo(() => {
    return NER_LOCATIONS.find(l => l.name === origin) || NER_LOCATIONS[0];
  }, [origin]);

  const destLoc = useMemo(() => {
    return NER_LOCATIONS.find(l => l.name === destination) || NER_LOCATIONS[1];
  }, [destination]);

  const handleAnalyze = async () => {
    // Guard against duplicate clicks or already running request
    if (isAnalyzingRef.current || analyzing) {
      return;
    }

    if (origin === destination) {
      setErrorMessage('Origin and Destination cannot be the same. Please select different points.');
      return;
    }

    setErrorMessage(null);
    setAnalyzing(true);
    isAnalyzingRef.current = true;

    try {
      const res = await api.calculateRoute({
        origin: `${originLoc.name}, ${originLoc.state}`,
        destination: `${destLoc.name}, ${destLoc.state}`,
        cargoType,
        vehicleType,
        priority
      });

      if (res.data) {
        setRouteResult(res.data);
      } else {
        setErrorMessage(res.error || 'Failed to analyze route. Please verify server connectivity.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during route analysis.');
    } finally {
      isAnalyzingRef.current = false;
      setAnalyzing(false);
    }
  };

  const [selectedRouteId, setSelectedRouteId] = useState<string>('PRIMARY');

  // Auto-analyze route when origin and destination are passed via URL query params
  const hasAutoAnalyzedRef = useRef(false);
  useEffect(() => {
    if (originParam && destParam && !hasAutoAnalyzedRef.current && origin !== destination) {
      hasAutoAnalyzedRef.current = true;
      handleAnalyze();
    }
  }, [originParam, destParam, origin, destination]);

  // Memoize all evaluated route options with shared risk classification
  const allRouteOptions = useMemo(() => {
    if (!routeResult) return [];

    const primaryRiskScore = Number(
      (routeResult.mlPrediction ? routeResult.mlPrediction.disruptionProbability : routeResult.prototypeRiskScore).toFixed(1)
    );
    const primaryClassification = classifyRouteRisk(primaryRiskScore);

    const routes = [
      {
        id: 'PRIMARY',
        name: `Primary Highway Corridor (${routeResult.origin.split(',')[0]} ↔ ${routeResult.destination.split(',')[0]})`,
        distanceKm: routeResult.distanceKm,
        estimatedTravelTime: routeResult.estimatedTravelTime,
        estimatedDelayMinutes: routeResult.mlPrediction ? routeResult.mlPrediction.estimatedDelayMinutes : routeResult.estimatedDelayMinutes,
        riskScore: primaryRiskScore,
        classification: primaryClassification,
        path: routeResult.recommendedRoute,
        accessibilityScore: routeResult.accessibilityScore,
        majorFactors: [
          routeResult.weatherSummary ? `Weather: ${routeResult.weatherSummary.overallWeatherRisk}` : null,
          routeResult.mlPrediction ? `Landslide: ${routeResult.mlPrediction.landslideRisk}` : null,
          routeResult.nearbyIncidents?.length ? `${routeResult.nearbyIncidents.length} Incident(s) Nearby` : 'Clear Passage'
        ].filter(Boolean).join(' • ')
      }
    ];

    if (routeResult.alternativeRoutes && routeResult.alternativeRoutes.length > 0) {
      routeResult.alternativeRoutes.forEach((alt, idx) => {
        const altScore = Number(alt.prototypeRiskScore.toFixed(1));
        const altClassification = classifyRouteRisk(altScore);
        routes.push({
          id: alt.id || `ALT-${idx + 1}`,
          name: alt.name || `Alternative Bypass Corridor ${idx + 1}`,
          distanceKm: alt.distanceKm,
          estimatedTravelTime: alt.estimatedTravelTime,
          estimatedDelayMinutes: Math.max(10, Math.round(primaryClassification.level === 'CRITICAL' ? 25 : (altScore * 0.75))),
          riskScore: altScore,
          classification: altClassification,
          path: alt.path,
          accessibilityScore: Math.max(15, Math.round(100 - altScore)),
          majorFactors: 'Bypass passage avoiding primary roadblocks & sector congestion'
        });
      });
    }

    const minRisk = Math.min(...routes.map(r => r.riskScore));
    return routes.map(r => ({
      ...r,
      isSafest: r.riskScore === minRisk
    }));
  }, [routeResult]);

  const activeRoute = useMemo(() => {
    return allRouteOptions.find(r => r.id === selectedRouteId) || allRouteOptions[0] || null;
  }, [allRouteOptions, selectedRouteId]);

  const routePoints = useMemo<[number, number][]>(() => {
    if (activeRoute && activeRoute.path && activeRoute.path.length > 0) {
      return activeRoute.path;
    }
    if (routeResult && routeResult.recommendedRoute && routeResult.recommendedRoute.length > 0) {
      return routeResult.recommendedRoute;
    }
    return [
      [originLoc.lat, originLoc.lng],
      [destLoc.lat, destLoc.lng]
    ];
  }, [activeRoute, routeResult, originLoc.lat, originLoc.lng, destLoc.lat, destLoc.lng]);

  return (
    <div className="max-w-[1920px] mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">Live GIS Route Intelligence</h1>
          <p className="text-[12px] text-cyan-500/80 uppercase tracking-widest font-bold mt-1">
            Dynamic terrain routing, corridor status & accessibility assessment for North Eastern Region
          </p>
        </div>
        {routeResult && (
          <div className="flex items-center gap-2">
            <Badge variant={
              routeResult.routeStatus === 'OPEN' ? 'success' :
              routeResult.routeStatus === 'RESTRICTED' ? 'warning' : 'error'
            }>
              {routeResult.routeStatus.replace('_', ' ')}
            </Badge>
            <span className="text-xs text-gray-500 font-mono">
              PROVIDER: {routeResult.routingProvider === 'OSRM_LIVE' ? 'OSRM Live Road Grid' : 'NER Topological Graph'}
            </span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-lg flex items-center justify-between text-red-400 text-sm font-medium">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-xs underline hover:text-white">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Route Configuration & Action */}
        <div className="space-y-6">
          <Card className="border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0a0c14] shadow-xl">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-500" /> Corridor Selection
            </h3>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="space-y-4">
                  {/* Origin Selector */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-cyan-400" /> Origin Point
                    </label>
                    <select 
                      value={origin} 
                      onChange={e => { setOrigin(e.target.value); setErrorMessage(null); }} 
                      className="w-full bg-white dark:bg-[#05070a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                      {(Object.entries(groupedLocations) as [string, NERLocation[]][]).map(([state, locs]) => (
                        <optgroup key={state} label={state}>
                          {locs.map(loc => (
                            <option key={loc.id} value={loc.name}>
                              {loc.name} ({loc.district}, {loc.state})
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {/* Destination Selector */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" /> Destination Point
                    </label>
                    <select 
                      value={destination} 
                      onChange={e => { setDestination(e.target.value); setErrorMessage(null); }} 
                      className="w-full bg-white dark:bg-[#05070a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                      {(Object.entries(groupedLocations) as [string, NERLocation[]][]).map(([state, locs]) => (
                        <optgroup key={state} label={state}>
                          {locs.map(loc => (
                            <option key={loc.id} value={loc.name}>
                              {loc.name} ({loc.district}, {loc.state})
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Cargo & Vehicle Profile */}
              <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-white/5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Cargo Type</label>
                  <select 
                    value={cargoType} 
                    onChange={e => setCargoType(e.target.value)} 
                    className="w-full bg-white dark:bg-[#05070a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Medical Supplies (Insulin, Vaccines)">Medical Supplies (Insulin, Vaccines)</option>
                    <option value="Emergency Food & Rations">Emergency Food & Rations</option>
                    <option value="Fuel & Petroleum Supplies">Fuel & Petroleum Supplies</option>
                    <option value="Heavy Engineering Equipment">Heavy Engineering Equipment</option>
                    <option value="Standard Commercial Freight">Standard Commercial Freight</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Vehicle Type</label>
                    <select 
                      value={vehicleType} 
                      onChange={e => setVehicleType(e.target.value)} 
                      className="w-full bg-white dark:bg-[#05070a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Standard 4x4 Logistics Carrier">Standard 4x4 Truck</option>
                      <option value="Heavy Multiaxle Carrier">Heavy Multiaxle Carrier</option>
                      <option value="Light Commercial Vehicle (LCV)">Light LCV</option>
                      <option value="High-Clearance 4WD Convoy">High-Clearance 4WD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Priority</label>
                    <select 
                      value={priority} 
                      onChange={e => setPriority(e.target.value as any)} 
                      className="w-full bg-white dark:bg-[#05070a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500 font-bold"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical (Disaster)</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); handleAnalyze(); }} 
                disabled={analyzing || origin === destination}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(8,145,178,0.4)] transition-all flex justify-center items-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {analyzing ? 'Analyzing route accessibility...' : 'Analyze Route'}
              </button>
            </div>
          </Card>

          {/* AI Situational Recommendation */}
          {routeResult && (
            <Card className="border border-cyan-500/30 bg-cyan-950/10 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <ShieldAlert className="w-24 h-24 text-cyan-500" />
              </div>
              <h3 className="text-sm font-bold text-cyan-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Tactical Routing Advisory
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed relative z-10 font-medium">
                {routeResult.aiRecommendation}
              </p>

              {routeResult.nearbyIncidents && routeResult.nearbyIncidents.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-white/10 space-y-2">
                  <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                    ⚠️ {routeResult.nearbyIncidents.length} Incident(s) near transit corridor
                  </div>
                  {routeResult.nearbyIncidents.map(inc => (
                    <div key={inc.id} className="text-xs bg-black/40 p-2 rounded border border-gray-200 dark:border-white/5 flex justify-between items-center">
                      <span className="font-semibold text-gray-200">{inc.title}</span>
                      <span className="text-[10px] text-amber-400 font-mono">~{inc.distanceFromRouteKm} km away</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ML Disruption Analysis Box */}
              {routeResult.mlPrediction && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-white/10 space-y-2">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center justify-between">
                    <span>🧠 ML Disruption Intelligence</span>
                    <span className="text-[9px] text-gray-400 font-mono">Conf: {routeResult.mlPrediction.confidence}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-black/30 p-2 rounded border border-white/5 flex flex-col justify-between">
                      <span className="text-[9px] text-gray-400 uppercase font-bold">Landslide Risk</span>
                      <span className={`text-xs font-bold font-mono ${
                        routeResult.mlPrediction.landslideRisk === 'CRITICAL' ? 'text-red-400' :
                        routeResult.mlPrediction.landslideRisk === 'HIGH' ? 'text-orange-400' :
                        routeResult.mlPrediction.landslideRisk === 'ELEVATED' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {routeResult.mlPrediction.landslideRisk}
                      </span>
                    </div>
                    <div className="bg-black/30 p-2 rounded border border-white/5 flex flex-col justify-between">
                      <span className="text-[9px] text-gray-400 uppercase font-bold">Flood Risk</span>
                      <span className={`text-xs font-bold font-mono ${
                        routeResult.mlPrediction.floodRisk === 'ALERT' ? 'text-red-400' :
                        routeResult.mlPrediction.floodRisk === 'WARNING' ? 'text-orange-400' :
                        routeResult.mlPrediction.floodRisk === 'WATCH' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {routeResult.mlPrediction.floodRisk}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 font-mono">
                    <span>Model: {routeResult.mlPrediction.modelName}</span>
                    <Badge variant="default" className="text-[9px]">{routeResult.mlPrediction.modelVersion}</Badge>
                  </div>
                </div>
              )}

              {routeResult.weatherSummary && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-white/10 space-y-2">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center justify-between">
                    <span>🌦️ Live Corridor Meteorology</span>
                    <span className="text-[9px] text-gray-400">Risk: {routeResult.weatherSummary.overallWeatherRisk}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-black/30 p-2 rounded border border-white/5">
                      <div className="text-[9px] text-gray-400 uppercase">Temp</div>
                      <div className="font-bold text-white font-mono">{routeResult.weatherSummary.originWeather.temperature}°C</div>
                    </div>
                    <div className="bg-black/30 p-2 rounded border border-white/5">
                      <div className="text-[9px] text-gray-400 uppercase">Precip</div>
                      <div className="font-bold text-cyan-400 font-mono">{routeResult.weatherSummary.maxPrecipitationMm}mm</div>
                    </div>
                    <div className="bg-black/30 p-2 rounded border border-white/5">
                      <div className="text-[9px] text-gray-400 uppercase">Vis.</div>
                      <div className="font-bold text-emerald-400 font-mono">{routeResult.weatherSummary.avgVisibilityKm}km</div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right Columns: Interactive GIS Map & Key Metrics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Map Container */}
          <Card noPadding className="h-[460px] relative overflow-hidden group border-gray-200 dark:border-white/5 shadow-2xl bg-gray-50 dark:bg-[#0a0c14] rounded-xl">
            <MapContainer 
              center={[originLoc.lat, originLoc.lng]} 
              zoom={7} 
              className="w-full h-full z-0"
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />

              <MapBoundsFitter points={routePoints} />

              {/* Origin Marker */}
              <Marker position={[originLoc.lat, originLoc.lng]} icon={createPinIcon('#06b6d4', 'A')}>
                <Popup className="custom-popup">
                  <div className="p-1">
                    <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Origin Transit Node</div>
                    <h4 className="font-bold text-sm text-white">{originLoc.name}</h4>
                    <p className="text-xs text-gray-400">{originLoc.district}, {originLoc.state}</p>
                    <p className="text-[10px] text-gray-500 mt-1 font-mono">Elev: {originLoc.elevationMeters}m</p>
                  </div>
                </Popup>
              </Marker>

              {/* Destination Marker */}
              <Marker position={[destLoc.lat, destLoc.lng]} icon={createPinIcon('#10b981', 'B')}>
                <Popup className="custom-popup">
                  <div className="p-1">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Destination Hub</div>
                    <h4 className="font-bold text-sm text-white">{destLoc.name}</h4>
                    <p className="text-xs text-gray-400">{destLoc.district}, {destLoc.state}</p>
                    <p className="text-[10px] text-gray-500 mt-1 font-mono">Elev: {destLoc.elevationMeters}m</p>
                  </div>
                </Popup>
              </Marker>

              {/* Dynamic Route Polylines Classified by Risk Status */}
              {allRouteOptions.map(opt => {
                const isSelected = selectedRouteId === opt.id;
                if (opt.id === 'PRIMARY' && !showPrimaryRoute) return null;
                if (opt.id !== 'PRIMARY' && !showAltRoute) return null;

                return (
                  <Polyline 
                    key={opt.id}
                    positions={opt.path} 
                    pathOptions={{ 
                      color: opt.classification.lineColor, // GREEN (#10b981), YELLOW (#f59e0b), or RED (#ef4444)
                      weight: isSelected ? 6 : 4, 
                      opacity: isSelected ? 1.0 : 0.65,
                      dashArray: isSelected ? undefined : '6, 6'
                    }} 
                  >
                    <Popup className="custom-popup">
                      <div className="p-1.5 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{opt.classification.statusIcon}</span>
                          <span className="text-[10px] font-bold uppercase font-mono" style={{ color: opt.classification.lineColor }}>
                            {opt.classification.statusText}
                          </span>
                          {opt.isSafest && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              Safest
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-sm text-white">{opt.name}</div>
                        <div className="text-xs text-gray-300 mt-1">Distance: <span className="font-mono font-bold">{opt.distanceKm} km</span></div>
                        <div className="text-xs text-gray-300">Est. Time: <span className="font-mono font-bold">{opt.estimatedTravelTime}</span></div>
                        <div className="text-xs text-gray-300">Predicted Delay: <span className="font-mono font-bold text-amber-400">+{opt.estimatedDelayMinutes}m</span></div>
                        <div className="text-xs text-gray-300">Risk Score: <span className="font-mono font-bold" style={{ color: opt.classification.lineColor }}>{opt.riskScore}/100</span></div>
                        <div className="text-[10px] text-gray-400 pt-1 border-t border-white/10">{opt.majorFactors}</div>
                      </div>
                    </Popup>
                  </Polyline>
                );
              })}

              {/* Nearby Incidents Markers */}
              {showIncidents && routeResult && routeResult.nearbyIncidents && routeResult.nearbyIncidents.map(inc => (
                <Marker key={inc.id} position={inc.location} icon={incidentPin}>
                  <Popup className="custom-popup">
                    <div className="p-1">
                      <Badge variant="error" className="mb-1">{inc.severity}</Badge>
                      <h4 className="font-bold text-xs text-white">{inc.title}</h4>
                      <p className="text-[10px] text-gray-400">{inc.locationName}</p>
                      <p className="text-[10px] text-amber-400 mt-1 font-mono">Distance to Corridor: {inc.distanceFromRouteKm} km</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            
            {/* Top-Left Floating Overlay Badge */}
            <div className="absolute top-4 left-4 z-[400] flex gap-2 pointer-events-auto">
              <div className="bg-gray-900/90 border border-white/10 backdrop-blur px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-gray-200 uppercase tracking-widest">
                  {routeResult ? `${routeResult.origin.split(',')[0]} → ${routeResult.destination.split(',')[0]}` : 'GIS Route Navigator'}
                </span>
              </div>
            </div>

            {/* Top-Right Floating Route Risk Legend */}
            <div className="absolute top-4 right-4 z-[400] bg-gray-900/90 backdrop-blur border border-white/10 p-2.5 rounded-lg shadow-2xl text-xs space-y-1.5 pointer-events-auto hidden sm:block">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Route Risk Classification</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
                <span className="text-[10px] text-emerald-400 font-semibold">🟢 Safest / Low Risk (0–35)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]" />
                <span className="text-[10px] text-amber-400 font-semibold">🟡 Moderate Risk (36–65)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]" />
                <span className="text-[10px] text-red-400 font-semibold">🔴 Critical / High Risk (66–100)</span>
              </div>
            </div>

            {/* Bottom Floating Layer Toggles */}
            <div className="absolute bottom-4 right-4 z-[400] bg-gray-900/90 backdrop-blur border border-white/10 p-2.5 rounded-lg flex items-center gap-4 text-xs font-medium text-gray-300 shadow-xl">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={showPrimaryRoute} onChange={e => setShowPrimaryRoute(e.target.checked)} className="rounded text-cyan-500" />
                <span className="text-[11px] text-cyan-400 font-semibold">Primary Route</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={showAltRoute} onChange={e => setShowAltRoute(e.target.checked)} className="rounded text-amber-500" />
                <span className="text-[11px] text-amber-400 font-semibold">Alternate Bypass</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={showIncidents} onChange={e => setShowIncidents(e.target.checked)} className="rounded text-red-500" />
                <span className="text-[11px] text-red-400 font-semibold">Nearby Alerts</span>
              </label>
            </div>
          </Card>

          {/* Key Metrics Cards */}
          {routeResult && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card className="p-3.5 flex flex-col justify-between border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0a0c14]">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Navigation className="w-3.5 h-3.5 text-cyan-500" />
                  </div>
                  <span className="text-[9px] font-bold text-cyan-500 uppercase tracking-wider font-mono">Distance</span>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Total Route</div>
                  <div className="text-xl font-bold font-mono text-gray-900 dark:text-white">{routeResult.distanceKm} km</div>
                </div>
              </Card>

              <Card className="p-3.5 flex flex-col justify-between border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0a0c14]">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider font-mono">ETA</span>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Est. Travel</div>
                  <div className="text-xl font-bold font-mono text-gray-900 dark:text-white">{routeResult.estimatedTravelTime}</div>
                </div>
              </Card>

              <Card className="p-3.5 flex flex-col justify-between border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0a0c14]">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider font-mono">ML Delay</span>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Predicted Delay</div>
                  <div className="text-xl font-bold font-mono text-amber-500">
                    +{routeResult.mlPrediction ? routeResult.mlPrediction.estimatedDelayMinutes : routeResult.estimatedDelayMinutes}m
                  </div>
                </div>
              </Card>

              <Card className="p-3.5 flex flex-col justify-between border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0a0c14]">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <Badge variant={
                    (routeResult.mlPrediction?.riskLevel === 'CRITICAL' || routeResult.prototypeRiskScore > 75) ? 'error' :
                    (routeResult.mlPrediction?.riskLevel === 'HIGH' || routeResult.prototypeRiskScore > 50) ? 'warning' : 'success'
                  }>
                    {routeResult.mlPrediction?.riskLevel || 'NORMAL'}
                  </Badge>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Disruption Prob</div>
                  <div className="text-xl font-bold font-mono text-gray-900 dark:text-white">
                    {routeResult.mlPrediction ? routeResult.mlPrediction.disruptionProbability : routeResult.prototypeRiskScore}%
                  </div>
                </div>
              </Card>

              <Card className="p-3.5 flex flex-col justify-between border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0a0c14]">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                  </div>
                  <span className="text-[9px] font-bold text-cyan-500 uppercase tracking-wider font-mono">Index</span>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Accessibility</div>
                  <div className="text-xl font-bold font-mono text-gray-900 dark:text-white">{routeResult.accessibilityScore}%</div>
                </div>
              </Card>
            </div>
          )}

          {/* Multi-Route Risk Comparison Matrix & Selection */}
          {routeResult && allRouteOptions.length > 0 && (
            <Card className="border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0a0c14] shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 dark:border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-500" /> Evaluated Corridor Options & Risk Classification
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Select a route to highlight on the GIS map canvas. Route lines and cards share unified risk classification.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400 font-semibold">{allRouteOptions.length} Evaluated Corridors</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allRouteOptions.map(opt => {
                  const isSelected = selectedRouteId === opt.id;
                  return (
                    <div 
                      key={opt.id}
                      onClick={() => setSelectedRouteId(opt.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between gap-3 ${
                        isSelected 
                          ? 'border-cyan-500 bg-cyan-500/5 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500' 
                          : 'border-gray-200 dark:border-white/5 bg-white dark:bg-[#05070a] hover:border-gray-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{opt.classification.statusIcon}</span>
                            <span className={`text-xs font-bold uppercase tracking-wider font-mono ${
                              opt.classification.level === 'LOW' ? 'text-emerald-500' :
                              opt.classification.level === 'MODERATE' ? 'text-amber-500' : 'text-red-500'
                            }`}>
                              {opt.classification.statusText}
                            </span>
                          </div>
                          {opt.isSafest && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Safest Option
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-snug">{opt.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{opt.majorFactors}</p>
                      </div>

                      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-200 dark:border-white/10 text-center">
                        <div>
                          <div className="text-[9px] text-gray-500 uppercase font-bold">Distance</div>
                          <div className="text-xs font-bold font-mono text-gray-800 dark:text-gray-200">{opt.distanceKm} km</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-gray-500 uppercase font-bold">Est. Time</div>
                          <div className="text-xs font-bold font-mono text-gray-800 dark:text-gray-200">{opt.estimatedTravelTime}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-gray-500 uppercase font-bold">Delay</div>
                          <div className="text-xs font-bold font-mono text-amber-500">+{opt.estimatedDelayMinutes}m</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-gray-500 uppercase font-bold">Risk Score</div>
                          <div className={`text-xs font-bold font-mono ${
                            opt.classification.level === 'LOW' ? 'text-emerald-500' :
                            opt.classification.level === 'MODERATE' ? 'text-amber-500' : 'text-red-500'
                          }`}>
                            {opt.riskScore}/100
                          </div>
                        </div>
                      </div>

                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedRouteId(opt.id); }}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isSelected 
                            ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.3)]' 
                            : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                        }`}
                      >
                        {isSelected ? '✓ Active Route on Map' : 'Highlight on Map'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}

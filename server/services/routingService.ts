import { NERLocation, findLocation, NER_LOCATIONS } from '../data/nerLocations.js';
import { db, Incident } from '../db/database.js';
import { getRouteWeatherSummary, RouteWeatherSummary } from './weatherService.js';
import { mlRiskService, MLRiskPrediction } from './mlRiskService.js';

export interface RouteAnalysisRequest {
  origin: string;
  destination: string;
  cargoType?: string;
  vehicleType?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface RouteAnalysisResult {
  origin: string;
  destination: string;
  originLocation: NERLocation;
  destinationLocation: NERLocation;
  distanceKm: number;
  estimatedTravelTime: string;
  estimatedDelayMinutes: number;
  accessibilityScore: number;
  prototypeRiskScore: number;
  routeStatus: 'OPEN' | 'RESTRICTED' | 'HIGH_RISK' | 'CRITICAL_BLOCKADE';
  routingProvider: 'OSRM_LIVE' | 'NER_TOPOLOGICAL_FALLBACK';
  recommendedRoute: [number, number][]; // [lat, lng] array
  alternativeRoutes: {
    id: string;
    name: string;
    distanceKm: number;
    estimatedTravelTime: string;
    prototypeRiskScore: number;
    path: [number, number][];
  }[];
  nearbyIncidents: {
    id: string;
    title: string;
    type: string;
    severity: string;
    locationName: string;
    location: [number, number];
    distanceFromRouteKm: number;
  }[];
  weatherSummary?: RouteWeatherSummary;
  mlPrediction: MLRiskPrediction;
  aiRecommendation: string;
  analysisTimestamp: string;
}

// In-memory cache for fast repeat queries during current session
const routeCache = new Map<string, { result: RouteAnalysisResult; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Minimum distance from a point to a polyline segment
function getDistanceToPolylineKm(point: [number, number], polyline: [number, number][]): number {
  if (polyline.length === 0) return 9999;
  let minDistance = Infinity;

  for (let i = 0; i < polyline.length; i++) {
    const d = calculateHaversineKm(point[0], point[1], polyline[i][0], polyline[i][1]);
    if (d < minDistance) minDistance = d;
  }
  return minDistance;
}

// Intermediate hub waypoints for known mountain highway corridors in NER
const KNOWN_CORRIDOR_WAYPOINTS: Record<string, [number, number][]> = {
  // Guwahati <-> Aizawl via Shillong, Jowai, Silchar, Kolasib
  'Guwahati->Aizawl': [
    [26.1445, 91.7362], // Guwahati
    [25.8500, 91.8800], // Nongpoh
    [25.5788, 91.8933], // Shillong
    [25.4500, 92.2000], // Jowai
    [25.1000, 92.5000], // Sonapur Tunnel
    [24.8333, 92.7789], // Silchar
    [24.2300, 92.6800], // Kolasib
    [23.7307, 92.7173]  // Aizawl
  ],
  // Shillong <-> Imphal via Jowai, Silchar, Jiribam, Noney
  'Shillong->Imphal': [
    [25.5788, 91.8933], // Shillong
    [25.4500, 92.2000], // Jowai
    [24.8333, 92.7789], // Silchar
    [24.8000, 93.1200], // Jiribam
    [24.7500, 93.6000], // Noney
    [24.8170, 93.9368]  // Imphal
  ],
  // Guwahati <-> Itanagar via Nagaon, Tezpur, Gohpur, Banderdewa
  'Guwahati->Itanagar': [
    [26.1445, 91.7362], // Guwahati
    [26.3500, 92.6800], // Nagaon
    [26.6528, 92.7926], // Tezpur
    [26.8800, 93.6100], // Gohpur
    [27.0500, 93.8000], // Banderdewa
    [27.0844, 93.6053]  // Itanagar
  ],
  // Gangtok <-> Guwahati via Singtam, Melli, Siliguri, Alipurduar, Bongaigaon
  'Gangtok->Guwahati': [
    [27.3389, 88.6065], // Gangtok
    [27.2300, 88.5000], // Singtam
    [27.0500, 88.5200], // Melli (NH-10)
    [26.7271, 88.3953], // Siliguri
    [26.5000, 89.5000], // Alipurduar
    [26.4700, 90.5500], // Bongaigaon
    [26.1445, 91.7362]  // Guwahati
  ],
  // Aizawl <-> Agartala via Mamit, Kanchanpur, Kumarghat, Teliamura
  'Aizawl->Agartala': [
    [23.7307, 92.7173], // Aizawl
    [23.9300, 92.4800], // Mamit
    [23.9800, 92.2200], // Kanchanpur
    [24.1500, 92.0200], // Kumarghat
    [23.8500, 91.6000], // Teliamura
    [23.8315, 91.2868]  // Agartala
  ],
  // Kohima <-> Imphal via Mao Gate, Maram, Senapati, Kangpokpi (NH-02)
  'Kohima->Imphal': [
    [25.6751, 94.1086], // Kohima
    [25.5000, 94.1400], // Mao Gate
    [25.3800, 94.0200], // Maram
    [25.2600, 94.0100], // Senapati
    [25.1500, 93.9700], // Kangpokpi
    [24.8170, 93.9368]  // Imphal
  ]
};

// Generate reverse corridor keys automatically
Object.keys(KNOWN_CORRIDOR_WAYPOINTS).forEach(key => {
  const [from, to] = key.split('->');
  const reverseKey = `${to}->${from}`;
  if (!KNOWN_CORRIDOR_WAYPOINTS[reverseKey]) {
    KNOWN_CORRIDOR_WAYPOINTS[reverseKey] = [...KNOWN_CORRIDOR_WAYPOINTS[key]].reverse();
  }
});

// Fallback topological interpolation between any 2 NER points
function generateTopologicalFallback(origin: NERLocation, dest: NERLocation): [number, number][] {
  const directKey = `${origin.name}->${dest.name}`;
  if (KNOWN_CORRIDOR_WAYPOINTS[directKey]) {
    return KNOWN_CORRIDOR_WAYPOINTS[directKey];
  }

  const waypoints: [number, number][] = [[origin.lat, origin.lng]];
  const midLat = (origin.lat + dest.lat) / 2;
  const midLng = (origin.lng + dest.lng) / 2;

  waypoints.push([midLat + 0.15, midLng - 0.12]);
  waypoints.push([midLat - 0.08, midLng + 0.18]);
  waypoints.push([dest.lat, dest.lng]);

  return waypoints;
}

// Generate alternative bypass path
function generateAlternateBypass(primaryRoute: [number, number][]): [number, number][] {
  if (primaryRoute.length < 2) return primaryRoute;
  const start = primaryRoute[0];
  const end = primaryRoute[primaryRoute.length - 1];

  const midIndex = Math.floor(primaryRoute.length / 2);
  const mid = primaryRoute[midIndex];

  const offsetLat = mid[0] - 0.28;
  const offsetLng = mid[1] + 0.35;

  return [
    start,
    [primaryRoute[1][0] - 0.1, primaryRoute[1][1] + 0.15],
    [offsetLat, offsetLng],
    [end[0] + 0.05, end[1] - 0.1],
    end
  ];
}

// Call live OSRM public service with short timeout
async function fetchOSRM(origin: NERLocation, dest: NERLocation): Promise<{
  path: [number, number][];
  distanceKm: number;
  durationMinutes: number;
  altPath?: [number, number][];
} | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson&alternatives=true&steps=false`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });

    if (!res.ok) return null;
    const data = await res.json();

    if (!data.routes || data.routes.length === 0) return null;

    const primary = data.routes[0];
    const path: [number, number][] = primary.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
    const distanceKm = Math.round(primary.distance / 1000);
    const durationMinutes = Math.round(primary.duration / 60);

    let altPath: [number, number][] | undefined = undefined;
    if (data.routes.length > 1) {
      altPath = data.routes[1].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
    }

    return { path, distanceKm, durationMinutes, altPath };
  } catch (err) {
    return null;
  }
}

export async function analyzeRoute(req: RouteAnalysisRequest): Promise<RouteAnalysisResult> {
  const originLoc = findLocation(req.origin);
  const destLoc = findLocation(req.destination);

  if (!originLoc) {
    throw new Error(`Origin location "${req.origin}" is not a recognized NER hub.`);
  }
  if (!destLoc) {
    throw new Error(`Destination location "${req.destination}" is not a recognized NER hub.`);
  }
  if (originLoc.id === destLoc.id) {
    throw new Error('Origin and Destination cannot be the same location.');
  }

  const cacheKey = `${originLoc.id}_${destLoc.id}_${req.cargoType || 'ALL'}_${req.priority || 'MED'}_${req.vehicleType || 'STD'}`;
  const cached = routeCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.result;
  }

  // 1. Fetch real road path from OSRM, or fallback to topological highway coordinates
  let routingProvider: 'OSRM_LIVE' | 'NER_TOPOLOGICAL_FALLBACK' = 'OSRM_LIVE';
  let recommendedRoute: [number, number][] = [];
  let distanceKm = 0;
  let durationMinutes = 0;
  let osrmAltPath: [number, number][] | undefined = undefined;

  const osrmResult = await fetchOSRM(originLoc, destLoc);

  if (osrmResult && osrmResult.path.length > 2) {
    recommendedRoute = osrmResult.path;
    distanceKm = osrmResult.distanceKm;
    durationMinutes = osrmResult.durationMinutes;
    osrmAltPath = osrmResult.altPath;
  } else {
    routingProvider = 'NER_TOPOLOGICAL_FALLBACK';
    recommendedRoute = generateTopologicalFallback(originLoc, destLoc);
    const aerialKm = calculateHaversineKm(originLoc.lat, originLoc.lng, destLoc.lat, destLoc.lng);
    distanceKm = Math.round(Math.max(40, aerialKm * 1.48));
    durationMinutes = Math.round((distanceKm / 38) * 60);
  }

  // 2. Incident & Field Report Corridor Intersections
  const activeIncidents = db.getIncidents().filter(i => i.status === 'ACTIVE');
  const nearbyIncidents = activeIncidents
    .map(inc => {
      const dist = getDistanceToPolylineKm(inc.location, recommendedRoute);
      return {
        id: inc.id,
        title: inc.title,
        type: inc.type,
        severity: inc.severity,
        locationName: inc.locationName,
        location: inc.location,
        distanceFromRouteKm: Math.round(dist * 10) / 10
      };
    })
    .filter(inc => inc.distanceFromRouteKm <= 40)
    .sort((a, b) => a.distanceFromRouteKm - b.distanceFromRouteKm);

  // 3. Meteorological Weather Assessment
  let weatherSummary: RouteWeatherSummary | undefined = undefined;
  try {
    weatherSummary = await getRouteWeatherSummary(originLoc.name, destLoc.name, recommendedRoute);
  } catch (wErr) {
    // Gracefully handle if weather lookup has issue
  }

  // 4. ML Logistics Disruption Model Inference
  const hasCritical = nearbyIncidents.some(i => i.severity === 'CRITICAL');
  const hasWarning = nearbyIncidents.some(i => i.severity === 'WARNING');

  const maxPrecipitation = weatherSummary?.maxPrecipitationMm ?? 0;
  const precipIntensity = maxPrecipitation > 45 ? 4 : maxPrecipitation > 25 ? 3 : maxPrecipitation > 10 ? 2 : maxPrecipitation > 0 ? 1 : 0;
  const maxElevation = Math.max(originLoc.elevationMeters, destLoc.elevationMeters);
  const terrainFactor = maxElevation > 2000 ? 3 : maxElevation > 1000 ? 2 : maxElevation > 300 ? 1 : 0;
  const maxIncidentSeverity = hasCritical ? 3 : hasWarning ? 2 : nearbyIncidents.length > 0 ? 1 : 0;

  const mlPrediction = mlRiskService.predictRisk({
    rainfallMm: maxPrecipitation,
    rainfallIntensity: precipIntensity,
    elevationMeters: maxElevation,
    terrainFactor,
    historicalIncidents: 3,
    activeIncidentsNearby: nearbyIncidents.length,
    roadCondition: hasCritical ? 3.0 : hasWarning ? 5.5 : 8.0,
    bridgeCondition: hasCritical ? 4.0 : 8.5,
    trafficLevel: hasCritical ? 3 : hasWarning ? 2 : 1,
    routeDistanceKm: distanceKm,
    routeDurationMinutes: durationMinutes,
    incidentSeverity: maxIncidentSeverity
  });

  const prototypeRiskScore = mlPrediction.riskScore;
  const estimatedDelayMinutes = mlPrediction.estimatedDelayMinutes;
  const accessibilityScore = Math.max(8, Math.round(100 - prototypeRiskScore));

  let routeStatus: 'OPEN' | 'RESTRICTED' | 'HIGH_RISK' | 'CRITICAL_BLOCKADE' = 'OPEN';
  if (prototypeRiskScore >= 78) routeStatus = 'CRITICAL_BLOCKADE';
  else if (prototypeRiskScore >= 55) routeStatus = 'HIGH_RISK';
  else if (prototypeRiskScore >= 30) routeStatus = 'RESTRICTED';

  // 5. Alternate Routes
  const alternatePath = osrmAltPath || generateAlternateBypass(recommendedRoute);
  const altDistanceKm = Math.round(distanceKm * 1.14);
  const altDurationMinutes = Math.round(durationMinutes * 1.18);
  const altRiskScore = hasCritical ? Math.max(20, prototypeRiskScore - 30) : prototypeRiskScore + 5;

  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  const estimatedTravelTime = `${hours}h ${mins}m`;

  const altHours = Math.floor(altDurationMinutes / 60);
  const altMins = altDurationMinutes % 60;

  // 6. Situational Advice / AI Recommendation
  let aiRecommendation = `Corridor from ${originLoc.name} (${originLoc.state}) to ${destLoc.name} (${destLoc.state}) is operational. Accessibility index: ${accessibilityScore}%. ML Disruption Risk: ${mlPrediction.riskLevel} (${mlPrediction.disruptionProbability}%).`;

  if (hasCritical) {
    const crit = nearbyIncidents.find(i => i.severity === 'CRITICAL')!;
    aiRecommendation = `CRITICAL DISRUPTION: ${crit.title} near ${crit.locationName} (${crit.distanceFromRouteKm} km from route). Primary passage is heavily delayed. Divert priority ${req.cargoType || 'cargo'} via Alternative Bypass (+${estimatedDelayMinutes}m delay, recommended for safety).`;
  } else if (hasWarning) {
    const warn = nearbyIncidents.find(i => i.severity === 'WARNING')!;
    aiRecommendation = `TRANSIT CAUTION: ${warn.title} near ${warn.locationName}. High-clearance vehicles recommended. Exercise caution during mountain ghat transit.`;
  }

  if (weatherSummary && weatherSummary.overallWeatherRisk !== 'LOW') {
    aiRecommendation += ` [Weather Alert: ${weatherSummary.meteorologicalAdvisory}]`;
  }

  const result: RouteAnalysisResult = {
    origin: `${originLoc.name}, ${originLoc.state}`,
    destination: `${destLoc.name}, ${destLoc.state}`,
    originLocation: originLoc,
    destinationLocation: destLoc,
    distanceKm,
    estimatedTravelTime,
    estimatedDelayMinutes,
    accessibilityScore,
    prototypeRiskScore,
    routeStatus,
    routingProvider,
    recommendedRoute,
    alternativeRoutes: [
      {
        id: 'ALT-CORRIDOR-01',
        name: `Bypass Corridor via ${originLoc.connectedCorridors[0] || 'Regional Highway'} Alternate`,
        distanceKm: altDistanceKm,
        estimatedTravelTime: `${altHours}h ${altMins}m`,
        prototypeRiskScore: altRiskScore,
        path: alternatePath
      }
    ],
    nearbyIncidents,
    weatherSummary,
    mlPrediction,
    aiRecommendation,
    analysisTimestamp: new Date().toISOString()
  };

  routeCache.set(cacheKey, { result, timestamp: Date.now() });
  return result;
}

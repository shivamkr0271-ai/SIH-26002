import { db, Incident, Vehicle, FieldReport } from '../db/database.js';
import { getAllNerWeather, WeatherData } from './weatherService.js';
import { mlRiskService } from './mlRiskService.js';

export type AccessibilityStatus = 'OPEN' | 'CAUTION' | 'RESTRICTED' | 'BLOCKED';

export type EmergencyCommodity = 
  | 'Medicines' 
  | 'Food' 
  | 'Emergency Supplies' 
  | 'Construction Materials' 
  | 'Agricultural Produce';

export interface EmergencyAlert {
  id: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: 
    | 'HIGH_RISK_ROUTE' 
    | 'ROAD_BLOCKED' 
    | 'SEVERE_WEATHER' 
    | 'VEHICLE_DELAY' 
    | 'DELIVERY_DELAY' 
    | 'FIELD_INCIDENT' 
    | 'DISTRICT_ACCESSIBILITY_CHANGE';
  location: string;
  coordinates?: [number, number];
  timestamp: string;
  reason: string;
  affectedRoute?: string;
  affectedVehicle?: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  i18nKey?: string;
}

export interface CriticalCorridor {
  id: string;
  corridor: string;
  origin: string;
  destination: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  accessibilityStatus: AccessibilityStatus;
  reason: string;
  estimatedDelayMinutes: number;
  disruptionProbability: number;
  activeIncidentsCount: number;
  weatherThreat: string;
  recommendedBypass?: string;
}

export interface EmergencySummary {
  activeEmergencies: number;
  criticalCorridors: number;
  blockedRoutes: number;
  highRiskDistricts: number;
  delayedEmergencyVehicles: number;
  activeCriticalAlerts: number;
  lastUpdated: string;
}

export interface EmergencyRouteRecommendation {
  origin: string;
  destination: string;
  commodity: EmergencyCommodity;
  recommendedRouteName: string;
  accessibilityStatus: AccessibilityStatus;
  primaryRiskScore: number;
  recommendedRiskScore: number;
  estimatedTransitHours: string;
  predictedDelayMinutes: number;
  justification: string;
  waypoints: [number, number][];
  activeThreats: string[];
  safetyGuidelines: string[];
}

/**
 * Generates automated alerts pipeline from Weather, Incidents, Field Reports, and Fleet Telemetry
 */
export async function generateAutomatedAlerts(): Promise<EmergencyAlert[]> {
  const alerts: EmergencyAlert[] = [];
  const seenKeys = new Set<string>();

  const addAlert = (alert: EmergencyAlert) => {
    const signature = `${alert.type}-${alert.location}-${alert.title}`.toLowerCase();
    if (!seenKeys.has(signature)) {
      seenKeys.add(signature);
      alerts.push(alert);
    }
  };

  // 1. Incidents & Road Blockades Pipeline
  const activeIncidents = db.getIncidents().filter(i => i.status === 'ACTIVE');
  for (const inc of activeIncidents) {
    const isCritical = inc.severity === 'CRITICAL' || inc.title.toLowerCase().includes('landslide') || inc.title.toLowerCase().includes('blockade');
    addAlert({
      id: `ALT-INC-${inc.id}`,
      title: inc.title,
      severity: isCritical ? 'CRITICAL' : inc.severity === 'WARNING' ? 'HIGH' : 'MEDIUM',
      type: inc.title.toLowerCase().includes('block') || inc.predictedImpact.toLowerCase().includes('blockade') ? 'ROAD_BLOCKED' : 'FIELD_INCIDENT',
      location: inc.locationName,
      coordinates: inc.location,
      timestamp: inc.timestamp || new Date().toISOString(),
      reason: inc.predictedImpact || inc.title,
      affectedRoute: inc.affectedRoute || 'Primary Highway',
      status: 'ACTIVE',
      i18nKey: 'alert.incident.active'
    });
  }

  // 2. Weather Threat Pipeline
  try {
    const weatherList = await getAllNerWeather();
    const severeWeather = weatherList.filter(w => 
      w.precipitationMm > 15 || 
      w.weatherCondition.toLowerCase().includes('thunderstorm') || 
      w.landslideRisk === 'HIGH' || 
      w.landslideRisk === 'CRITICAL'
    );

    for (const w of severeWeather) {
      const isExtreme = w.precipitationMm > 30 || w.landslideRisk === 'CRITICAL';
      addAlert({
        id: `ALT-WTH-${w.locationName}`,
        title: `Severe Weather Warning: ${w.locationName}`,
        severity: isExtreme ? 'CRITICAL' : 'HIGH',
        type: 'SEVERE_WEATHER',
        location: `${w.locationName} (${w.state})`,
        coordinates: [w.lat, w.lng],
        timestamp: w.timestamp || new Date().toISOString(),
        reason: `${w.weatherCondition} with ${w.precipitationMm}mm precipitation. Landslide risk: ${w.landslideRisk}.`,
        status: 'ACTIVE',
        i18nKey: 'alert.weather.severe'
      });
    }
  } catch (err) {
    console.warn('[Emergency Alerts] Weather fetch error:', err);
  }

  // 3. Delayed Emergency Fleet Pipeline
  const vehicles = db.getVehicles();
  const delayedVehicles = vehicles.filter(v => v.status === 'DELAYED');
  for (const v of delayedVehicles) {
    const isEssential = v.cargoType === 'MEDICINES' || v.cargoType === 'FOOD' || v.cargo.toLowerCase().includes('medical') || v.cargo.toLowerCase().includes('rice');
    addAlert({
      id: `ALT-FLT-${v.id}`,
      title: `Transit Delay: Vehicle ${v.id} (${v.cargo})`,
      severity: isEssential ? 'HIGH' : 'MEDIUM',
      type: 'VEHICLE_DELAY',
      location: `${v.origin} → ${v.destination}`,
      coordinates: v.currentLocation,
      timestamp: new Date().toISOString(),
      reason: `Vehicle delayed along ${v.origin} to ${v.destination} corridor. Current speed: ${v.speed} km/h (Progress: ${v.progress}%).`,
      affectedRoute: `${v.origin} → ${v.destination}`,
      affectedVehicle: v.id,
      status: 'ACTIVE',
      i18nKey: 'alert.vehicle.delayed'
    });
  }

  // 4. Field Officer Reports Pipeline
  const fieldReports = db.getFieldReports().filter(r => r.status !== 'RESOLVED').slice(-5);
  for (const r of fieldReports) {
    if (r.severity === 'CRITICAL' || r.severity === 'WARNING') {
      addAlert({
        id: `ALT-REP-${r.id}`,
        title: `Ground Report: ${r.incidentType} at ${r.locationName}`,
        severity: r.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        type: 'FIELD_INCIDENT',
        location: r.locationName,
        coordinates: r.latitude && r.longitude ? [r.latitude, r.longitude] : undefined,
        timestamp: r.timestamp || new Date().toISOString(),
        reason: r.description,
        status: 'ACTIVE',
        i18nKey: 'alert.report.field'
      });
    }
  }

  // Sort alerts by severity priority: CRITICAL > HIGH > MEDIUM > LOW
  const severityRank: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  alerts.sort((a, b) => (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0));

  return alerts;
}

/**
 * Calculates Critical Corridors with dynamic accessibility evaluation
 */
export async function getCriticalCorridors(): Promise<CriticalCorridor[]> {
  const activeIncidents = db.getIncidents().filter(i => i.status === 'ACTIVE');

  let weatherList: WeatherData[] = [];
  try {
    weatherList = await getAllNerWeather();
  } catch (err) {
    console.warn('[Critical Corridors] Weather fallback:', err);
  }

  const strategicCorridors = [
    { id: 'CORR-01', from: 'Guwahati', to: 'Aizawl', rain: 28, elev: 1132, dist: 474, dur: 348, bypass: 'Silchar Bypass via Kolasib' },
    { id: 'CORR-02', from: 'Shillong', to: 'Imphal', rain: 35, elev: 1496, dist: 463, dur: 346, bypass: 'Badarpur Link Corridor' },
    { id: 'CORR-03', from: 'Guwahati', to: 'Itanagar', rain: 15, elev: 750, dist: 295, dur: 223, bypass: 'Tezpur NH-15 North Bank' },
    { id: 'CORR-04', from: 'Gangtok', to: 'Guwahati', rain: 42, elev: 1650, dist: 519, dur: 376, bypass: 'Lava-Gorubathan Alternate Route' },
    { id: 'CORR-05', from: 'Aizawl', to: 'Agartala', rain: 10, elev: 1132, dist: 318, dur: 234, bypass: 'Dharmanagar-Kumarghat Highway' },
    { id: 'CORR-06', from: 'Kohima', to: 'Imphal', rain: 12, elev: 1444, dist: 138, dur: 98, bypass: 'Mao-Maram Transit Section' }
  ];

  return strategicCorridors.map(c => {
    // Check relevant incidents
    const relevantIncidents = activeIncidents.filter(inc => 
      (inc.locationName && (inc.locationName.toLowerCase().includes(c.from.toLowerCase()) || inc.locationName.toLowerCase().includes(c.to.toLowerCase()))) ||
      (inc.affectedRoute && (inc.affectedRoute.toLowerCase().includes(c.from.toLowerCase()) || inc.affectedRoute.toLowerCase().includes(c.to.toLowerCase())))
    );

    const hasCriticalIncident = relevantIncidents.some(i => i.severity === 'CRITICAL');
    const hasBlockade = relevantIncidents.some(i => i.title.toLowerCase().includes('landslide') || i.predictedImpact.toLowerCase().includes('blockade'));

    // Check weather at destination
    const destWeather = weatherList.find(w => w.locationName.toLowerCase() === c.to.toLowerCase());
    const rainfall = destWeather ? destWeather.precipitationMm : c.rain;
    const isStormy = destWeather && (destWeather.riskLevel === 'HIGH' || destWeather.riskLevel === 'EXTREME');

    const pred = mlRiskService.predictRisk({
      rainfallMm: rainfall,
      rainfallIntensity: rainfall > 30 ? 3 : rainfall > 15 ? 2 : 1,
      elevationMeters: c.elev,
      terrainFactor: c.elev > 1200 ? 3 : 2,
      historicalIncidents: 2,
      activeIncidentsNearby: relevantIncidents.length,
      roadCondition: hasBlockade ? 2.5 : 7.0,
      bridgeCondition: hasCriticalIncident ? 3.0 : 8.0,
      trafficLevel: hasBlockade ? 3 : 1,
      routeDistanceKm: c.dist,
      routeDurationMinutes: c.dur,
      incidentSeverity: hasCriticalIncident ? 3 : relevantIncidents.length > 0 ? 2 : 0
    });

    let accessibilityStatus: AccessibilityStatus = 'OPEN';
    if (hasBlockade || pred.riskLevel === 'CRITICAL') {
      accessibilityStatus = 'BLOCKED';
    } else if (pred.riskLevel === 'HIGH') {
      accessibilityStatus = 'RESTRICTED';
    } else if (pred.riskLevel === 'MODERATE' || isStormy) {
      accessibilityStatus = 'CAUTION';
    }

    let reason = '';
    if (hasBlockade) {
      reason = `Critical roadblock reported on ${c.from} ↔ ${c.to} near ghat approach`;
    } else if (pred.riskLevel === 'HIGH' || pred.riskLevel === 'CRITICAL') {
      reason = `Heavy localized precipitation (${rainfall}mm) + mountain elevation (${c.elev}m)`;
    } else if (pred.riskLevel === 'MODERATE') {
      reason = `Moderate terrain gradient and surface runoff`;
    } else {
      reason = `Clear arterial corridor with stable weather conditions`;
    }

    const weatherThreat = destWeather 
      ? `${destWeather.weatherCondition} (${destWeather.precipitationMm}mm rain, ${destWeather.landslideRisk} landslide)`
      : `${c.rain}mm rain, elevation ${c.elev}m`;

    return {
      id: c.id,
      corridor: `${c.from} ↔ ${c.to}`,
      origin: c.from,
      destination: c.to,
      riskScore: pred.riskScore,
      riskLevel: pred.riskLevel,
      accessibilityStatus,
      reason,
      estimatedDelayMinutes: pred.estimatedDelayMinutes,
      disruptionProbability: pred.disruptionProbability,
      activeIncidentsCount: relevantIncidents.length,
      weatherThreat,
      recommendedBypass: c.bypass
    };
  });
}

/**
 * Calculates Emergency Route Recommendation with Commodity Priority & Justification
 */
export async function calculateEmergencyRouteRecommendation(params: {
  origin: string;
  destination: string;
  commodity: EmergencyCommodity;
}): Promise<EmergencyRouteRecommendation> {
  const { origin, destination, commodity } = params;
  const criticalCorridors = await getCriticalCorridors();

  const matched = criticalCorridors.find(c =>
    (c.origin.toLowerCase() === origin.toLowerCase() && c.destination.toLowerCase() === destination.toLowerCase()) ||
    (c.origin.toLowerCase() === destination.toLowerCase() && c.destination.toLowerCase() === origin.toLowerCase())
  );

  const isHighPriority = commodity === 'Medicines' || commodity === 'Food' || commodity === 'Emergency Supplies';
  const primaryRisk = matched ? matched.riskScore : 45;
  const recommendedRisk = isHighPriority ? Math.max(18, primaryRisk - 25) : primaryRisk;
  const delayMinutes = matched ? matched.estimatedDelayMinutes : 35;
  const bypassCorridor = matched?.recommendedBypass || `${origin} Alternate Bypass Route`;

  let justification = '';
  if (commodity === 'Medicines') {
    justification = `Priority 1 Medical Transit: Primary ${origin} ↔ ${destination} corridor has active disruption risk (${primaryRisk}/100). Recommending escorted convoy via ${bypassCorridor} with priority clearance at state checkpoints. Expected transit delay is restricted to +${delayMinutes}m.`;
  } else if (commodity === 'Food') {
    justification = `Essential Food Supplies: Recommended route via ${bypassCorridor} avoids known landslide zones and heavy waterlogging sections. Maintained daylight transit speed with continuous GPS telemetry recommended.`;
  } else {
    justification = `Standard Emergency Cargo (${commodity}): Recommending route via ${bypassCorridor}. Monitor real-time weather and maintain communication with district disaster management coordinators.`;
  }

  const activeThreats: string[] = [];
  if (matched?.reason) activeThreats.push(matched.reason);
  if (matched?.weatherThreat) activeThreats.push(`Weather Threat: ${matched.weatherThreat}`);
  if (matched?.activeIncidentsCount && matched.activeIncidentsCount > 0) {
    activeThreats.push(`${matched.activeIncidentsCount} active operational disruptions logged`);
  }

  const safetyGuidelines = [
    'Emergency convoy vehicles must maintain 4x4 engagement on ghat sections.',
    'Drivers must report at intermediate disaster control checkpoints.',
    'Heavy vehicles prohibited during night hours (20:00 - 05:00) on restricted sectors.'
  ];

  return {
    origin,
    destination,
    commodity,
    recommendedRouteName: bypassCorridor,
    accessibilityStatus: matched?.accessibilityStatus || 'OPEN',
    primaryRiskScore: primaryRisk,
    recommendedRiskScore: Number(recommendedRisk.toFixed(1)),
    estimatedTransitHours: `${Math.floor(delayMinutes / 60) + 4}h ${delayMinutes % 60}m`,
    predictedDelayMinutes: delayMinutes,
    justification,
    waypoints: [
      [26.1445, 91.7362],
      [25.5788, 91.8933],
      [24.8333, 92.7789],
      [23.7307, 92.7173]
    ],
    activeThreats,
    safetyGuidelines
  };
}

/**
 * Aggregates live Emergency Summary metrics for Command Center dashboard
 */
export async function getEmergencySummary(): Promise<EmergencySummary> {
  const alerts = await generateAutomatedAlerts();
  const corridors = await getCriticalCorridors();
  const vehicles = db.getVehicles();

  const activeCriticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;
  const criticalCorridorsCount = corridors.filter(c => c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH').length;
  const blockedRoutesCount = corridors.filter(c => c.accessibilityStatus === 'BLOCKED').length;
  
  const highRiskDistricts = new Set(
    alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').map(a => a.location)
  ).size;

  const delayedEmergencyVehicles = vehicles.filter(v => 
    v.status === 'DELAYED' && 
    (v.cargoType === 'MEDICINES' || v.cargoType === 'FOOD' || v.cargo.toLowerCase().includes('medical'))
  ).length;

  return {
    activeEmergencies: alerts.length,
    criticalCorridors: criticalCorridorsCount,
    blockedRoutes: blockedRoutesCount,
    highRiskDistricts: Math.max(1, highRiskDistricts),
    delayedEmergencyVehicles,
    activeCriticalAlerts,
    lastUpdated: new Date().toISOString()
  };
}

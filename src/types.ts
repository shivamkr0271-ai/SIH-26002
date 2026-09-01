export interface State {
  id: string;
  name: string;
  connectivityScore: number;
  activeIncidents: number;
  highRiskCorridors: number;
  supplyStatus: 'STABLE' | 'MODERATE' | 'AT RISK' | 'CRITICAL';
  weatherRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
}

export interface Incident {
  id: string;
  title: string;
  type: 'Landslide' | 'Flood' | 'Road Damage' | 'Bridge Damage' | 'Traffic' | 'Other';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  status: 'ACTIVE' | 'RESOLVED' | 'UNDER_REVIEW' | 'ACKNOWLEDGED';
  location: [number, number]; // lat, lng
  locationName: string;
  affectedRoute: string;
  predictedImpact: string;
  recommendedAction: string;
  timestamp: string;
}

export interface Vehicle {
  id: string;
  cargo: string;
  cargoType: 'MEDICINES' | 'FOOD' | 'FUEL' | 'CONSTRUCTION MATERIAL' | 'AGRICULTURAL PRODUCE' | 'EMERGENCY EQUIPMENT';
  origin: string;
  destination: string;
  driver: string;
  currentLocation: [number, number];
  speed: number; // km/h
  eta: string;
  status: 'IN TRANSIT' | 'DELAYED' | 'HALTED' | 'DELIVERED';
  risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  progress: number;
}

export interface Shipment {
  id: string;
  cargo: string;
  cargoType: string;
  origin: string;
  destination: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  progress: number;
  eta: string;
  risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  aiRecommendation: string;
}

export interface FieldReport {
  id: string;
  incidentType: string;
  locationName: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO' | string;
  timestamp: string;
  officerName: string;
  status: 'SYNCED' | 'WAITING' | 'ACTIVE' | 'RESOLVED' | 'PENDING_SYNC';
  latitude?: number;
  longitude?: number;
}

export interface WeatherData {
  locationName: string;
  state: string;
  lat: number;
  lng: number;
  temperature: number;
  humidity: number;
  precipitationMm: number;
  precipitationProbability: number;
  windSpeedKmh: number;
  visibilityKm: number;
  weatherCondition: string;
  weatherCode: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  landslideRisk: 'MINIMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  floodRisk: 'LOW' | 'WATCH' | 'WARNING' | 'ALERT';
  provider: string;
  timestamp: string;
}

export interface RouteWeatherSummary {
  originWeather: WeatherData;
  destinationWeather: WeatherData;
  midpointWeather: WeatherData;
  maxPrecipitationMm: number;
  avgVisibilityKm: number;
  overallWeatherRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  meteorologicalAdvisory: string;
}

export interface WeatherInfo {
  location: string;
  temp: number;
  rainfall: number;
  visibility: string;
  wind: string;
  risk: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
}

export interface MLRiskPrediction {
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  landslideRisk: 'MINIMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  floodRisk: 'LOW' | 'WATCH' | 'WARNING' | 'ALERT';
  disruptionProbability: number;
  estimatedDelayMinutes: number;
  confidence: number;
  modelName: string;
  modelVersion: string;
  featuresEvaluated: number;
  isPrototype: boolean;
  generatedAt: string;
}

export interface RouteAnalysisResult {
  origin: string;
  destination: string;
  originLocation?: {
    id: string;
    name: string;
    state: string;
    district: string;
    lat: number;
    lng: number;
    elevationMeters: number;
  };
  destinationLocation?: {
    id: string;
    name: string;
    state: string;
    district: string;
    lat: number;
    lng: number;
    elevationMeters: number;
  };
  distanceKm: number;
  estimatedTravelTime: string;
  estimatedDelayMinutes: number;
  accessibilityScore: number;
  prototypeRiskScore: number;
  routeStatus: 'OPEN' | 'RESTRICTED' | 'HIGH_RISK' | 'CRITICAL_BLOCKADE';
  routingProvider?: 'OSRM_LIVE' | 'NER_TOPOLOGICAL_FALLBACK';
  recommendedRoute: [number, number][];
  alternativeRoutes?: {
    id: string;
    name: string;
    distanceKm: number;
    estimatedTravelTime: string;
    prototypeRiskScore: number;
    path: [number, number][];
  }[];
  nearbyIncidents?: {
    id: string;
    title: string;
    type: string;
    severity: string;
    locationName: string;
    location: [number, number];
    distanceFromRouteKm: number;
  }[];
  weatherSummary?: RouteWeatherSummary;
  mlPrediction?: MLRiskPrediction;
  aiRecommendation: string;
  analysisTimestamp: string;
}

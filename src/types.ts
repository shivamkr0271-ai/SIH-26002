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
  status: 'ACTIVE' | 'RESOLVED' | 'UNDER_REVIEW';
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
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  officerName: string;
  status: 'SYNCED' | 'WAITING';
}

export interface WeatherInfo {
  location: string;
  temp: number;
  rainfall: number;
  visibility: string;
  wind: string;
  risk: 'LOW' | 'MODERATE' | 'HIGH';
}

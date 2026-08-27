import { State, Incident, Vehicle, Shipment, FieldReport, WeatherInfo } from '../types';

export const states: State[] = [
  { id: 'AS', name: 'Assam', connectivityScore: 94, activeIncidents: 4, highRiskCorridors: 2, supplyStatus: 'STABLE', weatherRisk: 'LOW' },
  { id: 'AR', name: 'Arunachal Pradesh', connectivityScore: 69, activeIncidents: 12, highRiskCorridors: 8, supplyStatus: 'AT RISK', weatherRisk: 'HIGH' },
  { id: 'MN', name: 'Manipur', connectivityScore: 72, activeIncidents: 6, highRiskCorridors: 4, supplyStatus: 'MODERATE', weatherRisk: 'MODERATE' },
  { id: 'ML', name: 'Meghalaya', connectivityScore: 78, activeIncidents: 8, highRiskCorridors: 5, supplyStatus: 'MODERATE', weatherRisk: 'HIGH' },
  { id: 'MZ', name: 'Mizoram', connectivityScore: 64, activeIncidents: 7, highRiskCorridors: 6, supplyStatus: 'AT RISK', weatherRisk: 'MODERATE' },
  { id: 'NL', name: 'Nagaland', connectivityScore: 71, activeIncidents: 5, highRiskCorridors: 3, supplyStatus: 'MODERATE', weatherRisk: 'LOW' },
  { id: 'TR', name: 'Tripura', connectivityScore: 82, activeIncidents: 3, highRiskCorridors: 1, supplyStatus: 'STABLE', weatherRisk: 'LOW' },
  { id: 'SK', name: 'Sikkim', connectivityScore: 61, activeIncidents: 9, highRiskCorridors: 5, supplyStatus: 'CRITICAL', weatherRisk: 'EXTREME' },
];

export const incidents: Incident[] = [
  {
    id: 'INC-001',
    title: 'Major Landslide on NH-10',
    type: 'Landslide',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    location: [27.05, 88.52], // Near Sikkim border
    locationName: 'NH-10 near Melli',
    affectedRoute: 'Siliguri to Gangtok Corridor',
    predictedImpact: 'Complete blockade expected for 12+ hours. 48 logistics vehicles halted.',
    recommendedAction: 'Reroute critical medical supplies via helicopter. Divert non-essential traffic to Lava route.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'INC-002',
    title: 'Severe Waterlogging',
    type: 'Flood',
    severity: 'WARNING',
    status: 'ACTIVE',
    location: [24.83, 92.77], // Near Silchar
    locationName: 'NH-37 bypass, Silchar',
    affectedRoute: 'Guwahati - Silchar Route',
    predictedImpact: 'Average delay of 2 hours for heavy vehicles. Light vehicles cannot pass.',
    recommendedAction: 'Deploy water pumps. Issue advisory for high-clearance vehicles only.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'INC-003',
    title: 'Bridge Structural Stress Detected',
    type: 'Bridge Damage',
    severity: 'WARNING',
    status: 'UNDER_REVIEW',
    location: [25.56, 91.89], // Near Shillong
    locationName: 'Umiam Lake Bridge',
    affectedRoute: 'Guwahati - Shillong Highway',
    predictedImpact: 'Potential load restriction. Heavy multiaxle vehicles may be restricted.',
    recommendedAction: 'Immediate engineering inspection required. Prepare alternate traffic plan.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'INC-004',
    title: 'Routine Road Maintenance',
    type: 'Road Damage',
    severity: 'INFO',
    status: 'ACTIVE',
    location: [26.14, 91.73], // Guwahati
    locationName: 'Jalukbari Flyover Approach',
    affectedRoute: 'City Transit',
    predictedImpact: 'Minor traffic slowdown. 15 minute delay.',
    recommendedAction: 'Monitor traffic flow.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  }
];

export const vehicles: Vehicle[] = [
  {
    id: 'NER-MED-204',
    cargo: 'Essential Medicines',
    cargoType: 'MEDICINES',
    origin: 'Guwahati',
    destination: 'Aizawl',
    driver: 'Rahul Das',
    currentLocation: [24.3, 92.8],
    speed: 42,
    eta: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
    status: 'IN TRANSIT',
    risk: 'MODERATE',
    progress: 65,
  },
  {
    id: 'NER-FOOD-117',
    cargo: 'Rice & Grains',
    cargoType: 'FOOD',
    origin: 'Silchar',
    destination: 'Imphal',
    driver: 'T. Singh',
    currentLocation: [24.8, 93.5],
    speed: 35,
    eta: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
    status: 'DELAYED',
    risk: 'HIGH',
    progress: 40,
  },
  {
    id: 'NER-CON-342',
    cargo: 'Cement & Steel',
    cargoType: 'CONSTRUCTION MATERIAL',
    origin: 'Guwahati',
    destination: 'Itanagar',
    driver: 'Karma Bhutia',
    currentLocation: [26.8, 93.2],
    speed: 55,
    eta: new Date(Date.now() + 1000 * 60 * 60 * 4.5).toISOString(),
    status: 'IN TRANSIT',
    risk: 'LOW',
    progress: 75,
  },
  {
    id: 'NER-EMG-001',
    cargo: 'Water Purifiers & Tents',
    cargoType: 'EMERGENCY EQUIPMENT',
    origin: 'Guwahati',
    destination: 'Gangtok',
    driver: 'P. Sharma',
    currentLocation: [26.7, 88.4],
    speed: 0,
    eta: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
    status: 'HALTED',
    risk: 'CRITICAL',
    progress: 55,
  },
  {
    id: 'NER-FUEL-88',
    cargo: 'Diesel',
    cargoType: 'FUEL',
    origin: 'Digboi',
    destination: 'Kohima',
    driver: 'S. Konyak',
    currentLocation: [26.5, 94.2],
    speed: 48,
    eta: new Date(Date.now() + 1000 * 60 * 60 * 2.5).toISOString(),
    status: 'IN TRANSIT',
    risk: 'LOW',
    progress: 82,
  }
];

export const shipments: Shipment[] = [
  {
    id: 'SHP-1024',
    cargo: 'Essential Medicines (Insulin)',
    cargoType: 'MEDICINES',
    origin: 'Guwahati',
    destination: 'Tawang',
    priority: 'CRITICAL',
    progress: 68,
    eta: '7h 22m',
    risk: 'HIGH',
    aiRecommendation: 'Consider rerouting through the alternate corridor due to increasing landslide probability near Bomdila.'
  },
  {
    id: 'SHP-1025',
    cargo: 'Emergency Rations',
    cargoType: 'FOOD',
    origin: 'Siliguri',
    destination: 'Gangtok',
    priority: 'HIGH',
    progress: 20,
    eta: 'Unknown',
    risk: 'CRITICAL',
    aiRecommendation: 'NH-10 completely blocked. Hold shipment at transit hub or coordinate for air-drop if situation deteriorates.'
  },
  {
    id: 'SHP-1026',
    cargo: 'Construction Material (Pipes)',
    cargoType: 'CONSTRUCTION',
    origin: 'Guwahati',
    destination: 'Shillong',
    priority: 'LOW',
    progress: 90,
    eta: '1h 15m',
    risk: 'LOW',
    aiRecommendation: 'Route is clear. No changes recommended.'
  },
  {
    id: 'SHP-1027',
    cargo: 'Aviation Turbine Fuel',
    cargoType: 'FUEL',
    origin: 'Numaligarh',
    destination: 'Imphal',
    priority: 'HIGH',
    progress: 45,
    eta: '6h 40m',
    risk: 'MODERATE',
    aiRecommendation: 'Heavy rainfall expected on route in 3 hours. Recommend drivers maintain cautious speed.'
  }
];

export const fieldReports: FieldReport[] = [
  {
    id: 'FR-8892',
    incidentType: 'Landslide',
    locationName: 'NH-10 near Melli',
    description: 'Massive mudslide blocking both lanes. Immediate clearing required. Approximately 50m of road covered.',
    severity: 'CRITICAL',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    officerName: 'Inspector D. Lepcha',
    status: 'SYNCED'
  },
  {
    id: 'FR-8893',
    incidentType: 'Flood',
    locationName: 'Sonapur',
    description: 'Water flowing over the highway. Depth approx 1.5 ft. Light vehicles struggling.',
    severity: 'WARNING',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    officerName: 'Officer B. Baruah',
    status: 'SYNCED'
  },
  {
    id: 'FR-8894',
    incidentType: 'Bridge Damage',
    locationName: 'Barak River Bridge',
    description: 'Visible crack on expansion joint. Sent photos for engineering review.',
    severity: 'WARNING',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    officerName: 'Engineer S. Laskar',
    status: 'WAITING'
  }
];

export const weatherData: WeatherInfo[] = [
  { location: 'Guwahati', temp: 28, rainfall: 5, visibility: '8 km', wind: '12 km/h', risk: 'LOW' },
  { location: 'Shillong', temp: 18, rainfall: 45, visibility: '3 km', wind: '22 km/h', risk: 'MODERATE' },
  { location: 'Itanagar', temp: 22, rainfall: 65, visibility: '2 km', wind: '15 km/h', risk: 'HIGH' },
  { location: 'Aizawl', temp: 20, rainfall: 30, visibility: '4 km', wind: '10 km/h', risk: 'MODERATE' },
  { location: 'Imphal', temp: 24, rainfall: 15, visibility: '6 km', wind: '8 km/h', risk: 'LOW' },
  { location: 'Kohima', temp: 19, rainfall: 10, visibility: '5 km', wind: '14 km/h', risk: 'LOW' },
  { location: 'Agartala', temp: 30, rainfall: 2, visibility: '9 km', wind: '10 km/h', risk: 'LOW' },
  { location: 'Gangtok', temp: 15, rainfall: 85, visibility: '1 km', wind: '25 km/h', risk: 'HIGH' },
];

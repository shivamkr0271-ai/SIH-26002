import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory paths in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'nerlink_db.json');

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
  speed: number;
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

export interface Activity {
  id: string;
  action: string;
  time: string;
  type: string;
  relatedId?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'critical' | 'success';
}

export interface Mission {
  id: string;
  commodity: string;
  origin: string;
  destination: string;
  cargoWeightTon: number;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  vehicleId?: string;
  vehicleStatus?: string;
  recommendedRouteId: string;
  recommendedRouteName: string;
  alternateRouteName?: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  weatherStatus: string;
  eta: string;
  estimatedDelayMinutes: number;
  fuelEstimateLitres: number;
  criticalCheckpoints: string[];
  justification: string;
  status: 'OPTIMIZED' | 'IN_TRANSIT' | 'COMPLETED' | 'HALTED';
  createdAt: string;
}

export interface DatabaseSchema {
  states: State[];
  incidents: Incident[];
  vehicles: Vehicle[];
  shipments: Shipment[];
  missions: Mission[];
  fieldReports: FieldReport[];
  activities: Activity[];
  notifications: Notification[];
  meta: {
    version: string;
    lastUpdated: string;
    isEmergency: boolean;
  };
}

// Initial seed data for North Eastern Region
const initialStates: State[] = [
  { id: 'AS', name: 'Assam', connectivityScore: 94, activeIncidents: 4, highRiskCorridors: 2, supplyStatus: 'STABLE', weatherRisk: 'LOW' },
  { id: 'AR', name: 'Arunachal Pradesh', connectivityScore: 69, activeIncidents: 12, highRiskCorridors: 8, supplyStatus: 'AT RISK', weatherRisk: 'HIGH' },
  { id: 'MN', name: 'Manipur', connectivityScore: 72, activeIncidents: 6, highRiskCorridors: 4, supplyStatus: 'MODERATE', weatherRisk: 'MODERATE' },
  { id: 'ML', name: 'Meghalaya', connectivityScore: 78, activeIncidents: 8, highRiskCorridors: 5, supplyStatus: 'MODERATE', weatherRisk: 'HIGH' },
  { id: 'MZ', name: 'Mizoram', connectivityScore: 64, activeIncidents: 7, highRiskCorridors: 6, supplyStatus: 'AT RISK', weatherRisk: 'MODERATE' },
  { id: 'NL', name: 'Nagaland', connectivityScore: 71, activeIncidents: 5, highRiskCorridors: 3, supplyStatus: 'MODERATE', weatherRisk: 'LOW' },
  { id: 'TR', name: 'Tripura', connectivityScore: 82, activeIncidents: 3, highRiskCorridors: 1, supplyStatus: 'STABLE', weatherRisk: 'LOW' },
  { id: 'SK', name: 'Sikkim', connectivityScore: 61, activeIncidents: 9, highRiskCorridors: 5, supplyStatus: 'CRITICAL', weatherRisk: 'EXTREME' },
];

const initialIncidents: Incident[] = [
  {
    id: 'INC-001',
    title: 'Major Landslide on NH-10',
    type: 'Landslide',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    location: [27.05, 88.52],
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
    location: [24.83, 92.77],
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
    location: [25.56, 91.89],
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
    location: [26.14, 91.73],
    locationName: 'Jalukbari Flyover Approach',
    affectedRoute: 'City Transit',
    predictedImpact: 'Minor traffic slowdown. 15 minute delay.',
    recommendedAction: 'Monitor traffic flow.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  }
];

const initialVehicles: Vehicle[] = [
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

const initialShipments: Shipment[] = [
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

const initialReports: FieldReport[] = [
  {
    id: 'FR-8892',
    incidentType: 'Landslide',
    locationName: 'NH-10 near Melli',
    description: 'Massive mudslide blocking both lanes. Immediate clearing required. Approximately 50m of road covered.',
    severity: 'CRITICAL',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    officerName: 'Inspector D. Lepcha',
    status: 'SYNCED',
    latitude: 27.05,
    longitude: 88.52
  },
  {
    id: 'FR-8893',
    incidentType: 'Flood',
    locationName: 'Sonapur',
    description: 'Water flowing over the highway. Depth approx 1.5 ft. Light vehicles struggling.',
    severity: 'WARNING',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    officerName: 'Officer B. Baruah',
    status: 'SYNCED',
    latitude: 26.12,
    longitude: 91.98
  },
  {
    id: 'FR-8894',
    incidentType: 'Bridge Damage',
    locationName: 'Barak River Bridge',
    description: 'Visible crack on expansion joint. Sent photos for engineering review.',
    severity: 'WARNING',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    officerName: 'Engineer S. Laskar',
    status: 'WAITING',
    latitude: 24.81,
    longitude: 92.80
  }
];

const initialMissions: Mission[] = [
  {
    id: 'MSN-901',
    commodity: 'Medical Supplies',
    origin: 'Guwahati, Assam',
    destination: 'Imphal, Manipur',
    cargoWeightTon: 2.5,
    priority: 'CRITICAL',
    vehicleId: 'AS-01-EC-9901',
    vehicleStatus: 'IN TRANSIT',
    recommendedRouteId: 'ALT-CORRIDOR-01',
    recommendedRouteName: 'Bypass Corridor via NH-27 / NH-06 Alternate',
    alternateRouteName: 'Primary Highway via NH-29',
    riskScore: 28.5,
    riskLevel: 'LOW',
    weatherStatus: 'Moderate Rain (12mm)',
    eta: '7h 20m',
    estimatedDelayMinutes: 25,
    fuelEstimateLitres: 142,
    criticalCheckpoints: ['Guwahati Hub', 'Jorabat Junction', 'Lumding Pass', 'Imphal Transit Point'],
    justification: 'Diverted from primary corridor to avoid active landslide warning at Mao Gate. Alternate corridor provides stable passage.',
    status: 'IN_TRANSIT',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    id: 'MSN-902',
    commodity: 'Emergency Food & Rations',
    origin: 'Guwahati, Assam',
    destination: 'Aizawl, Mizoram',
    cargoWeightTon: 5.0,
    priority: 'HIGH',
    vehicleId: 'MZ-01-FD-3310',
    vehicleStatus: 'IN TRANSIT',
    recommendedRouteId: 'PRIMARY',
    recommendedRouteName: 'Primary Corridor via NH-06 / NH-306',
    alternateRouteName: 'Silchar Hill Bypass',
    riskScore: 68.2,
    riskLevel: 'CRITICAL',
    weatherStatus: 'Heavy Rain (38mm), High Landslide Risk',
    eta: '8h 45m',
    estimatedDelayMinutes: 140,
    fuelEstimateLitres: 215,
    criticalCheckpoints: ['Guwahati Hub', 'Meghalaya Plateau Gate', 'Silchar Transit Hub', 'Aizawl Civil Supply Depot'],
    justification: 'High-clearance 4WD convoy assigned. Escort recommended through Sonapur tunnel segment due to mud runoff.',
    status: 'IN_TRANSIT',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString()
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDirectory();
    this.data = this.loadDatabase();
  }

  private ensureDataDirectory(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (!parsed.missions) parsed.missions = initialMissions;
        return parsed;
      }
    } catch (err) {
      console.error('[DB] Error loading database file, reinitializing default dataset:', err);
    }

    // Default Seed Dataset
    const initialData: DatabaseSchema = {
      states: initialStates,
      incidents: initialIncidents,
      vehicles: initialVehicles,
      shipments: initialShipments,
      missions: initialMissions,
      fieldReports: initialReports,
      activities: [
        {
          id: 'act-01',
          action: 'System initialized with live NER highway monitors',
          time: new Date().toISOString(),
          type: 'system'
        }
      ],
      notifications: [
        {
          id: 'notif-01',
          title: 'Command Center Online',
          message: 'Connected to NER Logistics & Intelligence Grid',
          time: new Date().toISOString(),
          read: false,
          type: 'info'
        }
      ],
      meta: {
        version: '2.4.0',
        lastUpdated: new Date().toISOString(),
        isEmergency: false
      }
    };

    this.saveDataDirect(initialData);
    return initialData;
  }

  private saveDataDirect(data: DatabaseSchema): void {
    try {
      data.meta.lastUpdated = new Date().toISOString();
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('[DB] Error persisting database to disk:', err);
    }
  }

  public save(): void {
    this.saveDataDirect(this.data);
  }

  // Vehicles CRUD
  public getVehicles(): Vehicle[] {
    return this.data.vehicles;
  }

  public getVehicleById(id: string): Vehicle | undefined {
    return this.data.vehicles.find(v => v.id === id);
  }

  public addVehicle(vehicle: Vehicle): Vehicle {
    const existingIndex = this.data.vehicles.findIndex(v => v.id === vehicle.id);
    if (existingIndex >= 0) {
      this.data.vehicles[existingIndex] = vehicle;
    } else {
      this.data.vehicles.unshift(vehicle);
    }
    this.addActivity(`Vehicle ${vehicle.id} registered`, 'vehicle', vehicle.id);
    this.save();
    return vehicle;
  }

  public updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle | null {
    const index = this.data.vehicles.findIndex(v => v.id === id);
    if (index === -1) return null;
    this.data.vehicles[index] = { ...this.data.vehicles[index], ...updates };
    this.addActivity(`Vehicle ${id} status updated (${updates.status || 'Updated'})`, 'vehicle', id);
    this.save();
    return this.data.vehicles[index];
  }

  public deleteVehicle(id: string): boolean {
    const initialLen = this.data.vehicles.length;
    this.data.vehicles = this.data.vehicles.filter(v => v.id !== id);
    if (this.data.vehicles.length < initialLen) {
      this.addActivity(`Vehicle ${id} decommissioned`, 'vehicle', id);
      this.save();
      return true;
    }
    return false;
  }

  // Incidents CRUD
  public getIncidents(): Incident[] {
    return this.data.incidents;
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.data.incidents.find(i => i.id === id);
  }

  public addIncident(incident: Incident): Incident {
    const existingIndex = this.data.incidents.findIndex(i => i.id === incident.id);
    if (existingIndex >= 0) {
      this.data.incidents[existingIndex] = incident;
    } else {
      this.data.incidents.unshift(incident);
    }
    this.addActivity(`Incident alert ${incident.id} declared: ${incident.title}`, 'incident', incident.id);
    if (incident.severity === 'CRITICAL') {
      this.addNotification('CRITICAL DISRUPTION', `${incident.title} at ${incident.locationName}`, 'critical');
    }
    this.save();
    return incident;
  }

  public updateIncident(id: string, updates: Partial<Incident>): Incident | null {
    const index = this.data.incidents.findIndex(i => i.id === id);
    if (index === -1) return null;
    this.data.incidents[index] = { ...this.data.incidents[index], ...updates };
    this.addActivity(`Incident ${id} updated (${updates.status || 'Updated'})`, 'incident', id);
    this.save();
    return this.data.incidents[index];
  }

  public deleteIncident(id: string): boolean {
    const initialLen = this.data.incidents.length;
    this.data.incidents = this.data.incidents.filter(i => i.id !== id);
    if (this.data.incidents.length < initialLen) {
      this.addActivity(`Incident ${id} archived`, 'incident', id);
      this.save();
      return true;
    }
    return false;
  }

  // Shipments CRUD
  public getShipments(): Shipment[] {
    return this.data.shipments;
  }

  public getShipmentById(id: string): Shipment | undefined {
    return this.data.shipments.find(s => s.id === id);
  }

  public addShipment(shipment: Shipment): Shipment {
    const existingIndex = this.data.shipments.findIndex(s => s.id === shipment.id);
    if (existingIndex >= 0) {
      this.data.shipments[existingIndex] = shipment;
    } else {
      this.data.shipments.unshift(shipment);
    }
    this.addActivity(`Shipment ${shipment.id} created (${shipment.cargo})`, 'shipment', shipment.id);
    this.save();
    return shipment;
  }

  public updateShipment(id: string, updates: Partial<Shipment>): Shipment | null {
    const index = this.data.shipments.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.data.shipments[index] = { ...this.data.shipments[index], ...updates };
    this.addActivity(`Shipment ${id} updated`, 'shipment', id);
    this.save();
    return this.data.shipments[index];
  }

  public deleteShipment(id: string): boolean {
    const initialLen = this.data.shipments.length;
    this.data.shipments = this.data.shipments.filter(s => s.id !== id);
    if (this.data.shipments.length < initialLen) {
      this.addActivity(`Shipment ${id} removed`, 'shipment', id);
      this.save();
      return true;
    }
    return false;
  }

  // Missions CRUD
  public getMissions(): Mission[] {
    return this.data.missions || [];
  }

  public getMissionById(id: string): Mission | undefined {
    return (this.data.missions || []).find(m => m.id === id);
  }

  public addMission(mission: Mission): Mission {
    if (!this.data.missions) this.data.missions = [];
    const existingIndex = this.data.missions.findIndex(m => m.id === mission.id);
    if (existingIndex >= 0) {
      this.data.missions[existingIndex] = mission;
    } else {
      this.data.missions.unshift(mission);
    }
    this.addActivity(`Mission ${mission.id} created: ${mission.commodity} (${mission.origin} → ${mission.destination})`, 'mission', mission.id);
    this.save();
    return mission;
  }

  public updateMission(id: string, updates: Partial<Mission>): Mission | null {
    if (!this.data.missions) this.data.missions = [];
    const index = this.data.missions.findIndex(m => m.id === id);
    if (index === -1) return null;
    this.data.missions[index] = { ...this.data.missions[index], ...updates };
    this.addActivity(`Mission ${id} updated (${updates.status || 'Updated'})`, 'mission', id);
    this.save();
    return this.data.missions[index];
  }

  public deleteMission(id: string): boolean {
    if (!this.data.missions) return false;
    const initialLen = this.data.missions.length;
    this.data.missions = this.data.missions.filter(m => m.id !== id);
    if (this.data.missions.length < initialLen) {
      this.addActivity(`Mission ${id} removed`, 'mission', id);
      this.save();
      return true;
    }
    return false;
  }

  // Field Reports CRUD
  public getFieldReports(): FieldReport[] {
    return this.data.fieldReports;
  }

  public addFieldReport(report: FieldReport, autoCreateIncident = true): FieldReport {
    const existingIndex = this.data.fieldReports.findIndex(r => r.id === report.id);
    if (existingIndex >= 0) {
      this.data.fieldReports[existingIndex] = report;
    } else {
      this.data.fieldReports.unshift(report);
    }

    this.addActivity(`Field report ${report.id} submitted by ${report.officerName}`, 'report', report.id);

    // Auto-create incident if critical/warning and requested
    if (autoCreateIncident && report.status !== 'PENDING_SYNC') {
      const incId = 'INC-' + report.id.replace(/[^0-9]/g, '').slice(-4) || 'INC-FR-' + Math.floor(Math.random() * 900 + 100);
      const newIncident: Incident = {
        id: incId,
        title: `${report.incidentType}: ${report.locationName}`,
        type: (report.incidentType.includes('Landslide') ? 'Landslide' :
               report.incidentType.includes('Flood') ? 'Flood' :
               report.incidentType.includes('Bridge') ? 'Bridge Damage' :
               report.incidentType.includes('Road') ? 'Road Damage' : 'Other'),
        severity: (report.severity === 'CRITICAL' ? 'CRITICAL' : report.severity === 'WARNING' ? 'WARNING' : 'INFO'),
        status: report.status === 'RESOLVED' ? 'RESOLVED' : 'ACTIVE',
        location: [report.latitude || 25.5, report.longitude || 91.5],
        locationName: report.locationName,
        affectedRoute: 'Identified via Field Report',
        predictedImpact: report.description,
        recommendedAction: 'Deploy assessment team; coordinate local traffic diversion.',
        timestamp: report.timestamp || new Date().toISOString()
      };
      this.addIncident(newIncident);
    }

    this.save();
    return report;
  }

  public updateFieldReport(id: string, updates: Partial<FieldReport>): FieldReport | null {
    const index = this.data.fieldReports.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.data.fieldReports[index] = { ...this.data.fieldReports[index], ...updates };
    this.addActivity(`Field report ${id} updated`, 'report', id);
    this.save();
    return this.data.fieldReports[index];
  }

  public deleteFieldReport(id: string): boolean {
    const initialLen = this.data.fieldReports.length;
    this.data.fieldReports = this.data.fieldReports.filter(r => r.id !== id);
    if (this.data.fieldReports.length < initialLen) {
      this.addActivity(`Field report ${id} deleted`, 'report', id);
      this.save();
      return true;
    }
    return false;
  }

  public syncReports(reports: FieldReport[]): { syncedCount: number; reports: FieldReport[] } {
    let syncedCount = 0;
    for (const r of reports) {
      const syncedReport: FieldReport = { ...r, status: 'SYNCED' };
      this.addFieldReport(syncedReport, true);
      syncedCount++;
    }
    this.addNotification('Batch Sync Complete', `${syncedCount} offline field report(s) synchronized with central database.`, 'success');
    return { syncedCount, reports: this.data.fieldReports };
  }

  // Activities & Notifications
  public getActivities(): Activity[] {
    return this.data.activities;
  }

  public addActivity(action: string, type: string, relatedId?: string): Activity {
    const newAct: Activity = {
      id: 'act-' + Math.random().toString(36).substring(2, 9),
      action,
      time: new Date().toISOString(),
      type,
      relatedId
    };
    this.data.activities.unshift(newAct);
    if (this.data.activities.length > 100) {
      this.data.activities = this.data.activities.slice(0, 100);
    }
    return newAct;
  }

  public getNotifications(): Notification[] {
    return this.data.notifications;
  }

  public addNotification(title: string, message: string, type: 'info' | 'warning' | 'critical' | 'success' = 'info'): Notification {
    const newNotif: Notification = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      title,
      message,
      time: new Date().toISOString(),
      read: false,
      type
    };
    this.data.notifications.unshift(newNotif);
    if (this.data.notifications.length > 50) {
      this.data.notifications = this.data.notifications.slice(0, 50);
    }
    this.save();
    return newNotif;
  }

  public markNotificationRead(id: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
      return true;
    }
    return false;
  }

  public markAllNotificationsRead(): void {
    this.data.notifications.forEach(n => { n.read = true; });
    this.save();
  }

  // States
  public getStates(): State[] {
    return this.data.states;
  }

  // Meta & Reset
  public getMeta() {
    return this.data.meta;
  }

  public resetAll(): void {
    this.data = {
      states: initialStates,
      incidents: initialIncidents,
      vehicles: initialVehicles,
      shipments: initialShipments,
      missions: initialMissions,
      fieldReports: initialReports,
      activities: [{ id: 'act-01', action: 'Database reset to default seed data', time: new Date().toISOString(), type: 'system' }],
      notifications: [{ id: 'notif-01', title: 'Data Reset', message: 'Original demo dataset restored', time: new Date().toISOString(), read: false, type: 'info' }],
      meta: { version: '2.4.0', lastUpdated: new Date().toISOString(), isEmergency: false }
    };
    this.save();
  }
}

export const db = new Database();


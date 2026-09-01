import { Vehicle, Shipment, Incident, FieldReport, State, RouteAnalysisResult, Mission } from '@/types';
import { Activity, Notification } from '@/contexts/DataContext';
import { NERLocation } from '@/data/nerLocations';

const API_BASE = '/api/v1';

function getDirectBackendBase(): string {
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:5000/api/v1`;
  }
  return 'http://127.0.0.1:5000/api/v1';
}

// Generic safe fetch helper with JSON parsing, direct-port fallback and error handling
async function request<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<{ data: T | null; error: string | null; code?: string; isOffline?: boolean }> {
  const directBase = getDirectBackendBase();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 18000); // 18s safe ceiling

  try {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}${endpoint}`, {
        signal: options?.signal || controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });
    } catch (primaryErr: any) {
      // If relative proxy fetch threw network error, attempt direct connection to backend port 5000
      try {
        res = await fetch(`${directBase}${endpoint}`, {
          signal: options?.signal || controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
          ...options,
        });
      } catch (secErr) {
        throw primaryErr;
      }
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const fallbackMsg = res.status === 503 
        ? 'Backend routing server is unavailable on port 5000. Please start with "npm run dev:all".'
        : `HTTP error ${res.status}`;
      return { 
        data: null, 
        error: errBody.error || fallbackMsg, 
        code: errBody.code || `HTTP_${res.status}`,
        isOffline: res.status === 503 
      };
    }

    const json = await res.json();
    return { data: (json.data !== undefined ? json.data : json) as T, error: null };
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`[API] Network connection issue for ${endpoint}:`, err.message);

    let friendlyError = 'Unable to connect to backend routing service. Please ensure the server is running on port 5000.';
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      friendlyError = 'Route intelligence service timed out. Please check your network or try again.';
    } else if (err.message && !err.message.toLowerCase().includes('failed to fetch')) {
      friendlyError = err.message;
    }

    return { data: null, error: friendlyError, code: 'NETWORK_ERROR', isOffline: true };
  }
}

export const api = {
  // Health
  async getHealth() {
    return request<any>('/health');
  },

  // Vehicles
  async getVehicles() {
    return request<Vehicle[]>('/vehicles');
  },
  async getVehicle(id: string) {
    return request<Vehicle>(`/vehicles/${id}`);
  },
  async createVehicle(vehicle: Vehicle) {
    return request<Vehicle>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    });
  },
  async updateVehicle(id: string, updates: Partial<Vehicle>) {
    return request<Vehicle>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async deleteVehicle(id: string) {
    return request<any>(`/vehicles/${id}`, {
      method: 'DELETE',
    });
  },

  // Shipments
  async getShipments() {
    return request<Shipment[]>('/shipments');
  },
  async getShipment(id: string) {
    return request<Shipment>(`/shipments/${id}`);
  },
  async createShipment(shipment: Shipment) {
    return request<Shipment>('/shipments', {
      method: 'POST',
      body: JSON.stringify(shipment),
    });
  },
  async updateShipment(id: string, updates: Partial<Shipment>) {
    return request<Shipment>(`/shipments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async deleteShipment(id: string) {
    return request<any>(`/shipments/${id}`, {
      method: 'DELETE',
    });
  },

  // Incidents & Alerts
  async getIncidents() {
    return request<Incident[]>('/incidents');
  },
  async getIncident(id: string) {
    return request<Incident>(`/incidents/${id}`);
  },
  async createIncident(incident: Incident) {
    return request<Incident>('/incidents', {
      method: 'POST',
      body: JSON.stringify(incident),
    });
  },
  async updateIncident(id: string, updates: Partial<Incident>) {
    return request<Incident>(`/incidents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },
  async acknowledgeIncident(id: string) {
    return request<Incident>(`/incidents/${id}/acknowledge`, {
      method: 'POST',
    });
  },
  async resolveIncident(id: string) {
    return request<Incident>(`/incidents/${id}/resolve`, {
      method: 'POST',
    });
  },
  async deleteIncident(id: string) {
    return request<any>(`/incidents/${id}`, {
      method: 'DELETE',
    });
  },

  // Field Reports
  async getFieldReports() {
    return request<FieldReport[]>('/reports');
  },
  async createFieldReport(report: FieldReport, autoCreateIncident = true) {
    return request<FieldReport>('/reports', {
      method: 'POST',
      body: JSON.stringify({ ...report, autoCreateIncident }),
    });
  },
  async updateFieldReport(id: string, updates: Partial<FieldReport>) {
    return request<FieldReport>(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async deleteFieldReport(id: string) {
    return request<any>(`/reports/${id}`, {
      method: 'DELETE',
    });
  },
  async syncOfflineReports(reports: FieldReport[]) {
    return request<FieldReport[]>('/reports/sync', {
      method: 'POST',
      body: JSON.stringify({ reports }),
    });
  },

  // Notifications
  async getNotifications() {
    return request<Notification[]>('/notifications');
  },
  async createNotification(title: string, message: string, type: 'info' | 'warning' | 'critical' | 'success' = 'info') {
    return request<Notification>('/notifications', {
      method: 'POST',
      body: JSON.stringify({ title, message, type }),
    });
  },
  async markNotificationRead(id: string) {
    return request<any>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },
  async markAllNotificationsRead() {
    return request<any>('/notifications/read-all', {
      method: 'POST',
    });
  },

  // Activities
  async getActivities() {
    return request<Activity[]>('/activities');
  },
  async createActivity(action: string, type: string, relatedId?: string) {
    return request<Activity>('/activities', {
      method: 'POST',
      body: JSON.stringify({ action, type, relatedId }),
    });
  },

  // Route Intelligence & NER Locations
  async getNerLocations() {
    return request<NERLocation[]>('/routes/locations');
  },
  async calculateRoute(params: {
    origin: string;
    destination: string;
    cargoType?: string;
    vehicleType?: string;
    priority?: string;
  }) {
    return request<RouteAnalysisResult>('/routes/calculate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Weather API
  async getWeather(params?: { location?: string; lat?: number; lng?: number }) {
    const query = new URLSearchParams();
    if (params?.location) query.set('location', params.location);
    if (params?.lat !== undefined) query.set('lat', params.lat.toString());
    if (params?.lng !== undefined) query.set('lng', params.lng.toString());
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<any>(`/weather${qs}`);
  },
  async getAllWeather() {
    return request<any[]>('/weather/all');
  },
  async getRouteWeather(params: { origin: string; destination: string; coordinates?: [number, number][] }) {
    return request<any>('/weather/route', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // States
  async getStates() {
    return request<State[]>('/states');
  },

  // ML Risk Prediction
  async predictRisk(features: any) {
    return request<any>('/ml/predict-risk', {
      method: 'POST',
      body: JSON.stringify(features),
    });
  },
  async getModelInfo() {
    return request<any>('/ml/model-info');
  },

  // Grounded AI Assistant (NIRA)
  async chatWithAi(params: { message: string; conversation?: any[]; routeContext?: any }) {
    return request<{
      answer: string;
      sources: string[];
      provider: string;
      confidence: number;
      generatedAt: string;
      contextSnapshot: any;
    }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
  async getAiStatus() {
    return request<{
      assistantName: string;
      primaryProvider: string;
      geminiConfigured: boolean;
      version: string;
      capabilities: string[];
    }>('/ai/status');
  },

  // Emergency & Disaster Intelligence
  async getEmergencySummary() {
    return request<any>('/emergency/summary');
  },
  async getCriticalCorridors() {
    return request<any[]>('/emergency/critical-corridors');
  },
  async getEmergencyAlerts() {
    return request<any[]>('/emergency/alerts');
  },
  async recommendEmergencyRoute(params: { origin: string; destination: string; commodity: string }) {
    return request<any>('/emergency/recommend-route', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Logistics Missions
  async getMissions() {
    return request<Mission[]>('/missions');
  },
  async getMission(id: string) {
    return request<Mission>(`/missions/${id}`);
  },
  async createMission(payload: {
    commodity: string;
    origin: string;
    destination: string;
    cargoWeightTon: number;
    priority?: string;
    vehicleId?: string;
  }) {
    return request<Mission>('/missions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Database Reset
  async resetDatabase() {
    return request<any>('/reset', {
      method: 'POST',
    });
  }
};

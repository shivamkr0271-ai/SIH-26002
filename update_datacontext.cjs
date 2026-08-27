const fs = require('fs');

const dataContextStr = `import React, { createContext, useContext, useState, useEffect } from 'react';
import { vehicles as initialVehicles, fieldReports as initialReports, incidents as initialIncidents, shipments as initialShipments } from '@/data/mockData';
import { Vehicle, FieldReport, Incident, Shipment } from '@/types';

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

export interface Settings {
  theme: 'dark' | 'light' | 'system';
  notificationsEnabled: boolean;
  autoRefresh: boolean;
  compactMode: boolean;
  offlineMode: boolean;
}

export interface DataContextType {
  vehicles: Vehicle[];
  addVehicle: (v: Vehicle) => void;
  updateVehicle: (v: Vehicle) => void;
  deleteVehicle: (id: string) => void;
  
  fieldReports: FieldReport[];
  addReport: (r: FieldReport) => void;
  updateReport: (r: FieldReport) => void;
  deleteReport: (id: string) => void;
  syncOfflineReports: () => void;
  
  incidents: Incident[];
  addIncident: (i: Incident) => void;
  updateIncident: (i: Incident) => void;
  deleteIncident: (id: string) => void;
  
  shipments: Shipment[];
  addShipment: (s: Shipment) => void;
  updateShipment: (s: Shipment) => void;
  deleteShipment: (id: string) => void;

  activities: Activity[];
  addActivity: (action: string, type: string, relatedId?: string) => void;

  notifications: Notification[];
  addNotification: (title: string, message: string, type?: 'info' | 'warning' | 'critical' | 'success') => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  settings: Settings;
  updateSettings: (s: Partial<Settings>) => void;

  resetData: () => void;
  clearLocalData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultSettings: Settings = {
  theme: 'dark',
  notificationsEnabled: true,
  autoRefresh: true,
  compactMode: false,
  offlineMode: false,
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('nerlink_vehicles');
    return saved ? JSON.parse(saved) : initialVehicles;
  });
  const [fieldReports, setFieldReports] = useState<FieldReport[]>(() => {
    const saved = localStorage.getItem('nerlink_reports');
    return saved ? JSON.parse(saved) : initialReports;
  });
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem('nerlink_incidents');
    return saved ? JSON.parse(saved) : initialIncidents;
  });
  const [shipments, setShipments] = useState<Shipment[]>(() => {
    const saved = localStorage.getItem('nerlink_shipments');
    return saved ? JSON.parse(saved) : initialShipments;
  });
  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('nerlink_activities');
    return saved ? JSON.parse(saved) : [];
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('nerlink_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('nerlink_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => { localStorage.setItem('nerlink_vehicles', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem('nerlink_reports', JSON.stringify(fieldReports)); }, [fieldReports]);
  useEffect(() => { localStorage.setItem('nerlink_incidents', JSON.stringify(incidents)); }, [incidents]);
  useEffect(() => { localStorage.setItem('nerlink_shipments', JSON.stringify(shipments)); }, [shipments]);
  useEffect(() => { localStorage.setItem('nerlink_activities', JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem('nerlink_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('nerlink_settings', JSON.stringify(settings)); }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
    
    if (settings.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
  }, [settings.theme, settings.compactMode]);

  const addActivity = (action: string, type: string, relatedId?: string) => {
    const newAct: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      time: new Date().toISOString(),
      type,
      relatedId
    };
    setActivities(prev => [newAct, ...prev].slice(0, 50));
  };

  const addNotification = (title: string, message: string, type: 'info' | 'warning' | 'critical' | 'success' = 'info') => {
    if (!settings.notificationsEnabled && type !== 'critical') return;
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      time: new Date().toISOString(),
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
  };

  const updateSettings = (s: Partial<Settings>) => setSettings(prev => ({ ...prev, ...s }));

  const markNotificationRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllNotificationsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const addVehicle = (v: Vehicle) => {
    setVehicles(prev => [v, ...prev]);
    addActivity(\`Vehicle \${v.id} added\`, 'vehicle', v.id);
    addNotification('Vehicle Added', \`Vehicle \${v.id} has been added to the fleet.\`, 'success');
  };
  const updateVehicle = (v: Vehicle) => {
    setVehicles(prev => prev.map(item => item.id === v.id ? v : item));
    addActivity(\`Vehicle \${v.id} updated (\${v.status})\`, 'vehicle', v.id);
  };
  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(item => item.id !== id));
    addActivity(\`Vehicle \${id} removed\`, 'vehicle', id);
  };

  const addReport = (r: FieldReport) => {
    if (settings.offlineMode) {
      r.status = 'PENDING_SYNC' as any;
    }
    setFieldReports(prev => [r, ...prev]);
    addActivity(\`Field report \${r.id} submitted\`, 'report', r.id);
    addNotification('Report Submitted', \`Field report \${r.id} added.\`, 'success');

    if (!settings.offlineMode) {
      const newIncident: Incident = {
        id: 'INC-FR-' + r.id,
        title: r.incidentType,
        type: 'Other',
        severity: r.severity as any,
        status: (r.status === 'Resolved' || r.status === 'RESOLVED') ? 'RESOLVED' : 'ACTIVE',
        location: [25.5 + (Math.random() * 2 - 1), 91.5 + (Math.random() * 2 - 1)],
        locationName: r.locationName,
        affectedRoute: 'Unknown',
        predictedImpact: r.description,
        recommendedAction: 'Investigate field report.',
        timestamp: r.timestamp
      };
      addIncident(newIncident);
    }
  };
  
  const updateReport = (r: FieldReport) => {
    setFieldReports(prev => prev.map(item => item.id === r.id ? r : item));
    addActivity(\`Field report \${r.id} updated\`, 'report', r.id);
  };
  
  const deleteReport = (id: string) => {
    setFieldReports(prev => prev.filter(item => item.id !== id));
    addActivity(\`Field report \${id} deleted\`, 'report', id);
  };

  const syncOfflineReports = () => {
    setFieldReports(prev => prev.map(r => {
      if (r.status === ('PENDING_SYNC' as any)) {
        return { ...r, status: 'SYNCED' as any };
      }
      return r;
    }));
    addActivity('Data synchronized with central servers', 'system');
    addNotification('Sync Complete', 'All offline reports have been synchronized.', 'success');
  };

  const addIncident = (i: Incident) => {
    setIncidents(prev => [i, ...prev]);
    addActivity(\`Incident \${i.id} created\`, 'incident', i.id);
    if (i.severity === 'CRITICAL') {
      addNotification('Critical Alert', i.title, 'critical');
    }
  };
  
  const updateIncident = (i: Incident) => {
    setIncidents(prev => prev.map(item => item.id === i.id ? i : item));
    addActivity(\`Incident \${i.id} updated (\${i.status})\`, 'incident', i.id);
  };
  
  const deleteIncident = (id: string) => {
    setIncidents(prev => prev.filter(item => item.id !== id));
    addActivity(\`Incident \${id} deleted\`, 'incident', id);
  };

  const addShipment = (s: Shipment) => {
    setShipments(prev => [s, ...prev]);
    addActivity(\`Shipment \${s.id} created\`, 'shipment', s.id);
    addNotification('Shipment Created', \`Shipment \${s.id} is now tracked.\`, 'success');
  };
  
  const updateShipment = (s: Shipment) => {
    setShipments(prev => prev.map(item => item.id === s.id ? s : item));
    addActivity(\`Shipment \${s.id} status changed to \${s.status}\`, 'shipment', s.id);
  };
  
  const deleteShipment = (id: string) => {
    setShipments(prev => prev.filter(item => item.id !== id));
    addActivity(\`Shipment \${id} removed\`, 'shipment', id);
  };

  const resetData = () => {
    setVehicles(initialVehicles);
    setFieldReports(initialReports);
    setIncidents(initialIncidents);
    setShipments(initialShipments);
    setActivities([]);
    setNotifications([]);
    addActivity('Demo data reset', 'system');
    addNotification('Data Reset', 'Original demo data restored.', 'info');
  };

  const clearLocalData = () => {
    setVehicles([]);
    setFieldReports([]);
    setIncidents([]);
    setShipments([]);
    setActivities([]);
    setNotifications([]);
    addActivity('All local data cleared', 'system');
  };

  return (
    <DataContext.Provider value={{
      vehicles, addVehicle, updateVehicle, deleteVehicle,
      fieldReports, addReport, updateReport, deleteReport, syncOfflineReports,
      incidents, addIncident, updateIncident, deleteIncident,
      shipments, addShipment, updateShipment, deleteShipment,
      activities, addActivity,
      notifications, addNotification, markNotificationRead, markAllNotificationsRead,
      settings, updateSettings,
      resetData, clearLocalData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
`;

fs.writeFileSync('src/contexts/DataContext.tsx', dataContextStr);

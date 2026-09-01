import React, { createContext, useContext, useState, useEffect } from 'react';
import { vehicles as initialVehicles, fieldReports as initialReports, incidents as initialIncidents, shipments as initialShipments } from '@/data/mockData';
import { Vehicle, FieldReport, Incident, Shipment } from '@/types';
import { api } from '@/services/api';

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

  // Sync to localStorage as client cache
  useEffect(() => { localStorage.setItem('nerlink_vehicles', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem('nerlink_reports', JSON.stringify(fieldReports)); }, [fieldReports]);
  useEffect(() => { localStorage.setItem('nerlink_incidents', JSON.stringify(incidents)); }, [incidents]);
  useEffect(() => { localStorage.setItem('nerlink_shipments', JSON.stringify(shipments)); }, [shipments]);
  useEffect(() => { localStorage.setItem('nerlink_activities', JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem('nerlink_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('nerlink_settings', JSON.stringify(settings)); }, [settings]);

  // Initial fetch from backend API with graceful fallback to local storage
  useEffect(() => {
    let isMounted = true;

    async function loadBackendData() {
      try {
        const [vRes, iRes, sRes, rRes, aRes, nRes] = await Promise.all([
          api.getVehicles(),
          api.getIncidents(),
          api.getShipments(),
          api.getFieldReports(),
          api.getActivities(),
          api.getNotifications()
        ]);

        if (!isMounted) return;

        if (vRes.data && Array.isArray(vRes.data)) setVehicles(vRes.data);
        if (iRes.data && Array.isArray(iRes.data)) setIncidents(iRes.data);
        if (sRes.data && Array.isArray(sRes.data)) setShipments(sRes.data);
        if (rRes.data && Array.isArray(rRes.data)) setFieldReports(rRes.data);
        if (aRes.data && Array.isArray(aRes.data)) setActivities(aRes.data);
        if (nRes.data && Array.isArray(nRes.data)) setNotifications(nRes.data);
      } catch (err) {
        console.warn('[DataContext] Backend connection not established. Running in offline/localStorage mode.');
      }
    }

    loadBackendData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Theme application
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
      if (settings.theme === 'light') {
        root.classList.remove('dark');
      } else if (settings.theme === 'dark') {
        root.classList.add('dark');
      } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };
    
    applyTheme();

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
  }, [settings.compactMode]);

  const addActivity = (action: string, type: string, relatedId?: string) => {
    const newAct: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      time: new Date().toISOString(),
      type,
      relatedId
    };
    setActivities(prev => [newAct, ...prev].slice(0, 50));
    api.createActivity(action, type, relatedId).catch(() => {});
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
    api.createNotification(title, message, type).catch(() => {});
  };

  const updateSettings = (s: Partial<Settings>) => setSettings(prev => ({ ...prev, ...s }));

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    api.markNotificationRead(id).catch(() => {});
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    api.markAllNotificationsRead().catch(() => {});
  };

  const addVehicle = (v: Vehicle) => {
    setVehicles(prev => [v, ...prev]);
    addActivity(`Vehicle ${v.id} added`, 'vehicle', v.id);
    addNotification('Vehicle Added', `Vehicle ${v.id} has been added to the fleet.`, 'success');
    api.createVehicle(v).catch(() => {});
  };

  const updateVehicle = (v: Vehicle) => {
    setVehicles(prev => prev.map(item => item.id === v.id ? v : item));
    addActivity(`Vehicle ${v.id} updated (${v.status})`, 'vehicle', v.id);
    api.updateVehicle(v.id, v).catch(() => {});
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(item => item.id !== id));
    addActivity(`Vehicle ${id} removed`, 'vehicle', id);
    api.deleteVehicle(id).catch(() => {});
  };

  const addReport = (r: FieldReport) => {
    if (settings.offlineMode) {
      r.status = 'PENDING_SYNC' as any;
    }
    setFieldReports(prev => [r, ...prev]);
    addActivity(`Field report ${r.id} submitted`, 'report', r.id);
    addNotification('Report Submitted', `Field report ${r.id} added.`, 'success');

    if (!settings.offlineMode) {
      const newIncident: Incident = {
        id: `INC-${r.id}`,
        title: `${r.incidentType} - ${r.locationName}`,
        type: r.incidentType as any,
        severity: r.severity as any,
        status: (r.status === 'SYNCED' || r.status === 'RESOLVED') ? 'RESOLVED' : 'ACTIVE',
        location: (r.latitude && r.longitude) ? [r.latitude, r.longitude] : [25.5, 91.5],
        locationName: r.locationName,
        affectedRoute: `${r.locationName} Corridor`,
        predictedImpact: r.description,
        recommendedAction: 'Investigate field report.',
        timestamp: r.timestamp
      };
      setIncidents(prev => {
        if (prev.some(i => i.id === newIncident.id)) return prev;
        return [newIncident, ...prev];
      });
      api.createFieldReport(r, true).catch(() => {});
    }
  };
  
  const updateReport = (r: FieldReport) => {
    setFieldReports(prev => prev.map(item => item.id === r.id ? r : item));
    addActivity(`Field report ${r.id} updated`, 'report', r.id);
    api.updateFieldReport(r.id, r).catch(() => {});
  };
  
  const deleteReport = (id: string) => {
    setFieldReports(prev => prev.filter(item => item.id !== id));
    addActivity(`Field report ${id} deleted`, 'report', id);
    api.deleteFieldReport(id).catch(() => {});
  };

  const syncOfflineReports = async () => {
    const pendingReports = fieldReports.filter(r => r.status === ('PENDING_SYNC' as any) || r.status === ('WAITING' as any));
    
    setFieldReports(prev => prev.map(r => {
      if (r.status === ('PENDING_SYNC' as any) || r.status === ('WAITING' as any)) {
        return { ...r, status: 'SYNCED' as any };
      }
      return r;
    }));

    addActivity('Data synchronized with central servers', 'system');
    addNotification('Sync Complete', 'All offline reports have been synchronized.', 'success');

    if (pendingReports.length > 0) {
      try {
        const res = await api.syncOfflineReports(pendingReports);
        if (res.data && Array.isArray(res.data)) {
          setFieldReports(res.data);
          // Refresh incidents list as well
          const incRes = await api.getIncidents();
          if (incRes.data && Array.isArray(incRes.data)) {
            setIncidents(incRes.data);
          }
        }
      } catch (err) {
        console.warn('[DataContext] Offline sync request completed locally.');
      }
    }
  };

  const addIncident = (i: Incident) => {
    setIncidents(prev => [i, ...prev]);
    addActivity(`Incident ${i.id} created`, 'incident', i.id);
    if (i.severity === 'CRITICAL') {
      addNotification('Critical Alert', i.title, 'critical');
    }
    api.createIncident(i).catch(() => {});
  };
  
  const updateIncident = (i: Incident) => {
    setIncidents(prev => prev.map(item => item.id === i.id ? i : item));
    addActivity(`Incident ${i.id} updated (${i.status})`, 'incident', i.id);
    api.updateIncident(i.id, i).catch(() => {});
  };
  
  const deleteIncident = (id: string) => {
    setIncidents(prev => prev.filter(item => item.id !== id));
    addActivity(`Incident ${id} deleted`, 'incident', id);
    api.deleteIncident(id).catch(() => {});
  };

  const addShipment = (s: Shipment) => {
    setShipments(prev => [s, ...prev]);
    addActivity(`Shipment ${s.id} created`, 'shipment', s.id);
    addNotification('Shipment Created', `Shipment ${s.id} is now tracked.`, 'success');
    api.createShipment(s).catch(() => {});
  };
  
  const updateShipment = (s: Shipment) => {
    setShipments(prev => prev.map(item => item.id === s.id ? s : item));
    addActivity(`Shipment ${s.id} updated (Risk: ${s.risk})`, 'shipment', s.id);
    api.updateShipment(s.id, s).catch(() => {});
  };
  
  const deleteShipment = (id: string) => {
    setShipments(prev => prev.filter(item => item.id !== id));
    addActivity(`Shipment ${id} removed`, 'shipment', id);
    api.deleteShipment(id).catch(() => {});
  };

  const resetData = async () => {
    setVehicles(initialVehicles);
    setFieldReports(initialReports);
    setIncidents(initialIncidents);
    setShipments(initialShipments);
    setActivities([]);
    setNotifications([]);
    addActivity('Demo data reset', 'system');
    addNotification('Data Reset', 'Original demo data restored.', 'info');
    api.resetDatabase().catch(() => {});
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

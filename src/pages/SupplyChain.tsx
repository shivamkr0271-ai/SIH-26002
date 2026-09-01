import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Search, Filter, Box, ArrowRight, Package, Truck, Calendar, Edit, Trash2, 
  Plus, Save, RefreshCw, Zap, ShieldCheck, ShieldAlert, Clock, Fuel, MapPin, 
  Layers, CheckCircle2, Info, Compass
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Shipment, Mission } from '@/types';
import { NER_LOCATIONS } from '@/data/nerLocations';
import { api } from '@/services/api';
import Modal from '@/components/ui/Modal';

export default function SupplyChain() {
  const navigate = useNavigate();
  const { shipments, addShipment, updateShipment, deleteShipment, vehicles } = useData();
  const [activeSection, setActiveSection] = useState<'missions' | 'shipments'>('missions');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Missions State
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loadingMissions, setLoadingMissions] = useState(false);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [calculatingMission, setCalculatingMission] = useState(false);
  const [missionSummary, setMissionSummary] = useState<Mission | null>(null);
  const [missionError, setMissionError] = useState<string | null>(null);

  const [missionForm, setMissionForm] = useState({
    commodity: 'Medical Supplies',
    origin: 'Guwahati, Assam',
    destination: 'Imphal, Manipur',
    cargoWeightTon: 2.0,
    priority: 'CRITICAL' as 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL',
    vehicleId: 'AS-01-EC-9901'
  });

  // Load Missions on mount
  const loadMissions = async () => {
    setLoadingMissions(true);
    try {
      const res = await api.getMissions();
      if (res.data && Array.isArray(res.data)) {
        setMissions(res.data);
      }
    } catch (err) {
      console.warn('[SupplyChain] Error loading missions:', err);
    } finally {
      setLoadingMissions(false);
    }
  };

  useEffect(() => {
    loadMissions();
  }, []);

  // Standard Shipments State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<Partial<Shipment>>({
    id: '', cargo: '', cargoType: 'MEDICINES', origin: '', destination: '', priority: 'MEDIUM', progress: 0, eta: '', risk: 'LOW', aiRecommendation: ''
  });

  const filteredShipments = shipments.filter(s => 
    (activeTab === 'all' || s.priority.toLowerCase() === activeTab) &&
    (s.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
     s.cargo.toLowerCase().includes(searchQuery.toLowerCase()) ||
     s.destination.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredMissions = missions.filter(m =>
    (activeTab === 'all' || m.priority.toLowerCase() === activeTab) &&
    (m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
     m.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
     m.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
     m.origin.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openAddMission = () => {
    setMissionSummary(null);
    setMissionError(null);
    setMissionForm({
      commodity: 'Medical Supplies',
      origin: 'Guwahati, Assam',
      destination: 'Imphal, Manipur',
      cargoWeightTon: 2.0,
      priority: 'CRITICAL',
      vehicleId: vehicles.length > 0 ? vehicles[0].id : 'AS-01-EC-9901'
    });
    setIsMissionModalOpen(true);
  };

  const handleCalculateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    setMissionError(null);
    if (missionForm.origin === missionForm.destination) {
      setMissionError('Origin and destination cannot be the same hub.');
      return;
    }
    setCalculatingMission(true);
    try {
      const res = await api.createMission(missionForm);
      if (res.data) {
        setMissionSummary(res.data);
        // Refresh missions list
        loadMissions();
      } else {
        setMissionError(res.error || 'Failed to calculate mission logistics.');
      }
    } catch (err: any) {
      setMissionError(err.message || 'Error communicating with routing engine.');
    } finally {
      setCalculatingMission(false);
    }
  };

  const openAdd = () => {
    setEditingShipment(null);
    setFormData({
      id: 'SHP-' + Math.floor(Math.random() * 9000 + 1000),
      cargo: '',
      cargoType: 'OTHER',
      origin: '',
      destination: '',
      priority: 'MEDIUM',
      progress: 0,
      eta: 'Unknown',
      risk: 'LOW',
      aiRecommendation: ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (s: Shipment) => {
    setEditingShipment(s);
    setFormData(s);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete shipment ' + id + '?')) {
      deleteShipment(id);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.id) newErrors.id = 'ID required';
    if (!formData.cargo) newErrors.cargo = 'Cargo required';
    if (!formData.origin) newErrors.origin = 'Origin required';
    if (!formData.destination) newErrors.destination = 'Destination required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const shipmentPayload: Shipment = {
        id: formData.id || ('SHP-' + Math.floor(Math.random() * 9000 + 1000)),
        cargo: formData.cargo || 'Essential Goods',
        cargoType: formData.cargoType || 'OTHER',
        origin: formData.origin || 'Guwahati',
        destination: formData.destination || 'Aizawl',
        priority: formData.priority || 'MEDIUM',
        progress: formData.progress !== undefined ? formData.progress : 10,
        eta: formData.eta || '6 hrs',
        risk: formData.risk || 'LOW',
        aiRecommendation: formData.aiRecommendation || 'Transit monitored via AI route intelligence.'
      };
      if (editingShipment) updateShipment(shipmentPayload);
      else addShipment(shipmentPayload);
      setIsModalOpen(false);
    }, 400);
  };

  return (
    <div className="max-w-[1920px] mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">Logistics & Supply Grid</h1>
          <p className="text-xs text-cyan-500 font-bold uppercase tracking-widest mt-1">
            End-to-end visibility of critical missions, cargo corridors & resource delivery
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search missions or cargo..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-cyan-500 text-gray-900 dark:text-gray-200 w-full sm:w-60 transition-colors"
            />
          </div>

          <button 
            type="button"
            onClick={openAddMission} 
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(8,145,178,0.4)] transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4" /> Create Mission
          </button>

          <button 
            type="button"
            onClick={openAdd} 
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-bold transition-colors border border-gray-300 dark:border-white/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Shipment
          </button>
        </div>
      </div>

      {/* Mode Switcher: Missions Simulation vs Standard Shipments */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveSection('missions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'missions'
                ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.3)]'
                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            <Compass className="w-4 h-4" /> Logistics Missions ({missions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('shipments')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'shipments'
                ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.3)]'
                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            <Box className="w-4 h-4" /> Standard Cargo Shipments ({shipments.length})
          </button>
        </div>

        {/* Priority Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto custom-scrollbar">
          {['all', 'low', 'normal', 'medium', 'high', 'critical'].map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' 
                  : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: LOGISTICS MISSIONS */}
      {activeSection === 'missions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMissions.map(m => (
              <Card key={m.id} className="hover:border-cyan-500/40 transition-all group border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0a0c14] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-gray-900 dark:text-white font-mono">{m.id}</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase">{m.commodity}</div>
                      </div>
                    </div>
                    <Badge variant={
                      m.priority === 'CRITICAL' ? 'error' :
                      m.priority === 'HIGH' ? 'warning' : 'default'
                    }>
                      {m.priority}
                    </Badge>
                  </div>

                  {/* Route corridor block */}
                  <div className="bg-white dark:bg-[#05070a] p-3 rounded-lg border border-gray-200 dark:border-white/5 mb-3 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200">
                      <span className="truncate max-w-[45%]">{m.origin.split(',')[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate max-w-[45%] text-right">{m.destination.split(',')[0]}</span>
                    </div>

                    <div className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1.5">
                      <Compass className="w-3 h-3" />
                      <span className="truncate">{m.recommendedRouteName}</span>
                    </div>
                  </div>

                  {/* Metrics row */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                    <div className="bg-gray-100 dark:bg-white/5 p-2 rounded">
                      <div className="text-[9px] text-gray-500 uppercase font-bold">Risk Level</div>
                      <div className={`font-bold font-mono ${
                        m.riskLevel === 'LOW' ? 'text-emerald-500' :
                        m.riskLevel === 'MODERATE' ? 'text-amber-500' : 'text-red-500'
                      }`}>
                        {m.riskLevel === 'LOW' ? '🟢 LOW' : m.riskLevel === 'MODERATE' ? '🟡 MOD' : '🔴 CRIT'}
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-white/5 p-2 rounded">
                      <div className="text-[9px] text-gray-500 uppercase font-bold">Transit ETA</div>
                      <div className="font-bold text-gray-900 dark:text-white font-mono">{m.eta}</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-white/5 p-2 rounded">
                      <div className="text-[9px] text-gray-500 uppercase font-bold">Fuel Est.</div>
                      <div className="font-bold text-cyan-400 font-mono">{m.fuelEstimateLitres} L</div>
                    </div>
                  </div>

                  {/* Checkpoints snippet */}
                  {m.criticalCheckpoints && m.criticalCheckpoints.length > 0 && (
                    <div className="text-[11px] text-gray-500 mb-3 line-clamp-1 font-mono">
                      📍 {m.criticalCheckpoints.join(' → ')}
                    </div>
                  )}

                  {/* Justification note */}
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 italic mb-3">
                    "{m.justification}"
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-white/10 flex gap-2">
                  <button 
                    type="button"
                    onClick={() => navigate(`/route?origin=${encodeURIComponent(m.origin)}&destination=${encodeURIComponent(m.destination)}`)}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" /> View on GIS Route Map
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {filteredMissions.length === 0 && (
            <div className="text-center py-12 bg-gray-50 dark:bg-[#0a0c14] rounded-xl border border-gray-200 dark:border-white/5">
              <Compass className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-50" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase">No Logistics Missions Found</h3>
              <p className="text-xs text-gray-500 mt-1">Click "Create Mission" above to generate and optimize a high-priority cargo mission.</p>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: STANDARD SHIPMENTS */}
      {activeSection === 'shipments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredShipments.map(shipment => (
            <Card key={shipment.id} className="hover:border-cyan-500/50 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/10 flex items-center justify-center group-hover:border-cyan-500/50 transition-colors">
                    <Box className="w-5 h-5 text-gray-600 dark:text-cyan-500" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{shipment.id}</div>
                    <div className="text-xs text-gray-500">
                      <Badge variant={shipment.priority === 'CRITICAL' ? 'error' : shipment.priority === 'HIGH' ? 'warning' : 'default'} className="scale-75 origin-left">
                        {shipment.priority} PRIORITY
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(shipment)} className="p-1.5 text-gray-400 hover:text-cyan-500 rounded"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(shipment.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-[#05070a]/50 rounded-lg p-3 border border-gray-300 dark:border-gray-200 dark:border-white/5 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{shipment.cargo}</span>
                </div>
                <div className="flex items-center justify-between mt-3 relative">
                  <div className="absolute left-4 right-4 top-1/2 h-0.5 bg-gray-300 dark:bg-white/10 -z-10"></div>
                  <div className="bg-gray-100 dark:bg-[#05070a] px-2 text-xs font-bold text-gray-500 truncate max-w-[40%]">{shipment.origin}</div>
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <Truck className="w-3 h-3 text-cyan-500" />
                  </div>
                  <div className="bg-gray-100 dark:bg-[#05070a] px-2 text-xs font-bold text-gray-500 truncate max-w-[40%] text-right">{shipment.destination}</div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-cyan-500 h-full shadow-[0_0_8px_rgba(6,182,212,0.5)]" style={{ width: `${shipment.progress}%` }}></div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-300 dark:border-gray-200 dark:border-white/5 pt-3">
                <Badge variant={
                  shipment.risk === 'LOW' ? 'success' : 
                  shipment.risk === 'MODERATE' ? 'info' : 
                  shipment.risk === 'HIGH' ? 'warning' : 'error'
                }>
                  {shipment.risk} RISK
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>ETA: {shipment.eta}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE LOGISTICS MISSION MODAL (Feature 4) */}
      <Modal isOpen={isMissionModalOpen} onClose={() => setIsMissionModalOpen(false)} title="Create & Optimize Logistics Mission">
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            Configure mission parameters. NER-LINK AI evaluates live corridor risk, weather, and terrain elevation to calculate safest passage.
          </p>

          {missionError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
              ⚠️ {missionError}
            </div>
          )}

          <form onSubmit={handleCalculateMission} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Mission Type / Commodity
              </label>
              <select
                value={missionForm.commodity}
                onChange={e => setMissionForm({ ...missionForm, commodity: e.target.value })}
                className="w-full bg-white dark:bg-[#05070a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500 font-medium"
              >
                <option value="Medical Supplies">Medical Supplies</option>
                <option value="Emergency Food & Rations">Food</option>
                <option value="Construction Materials">Construction Materials</option>
                <option value="Agricultural Produce">Agricultural Produce</option>
                <option value="Emergency Supplies">Emergency Supplies</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Origin Node</label>
                <select
                  value={missionForm.origin}
                  onChange={e => setMissionForm({ ...missionForm, origin: e.target.value })}
                  className="w-full bg-white dark:bg-[#05070a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500 font-medium"
                >
                  {NER_LOCATIONS.map(loc => (
                    <option key={loc.id} value={`${loc.name}, ${loc.state}`}>{loc.name} ({loc.state})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Destination Node</label>
                <select
                  value={missionForm.destination}
                  onChange={e => setMissionForm({ ...missionForm, destination: e.target.value })}
                  className="w-full bg-white dark:bg-[#05070a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500 font-medium"
                >
                  {NER_LOCATIONS.map(loc => (
                    <option key={loc.id} value={`${loc.name}, ${loc.state}`}>{loc.name} ({loc.state})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Cargo Weight</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="35"
                  value={missionForm.cargoWeightTon}
                  onChange={e => setMissionForm({ ...missionForm, cargoWeightTon: Number(e.target.value) })}
                  className="w-full bg-white dark:bg-[#05070a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Priority</label>
                <select
                  value={missionForm.priority}
                  onChange={e => setMissionForm({ ...missionForm, priority: e.target.value as any })}
                  className="w-full bg-white dark:bg-[#05070a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500 font-bold"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Vehicle (Optional)</label>
                <select
                  value={missionForm.vehicleId}
                  onChange={e => setMissionForm({ ...missionForm, vehicleId: e.target.value })}
                  className="w-full bg-white dark:bg-[#05070a] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="">None Assigned</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.id} ({v.driver})</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={calculatingMission || missionForm.origin === missionForm.destination}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-[0_0_12px_rgba(8,145,178,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {calculatingMission ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {calculatingMission ? 'Optimizing Corridor...' : 'Calculate Mission & Optimize Route'}
            </button>
          </form>

          {/* MISSION SUMMARY RESULT */}
          {missionSummary && (
            <div className="mt-4 p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/20 space-y-3">
              <div className="flex justify-between items-center border-b border-cyan-500/20 pb-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mission Summary
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {missionSummary.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase">Commodity</span>
                  <span className="font-bold text-white">{missionSummary.commodity}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase">Cargo Weight</span>
                  <span className="font-bold text-white font-mono">{missionSummary.cargoWeightTon} Ton</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase">Origin</span>
                  <span className="font-semibold text-gray-200 truncate">{missionSummary.origin.split(',')[0]}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase">Destination</span>
                  <span className="font-semibold text-gray-200 truncate">{missionSummary.destination.split(',')[0]}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Recommended Route:</span>
                  <span className="font-bold text-cyan-400">{missionSummary.recommendedRouteName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk Assessment:</span>
                  <span className={`font-bold font-mono ${
                    missionSummary.riskLevel === 'LOW' ? 'text-emerald-400' :
                    missionSummary.riskLevel === 'MODERATE' ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {missionSummary.riskLevel === 'LOW' ? '🟢 LOW' : missionSummary.riskLevel === 'MODERATE' ? '🟡 MODERATE' : '🔴 CRITICAL'} ({missionSummary.riskScore}/100)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Transit ETA:</span>
                  <span className="font-bold text-white font-mono">{missionSummary.eta} (+{missionSummary.estimatedDelayMinutes}m delay)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Weather:</span>
                  <span className="font-semibold text-gray-200">{missionSummary.weatherStatus}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-amber-400" /> Fuel Estimate:
                  </span>
                  <span className="font-bold text-amber-400 font-mono flex items-center gap-1.5">
                    {missionSummary.fuelEstimateLitres} Litres
                    <span className="text-[8px] bg-amber-500/10 border border-amber-500/30 px-1 py-0.5 rounded text-amber-300">ESTIMATED</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Alternate Route:</span>
                  <span className="text-gray-300">{missionSummary.alternateRouteName || 'None'}</span>
                </div>
              </div>

              {missionSummary.criticalCheckpoints && (
                <div className="text-[11px] text-gray-400">
                  <span className="font-bold text-gray-300 block mb-0.5">Critical Checkpoints:</span>
                  <span>{missionSummary.criticalCheckpoints.join(' ➔ ')}</span>
                </div>
              )}

              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-[11px] text-emerald-300">
                <span className="font-bold">Why this route: </span>
                {missionSummary.justification}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsMissionModalOpen(false)}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  ✓ Confirm & Close
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* EDIT/ADD SHIPMENT MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingShipment ? 'Edit Shipment' : 'Add New Shipment'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shipment ID</label>
              <input type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} disabled={!!editingShipment} className={`w-full bg-gray-50 dark:bg-[#0a0c14] border ${errors.id ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} rounded px-3 py-2 text-gray-900 dark:text-white`} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Priority</label>
              <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})} className="w-full bg-gray-50 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded px-3 py-2 text-gray-900 dark:text-white">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cargo</label>
            <input type="text" value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})} className={`w-full bg-gray-50 dark:bg-[#0a0c14] border ${errors.cargo ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} rounded px-3 py-2 text-gray-900 dark:text-white`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Origin</label>
              <input type="text" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} className={`w-full bg-gray-50 dark:bg-[#0a0c14] border ${errors.origin ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} rounded px-3 py-2 text-gray-900 dark:text-white`} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Destination</label>
              <input type="text" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className={`w-full bg-gray-50 dark:bg-[#0a0c14] border ${errors.destination ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} rounded px-3 py-2 text-gray-900 dark:text-white`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Risk</label>
              <select value={formData.risk} onChange={e => setFormData({...formData, risk: e.target.value as any})} className="w-full bg-gray-50 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded px-3 py-2 text-gray-900 dark:text-white">
                <option value="LOW">Low</option>
                <option value="MODERATE">Moderate</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ETA</label>
              <input type="text" value={formData.eta} onChange={e => setFormData({...formData, eta: e.target.value})} className="w-full bg-gray-50 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded px-3 py-2 text-gray-900 dark:text-white" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/5">
            <button type="button" onClick={() => setIsModalOpen(false)} disabled={submitting} className="px-4 py-2 bg-gray-800 text-white rounded cursor-pointer">Cancel</button>
            <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded cursor-pointer">
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

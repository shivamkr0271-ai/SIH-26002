import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Search, Filter, MapPin, Navigation, Truck, Plus, Edit, Trash2, Save, RefreshCw } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Vehicle } from '@/types';
import Modal from '@/components/ui/Modal';

export default function FleetTracking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const statusParam = searchParams.get('status') || searchParams.get('filter');

  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(() => {
    if (statusParam && statusParam.toUpperCase() === 'DELAYED') return 'DELAYED';
    if (statusParam && statusParam.toUpperCase() === 'IN TRANSIT') return 'IN TRANSIT';
    return 'ALL';
  });

  useEffect(() => {
    if (statusParam) {
      if (statusParam.toUpperCase() === 'DELAYED') setStatusFilter('DELAYED');
      else if (statusParam.toUpperCase() === 'IN TRANSIT') setStatusFilter('IN TRANSIT');
      else setStatusFilter('ALL');
    }
  }, [statusParam]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    id: '', cargoType: 'MEDICINES', status: 'IN TRANSIT', origin: '', destination: '', cargo: '', currentLocation: [0, 0]
  });

  const activeVehicles = vehicles.filter(v => v.status === 'IN TRANSIT').length;
  const delayedVehicles = vehicles.filter(v => v.status === 'DELAYED').length;
  const emergencyVehicles = vehicles.filter(v => v.status === 'HALTED').length;

  const filteredVehicles = vehicles.filter(v => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      v.id.toLowerCase().includes(query) || 
      v.cargo.toLowerCase().includes(query) ||
      v.origin.toLowerCase().includes(query) ||
      v.destination.toLowerCase().includes(query) ||
      v.status.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openAdd = () => {
    setEditingVehicle(null);
    setFormData({
      id: 'NER-V' + Math.floor(Math.random() * 900 + 100),
      cargoType: 'MEDICINES',
      status: 'IN TRANSIT',
      origin: '',
      destination: '',
      cargo: '',
      currentLocation: [25.5, 91.5]
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setFormData(v);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if(confirm('Delete vehicle ' + id + '?')) {
      deleteVehicle(id);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.id) newErrors.id = 'Vehicle ID is required.';
    else if (!editingVehicle && vehicles.some(v => v.id === formData.id)) newErrors.id = 'Vehicle ID already exists.';
    
    if (!formData.cargo) newErrors.cargo = 'Cargo type is required.';
    if (!formData.origin) newErrors.origin = 'Origin is required.';
    if (!formData.destination) newErrors.destination = 'Destination is required.';
    if (!formData.status) newErrors.status = 'Status is required.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const vehiclePayload: Vehicle = {
        id: formData.id || ('NER-V' + Math.floor(Math.random() * 900 + 100)),
        cargo: formData.cargo || 'General Cargo',
        cargoType: (formData.cargoType as any) || 'MEDICINES',
        origin: formData.origin || 'Guwahati',
        destination: formData.destination || 'Aizawl',
        driver: formData.driver || 'Driver Team',
        currentLocation: formData.currentLocation || [26.14, 91.73],
        speed: formData.speed !== undefined ? formData.speed : 48,
        eta: formData.eta || '4 hrs',
        status: (formData.status as any) || 'IN TRANSIT',
        risk: (formData.risk as any) || 'LOW',
        progress: formData.progress !== undefined ? formData.progress : 15
      };

      if (editingVehicle) {
        updateVehicle(vehiclePayload);
      } else {
        addVehicle(vehiclePayload);
      }
      setIsModalOpen(false);
    }, 400);
  };

  return (
    <div className="max-w-[1920px] mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Active Fleet Tracking</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Live monitoring of logistics and supply vehicles</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search ID, Cargo, Status..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-cyan-500 text-gray-900 dark:text-gray-200 w-full sm:w-64 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-[#0a0c14] hover:bg-gray-200 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200 rounded-lg text-sm border border-gray-300 dark:border-white/10 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(8,145,178,0.4)] transition-colors">
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={() => setStatusFilter('ALL')} 
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'ALL' 
              ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
              : 'bg-gray-50 dark:bg-[#0a0c14] border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'
          }`}
        >
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Fleet</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-mono">{vehicles.length}</div>
        </button>

        <button 
          onClick={() => setStatusFilter('IN TRANSIT')} 
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'IN TRANSIT' 
              ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
              : 'bg-gray-50 dark:bg-[#0a0c14] border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'
          }`}
        >
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">In Transit</div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{activeVehicles}</div>
        </button>

        <button 
          onClick={() => setStatusFilter('DELAYED')} 
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'DELAYED' 
              ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
              : 'bg-gray-50 dark:bg-[#0a0c14] border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'
          }`}
        >
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Delayed</div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 font-mono">{delayedVehicles}</div>
        </button>

        <button 
          onClick={() => setStatusFilter('HALTED')} 
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'HALTED' 
              ? 'bg-red-500/10 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
              : 'bg-gray-50 dark:bg-[#0a0c14] border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'
          }`}
        >
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Emergency / Halted</div>
          <div className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 font-mono">{emergencyVehicles}</div>
        </button>
      </div>

      <div className="bg-gray-50 dark:bg-[#0a0c14] border border-gray-300 dark:border-gray-200 dark:border-white/5 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-200 dark:border-white/5 bg-gray-200 dark:bg-white/5">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Vehicle</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Route</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Cargo</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 dark:divide-white/5">
              {filteredVehicles.map(vehicle => (
                <tr key={vehicle.id} className="hover:bg-gray-200 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-300 dark:bg-white/5 border border-gray-400 dark:border-gray-300 dark:border-white/10 flex items-center justify-center shrink-0 group-hover:border-cyan-500/50 transition-colors">
                        <Truck className="w-5 h-5 text-gray-600 dark:text-cyan-500" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{vehicle.id}</div>
                        <div className="text-xs text-gray-500">{vehicle.cargoType}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={
                      vehicle.status === 'IN TRANSIT' ? 'success' : 
                      vehicle.status === 'DELAYED' ? 'warning' : 
                      vehicle.status === 'HALTED' ? 'error' : 'default'
                    }>
                      {vehicle.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3 w-48 lg:w-64">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                        <div className="w-0.5 h-6 bg-gray-300 dark:bg-white/10"></div>
                        <div className="w-2 h-2 rounded-full border-2 border-cyan-500"></div>
                      </div>
                      <div className="flex flex-col justify-between h-10 flex-1">
                        <div className="text-xs font-medium text-gray-900 dark:text-gray-300 truncate">{vehicle.origin}</div>
                        <div className="text-xs font-medium text-gray-900 dark:text-gray-300 truncate">{vehicle.destination}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{vehicle.cargo}</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(vehicle)} className="p-2 text-gray-500 hover:text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(vehicle.id)} className="p-2 text-gray-500 hover:text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => !submitting && setIsModalOpen(false)} title={editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vehicle ID *</label>
              <input 
                type="text" 
                value={formData.id} 
                onChange={e => setFormData({...formData, id: e.target.value})}
                disabled={!!editingVehicle}
                className={`w-full bg-gray-50 dark:bg-[#0a0c14] border ${errors.id ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} rounded px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50`}
              />
              {errors.id && <p className="text-red-500 text-xs mt-1">{errors.id}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Type</label>
              <select 
                value={formData.cargoType} 
                onChange={e => setFormData({...formData, cargoType: e.target.value as any})}
                className="w-full bg-gray-50 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="MEDICINES">Medicines</option>
                <option value="FOOD">Food</option>
                <option value="FUEL">Fuel</option>
                <option value="CONSTRUCTION MATERIAL">Construction Material</option>
                <option value="AGRICULTURAL PRODUCE">Agricultural Produce</option>
                <option value="EMERGENCY EQUIPMENT">Emergency Equipment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cargo Name *</label>
            <input 
              type="text" 
              placeholder="e.g. Medical Supplies, Rations"
              value={formData.cargo} 
              onChange={e => setFormData({...formData, cargo: e.target.value})}
              className={`w-full bg-gray-50 dark:bg-[#0a0c14] border ${errors.cargo ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} rounded px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500`}
            />
            {errors.cargo && <p className="text-red-500 text-xs mt-1">{errors.cargo}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Origin *</label>
              <input 
                type="text" 
                value={formData.origin || ''} 
                onChange={e => setFormData({...formData, origin: e.target.value})}
                className={`w-full bg-gray-50 dark:bg-[#0a0c14] border ${errors.origin ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} rounded px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500`}
              />
              {errors.origin && <p className="text-red-500 text-xs mt-1">{errors.origin}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Destination *</label>
              <input 
                type="text" 
                value={formData.destination || ''} 
                onChange={e => setFormData({...formData, destination: e.target.value})}
                className={`w-full bg-gray-50 dark:bg-[#0a0c14] border ${errors.destination ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} rounded px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500`}
              />
              {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status *</label>
            <select 
              value={formData.status} 
              onChange={e => setFormData({...formData, status: e.target.value as any})}
              className={`w-full bg-gray-50 dark:bg-[#0a0c14] border ${errors.status ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} rounded px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500`}
            >
              <option value="IN TRANSIT">In Transit</option>
              <option value="DELAYED">Delayed</option>
              <option value="HALTED">Halted</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/5">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded shadow-[0_0_15px_rgba(8,145,178,0.4)] disabled:opacity-50"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {submitting ? 'Saving...' : 'Save Vehicle'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RefreshCw, Search, Plus, Filter, MapPin, Clock, ArrowRight, Save, Trash2, Edit } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { FieldReport } from '@/types';
import Modal from '@/components/ui/Modal';

export default function FieldReports() {
  const navigate = useNavigate();
  const { fieldReports, addReport, updateReport, deleteReport, syncOfflineReports, settings } = useData();
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<FieldReport | null>(null);
  
  const [formData, setFormData] = useState<Partial<FieldReport>>({
    id: '', incidentType: '', locationName: '', description: '', severity: '' as any, officerName: '', status: 'ACTIVE', timestamp: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pendingCount = fieldReports.filter(r => r.status === 'PENDING_SYNC' || r.status === ('WAITING' as any)).length;

  const filteredReports = fieldReports.filter(r => 
    r.incidentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.severity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAdd = () => {
    setEditingReport(null);
    setFormData({
      id: 'FR-' + Math.floor(Math.random() * 9000 + 1000),
      incidentType: 'Landslide',
      locationName: '',
      description: '',
      severity: '' as any,
      officerName: 'Officer 01',
      status: 'ACTIVE',
      timestamp: new Date().toISOString()
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (r: FieldReport) => {
    setEditingReport(r);
    setFormData(r);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if(confirm('Delete this field report?')) {
      deleteReport(id);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.id) newErrors.id = 'Report ID is required.';
    if (!formData.officerName) newErrors.officerName = 'Officer Name is required.';
    if (!formData.locationName) newErrors.locationName = 'Location / District is required.';
    if (!formData.incidentType) newErrors.incidentType = 'Incident Type is required.';
    if (!formData.severity) newErrors.severity = 'Severity is required.';
    if (!formData.description) newErrors.description = 'Description is required.';
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
      if(editingReport) {
        updateReport(formData as FieldReport);
      } else {
        addReport(formData as FieldReport);
      }
      setIsModalOpen(false);
    }, 1000);
  };

  return (
    <div className="max-w-[1920px] mx-auto space-y-6 pb-20">
      {settings.offlineMode && (
        <div className="bg-amber-500/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
          <p className="text-amber-600 dark:text-amber-400 font-bold">Offline Mode Active — Changes will synchronize when connectivity is restored.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Field Intelligence Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Ground-truth incident reporting and offline synchronization queue</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#0a0c14] border border-gray-200 dark:border-white/5 rounded-lg px-4 py-2 shadow-inner">
            <div className="flex items-center gap-2 border-r border-gray-300 dark:border-white/10 pr-4">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pending Sync</span>
              <span className={`text-lg font-mono font-bold ${pendingCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{pendingCount}</span>
            </div>
            <button 
              onClick={syncOfflineReports}
              disabled={pendingCount === 0}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-all ${pendingCount === 0 ? 'text-gray-600 cursor-not-allowed' : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-600 dark:text-cyan-400 shadow-[0_0_15px_rgba(8,145,178,0.3)]'}`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Now
            </button>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(8,145,178,0.4)]">
            <Plus className="w-4 h-4" /> Add Field Report
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search reports by location, type, or content..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-cyan-500 text-gray-900 dark:text-gray-200"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#0a0c14] hover:bg-gray-200 dark:hover:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-lg text-sm transition-colors">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="group hover:border-cyan-500/30">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Badge variant={report.severity === 'CRITICAL' || report.severity === 'High' ? 'error' : report.severity === 'Moderate' ? 'warning' : 'info'}>
                  {report.severity || 'UNKNOWN'}
                </Badge>
                <Badge variant="default" className="bg-gray-200 dark:bg-gray-50 dark:bg-[#0a0c14] border-gray-300 dark:border-white/10">{report.id}</Badge>
              </div>
              <Badge variant={report.status === 'PENDING_SYNC' || report.status === ('WAITING' as any) ? 'warning' : 'success'}>
                {report.status}
              </Badge>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{report.incidentType}</h3>
            
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4 text-cyan-500" /> {report.locationName}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Clock className="w-4 h-4 text-cyan-500" /> {new Date(report.timestamp).toLocaleString()}
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 bg-gray-100 dark:bg-white/5 p-4 rounded-lg">
              "{report.description}"
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-300 dark:border-gray-200 dark:border-white/5">
              <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">
                Reporter: <span className="text-cyan-600 dark:text-cyan-400">{report.officerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(report)} className="px-3 py-1.5 text-xs font-bold text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded flex items-center gap-2 transition-colors">
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(report.id)} className="px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded flex items-center gap-2 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !submitting && setIsModalOpen(false)} 
        title={editingReport ? 'Edit Field Report' : 'Add Field Report'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Report ID *</label>
              <input 
                type="text" 
                value={formData.id} 
                onChange={e => setFormData({...formData, id: e.target.value})}
                className={`w-full bg-gray-50 dark:bg-[#0a0c14] border ${errors.id ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} rounded px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500`}
              />
              {errors.id && <p className="text-red-500 text-xs mt-1">{errors.id}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Officer Name *</label>
              <input 
                type="text" 
                value={formData.officerName} 
                onChange={e => setFormData({...formData, officerName: e.target.value})}
                className={`w-full bg-gray-50 dark:bg-[#0a0c14] border ${errors.officerName ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} rounded px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500`}
              />
              {errors.officerName && <p className="text-red-500 text-xs mt-1">{errors.officerName}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Location / District *</label>
            <input 
              type="text" 
              placeholder="e.g. Shillong, Meghalaya"
              value={formData.locationName} 
              onChange={e => setFormData({...formData, locationName: e.target.value})}
              className={`w-full bg-gray-50 dark:bg-[#0a0c14] border ${errors.locationName ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} rounded px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500`}
            />
            {errors.locationName && <p className="text-red-500 text-xs mt-1">{errors.locationName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Incident Type *</label>
              <select 
                value={formData.incidentType} 
                onChange={e => setFormData({...formData, incidentType: e.target.value})}
                className={`w-full bg-gray-50 dark:bg-[#0a0c14] border ${errors.incidentType ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} rounded px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500`}
              >
                <option value="">Select Type</option>
                <option value="Landslide">Landslide</option>
                <option value="Road Blockage">Road Blockage</option>
                <option value="Accident">Accident</option>
                <option value="Bridge Damage">Bridge Damage</option>
                <option value="Flooding">Flooding</option>
              </select>
              {errors.incidentType && <p className="text-red-500 text-xs mt-1">{errors.incidentType}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Severity *</label>
              <select 
                value={formData.severity} 
                onChange={e => setFormData({...formData, severity: e.target.value as any})}
                className={`w-full bg-gray-50 dark:bg-[#0a0c14] border ${errors.severity ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} rounded px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500`}
              >
                <option value="">Select Severity</option>
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="CRITICAL">Critical</option>
              </select>
              {errors.severity && <p className="text-red-500 text-xs mt-1">{errors.severity}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description *</label>
            <textarea 
              rows={4}
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              className={`w-full bg-gray-50 dark:bg-[#0a0c14] border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} rounded px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status *</label>
            <select 
              value={formData.status} 
              onChange={e => setFormData({...formData, status: e.target.value as any})}
              className={`w-full bg-gray-50 dark:bg-[#0a0c14] border ${errors.status ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} rounded px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500`}
            >
              <option value="ACTIVE">Active</option>
              <option value="RESOLVED">Resolved</option>
              <option value="SYNCED">Synced</option>
              <option value="PENDING_SYNC">Pending Sync</option>
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
              {submitting ? 'Submitting...' : 'Save Report'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

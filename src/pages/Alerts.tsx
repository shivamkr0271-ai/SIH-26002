import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, Clock, MapPin, Search, Filter, ShieldAlert, CheckCircle, Plus, RefreshCw } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import Modal from '@/components/ui/Modal';
import { Incident } from '@/types';

export default function Alerts() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || searchParams.get('severity');

  const { incidents, addIncident, updateIncident } = useData();
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'warning' | 'info'>(() => {
    if (tabParam && ['critical', 'warning', 'info'].includes(tabParam.toLowerCase())) {
      return tabParam.toLowerCase() as any;
    }
    return 'all';
  });

  useEffect(() => {
    if (tabParam && ['critical', 'warning', 'info'].includes(tabParam.toLowerCase())) {
      setActiveTab(tabParam.toLowerCase() as any);
    }
  }, [tabParam]);
  const [pulse, setPulse] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<Partial<Incident>>({
    id: '', title: '', type: 'Weather', severity: 'WARNING', status: 'ACTIVE', locationName: '', predictedImpact: '', timestamp: ''
  });

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  const filtered = incidents.filter(i => 
    (activeTab === 'all' || i.severity.toLowerCase() === activeTab) && 
    (i.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     i.locationName.toLowerCase().includes(searchQuery.toLowerCase()) || 
     i.type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAcknowledge = (incident: Incident) => {
    updateIncident({...incident, status: 'ACKNOWLEDGED' as any});
  };

  const handleResolve = (incident: Incident) => {
    updateIncident({...incident, status: 'RESOLVED' as any});
  };

  const openAdd = () => {
    setFormData({
      id: 'INC-' + Math.floor(Math.random() * 900 + 100),
      title: '',
      type: 'Weather',
      severity: 'WARNING',
      status: 'ACTIVE',
      locationName: '',
      predictedImpact: '',
      recommendedAction: 'Awaiting instruction',
      timestamp: new Date().toISOString(),
      location: [25.5, 91.5],
      affectedRoute: 'N/A'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.id) newErrors.id = 'Incident ID required.';
    if (!formData.title) newErrors.title = 'Title required.';
    if (!formData.locationName) newErrors.locationName = 'Location required.';
    if (!formData.predictedImpact) newErrors.predictedImpact = 'Description required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const incidentPayload: Incident = {
        id: formData.id || ('INC-' + Math.floor(Math.random() * 900 + 100)),
        title: formData.title || 'Road Disruption Alert',
        type: formData.type || 'Other',
        severity: formData.severity || 'WARNING',
        status: formData.status || 'ACTIVE',
        locationName: formData.locationName || 'NER Highway Corridor',
        predictedImpact: formData.predictedImpact || 'Transit delay expected',
        recommendedAction: formData.recommendedAction || 'Proceed with caution',
        timestamp: formData.timestamp || new Date().toISOString(),
        location: formData.location || [26.14, 91.73],
        affectedRoute: formData.affectedRoute || 'Primary Corridor'
      };
      addIncident(incidentPayload);
      setIsModalOpen(false);
    }, 400);
  };

  return (
    <div className="max-w-[1920px] mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Alerts & Incident Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Real-time disruption warnings and operational events</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400" />
            <input 
              type="text" 
              placeholder="Search incidents..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-cyan-500 text-gray-800 dark:text-gray-200 w-full sm:w-64 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-[#0a0c14] hover:bg-white/5 text-gray-800 dark:text-gray-200 rounded-lg text-sm border border-gray-300 dark:border-white/10 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-colors">
            <Plus className="w-4 h-4" /> Create Incident
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {['all', 'critical', 'warning', 'info'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'bg-cyan-600 text-gray-900 dark:text-white shadow-[0_0_15px_rgba(8,145,178,0.4)]' 
                : 'bg-gray-50 dark:bg-[#0a0c14] text-gray-600 dark:text-gray-400 hover:bg-white/5 border border-gray-200 dark:border-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(incident => (
          <Card key={incident.id} className={`border-l-4 border-r-white/5 border-y-white/5 transition-all duration-1000 ${incident.severity === 'CRITICAL' ? `border-l-red-500 ${pulse ? 'bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-red-950/5 shadow-none'}` : incident.severity === 'WARNING' ? 'border-l-amber-500 bg-amber-950/10' : 'border-l-cyan-500 bg-cyan-950/10'}`}>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <Badge variant={incident.severity === 'CRITICAL' ? 'error' : incident.severity === 'WARNING' ? 'warning' : 'info'}>
                    {incident.severity}
                  </Badge>
                  <Badge variant="default" className="bg-gray-50 dark:bg-[#0a0c14] border-gray-300 dark:border-white/10">{incident.type}</Badge>
                  <Badge variant={incident.status === 'RESOLVED' ? 'success' : incident.status === 'ACKNOWLEDGED' ? 'warning' : 'error'}>
                    {incident.status}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(incident.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{incident.title}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Location / Affected Route</div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400 shrink-0" />
                      <span>{incident.locationName} <span className="text-gray-500 mx-1">•</span> {incident.affectedRoute}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Impact</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {incident.predictedImpact}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-[#05070a]/50 rounded-lg p-3 border border-gray-200 dark:border-white/5 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-cyan-500 font-bold uppercase tracking-wider mb-1">Recommended Action</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">{incident.recommendedAction}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-48">
                {incident.status === 'RESOLVED' ? (
                  <div className="flex-1 md:flex-none px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm font-medium rounded text-center flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Resolved
                  </div>
                ) : incident.status === 'ACKNOWLEDGED' ? (
                  <>
                    <div className="flex-1 md:flex-none px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-sm font-medium rounded text-center flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4" /> Ack'd
                    </div>
                    <button onClick={() => handleResolve(incident)} className="flex-1 md:flex-none px-4 py-2 bg-gray-50 dark:bg-[#0a0c14] hover:bg-emerald-500/20 hover:text-emerald-600 dark:text-emerald-400 border border-gray-300 dark:border-white/10 text-gray-800 dark:text-gray-200 text-sm font-medium rounded transition-colors text-center">
                      Mark Resolved
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleAcknowledge(incident)} className="flex-1 md:flex-none px-4 py-2 bg-gray-50 dark:bg-[#0a0c14] hover:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-800 dark:text-gray-200 text-sm font-medium rounded transition-colors text-center">
                    Acknowledge
                  </button>
                )}
                
                <button onClick={() => navigate(`/map?lat=${incident.location[0]}&lng=${incident.location[1]}&zoom=11`)} className="flex-1 md:flex-none px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-sm font-medium rounded transition-colors text-center">
                  View on Map
                </button>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center p-8 text-gray-500">No incidents match your criteria.</div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => !submitting && setIsModalOpen(false)} title="Create Incident Alert">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Incident ID</label>
              <input type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className={`w-full bg-gray-50 dark:bg-[#0a0c14] border ${errors.id ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} rounded px-3 py-2 text-gray-900 dark:text-white`} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full bg-gray-50 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded px-3 py-2 text-gray-900 dark:text-white">
                <option value="Landslide">Landslide</option>
                <option value="Flood">Flood</option>
                <option value="Road Damage">Road Damage</option>
                <option value="Bridge Damage">Bridge Damage</option>
                <option value="Traffic">Traffic</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Severity</label>
            <select value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value as any})} className="w-full bg-gray-50 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded px-3 py-2 text-gray-900 dark:text-white">
              <option value="INFO">Info</option>
              <option value="WARNING">Warning</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Title</label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={`w-full bg-gray-50 dark:bg-[#0a0c14] border ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} rounded px-3 py-2 text-gray-900 dark:text-white`} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Location</label>
            <input type="text" value={formData.locationName} onChange={e => setFormData({...formData, locationName: e.target.value})} className={`w-full bg-gray-50 dark:bg-[#0a0c14] border ${errors.locationName ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} rounded px-3 py-2 text-gray-900 dark:text-white`} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Description / Impact</label>
            <textarea rows={3} value={formData.predictedImpact} onChange={e => setFormData({...formData, predictedImpact: e.target.value})} className={`w-full bg-gray-50 dark:bg-[#0a0c14] border ${errors.predictedImpact ? 'border-red-500' : 'border-gray-300 dark:border-white/10'} rounded px-3 py-2 text-gray-900 dark:text-white`} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/5">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-800 text-white rounded">Cancel</button>
            <button type="submit" disabled={submitting} className="px-6 py-2 bg-red-600 text-white font-bold rounded">
              {submitting ? 'Creating...' : 'Create Alert'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

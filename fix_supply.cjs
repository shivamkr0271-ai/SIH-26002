const fs = require('fs');

const code = `import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Search, Filter, Box, ArrowRight, Package, Truck, Calendar, Edit, Trash2, Plus, Save, RefreshCw } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Shipment } from '@/types';
import { Modal } from '@/components/ui/Modal';

export default function SupplyChain() {
  const { shipments, addShipment, updateShipment, deleteShipment } = useData();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<Partial<Shipment>>({
    id: '', contents: '', origin: '', destination: '', status: 'IN_TRANSIT', priority: 'NORMAL', estimatedArrival: ''
  });

  const filteredShipments = shipments.filter(s => 
    (activeTab === 'all' || s.status.toLowerCase() === activeTab.replace('_', '')) &&
    (s.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
     s.contents.toLowerCase().includes(searchQuery.toLowerCase()) ||
     s.destination.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openAdd = () => {
    setEditingShipment(null);
    setFormData({
      id: 'SHP-' + Math.floor(Math.random() * 9000 + 1000),
      contents: '',
      origin: '',
      destination: '',
      status: 'PENDING',
      priority: 'NORMAL',
      estimatedArrival: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
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
    if(confirm('Delete shipment ' + id + '?')) {
      deleteShipment(id);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.id) newErrors.id = 'ID required';
    if (!formData.contents) newErrors.contents = 'Contents required';
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
      if(editingShipment) updateShipment(formData as Shipment);
      else addShipment(formData as Shipment);
      setIsModalOpen(false);
    }, 800);
  };

  return (
    <div className="max-w-[1920px] mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Supply Chain Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">End-to-end visibility of critical cargo and resources</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search shipments..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-cyan-500 text-gray-900 dark:text-gray-200 w-full sm:w-64 transition-colors"
            />
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(8,145,178,0.4)] transition-colors">
            <Plus className="w-4 h-4" /> New Shipment
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {['all', 'pending', 'in_transit', 'delayed', 'delivered'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={\`px-4 py-2 rounded-lg text-sm font-medium uppercase tracking-wider whitespace-nowrap transition-colors \${
              activeTab === tab 
                ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.4)]' 
                : 'bg-gray-200 dark:bg-[#0a0c14] text-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-white/5 border border-gray-300 dark:border-white/5'
            }\`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

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

            <div className="bg-gray-100 dark:bg-[#05070a]/50 rounded-lg p-3 border border-gray-300 dark:border-white/5 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{shipment.contents}</span>
              </div>
              <div className="flex items-center justify-between mt-3 relative">
                <div className="absolute left-4 right-4 top-1/2 h-0.5 bg-gray-300 dark:bg-white/10 -z-10"></div>
                <div className="bg-gray-100 dark:bg-[#05070a] px-2 text-xs font-bold text-gray-500 truncate max-w-[40%]">{shipment.origin}</div>
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Truck className="w-3 h-3 text-cyan-500" />
                </div>
                <div className="bg-gray-100 dark:bg-[#05070a] px-2 text-xs font-bold text-gray-500 truncate max-w-[40%] text-right">{shipment.destination}</div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-300 dark:border-white/5 pt-3">
              <Badge variant={
                shipment.status === 'DELIVERED' ? 'success' : 
                shipment.status === 'DELAYED' ? 'error' : 
                shipment.status === 'IN_TRANSIT' ? 'info' : 'default'
              }>
                {shipment.status.replace('_', ' ')}
              </Badge>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <Calendar className="w-3.5 h-3.5" />
                ETA: {new Date(shipment.estimatedArrival).toLocaleDateString()}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => !submitting && setIsModalOpen(false)} title={editingShipment ? 'Edit Shipment' : 'New Shipment'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shipment ID</label>
              <input type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} disabled={!!editingShipment} className={\`w-full bg-[#0a0c14] border \${errors.id ? 'border-red-500' : 'border-white/10'} rounded px-3 py-2 text-white disabled:opacity-50\`} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Priority</label>
              <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})} className="w-full bg-[#0a0c14] border border-white/10 rounded px-3 py-2 text-white">
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contents</label>
            <input type="text" value={formData.contents} onChange={e => setFormData({...formData, contents: e.target.value})} className={\`w-full bg-[#0a0c14] border \${errors.contents ? 'border-red-500' : 'border-white/10'} rounded px-3 py-2 text-white\`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Origin</label>
              <input type="text" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} className={\`w-full bg-[#0a0c14] border \${errors.origin ? 'border-red-500' : 'border-white/10'} rounded px-3 py-2 text-white\`} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Destination</label>
              <input type="text" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className={\`w-full bg-[#0a0c14] border \${errors.destination ? 'border-red-500' : 'border-white/10'} rounded px-3 py-2 text-white\`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full bg-[#0a0c14] border border-white/10 rounded px-3 py-2 text-white">
                <option value="PENDING">Pending</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELAYED">Delayed</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ETA</label>
              <input type="date" value={formData.estimatedArrival?.split('T')[0]} onChange={e => setFormData({...formData, estimatedArrival: e.target.value})} className="w-full bg-[#0a0c14] border border-white/10 rounded px-3 py-2 text-white" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button type="button" onClick={() => setIsModalOpen(false)} disabled={submitting} className="px-4 py-2 bg-gray-800 text-white rounded">Cancel</button>
            <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded">
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/SupplyChain.tsx', code);

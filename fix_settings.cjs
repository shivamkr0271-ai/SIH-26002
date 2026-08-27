const fs = require('fs');

const code = `import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Settings as SettingsIcon, Bell, Shield, Database, Monitor, Moon, Sun, Smartphone, RefreshCw, Trash2, HardDrive, LayoutTemplate, WifiOff } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

export default function SettingsPage() {
  const { settings, updateSettings, resetData, clearLocalData, syncOfflineReports, fieldReports } = useData();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const pendingSync = fieldReports.filter(r => r.status === ('PENDING_SYNC' as any)).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-cyan-500" /> System Preferences
        </h1>
        <p className="text-gray-400 mt-1">Manage application settings and local data state.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          
          <Card>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-gray-400" /> Appearance
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-3">Color Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => updateSettings({theme: 'dark'})}
                    className={\`py-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-colors \${settings.theme === 'dark' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-[#0a0c14] border-white/10 text-gray-400 hover:border-white/30'}\`}
                  >
                    <Moon className="w-5 h-5" />
                    <span className="text-sm font-medium">Dark Mode</span>
                  </button>
                  <button 
                    onClick={() => updateSettings({theme: 'light'})}
                    className={\`py-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-colors \${settings.theme === 'light' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-[#0a0c14] border-white/10 text-gray-400 hover:border-white/30'}\`}
                  >
                    <Sun className="w-5 h-5" />
                    <span className="text-sm font-medium">Light Mode</span>
                  </button>
                  <button 
                    onClick={() => updateSettings({theme: 'system'})}
                    className={\`py-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-colors \${settings.theme === 'system' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-[#0a0c14] border-white/10 text-gray-400 hover:border-white/30'}\`}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span className="text-sm font-medium">System</span>
                  </button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Compact Dashboard</div>
                  <div className="text-xs text-gray-500">Reduce spacing and padding across the application.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={settings.compactMode} onChange={(e) => updateSettings({compactMode: e.target.checked})} />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-400" /> Notifications & Sync
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Enable Notifications</div>
                  <div className="text-xs text-gray-500">Show toast notifications for non-critical events.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={settings.notificationsEnabled} onChange={(e) => updateSettings({notificationsEnabled: e.target.checked})} />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>
              
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Auto Refresh Data</div>
                  <div className="text-xs text-gray-500">Periodically poll for simulated remote changes.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={settings.autoRefresh} onChange={(e) => updateSettings({autoRefresh: e.target.checked})} />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-medium text-amber-400 flex items-center gap-2">
                    <WifiOff className="w-4 h-4" /> Offline Mode
                  </div>
                  <div className="text-xs text-gray-500">Queue actions locally instead of immediate sync.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={settings.offlineMode} onChange={(e) => updateSettings({offlineMode: e.target.checked})} />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
              
              {settings.offlineMode && pendingSync > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between mt-2">
                  <div className="text-amber-400 text-sm font-bold">{pendingSync} items pending sync</div>
                  <button onClick={syncOfflineReports} className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded">SYNC NOW</button>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-gray-400" /> Data Management
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                <div>
                  <div className="font-bold text-white">Reset Demo Data</div>
                  <div className="text-sm text-gray-400">Restore the original mock dataset.</div>
                </div>
                {showResetConfirm ? (
                  <div className="flex gap-2">
                    <button onClick={() => setShowResetConfirm(false)} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white">Cancel</button>
                    <button onClick={() => { resetData(); setShowResetConfirm(false); }} className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded text-sm text-white font-bold">Confirm Reset</button>
                  </div>
                ) : (
                  <button onClick={() => setShowResetConfirm(true)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded flex items-center gap-2 text-sm transition-colors">
                    <RefreshCw className="w-4 h-4" /> Reset
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-red-950/20 border border-red-500/20 rounded-lg">
                <div>
                  <div className="font-bold text-red-400">Clear Local Data</div>
                  <div className="text-sm text-gray-400">Delete all stored entries (vehicles, reports, etc.)</div>
                </div>
                {showClearConfirm ? (
                  <div className="flex gap-2">
                    <button onClick={() => setShowClearConfirm(false)} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white">Cancel</button>
                    <button onClick={() => { clearLocalData(); setShowClearConfirm(false); }} className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded text-sm text-white font-bold">Confirm Clear</button>
                  </div>
                ) : (
                  <button onClick={() => setShowClearConfirm(true)} className="px-4 py-2 bg-red-900/40 hover:bg-red-800/60 text-red-300 rounded flex items-center gap-2 text-sm transition-colors">
                    <Trash2 className="w-4 h-4" /> Clear All
                  </button>
                )}
              </div>
            </div>
          </Card>

        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-400" /> System Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400 text-sm">Version</span>
                <span className="text-white font-mono text-sm">v2.4.0-prototype</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400 text-sm">Data Mode</span>
                <Badge variant="warning">PROTOTYPE</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400 text-sm">Storage</span>
                <span className="text-white flex items-center gap-1 text-sm"><HardDrive className="w-3.5 h-3.5" /> Local</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400 text-sm">Last Sync</span>
                <span className="text-cyan-400 text-sm">Just now</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-cyan-950/30 border border-cyan-500/20 rounded-lg text-xs text-cyan-400 leading-relaxed">
              <strong>Notice:</strong> This is an interactive prototype. Data is stored locally in your browser and is not connected to live government databases.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'warning' | 'error' | 'success' }) {
  const v = {
    'default': 'bg-gray-800 text-gray-300',
    'warning': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    'error': 'bg-red-500/20 text-red-400 border border-red-500/30',
    'success': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
  }[variant];
  return <span className={\`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider \${v}\`}>{children}</span>;
}
`;

fs.writeFileSync('src/pages/Settings.tsx', code);

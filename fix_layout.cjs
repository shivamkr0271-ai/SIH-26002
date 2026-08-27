const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Layout.tsx', 'utf8');

code = code.replace(`import { useState } from 'react';`, `import { useState } from 'react';\nimport { useData } from '@/contexts/DataContext';`);

// Global Search
code = code.replace(
  `<input type="text" placeholder="Global search..." className="w-full bg-[#0a0c14] border border-white/5 rounded-full py-1.5 pl-9 pr-4 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50" />`,
  `<input type="text" placeholder="Global search..." className="w-full bg-[#0a0c14] border border-white/5 rounded-full py-1.5 pl-9 pr-4 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50" />`
); // Note: Full global search requires a dropdown. Let's make it simpler if needed. The user requested: "Global Search Make the top search bar functional. Search across Vehicles, Shipments..."
// I'll skip implementing complex global search popover in Layout for a moment and focus on the notification bell.

code = code.replace(
  `<button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors relative">\n            <Bell className="w-5 h-5" />\n            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>\n          </button>`,
  `{/* NOTIFICATIONS */}\n          <button onClick={() => setShowNotifs(!showNotifs)} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors relative">\n            <Bell className="w-5 h-5" />\n            {notifications.filter(n => !n.read).length > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">{notifications.filter(n => !n.read).length}</span>}\n          </button>\n          {showNotifs && (\n            <div className="absolute top-14 right-4 w-80 bg-[#0a0c14] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">\n              <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5">\n                <h3 className="font-bold text-white text-sm">Notifications</h3>\n                <button onClick={markAllNotificationsRead} className="text-xs text-cyan-400 hover:text-cyan-300">Mark all read</button>\n              </div>\n              <div className="max-h-96 overflow-y-auto custom-scrollbar">\n                {notifications.length === 0 ? (\n                  <div className="p-4 text-center text-sm text-gray-500">No notifications</div>\n                ) : notifications.map(n => (\n                  <div key={n.id} onClick={() => markNotificationRead(n.id)} className={\`p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors \${n.read ? 'opacity-50' : ''}\`}>\n                    <div className="flex justify-between items-start mb-1">\n                      <span className={\`text-xs font-bold \${n.type === 'critical' ? 'text-red-400' : n.type === 'success' ? 'text-emerald-400' : n.type === 'warning' ? 'text-amber-400' : 'text-cyan-400'}\`}>{n.title}</span>\n                      <span className="text-[10px] text-gray-500">{new Date(n.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>\n                    </div>\n                    <p className="text-xs text-gray-300">{n.message}</p>\n                  </div>\n                ))}\n              </div>\n            </div>\n          )}`
);

// We need to inject state for showNotifs and pull notifications
code = code.replace(
  `export default function Layout({ children }: { children: ReactNode }) {\n  const location = useLocation();`,
  `export default function Layout({ children }: { children: ReactNode }) {\n  const location = useLocation();\n  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();\n  const [showNotifs, setShowNotifs] = useState(false);`
);

fs.writeFileSync('src/components/layout/Layout.tsx', code);

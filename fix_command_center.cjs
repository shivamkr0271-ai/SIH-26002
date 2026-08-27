const fs = require('fs');

let code = fs.readFileSync('src/pages/CommandCenter.tsx', 'utf8');

// Replace KPIs static numbers with actual counts from context.
code = code.replace(
  `{ label: 'Active Vehicles', value: vehicles.length.toString(), icon: Truck, trend: '+45', color: 'text-emerald-400' },`,
  `{ label: 'Active Vehicles', value: vehicles.length.toString(), icon: Truck, trend: '+1', color: 'text-emerald-400' },`
);

code = code.replace(
  `{ label: 'Field Reports', value: '842', icon: Activity, trend: '+12', color: 'text-cyan-400' },`,
  `{ label: 'Field Reports', value: fieldReports.length.toString(), icon: Activity, trend: '+2', color: 'text-cyan-400' },`
);

code = code.replace(
  `{ label: 'Active Alerts', value: '14', icon: AlertTriangle, trend: '-3', color: 'text-red-400' },`,
  `{ label: 'Active Alerts', value: incidents.filter(i => i.status !== 'RESOLVED').length.toString(), icon: AlertTriangle, trend: '+1', color: 'text-red-400' },`
);

code = code.replace(
  `{ label: 'Shipments', value: '1,204', icon: Box, trend: '+156', color: 'text-amber-400' }`,
  `{ label: 'Shipments', value: shipments.length.toString(), icon: Box, trend: '+5', color: 'text-amber-400' }`
);

// We need to bring in activities to the recent activity list
code = code.replace(
  `const { vehicles, fieldReports, incidents, shipments } = useData();`,
  `const { vehicles, fieldReports, incidents, shipments, activities } = useData();`
);

// We need to replace the fake list in "Recent Activity"
code = code.replace(
  `{[1, 2, 3, 4].map(i => (`,
  `{(activities.length > 0 ? activities.slice(0, 5) : [1,2,3,4]).map((activity: any, i: number) => (`
);
code = code.replace(
  `<div key={i} className="flex gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group">`,
  `<div key={activity.id || i} className="flex gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group">`
);
code = code.replace(
  `<div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/20">\n                    <Activity className="w-4 h-4 text-cyan-400" />\n                  </div>`,
  `<div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/20">\n                    {activity.type === 'vehicle' ? <Truck className="w-4 h-4 text-emerald-400" /> : activity.type === 'incident' ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <Activity className="w-4 h-4 text-cyan-400" />}\n                  </div>`
);
code = code.replace(
  `<p className="text-sm text-gray-200">Convoy NER-7A reached checkpoint <span className="text-cyan-400">Tezpur</span></p>`,
  `<p className="text-sm text-gray-200">{activity.action || "System initialized"}</p>`
);
code = code.replace(
  `<span className="text-xs text-gray-500 mt-1">{i * 12} mins ago</span>`,
  `<span className="text-xs text-gray-500 mt-1">{activity.time ? new Date(activity.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Just now"}</span>`
);

fs.writeFileSync('src/pages/CommandCenter.tsx', code);

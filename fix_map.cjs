const fs = require('fs');

let code = fs.readFileSync('src/pages/MapPage.tsx', 'utf8');

if (!code.includes('useData')) {
  code = code.replace(`import { Layers, ListFilter, AlertTriangle, ShieldAlert, Truck, Wind, Navigation, Crosshair, Map as MapIcon, Plus, Minus, Search } from 'lucide-react';`, `import { Layers, ListFilter, AlertTriangle, ShieldAlert, Truck, Wind, Navigation, Crosshair, Map as MapIcon, Plus, Minus, Search } from 'lucide-react';\nimport { useData } from '@/contexts/DataContext';`);
}

code = code.replace(
  `export default function MapPage() {`,
  `export default function MapPage() {
  const { vehicles, incidents } = useData();`
);

// We need to replace the static markers with vehicles and incidents.
// First remove the old mock markers
code = code.replace(
  `const activeIncidents = [
    { id: 1, lat: 26.1445, lng: 91.7362, type: 'flood', title: 'NH-6 Flooding', severity: 'CRITICAL' },
    { id: 2, lat: 25.5788, lng: 91.8933, type: 'landslide', title: 'Route Blocked', severity: 'WARNING' },
    { id: 3, lat: 24.8170, lng: 93.9368, type: 'security', title: 'Checkpoint Delay', severity: 'INFO' }
  ];

  const activeVehicles = [
    { id: 'NER-V1', lat: 26.5445, lng: 92.7362, status: 'In Transit' },
    { id: 'NER-V2', lat: 25.1788, lng: 92.8933, status: 'Delayed' },
  ];`,
  ``
);

code = code.replace(
  `{activeIncidents.map(incident => (
              <Marker 
                key={\`inc-\${incident.id}\`}
                position={[incident.lat, incident.lng]}
                icon={createCustomIcon(\`
                  <div class="w-8 h-8 rounded-full border-2 border-[#0a0c14] flex items-center justify-center \${
                    incident.severity === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 
                    incident.severity === 'WARNING' ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-cyan-500'
                  } \${pulse ? 'animate-pulse' : ''}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      \${incident.type === 'flood' ? '<path d="M2 12h20"/><path d="M2 20h20"/><path d="M2 16h20"/>' : 
                       incident.type === 'landslide' ? '<path d="M14.5 18a3.5 3.5 0 0 0-5 0"/><path d="M22 18a10 10 0 0 0-20 0"/>' : 
                       '<path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'}
                    </svg>
                  </div>
                \`)}
              >
                <Popup className="custom-popup">
                  <div className="font-bold text-gray-900 mb-1">{incident.title}</div>
                  <div className={\`text-xs font-bold \${incident.severity === 'CRITICAL' ? 'text-red-500' : incident.severity === 'WARNING' ? 'text-amber-500' : 'text-cyan-500'}\`}>
                    {incident.severity} ALERT
                  </div>
                </Popup>
              </Marker>
            ))}

            {activeVehicles.map(vehicle => (
              <Marker
                key={\`veh-\${vehicle.id}\`}
                position={[vehicle.lat, vehicle.lng]}
                icon={createCustomIcon(\`
                  <div class="w-6 h-6 rounded-md border border-[#0a0c14] flex items-center justify-center \${
                    vehicle.status === 'In Transit' ? 'bg-emerald-500' : 'bg-amber-500'
                  }">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                  </div>
                \`)}
              >
                <Popup className="custom-popup">
                  <div className="font-bold text-gray-900 mb-1">{vehicle.id}</div>
                  <div className="text-xs text-gray-500">{vehicle.status}</div>
                </Popup>
              </Marker>
            ))}`,
  `{incidents.filter(i => i.status !== 'RESOLVED' && i.location).map(incident => (
              <Marker 
                key={\`inc-\${incident.id}\`}
                position={incident.location}
                icon={createCustomIcon(\`
                  <div class="w-8 h-8 rounded-full border-2 border-[#0a0c14] flex items-center justify-center \${
                    incident.severity === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 
                    incident.severity === 'WARNING' ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-cyan-500'
                  } \${pulse ? 'animate-pulse' : ''}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                \`)}
              >
                <Popup className="custom-popup">
                  <div className="font-bold text-gray-900 mb-1">{incident.title}</div>
                  <div className={\`text-xs font-bold \${incident.severity === 'CRITICAL' ? 'text-red-500' : incident.severity === 'WARNING' ? 'text-amber-500' : 'text-cyan-500'}\`}>
                    {incident.severity} ALERT
                  </div>
                </Popup>
              </Marker>
            ))}

            {vehicles.filter(v => v.currentLocation).map(vehicle => (
              <Marker
                key={\`veh-\${vehicle.id}\`}
                position={vehicle.currentLocation}
                icon={createCustomIcon(\`
                  <div class="w-6 h-6 rounded-md border border-[#0a0c14] flex items-center justify-center \${
                    vehicle.status === 'In Transit' ? 'bg-emerald-500' : vehicle.status === 'Emergency' ? 'bg-red-500' : 'bg-amber-500'
                  }">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                  </div>
                \`)}
              >
                <Popup className="custom-popup">
                  <div className="font-bold text-gray-900 mb-1">{vehicle.id}</div>
                  <div className="text-xs text-gray-500">{vehicle.status}</div>
                </Popup>
              </Marker>
            ))}`
);

fs.writeFileSync('src/pages/MapPage.tsx', code);

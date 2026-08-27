const fs = require('fs');

// Fix FleetTracking
let ft = fs.readFileSync('src/pages/FleetTracking.tsx', 'utf8');
if (!ft.includes("import React")) {
  ft = ft.replace(`import { useState }`, `import React, { useState }`);
}
fs.writeFileSync('src/pages/FleetTracking.tsx', ft);

// Fix Alerts
let al = fs.readFileSync('src/pages/Alerts.tsx', 'utf8');
al = al.replace(/const handleAcknowledge = \(id: string\) => \{\n    setIncidents\(prev => prev.map\(i => i.id === id \? \{ \.\.\.i, acked: true \} : i\)\);\n  \};\n/, '');
fs.writeFileSync('src/pages/Alerts.tsx', al);

// Fix CommandCenter
let cc = fs.readFileSync('src/pages/CommandCenter.tsx', 'utf8');
cc = cc.replace(`const { vehicles, fieldReports, incidents, shipments } = useData();\n  const { vehicles, fieldReports, incidents, shipments } = useData();`, `const { vehicles, fieldReports, incidents, shipments } = useData();`);
fs.writeFileSync('src/pages/CommandCenter.tsx', cc);

// Fix DataContext
let dc = fs.readFileSync('src/contexts/DataContext.tsx', 'utf8');
dc = dc.replace(`r.status === 'Resolved' || r.status === 'RESOLVED'`, `r.status === ('Resolved' as any) || r.status === ('RESOLVED' as any)`);
fs.writeFileSync('src/contexts/DataContext.tsx', dc);

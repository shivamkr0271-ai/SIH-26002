const fs = require('fs');
let code = fs.readFileSync('src/pages/CommandCenter.tsx', 'utf8');

code = code.replace(
  `import { incidents, fieldReports, vehicles } from '@/data/mockData';`,
  `import { useData } from '@/contexts/DataContext';`
);

code = code.replace(
  `const [pulse, setPulse] = useState(false);`,
  `const [pulse, setPulse] = useState(false);\n  const { vehicles, fieldReports, incidents, shipments } = useData();`
);

code = code.replace(
  `{KPI_DATA.map`,
  `{[
          { label: 'States Monitored', value: '8', icon: MapIcon, trend: '+0%', color: 'text-cyan-400' },
          { label: 'Critical Corridors', value: '142', icon: Navigation, trend: '+2', color: 'text-amber-400' },
          { label: 'Active Vehicles', value: vehicles.length.toString(), icon: Truck, trend: '+45', color: 'text-emerald-400' },
          { label: 'Network Access', value: '93.7%', icon: Activity, trend: '-1.2%', color: 'text-emerald-400' },
          { label: 'Active Alerts', value: incidents.filter(i => i.status === 'ACTIVE').length.toString(), icon: AlertTriangle, trend: '+5', color: 'text-red-400' },
          { label: 'Emergency Drops', value: shipments.length.toString(), icon: Box, trend: '+12', color: 'text-amber-400' },
          { label: 'Field Reports', value: fieldReports.length.toString(), icon: CheckCircle2, trend: '+28', color: 'text-cyan-400' },
          { label: 'High-Risk Zones', value: '18', icon: MapPin, trend: '+3', color: 'text-red-400' },
        ].map`
);

fs.writeFileSync('src/pages/CommandCenter.tsx', code);

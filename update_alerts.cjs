const fs = require('fs');
let code = fs.readFileSync('src/pages/Alerts.tsx', 'utf8');

code = code.replace(
  `import { incidents as initialIncidents } from '@/data/mockData';`,
  `import { useData } from '@/contexts/DataContext';`
);

code = code.replace(
  `const [incidents, setIncidents] = useState(initialIncidents.map(i => ({...i, acked: false})));`,
  `const { incidents } = useData();\n  const [localIncidents, setLocalIncidents] = useState<{id: string, acked: boolean}[]>([]);\n  \n  // sync state\n  useEffect(() => {\n    setLocalIncidents(prev => {\n      const existing = new Set(prev.map(p => p.id));\n      const newIncs = incidents.filter(i => !existing.has(i.id)).map(i => ({id: i.id, acked: false}));\n      return [...prev, ...newIncs];\n    });\n  }, [incidents]);\n  const isAcked = (id: string) => localIncidents.find(l => l.id === id)?.acked || false;\n  const handleAcknowledge = (id: string) => setLocalIncidents(prev => prev.map(l => l.id === id ? {...l, acked: true} : l));`
);

code = code.replace(
  `const filtered = incidents.filter(i => activeTab === 'all' || i.severity.toLowerCase() === activeTab);`,
  `const [searchQuery, setSearchQuery] = useState('');\n  const filtered = incidents.filter(i => (activeTab === 'all' || i.severity.toLowerCase() === activeTab) && (i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.locationName.toLowerCase().includes(searchQuery.toLowerCase()) || i.type.toLowerCase().includes(searchQuery.toLowerCase())));`
);

code = code.replace(
  `<input \n              type="text" \n              placeholder="Search incidents..." \n              className="pl-9 pr-4 py-2 bg-[#0a0c14] border border-white/10 rounded-lg text-sm focus:outline-none focus:border-cyan-500 text-gray-200 w-full sm:w-64 transition-colors"\n            />`,
  `<input \n              type="text" \n              placeholder="Search incidents..." \n              value={searchQuery}\n              onChange={e => setSearchQuery(e.target.value)}\n              className="pl-9 pr-4 py-2 bg-[#0a0c14] border border-white/10 rounded-lg text-sm focus:outline-none focus:border-cyan-500 text-gray-200 w-full sm:w-64 transition-colors"\n            />`
);

code = code.replace(/incident\.acked/g, `isAcked(incident.id)`);

fs.writeFileSync('src/pages/Alerts.tsx', code);

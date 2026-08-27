const fs = require('fs');
let code = fs.readFileSync('src/pages/MapPage.tsx', 'utf8');

code = code.replace(
  `import { incidents, fieldReports, vehicles } from '@/data/mockData';`,
  `import { useData } from '@/contexts/DataContext';\nimport { incidents, fieldReports, vehicles } from '@/data/mockData'; // Fallback if not mapped`
);
code = code.replace(
  `const [activeLayer, setActiveLayer] = useState('ALL');`,
  `const [activeLayer, setActiveLayer] = useState('ALL');\n  const { vehicles, incidents, fieldReports } = useData();`
);

fs.writeFileSync('src/pages/MapPage.tsx', code);

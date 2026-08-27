const fs = require('fs');

let code = fs.readFileSync('src/components/layout/Layout.tsx', 'utf8');

if(!code.includes('import { useState')) {
  code = code.replace(`import { Bell`, `import { useState, useRef, useEffect } from 'react';\nimport { Bell`);
}

// Add useNavigate
if(!code.includes('import { useNavigate')) {
  code = code.replace(`import { Link, useLocation }`, `import { Link, useLocation, useNavigate }`);
}

// We need to inject the search state logic inside the Layout component.
code = code.replace(`export function Layout({ children }: { children: React.ReactNode }) {`, `export function Layout({ children }: { children: React.ReactNode }) {
  const { vehicles, shipments, fieldReports, incidents } = useData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = (() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results = [];
    
    vehicles.forEach(v => {
      if(v.id.toLowerCase().includes(q) || v.cargo.toLowerCase().includes(q)) {
        results.push({ type: 'Vehicle', title: v.id, desc: \`\${v.cargo} (\${v.status})\`, link: '/fleet' });
      }
    });
    shipments.forEach(s => {
      if(s.id.toLowerCase().includes(q) || s.contents.toLowerCase().includes(q)) {
        results.push({ type: 'Shipment', title: s.id, desc: \`\${s.contents} (\${s.status})\`, link: '/supply' });
      }
    });
    fieldReports.forEach(r => {
      if(r.id.toLowerCase().includes(q) || r.officerName.toLowerCase().includes(q)) {
        results.push({ type: 'Report', title: r.id, desc: \`\${r.incidentType} by \${r.officerName}\`, link: '/reports' });
      }
    });
    incidents.forEach(i => {
      if(i.id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q)) {
        results.push({ type: 'Incident', title: i.id, desc: i.title, link: '/alerts' });
      }
    });
    return results.slice(0, 6);
  })();

  const handleSelectResult = (link: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(link);
  };
`);

// Replace the Search Bar JSX
const oldSearchJSX = `<div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search resources, shipments, or districts..." 
                className="w-full sm:w-96 pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-cyan-500 text-gray-900 dark:text-gray-200 transition-colors"
              />
            </div>`;

const newSearchJSX = `<div className="relative z-50" ref={searchRef}>
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Global search (Vehicles, Shipments, etc.)..." 
                className="w-full sm:w-96 pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-cyan-500 text-gray-900 dark:text-gray-200 transition-colors"
              />
              {isSearchOpen && searchQuery.trim() && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded-lg shadow-xl overflow-hidden flex flex-col">
                  {searchResults.length > 0 ? (
                    searchResults.map((r, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleSelectResult(r.link)}
                        className="text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 border-b border-gray-200 dark:border-white/5 last:border-0 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider bg-cyan-100 dark:bg-cyan-500/10 px-1.5 py-0.5 rounded">{r.type}</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{r.title}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{r.desc}</div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-gray-500 text-center">No results found for "{searchQuery}"</div>
                  )}
                </div>
              )}
            </div>`;

code = code.replace(oldSearchJSX, newSearchJSX);

fs.writeFileSync('src/components/layout/Layout.tsx', code);

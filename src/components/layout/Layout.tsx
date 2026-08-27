import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Route, 
  Truck, 
  AlertTriangle, 
  Package, 
  FileText, 
  MapPin, 
  BarChart2, 
  Bot, 
  Settings, 
  Bell, 
  Search, 
  UserCircle,
  Wifi,
  ChevronLeft,
  ChevronRight,
  Menu,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const NAV_ITEMS = [
  { name: 'Command Center', path: '/', icon: LayoutDashboard },
  { name: 'Live Map', path: '/map', icon: Map },
  { name: 'Route Intelligence', path: '/route', icon: Route },
  { name: 'Fleet Tracking', path: '/fleet', icon: Truck },
  { name: 'Alerts & Risks', path: '/alerts', icon: AlertTriangle },
  { name: 'Supply Chain', path: '/supply', icon: Package },
  { name: 'Field Reports', path: '/reports', icon: FileText },
  { name: 'Districts', path: '/districts', icon: MapPin },
  { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  { name: 'AI Assistant', path: '/ai', icon: Bot },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const location = useLocation();
  const navigate = useNavigate();

  // Update time
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const [isEmergency, setIsEmergency] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className={cn("min-h-screen flex bg-white dark:bg-[#05070a] text-gray-800 dark:text-gray-200 font-sans transition-colors duration-500", isEmergency && "bg-red-950/20")}>
      
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[9998] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      {!isPresenting && (
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-[9999] w-64 bg-gray-50 dark:bg-[#0a0c14] border-r border-gray-200 dark:border-white/5 transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none",
          !isSidebarOpen && "lg:w-20",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isEmergency && "border-red-900/50 bg-gray-50 dark:bg-[#0a0c14]/90"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-white/5 shrink-0">
          <div className={cn("flex items-center gap-4 overflow-hidden", !isSidebarOpen && "lg:hidden")}>
            <div className={cn("w-8 h-8 rounded bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center shrink-0", isEmergency && "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse")}>
              <Activity className="w-5 h-5 text-black" />
            </div>
            <div className="flex flex-col whitespace-nowrap">
              <span className="text-[15px] font-bold text-gray-900 dark:text-white tracking-wide leading-tight font-sans">NER-LINK AI</span>
              <span className="text-[9px] text-cyan-500/80 font-bold uppercase tracking-[0.2em]">Intelligence</span>
            </div>
          </div>
          {/* Logo icon only when collapsed */}
          {!isSidebarOpen && (
            <div className="hidden lg:flex w-full items-center justify-center">
              <div className={cn("w-8 h-8 rounded bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center", isEmergency && "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse")}>
                 <Activity className="w-5 h-5 text-black" />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <div className={cn("px-6 mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500/70", !isSidebarOpen && "lg:hidden")}>
            Core Modules
          </div>
          <nav className="space-y-1 px-3">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group relative font-medium text-[13px] tracking-wide",
                  isActive 
                    ? isEmergency ? "bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white shadow-[inset_2px_0_0_0_#ef4444]" : "bg-cyan-500/10 text-gray-900 dark:text-white shadow-[inset_2px_0_0_0_#06b6d4]" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/5 hover:text-gray-900 dark:text-white"
                )}
                title={!isSidebarOpen ? item.name : undefined}
              >
                <item.icon className={cn("w-[18px] h-[18px] shrink-0", 
                  window.location.pathname === item.path ? (isEmergency ? "text-red-500" : "text-cyan-400") : "text-gray-500 group-hover:text-gray-700 dark:text-gray-300"
                )} />
                <span className={cn("whitespace-nowrap transition-opacity duration-200", !isSidebarOpen && "lg:hidden")}>
                  {item.name}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-black/20 shrink-0">
          <div className={cn("flex items-center justify-between text-gray-500 uppercase tracking-widest text-[10px] font-bold mb-2 overflow-hidden whitespace-nowrap transition-all", !isSidebarOpen && "lg:hidden")}>
            <span>System Status</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
          </div>
          <div className={cn("text-[11px] font-mono text-gray-600 dark:text-gray-400 truncate tracking-wider", !isSidebarOpen && "lg:hidden")}>
            SYNC: {format(time, 'HH:mm:ss')}
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex w-full mt-4 items-center justify-center p-2 rounded hover:bg-gray-200 dark:hover:bg-white/5 text-gray-500 hover:text-gray-900 dark:text-white transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-[#05070a]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-6 shrink-0 z-[9997] relative">
          <div className="flex items-center gap-4">
            {!isPresenting && (
              <button 
                className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white"
                onClick={() => setIsMobileOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            {isPresenting && (
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-black" />
                </div>
                <div className="flex flex-col whitespace-nowrap">
                  <span className="text-[15px] font-bold text-gray-900 dark:text-white tracking-wide leading-tight">NER-LINK AI</span>
                </div>
              </div>
            )}
            <div className="hidden md:flex items-center gap-3 bg-gray-50 dark:bg-[#0a0c14] rounded-md px-3 py-1.5 border border-gray-200 dark:border-white/5 focus-within:border-cyan-500/50 transition-colors shadow-inner">
              <Search className="w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search commands or modules..." 
                className="bg-transparent border-none outline-none text-[13px] w-64 text-gray-800 dark:text-gray-200 placeholder:text-gray-600 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={() => setIsPresenting(!isPresenting)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-[0.1em] border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/5 hover:text-gray-900 dark:text-white transition-colors"
            >
              {isPresenting ? "Exit Presentation Mode" : "Presentation Mode"}
            </button>
            
            <div className="hidden sm:flex flex-col items-end mr-4">
              <div className="text-[12px] font-mono text-gray-800 dark:text-gray-200">{format(time, 'HH:mm:ss')} UTC</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Last synchronized {time.getSeconds() % 5}s ago</div>
            </div>

            <div className="relative group hidden sm:flex items-center gap-2 cursor-pointer">
              <div className={cn("w-1.5 h-1.5 rounded-full", isEmergency ? "bg-red-500 animate-pulse" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]")} />
              <span className="text-[10px] text-gray-500 group-hover:text-gray-700 dark:text-gray-300 uppercase tracking-[0.1em] font-bold transition-colors">
                {isEmergency ? "Emergency Protocol" : "Network Stable"}
              </span>
              
              <div className="absolute top-full right-0 mt-4 w-48 bg-gray-50 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded-lg p-3 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[9999]">
                <h4 className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mb-2 pb-2 border-b border-gray-200 dark:border-white/5">System Health</h4>
                <div className="space-y-2">
                  {[
                    'GIS Engine',
                    'GPS Feed',
                    'Weather Intelligence',
                    'AI Engine',
                    'Field Sync'
                  ].map(sys => (
                    <div key={sys} className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-700 dark:text-gray-300 font-medium">{sys}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[9px] text-emerald-400 uppercase tracking-wider font-bold">Operational</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsEmergency(!isEmergency)}
              className={cn(
                "hidden md:flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-[0.1em] border transition-all",
                isEmergency 
                  ? "bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                  : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
              )}
            >
              {isEmergency ? "Deactivate Emergency Mode" : "Activate Emergency Mode"}
            </button>

            <div className="h-8 w-px bg-gray-100 dark:bg-white/5 hidden sm:block" />

            <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 border border-[#05070a]"></span>
            </button>
            
            <button className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors pl-2">
              <div className="text-right hidden md:block">
                <div className="text-[12px] font-bold text-gray-800 dark:text-gray-200 leading-tight">Commander 01</div>
                <div className="text-[10px] text-cyan-500/80 font-bold tracking-widest uppercase">Root Access</div>
              </div>
              <div className="w-8 h-8 rounded bg-gradient-to-br from-gray-800 to-black border border-gray-300 dark:border-white/10 flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-gray-500" />
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 bg-transparent relative custom-scrollbar">
           {isEmergency && (
             <div className="mb-6 bg-red-950/20 border border-red-500/30 rounded-lg p-4 flex items-center justify-between shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/10 rounded border border-red-500/20">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-red-400 uppercase tracking-wide">🚨 Emergency Operations Active</h2>
                    <p className="text-[13px] text-red-300/70 font-medium">Disaster response protocols engaged. Prioritizing emergency medical & food supplies across affected corridors.</p>
                  </div>
                </div>
             </div>
           )}
           <Outlet context={{ isEmergency }} />
        </main>
      </div>
    </div>
  );
}

// Ensure useOutletContext type is understood
export type LayoutContextType = { isEmergency: boolean };

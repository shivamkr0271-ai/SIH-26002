import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, Activity } from 'lucide-react';
import React, { useState } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate('/'), 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-cyan-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-600 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(8,145,178,0.4)]">
            <Activity className="w-8 h-8 text-gray-900 dark:text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">NER-LINK AI</h1>
          <p className="text-cyan-600 dark:text-cyan-400 font-medium tracking-wide uppercase text-sm">North Eastern Region Logistics & Accessibility Intelligence</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
            <Shield className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-200">Secure Access</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Official ID</label>
              <input 
                type="text" 
                defaultValue="CMDR-AS-094"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                defaultValue="********"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Role Authorization</label>
              <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all appearance-none">
                <option>State Control Room</option>
                <option>District Officer</option>
                <option>Logistics Coordinator</option>
                <option>Field Officer</option>
              </select>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Authenticate <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>Restricted Government System. Authorized personnel only.</p>
          <p className="mt-1">© 2026 Logistics Intelligence Platform Prototype.</p>
        </div>
      </div>
    </div>
  );
}

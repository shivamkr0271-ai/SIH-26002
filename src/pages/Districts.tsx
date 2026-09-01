import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { states as initialStates } from '@/data/mockData';
import { MapPin, Activity, ShieldAlert, CloudRain, Wind, Thermometer, RefreshCw, Eye } from 'lucide-react';
import { api } from '@/services/api';
import { State, WeatherData } from '@/types';

export default function Districts() {
  const [stateList, setStateList] = useState<State[]>(initialStates);
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData>>({});
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stateRes, weatherRes] = await Promise.all([
        api.getStates(),
        api.getAllWeather()
      ]);

      if (stateRes.data && Array.isArray(stateRes.data)) {
        setStateList(stateRes.data);
      }

      if (weatherRes.data && Array.isArray(weatherRes.data)) {
        const map: Record<string, WeatherData> = {};
        weatherRes.data.forEach((w: WeatherData) => {
          map[w.state] = w;
        });
        setWeatherMap(map);
      }
    } catch (err) {
      console.warn('Using local fallback state data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">District & State Connectivity</h1>
          <p className="text-[12px] text-cyan-500/80 uppercase tracking-widest font-bold mt-1">Regional operational status & meteorological risk across the 8 North Eastern states</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 bg-gray-50 dark:bg-[#0a0c14] hover:bg-gray-200 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Telemetry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stateList.map(state => {
          const w = weatherMap[state.name];
          return (
            <Card key={state.id} className="border-gray-200 dark:border-white/5 hover:border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/5 bg-gray-50 dark:bg-[#0a0c14] transition-colors shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    {state.name}
                  </h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 font-mono">{state.connectivityScore}%</div>
                    <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Conn. Score</div>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Active Incidents</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{state.activeIncidents}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">High Risk Corridors</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{state.highRiskCorridors}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Weather Risk</span>
                    <span className={`font-semibold text-xs px-2 py-0.5 rounded uppercase ${
                      state.weatherRisk === 'EXTREME' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' :
                      state.weatherRisk === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                      state.weatherRisk === 'MODERATE' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {state.weatherRisk}
                    </span>
                  </div>

                  {w && (
                    <div className="pt-2 border-t border-gray-200 dark:border-white/5 grid grid-cols-3 gap-1 text-[11px] text-gray-500">
                      <div className="flex items-center gap-1">
                        <Thermometer className="w-3 h-3 text-amber-400" />
                        <span>{w.temperature}°C</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CloudRain className="w-3 h-3 text-cyan-400" />
                        <span>{w.precipitationMm}mm</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wind className="w-3 h-3 text-emerald-400" />
                        <span>{w.windSpeedKmh}km/h</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Supply Status</span>
                <Badge variant={
                  state.supplyStatus === 'STABLE' ? 'success' : 
                  state.supplyStatus === 'MODERATE' ? 'warning' : 
                  state.supplyStatus === 'AT RISK' ? 'error' : 'error'
                }>
                  {state.supplyStatus}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

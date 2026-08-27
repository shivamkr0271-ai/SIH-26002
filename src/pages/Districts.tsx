import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { states } from '@/data/mockData';
import { MapPin, Activity, ShieldAlert, CloudRain } from 'lucide-react';

export default function Districts() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">District & State Connectivity</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Regional operational status across the 8 North Eastern states</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {states.map(state => (
          <Card key={state.id} className="border-gray-200 dark:border-white/5 hover:border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/5 bg-gray-50 dark:bg-[#0a0c14] transition-colors shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                {state.name}
              </h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{state.connectivityScore}%</div>
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
        ))}
      </div>
    </div>
  );
}

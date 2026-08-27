import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, LineChart, Line, Legend, PieChart, Pie
} from 'recharts';

const delayData = [
  { day: 'Mon', delay: 12 },
  { day: 'Tue', delay: 18 },
  { day: 'Wed', delay: 45 },
  { day: 'Thu', delay: 35 },
  { day: 'Fri', delay: 20 },
  { day: 'Sat', delay: 15 },
  { day: 'Sun', delay: 10 },
];

const riskDist = [
  { name: 'Low', value: 400, color: '#10b981' },
  { name: 'Moderate', value: 300, color: '#f59e0b' },
  { name: 'High', value: 150, color: '#f97316' },
  { name: 'Critical', value: 50, color: '#ef4444' },
];

const supplyPerf = [
  { category: 'Medicines', onTime: 92, delayed: 8 },
  { category: 'Food', onTime: 85, delayed: 15 },
  { category: 'Fuel', onTime: 88, delayed: 12 },
  { category: 'Construction', onTime: 70, delayed: 30 },
];

export default function Analytics() {
  return (
    <div className="max-w-[1920px] mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Analytics & Intelligence</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Platform metrics, historical trends, and performance insights</p>
        </div>
        
        <select className="bg-gray-50 dark:bg-[#0a0c14] border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500 text-gray-800 dark:text-gray-200 transition-colors">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Average Delivery Delay (mins)</CardTitle>
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={delayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0c14', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="delay" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#06b6d4' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Route Risk Distribution</CardTitle>
          </CardHeader>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {riskDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0a0c14', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Supply Delivery Performance (%)</CardTitle>
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplyPerf} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0c14', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} cursor={{fill: '#ffffff10'}} />
                <Legend iconType="circle" />
                <Bar dataKey="onTime" name="On Time" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="delayed" name="Delayed" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

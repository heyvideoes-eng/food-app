'use client'

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

const data = [
  { day: 'Mon', saved: 120, wasted: 20 },
  { day: 'Tue', saved: 200, wasted: 10 },
  { day: 'Wed', saved: 150, wasted: 40 },
  { day: 'Thu', saved: 300, wasted: 5 },
  { day: 'Fri', saved: 180, wasted: 30 },
  { day: 'Sat', saved: 250, wasted: 15 },
  { day: 'Sun', saved: 210, wasted: 10 },
]

export function WasteSavingsChart() {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.7 0.12 195)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="oklch(0.7 0.12 195)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorWasted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.55 0.18 25)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="oklch(0.55 0.18 25)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f111a', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '12px'
            }}
            itemStyle={{ color: '#fff' }}
          />
          <Area 
            type="monotone" 
            dataKey="saved" 
            stroke="oklch(0.7 0.12 195)" 
            fillOpacity={1} 
            fill="url(#colorSaved)" 
            strokeWidth={3}
          />
          <Area 
            type="monotone" 
            dataKey="wasted" 
            stroke="oklch(0.55 0.18 25)" 
            fillOpacity={1} 
            fill="url(#colorWasted)" 
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

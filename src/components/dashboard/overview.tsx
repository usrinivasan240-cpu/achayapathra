
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export default function Overview({ data }: { data: { name: string; total: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip 
          cursor={{ fill: 'transparent' }}
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            borderColor: 'hsl(var(--border))',
            borderRadius: 'var(--radius)',
            fontSize: '12px'
          }}
        />
        <Bar 
          dataKey="total" 
          fill="hsl(var(--primary))" 
          radius={[4, 4, 0, 0]} 
          barSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartProps {
  data: Array<{ time: number; wpm: number }>;
}

export function Chart({ data }: ChartProps) {
  if (data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-monkey-muted">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#646669" />
          <XAxis 
            dataKey="time" 
            stroke="#646669"
            tick={{ fill: '#646669' }}
            label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -5, fill: '#646669' }}
          />
          <YAxis 
            stroke="#646669"
            tick={{ fill: '#646669' }}
            label={{ value: 'WPM', angle: -90, position: 'insideLeft', fill: '#646669' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#323437', 
              border: '1px solid #646669',
              borderRadius: '4px',
              color: '#d1d0c5'
            }}
            labelStyle={{ color: '#d1d0c5' }}
          />
          <Line 
            type="monotone" 
            dataKey="wpm" 
            stroke="#e2b714" 
            strokeWidth={2}
            dot={{ fill: '#e2b714', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

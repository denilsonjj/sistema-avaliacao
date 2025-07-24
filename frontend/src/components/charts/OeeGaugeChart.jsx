
import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';


const getColor = (value) => {
  if (value >= 85) return '#43aaa0'; 
  if (value >= 70) return '#eca935'; 
  return '#e42313'; 
};

const OeeGaugeChart = ({ value, title }) => {
  const data = [{ name: 'OEE', value }];
  const color = getColor(value);

  return (
    <div style={{ textAlign: 'center' }}>
      <ResponsiveContainer width="100%" height={250}>
        <RadialBarChart
          innerRadius="60%"
          outerRadius="90%"
          barSize={30}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            angleAxisId={0}
            fill={color} 
            cornerRadius={15}
          />
          <text
            x="50%"
            y="70%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="3rem"
            fontWeight="bold"
            fill={color} 
          >
            {`${value.toFixed(1)}%`}
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
      <h3 style={{ marginTop: '-2rem', color: 'var(--color-text)' }}>{title}</h3>
    </div>
  );
};

export default OeeGaugeChart;
// frontend/src/components/charts/OeeGaugeChart.jsx
import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

// Função para determinar a cor com base no valor
const getColor = (value) => {
  if (value >= 85) return '#43aaa0'; // Verde (Mint)
  if (value >= 70) return '#eca935'; // Amarelo (Orange)
  return '#e42313'; // Vermelho (Tangerine Dark)
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
            fill={color} // A cor agora é dinâmica
            cornerRadius={15}
          />
          <text
            x="50%"
            y="70%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="3rem"
            fontWeight="bold"
            fill={color} // A cor do texto também é dinâmica
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
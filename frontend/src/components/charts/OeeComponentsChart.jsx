import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

function OeeComponentsChart({ data, onBarClick }) {
  const EFFICIENCY_TARGET = 90; // Defina a meta de eficiência

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
        <YAxis unit="%" domain={[0, 110]} />
        <Tooltip />
        <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
        
        <ReferenceLine y={EFFICIENCY_TARGET} label={{ value: `Meta: ${EFFICIENCY_TARGET}%`, position: 'insideTopRight', fill: 'var(--color-tangerine-dark)' }} stroke="var(--color-tangerine-dark)" strokeDasharray="3 3" />

        {/* --- MUDANÇA AQUI: Apenas uma barra para Eficiência --- */}
        <Bar dataKey="Eficiencia" fill="#243782" name="Eficiência" cursor="pointer" onClick={(data) => onBarClick(data)} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default OeeComponentsChart;
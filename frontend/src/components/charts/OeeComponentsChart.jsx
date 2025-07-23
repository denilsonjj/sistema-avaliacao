import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

function OeeComponentsChart({ data, onBarClick }) {
  const OEE_TARGET = 85;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 70,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
        <YAxis unit="%" domain={[0, 100]} />
        <Tooltip />
        <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
        
        <ReferenceLine y={OEE_TARGET} label={{ value: `Meta: ${OEE_TARGET}%`, position: 'insideTopRight', fill: 'var(--color-tangerine-dark)' }} stroke="var(--color-tangerine-dark)" strokeDasharray="3 3" />

      
        <Bar dataKey="Disponibilidade" fill="#243782" name="Disponibilidade" cursor="pointer" onClick={(data) => onBarClick(data)} />
        <Bar dataKey="Performance" fill="#eca935" name="Performance" cursor="pointer" onClick={(data) => onBarClick(data)} />
        <Bar dataKey="Qualidade" fill="#43aaa0" name="Qualidade" cursor="pointer" onClick={(data) => onBarClick(data)} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default OeeComponentsChart;
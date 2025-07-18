// frontend/src/components/charts/OeeBarChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function OeeBarChart({ data }) {
  return (
  
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis unit="%" />
        <Tooltip />
        <Legend />
        <Bar dataKey="oee" fill="#243782" name="OEE Médio" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default OeeBarChart;
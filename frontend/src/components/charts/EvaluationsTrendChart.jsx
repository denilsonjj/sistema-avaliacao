// frontend/src/components/charts/EvaluationsTrendChart.jsx
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EvaluationsTrendChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Area type="monotone" dataKey="count" stroke="#243782" fill="#5a7ec7" name="Avaliações" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default EvaluationsTrendChart;
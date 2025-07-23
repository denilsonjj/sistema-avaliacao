// frontend/src/components/charts/UsersByRoleDonutChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#243782', '#43aaa0', '#eca935', '#ec94a2', '#5a7ec7'];

const UsersByRoleDonutChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value} usuário(s)`} />
        <Legend iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default UsersByRoleDonutChart;
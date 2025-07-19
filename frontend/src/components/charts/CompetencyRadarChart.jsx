// frontend/src/components/charts/CompetencyRadarChart.jsx
import React from 'react';
import { Radar, RadarChart, PolarGrid, Legend, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

function CompetencyRadarChart({ evaluationData }) {
  // Transforma os dados da avaliação para o formato que o gráfico precisa
  const chartData = [
    { subject: 'Qualidade', score: evaluationData.serviceQuality_score, fullMark: 5 },
    { subject: 'Iniciativa', score: evaluationData.problemSolvingInitiative_score, fullMark: 5 },
    { subject: 'Proatividade', score: evaluationData.proactivity_score, fullMark: 5 },
    { subject: 'Comprometimento', score: evaluationData.commitment_score, fullMark: 5 },
    { subject: 'Trabalho em Equipe', score: evaluationData.teamwork_score, fullMark: 5 },
    { subject: 'Prazo', score: evaluationData.executionTimeframe_score, fullMark: 5 },
  ];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 5]} />
        <Radar name="Pontuação" dataKey="score" stroke="#243782" fill="#243782" fillOpacity={0.6} />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export default CompetencyRadarChart;
// frontend/src/pages/DashboardRouter.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import PmmDashboardPage from './PmmDashboardPage/PmmDashboardPage';
import TeamDashboardPage from './TeamDashboardPage/TeamDashboardPage';
import MyEvaluationsPage from './MyEvaluationsPage/MyEvaluationsPage';
import DashboardPage from './DashboardPage'; // O dashboard genérico

function DashboardRouter() {
  const { user } = useAuth();

  if (!user) {
    // Isso não deve acontecer dentro de uma rota protegida, mas é uma segurança extra
    return <p>Carregando perfil...</p>;
  }

  switch (user.role) {
    case 'PMM':
      return <PmmDashboardPage />;
    case 'LIDER':
      return <TeamDashboardPage />;
    case 'TECNICO':
    case 'ESTAGIARIO': // Pode adicionar outros perfis para o mesmo dashboard
    case 'PMS':
      return <MyEvaluationsPage />;
    default:
      // Um dashboard padrão para perfis não mapeados
      return <DashboardPage />;
  }
}

export default DashboardRouter;
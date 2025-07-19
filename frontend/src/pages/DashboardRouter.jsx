// frontend/src/pages/DashboardRouter.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import PmmDashboardPage from './PmmDashboardPage/PmmDashboardPage';
import TeamDashboardPage from './TeamDashboardPage/TeamDashboardPage';
import TechnicianDashboardPage from './TechnicianDashboardPage/TechnicianDashboardPage'; // Importe o novo dashboard

function DashboardRouter() {
  const { user } = useAuth();

  if (!user) {
    return <p>Carregando perfil...</p>;
  }

  switch (user.role) {
    case 'PMM':
      return <PmmDashboardPage />;
    case 'LIDER':
      case 'PMS':
      return <TeamDashboardPage />;
    case 'TECNICO':
    case 'ESTAGIARIO':
      // Agora, estes perfis verão o novo dashboard de técnico
      return <TechnicianDashboardPage />;
    default:
      // Um fallback, caso um novo perfil seja criado e não mapeado
      return <h1>Dashboard Padrão</h1>;
  }
}

export default DashboardRouter;
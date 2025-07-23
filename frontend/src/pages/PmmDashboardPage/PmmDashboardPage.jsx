// frontend/src/pages/PmmDashboardPage/PmmDashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import OeeComponentsChart from '../../components/charts/OeeComponentsChart';
import OeeGaugeChart from '../../components/charts/OeeGaugeChart';
import UsersByRoleDonutChart from '../../components/charts/UsersByRoleDonutChart';
import EvaluationsTrendChart from '../../components/charts/EvaluationsTrendChart';
import styles from './PmmDashboardPage.module.css';

function PmmDashboardPage() {
  const [stats, setStats] = useState({ userCount: 0, evaluationCount: 0 });
  const [users, setUsers] = useState([]);
  const [oeeOverview, setOeeOverview] = useState([]);
  const [usersByRole, setUsersByRole] = useState([]);
  const [evaluationsTrend, setEvaluationsTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para a funcionalidade de clique
  const [selectedLine, setSelectedLine] = useState(null);
  const [lineTechnicians, setLineTechnicians] = useState([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, oeeRes, usersRoleRes, evalsTrendRes] = await Promise.all([
          api.get('/evaluations/stats'),
          api.get('/auth/users'),
          api.get('/oee/lines/overview'),
          api.get('/auth/users/stats/by-role'),
          api.get('/reports/evaluations-over-time'),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setOeeOverview(oeeRes.data);
        setUsersByRole(usersRoleRes.data);
        setEvaluationsTrend(evalsTrendRes.data);
      } catch (err) {
        setError('Falha ao buscar dados do dashboard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBarClick = async (payload) => {
    if (!payload) return;
    const lineName = payload.name;

    if (selectedLine === lineName) {
      setSelectedLine(null);
      setLineTechnicians([]);
      return;
    }

    setSelectedLine(lineName);
    setLoadingTechnicians(true);
    setLineTechnicians([]);
    try {
      const encodedLineName = encodeURIComponent(lineName);
      const res = await api.get(`/production-lines/line/${encodedLineName}/users`);
      setLineTechnicians(res.data);
    } catch (err) {
      console.error(`Falha ao buscar técnicos para a linha "${lineName}"`, err);
      setLineTechnicians([]);
    } finally {
      setLoadingTechnicians(false);
    }
  };

  if (loading) return <p>Carregando dados globais...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  const overallAverageOee = oeeOverview.length > 0
    ? oeeOverview.reduce((sum, line) => sum + line.oee, 0) / oeeOverview.length
    : 0;

  return (
    <div className={styles.container}>
      <h1>Dashboard PMM - Visão Geral</h1>
      <p>Acesso total aos dados e KPIs de produção do sistema.</p>
      
      <div className={styles.kpiGrid}>
        <Card>
          <OeeGaugeChart value={overallAverageOee} title="OEE Médio da Planta" />
        </Card>
        
        <Card title="Usuários Cadastrados">
          <div className={styles.kpiTitle}>{stats.userCount}</div>
          <UsersByRoleDonutChart data={usersByRole} />
        </Card>

        <Card title="Avaliações Realizadas">
          <div className={styles.kpiTitle}>{stats.evaluationCount}</div>
          <EvaluationsTrendChart data={evaluationsTrend} />
        </Card>
      </div>

      <div className={styles.chartContainer}>
        <Card title="Desempenho OEE por Linha de Produção (Clique para ver detalhes)">
          {oeeOverview.length > 0 ? (
            <OeeComponentsChart data={oeeOverview} onBarClick={handleBarClick} />
          ) : (
            <p>Não há dados de OEE disponíveis para exibir o gráfico.</p>
          )}
        </Card>
      </div>
      
      {selectedLine && (
        <div className={styles.technicianCard}>
          <Card title={`Técnicos Responsáveis - ${selectedLine}`}>
            {loadingTechnicians ? (
              <p>Buscando técnicos...</p>
            ) : lineTechnicians.length > 0 ? (
              <table className={styles.userTable}>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Perfil</th>
                  </tr>
                </thead>
                <tbody>
                  {lineTechnicians.map(tech => (
                    <tr key={tech.id}>
                      <td data-label="Nome">{tech.name}</td>
                      <td data-label="Email">{tech.email}</td>
                      <td data-label="Perfil">{tech.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Nenhum técnico responsável encontrado para esta linha.</p>
            )}
          </Card>
        </div>
      )}

      <Card title="Todos os Usuários do Sistema">
        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td data-label="Nome">{user.name}</td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Perfil">{user.role}</td>
                <td data-label="Ações">
                  <Link to={`/equipe/${user.id}`} className={styles.actionButton}>
                    Ver Detalhes
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default PmmDashboardPage;
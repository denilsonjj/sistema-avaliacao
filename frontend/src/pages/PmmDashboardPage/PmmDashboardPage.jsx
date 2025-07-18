// frontend/src/pages/PmmDashboardPage/PmmDashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import OeeBarChart from '../../components/charts/OeeBarChart';
import styles from './PmmDashboardPage.module.css';

function PmmDashboardPage() {
  const [stats, setStats] = useState({ userCount: 0, evaluationCount: 0, averageOEE: 0 });
  const [users, setUsers] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Promise.all para buscar dados em paralelo
        const [statsRes, usersRes, chartRes] = await Promise.all([
          api.get('/evaluations/stats'),
          api.get('/auth/users'),
          api.get('/evaluations/charts/oee-by-user'),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        setError('Falha ao buscar dados do dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Carregando dados globais...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <h1>Dashboard PMM - Visão Geral</h1>
      <p>Acesso total aos dados do sistema.</p>

      {/* Seção de Estatísticas */}
      <div className={styles.statsGrid}>
        <Card>
          <div className={styles.statBox}>
            <div className={styles.statValue}>{stats.userCount}</div>
            <div className={styles.statLabel}>Usuários Cadastrados</div>
          </div>
        </Card>
        <Card>
          <div className={styles.statBox}>
            <div className={styles.statValue}>{stats.evaluationCount}</div>
            <div className={styles.statLabel}>Avaliações Realizadas</div>
          </div>
        </Card>
        <Card>
          <div className={styles.statBox}>
            <div className={styles.statValue}>{stats.averageOEE}%</div>
            <div className={styles.statLabel}>Média OEE Global</div>
          </div>
        </Card>
      </div>

      <div className={styles.chartContainer}>
        <Card title="Média de OEE por Usuário">
          <OeeBarChart data={chartData} />
        </Card>
      </div>


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
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
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
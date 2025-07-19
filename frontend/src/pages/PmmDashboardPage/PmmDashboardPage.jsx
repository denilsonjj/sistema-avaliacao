// frontend/src/pages/PmmDashboardPage/PmmDashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import styles from './PmmDashboardPage.module.css';

function PmmDashboardPage() {
  const [stats, setStats] = useState({ userCount: 0, evaluationCount: 0, averageOEE: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/evaluations/stats'),
          api.get('/auth/users')
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
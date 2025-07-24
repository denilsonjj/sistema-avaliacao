import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import Avatar from '../../components/Avatar/Avatar'; 
import styles from './TeamDashboardPage.module.css';
import { FaChartLine } from 'react-icons/fa'; 

function TeamDashboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/auth/users');
        setUsers(response.data);
      } catch (err) {
        setError('Falha ao buscar usuários. Verifique sua permissão.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return <p>Carregando equipe...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <div className={styles.container}>
      <h1>Dashboard da Equipe</h1>
      <p>Visualize e gerencie as avaliações dos membros da sua equipe.</p>

      <Card title="Membros da Equipe">
        <table className={styles.teamTable}>
          <thead>
            <tr>
              <th style={{ width: '60px' }}></th> {/* Coluna para Avatar */}
              <th>Nome</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Última Avaliação</th> {/* Nova Coluna */}
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              // Verifica se existe uma avaliação e formata a data
              const lastEvaluation = user.evaluations?.[0]?.createdAt;
              const formattedDate = lastEvaluation 
                ? new Date(lastEvaluation).toLocaleDateString('pt-BR') 
                : 'Nenhuma avaliação';

              return (
                <tr key={user.id}>
                  <td className={styles.avatarCell}><Avatar name={user.name} /></td>
                  <td data-label="Nome">{user.name}</td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Perfil">{user.role}</td>
                  <td data-label="Última Avaliação">{formattedDate}</td>
                  <td data-label="Ações">
                    <Link to={`/equipe/${user.id}`} className={styles.actionButton}>
                      <FaChartLine /> Ver Avaliação
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default TeamDashboardPage;
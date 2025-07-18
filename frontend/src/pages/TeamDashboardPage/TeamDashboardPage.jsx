// frontend/src/pages/TeamDashboardPage/TeamDashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api'; // Importe o serviço
import Card from '../../components/Card/Card';
import styles from './TeamDashboardPage.module.css';

function TeamDashboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Não precisamos mais de useAuth aqui para o token

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Use o serviço 'api'. Não precisa mais de headers.
        const response = await api.get('/auth/users');
        setUsers(response.data);
      } catch (err) {
        setError('Falha ao buscar usuários. Verifique sua permissão.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // Não precisa mais da dependência do token

  // ... JSX permanece o mesmo
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
                    Ver Avaliação
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

export default TeamDashboardPage;
// frontend/src/pages/MyEvaluationsPage/MyEvaluationsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api'; // Use o serviço de API
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card/Card';
import styles from './MyEvaluationsPage.module.css';

function MyEvaluationsPage() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth(); // Pegamos o usuário logado
  
  //logica de deletar usuarios
  const handleDeleteUser = async (userId) => {
    if (window.confirm('ATENÇÃO! Excluir este usuário também removerá TODAS as suas avaliações e feedbacks. Deseja continuar?')) {
      try {
        await api.delete(`/auth/users/${userId}`);
        setUsers(prev => prev.filter(u => u.id !== userId));
      } catch (err) {
        alert('Erro ao excluir usuário.');
      }
    }
  };
  useEffect(() => {
    if (!user) return;

    const fetchEvaluations = async () => {
      try {
        // Use o serviço 'api'
        const response = await api.get(`/evaluations/user/${user.userId}`);
        setEvaluations(response.data);
      } catch (err) {
        setError('Falha ao buscar suas avaliações.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, [user]);

  if (loading) {
    return <p>Carregando suas avaliações...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <div className={styles.container}>
      <h1>Meu Histórico de Avaliações</h1>
      <p>Acompanhe sua evolução e os feedbacks recebidos.</p>

      <div className={styles.evaluationList}>
        {evaluations.length > 0 ? (
          evaluations.map(evaluation => (
            <Card key={evaluation.id} title={`Avaliação de ${new Date(evaluation.createdAt).toLocaleDateString()}`}>
              <div className={styles.grid}>
                <div>
                  <h4>Avaliação Individual</h4>
                  <p><strong>Conhecimento Técnico:</strong> {evaluation.technicalKnowledge}</p>
                  <p><strong>Certificações:</strong> {evaluation.certifications}</p>
                </div>
                <div>
                  <h4>Avaliação de Desempenho</h4>
                  <p><strong>Qualidade do Serviço:</strong> {evaluation.serviceQuality}</p>
                  <p><strong>Iniciativa:</strong> {evaluation.problemSolvingInitiative}</p>
                </div>
                 <div>
                  <h4>Avaliação Comportamental</h4>
                  <p><strong>Trabalho em Equipe:</strong> {evaluation.teamwork}</p>
                  <p><strong>Comprometimento:</strong> {evaluation.commitment}</p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card title="Nenhuma avaliação encontrada">
            <p>Você ainda não possui avaliações registradas.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default MyEvaluationsPage;
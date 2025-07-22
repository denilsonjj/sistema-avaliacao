import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card/Card';
import styles from './MyEvaluationsPage.module.css';

function MyEvaluationsPage() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchEvaluations = async () => {
      try {
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

  // Função para lidar com a exclusão
  const handleDelete = async (evaluationId) => {
    if (window.confirm('Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.')) {
      try {
        await api.delete(`/evaluations/${evaluationId}`);
        // Atualiza a lista na tela sem precisar recarregar
        setEvaluations(prev => prev.filter(ev => ev.id !== evaluationId));
      } catch (err) {
        alert('Erro ao excluir avaliação.');
      }
    }
  };

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
            <Card 
              key={evaluation.id} 
              title={`Avaliação de ${new Date(evaluation.createdAt).toLocaleDateString()}`}
            >
              <div className={styles.cardActions}>
                <Link to={`/avaliacoes/${evaluation.id}/editar`} className={styles.editButton}>
                  Editar
                </Link>
                <button onClick={() => handleDelete(evaluation.id)} className={styles.deleteButton}>Excluir</button>
              </div>

              <div className={styles.grid}>
                <div>
                  <h4>Avaliação Individual</h4>
                  <p><strong>Conhecimento Técnico:</strong> {evaluation.technicalKnowledge_notes}</p>
                  <p><strong>Certificações:</strong> {evaluation.certifications_notes}</p>
                </div>
                <div>
                  <h4>Avaliação de Desempenho</h4>
                  <p><strong>Qualidade do Serviço (Nota):</strong> {evaluation.serviceQuality_score}</p>
                  <p><strong>Iniciativa (Nota):</strong> {evaluation.problemSolvingInitiative_score}</p>
                </div>
                 <div>
                  <h4>Avaliação Comportamental</h4>
                  <p><strong>Trabalho em Equipe (Nota):</strong> {evaluation.teamwork_score}</p>
                  <p><strong>Comprometimento (Nota):</strong> {evaluation.commitment_score}</p>
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
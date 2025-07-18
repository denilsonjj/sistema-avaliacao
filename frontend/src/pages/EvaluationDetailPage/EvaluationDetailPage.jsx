// frontend/src/pages/EvaluationDetailPage/EvaluationDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api'; // Importe o serviço
import Card from '../../components/Card/Card';
import styles from './EvaluationDetailPage.module.css';

function EvaluationDetailPage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Use o serviço 'api' para ambas as chamadas
        const userRes = await api.get(`/auth/users/${userId}`);
        setUser(userRes.data);
        const evalRes = await api.get(`/evaluations/user/${userId}`);
        setEvaluations(evalRes.data);
      } catch (err) {
        setError('Não foi possível carregar os dados. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  // ... JSX permanece o mesmo
  if (loading) return <p>Carregando avaliação...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!user) return <p>Usuário não encontrado.</p>;

  const latestEvaluation = evaluations[0];

  return (
    <div>
      <h1>Avaliação de {user.name}</h1>
      <p>Email: {user.email} | Perfil: {user.role}</p>

      <Link to={`/equipe/${userId}/nova-avaliacao`} style={{ display: 'inline-block', padding: '10px', backgroundColor: 'green', color: 'white', textDecoration: 'none', margin: '20px 0' }}>
        + Adicionar Nova Avaliação
      </Link>

      {latestEvaluation ? (
        <div className={styles.grid}>
          <Card title="Avaliação Individual">
            <p><strong>Conhecimento Técnico:</strong> {latestEvaluation.technicalKnowledge}</p>
            <p><strong>Certificações:</strong> {latestEvaluation.certifications}</p>
            <p><strong>Tempo de Experiência:</strong> {latestEvaluation.experienceTime}</p>
          </Card>
          <Card title="Avaliação de Desempenho">
            <p><strong>Qualidade do Serviço:</strong> {latestEvaluation.serviceQuality}</p>
            <p><strong>Prazo de Execução:</strong> {latestEvaluation.executionTimeframe}</p>
            <p><strong>Iniciativa:</strong> {latestEvaluation.problemSolvingInitiative}</p>
          </Card>
          <Card title="Avaliação Comportamental">
             <p><strong>Trabalho em Equipe:</strong> {latestEvaluation.teamwork}</p>
             <p><strong>Comprometimento:</strong> {latestEvaluation.commitment}</p>
             <p><strong>Proatividade:</strong> {latestEvaluation.proactivity}</p>
          </Card>
           <Card title="Indicadores de OEE">
             <p><strong>Disponibilidade:</strong> {latestEvaluation.availability}%</p>
             <p><strong>Performance:</strong> {latestEvaluation.performance}%</p>
             <p><strong>Qualidade:</strong> {latestEvaluation.quality}%</p>
          </Card>
        </div>
      ) : (
        <Card title="Nenhuma avaliação encontrada">
          <p>Este usuário ainda não possui avaliações registradas.</p>
        </Card>
      )}
    </div>
  );
}

export default EvaluationDetailPage;
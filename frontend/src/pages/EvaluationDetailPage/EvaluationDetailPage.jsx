// frontend/src/pages/EvaluationDetailPage/EvaluationDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import CompetencyRadarChart from '../../components/charts/CompetencyRadarChart';
import styles from './EvaluationDetailPage.module.css';

function EvaluationDetailPage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [goals, setGoals] = useState([]); // Estado para as metas
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [userRes, evalRes, goalsRes] = await Promise.all([
          api.get(`/auth/users/${userId}`),
          api.get(`/evaluations/user/${userId}`),
          api.get(`/goals/user/${userId}`) // Busca as metas do usuário
        ]);
        setUser(userRes.data);
        setEvaluations(evalRes.data);
        setGoals(goalsRes.data); // Salva as metas no estado
      } catch (err) {
        setError('Não foi possível carregar os dados completos. Verifique se existem avaliações para este usuário.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) return <p>Carregando relatório...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  const latestEvaluation = evaluations[0];
  const oee = latestEvaluation ? (latestEvaluation.availability / 100) * (latestEvaluation.performance / 100) * (latestEvaluation.quality / 100) : 0;
  const oeePercentage = (oee * 100).toFixed(2);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Relatório de Desempenho</h1>
          <p className={styles.userName}>{user?.name}</p>
        </div>
        <div className={styles.headerActions}>
          <Link to={`/equipe/${userId}/nova-avaliacao`} className={`${styles.actionButton} ${styles.primary}`}>
            + Nova Avaliação
          </Link>
        </div>
      </div>

      {!latestEvaluation ? (
        <Card>
            <p>Nenhuma avaliação encontrada para este usuário.</p>
        </Card>
      ) : (
        <div className={styles.grid}>
          {/* OEE Scorecard */}
          <div className={styles.oeeCard}>
            <div className={styles.oeeValue}>{oeePercentage}%</div>
            <div className={styles.oeeLabel}>OEE Global</div>
          </div>
          <div className={styles.indicatorCard}>
            <div className={styles.indicatorLabel}>Disponibilidade (A)</div>
            <div className={styles.indicatorValue}>{latestEvaluation.availability}%</div>
            <div className={styles.progressBar}><div style={{ width: `${latestEvaluation.availability}%`, backgroundColor: '#43aaa0' }}></div></div>
          </div>
          <div className={styles.indicatorCard}>
            <div className={styles.indicatorLabel}>Performance (P)</div>
            <div className={styles.indicatorValue}>{latestEvaluation.performance}%</div>
            <div className={styles.progressBar}><div style={{ width: `${latestEvaluation.performance}%`, backgroundColor: '#eca935' }}></div></div>
          </div>
          <div className={styles.indicatorCard}>
            <div className={styles.indicatorLabel}>Qualidade (Q)</div>
            <div className={styles.indicatorValue}>{latestEvaluation.quality}%</div>
            <div className={styles.progressBar}><div style={{ width: `${latestEvaluation.quality}%`, backgroundColor: '#ec94a2' }}></div></div>
          </div>

          {/* Radar Chart e Detalhes */}
          <div className={`${styles.largeCard} ${styles.radarCard}`}>
            <h3 className={styles.cardTitle}>Radar de Competências</h3>
            <CompetencyRadarChart evaluationData={latestEvaluation} />
          </div>
          <div className={`${styles.largeCard} ${styles.detailsCard}`}>
            <h3 className={styles.cardTitle}>Detalhes e Observações</h3>
            <div className={styles.detailItem}>
              <h4>Conhecimento Técnico</h4>
              <p>{latestEvaluation.technicalKnowledge_notes}</p>
            </div>
            <div className={styles.detailItem}>
              <h4>Certificações</h4>
              <p>{latestEvaluation.certifications_notes}</p>
            </div>
             <div className={styles.detailItem}>
              <h4>Tempo de Experiência</h4>
              <p>{latestEvaluation.experienceTime_notes}</p>
            </div>
          </div>

          {/* Painel de Metas */}
          <div className={`${styles.largeCard} ${styles.goalsCard}`}>
            <h3 className={styles.cardTitle}>Plano de Desenvolvimento (Metas)</h3>
            <div className={styles.goalsContainer}>
              {goals.length > 0 ? (
                goals.map(goal => (
                  <div key={goal.id} className={`${styles.goalItem} ${styles[goal.status.toLowerCase()]}`}>
                    <span className={styles.goalStatus}>{goal.status.replace('_', ' ')}</span>
                    <p className={styles.goalTitle}>{goal.title}</p>
                    <small>Criado por: {goal.author.name}</small>
                  </div>
                ))
              ) : (
                <p>Nenhuma meta de desenvolvimento definida para este usuário.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EvaluationDetailPage;
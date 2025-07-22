
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
  const [goals, setGoals] = useState([]);
  const [oeeData, setOeeData] = useState(null); // Estado para o OEE real
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [userRes, evalRes, goalsRes, oeeRes] = await Promise.all([
          api.get(`/auth/users/${userId}`),
          api.get(`/evaluations/user/${userId}`),
          api.get(`/goals/user/${userId}`),
          api.get(`/oee/user/${userId}`) // Busca os dados de OEE pré-calculados
        ]);
        
        setUser(userRes.data);
        setEvaluations(evalRes.data);
        setGoals(goalsRes.data);

        // Calcula a média de OEE se o usuário tiver múltiplas linhas
        if (oeeRes.data && oeeRes.data.length > 0) {
            const avgAvailability = oeeRes.data.reduce((sum, item) => sum + item.availability, 0) / oeeRes.data.length;
            const avgPerformance = oeeRes.data.reduce((sum, item) => sum + item.performance, 0) / oeeRes.data.length;
            const avgQuality = oeeRes.data.reduce((sum, item) => sum + item.quality, 0) / oeeRes.data.length;
            setOeeData({
                availability: avgAvailability,
                performance: avgPerformance,
                quality: avgQuality,
            });
        }

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
  
  // O cálculo do OEE agora usa os dados reais e pré-calculados
  const oee = oeeData ? (oeeData.availability / 100) * (oeeData.performance / 100) * (oeeData.quality / 100) : 0;
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
          <Link to={`/equipe/${userId}/atribuir-meta`} className={`${styles.actionButton} ${styles.secondary}`}>
            + Atribuir Meta
          </Link>
        </div>
      </div>

      <div className={styles.grid}>
        {/* OEE Scorecard com dados reais */}
        {oeeData ? (
          <>
            <div className={styles.oeeCard}>
              <div className={styles.oeeValue}>{oeePercentage}%</div>
              <div className={styles.oeeLabel}>OEE Real (Calculado)</div>
            </div>
            <div className={styles.indicatorCard}>
              <div className={styles.indicatorLabel}>Disponibilidade (A)</div>
              <div className={styles.indicatorValue}>{oeeData.availability.toFixed(2)}%</div>
              <div className={styles.progressBar}><div style={{ width: `${oeeData.availability}%`, backgroundColor: '#43aaa0' }}></div></div>
            </div>
            <div className={styles.indicatorCard}>
              <div className={styles.indicatorLabel}>Performance (P)</div>
              <div className={styles.indicatorValue}>{oeeData.performance.toFixed(2)}%</div>
              <div className={styles.progressBar}><div style={{ width: `${oeeData.performance}%`, backgroundColor: '#eca935' }}></div></div>
            </div>
            <div className={styles.indicatorCard}>
              <div className={styles.indicatorLabel}>Qualidade (Q)</div>
              <div className={styles.indicatorValue}>{oeeData.quality.toFixed(2)}%</div>
              <div className={styles.progressBar}><div style={{ width: `${oeeData.quality}%`, backgroundColor: '#ec94a2' }}></div></div>
            </div>
          </>
        ) : (
            <div className={`${styles.largeCard} ${styles.fullWidth}`}>
                <p>Dados de OEE real ainda não disponíveis para este usuário.</p>
            </div>
        )}

        {/* Radar Chart e Detalhes (só aparecem se houver uma avaliação manual) */}
        {latestEvaluation ? (
          <>
            <div className={`${styles.largeCard} ${styles.radarCard}`}>
              <h3 className={styles.cardTitle}>Radar de Competências</h3>
              <CompetencyRadarChart evaluationData={latestEvaluation} />
            </div>
            <div className={`${styles.largeCard} ${styles.detailsCard}`}>
              <h3 className={styles.cardTitle}>Observações da Última Avaliação</h3>
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
          </>
        ) : (
            <div className={`${styles.largeCard} ${styles.fullWidth}`}>
                <p>Nenhuma avaliação manual com observações encontrada para este usuário.</p>
            </div>
        )}

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
    </div>
  );
}

export default EvaluationDetailPage;
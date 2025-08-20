import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaEdit, FaPlus, FaArrowLeft } from 'react-icons/fa';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import CompetencyRadarChart from '../../components/charts/CompetencyRadarChart';
import styles from './EvaluationDetailPage.module.css';
import { useAuth } from '../../context/AuthContext';

function EvaluationDetailPage() {
  const { userId } = useParams();
  const { user: loggedInUser } = useAuth();
  const [user, setUser] = React.useState(null);
  const [evaluations, setEvaluations] = React.useState([]);
  const [goals, setGoals] = React.useState([]);
  const [efficiencyData, setEfficiencyData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [userRes, evalRes, goalsRes, oeeRes] = await Promise.all([
          api.get(`/auth/users/${userId}`),
          api.get(`/evaluations/user/${userId}`),
          api.get(`/goals/user/${userId}`),
          api.get(`/oee/user/${userId}`)
        ]);
        
        setUser(userRes.data);
        setEvaluations(evalRes.data);
        setGoals(goalsRes.data);

        // Calcula a média de eficiência a partir dos dados de produção
        if (oeeRes.data && oeeRes.data.length > 0) {
            const avgEfficiency = oeeRes.data.reduce((sum, item) => sum + item.oee, 0) / oeeRes.data.length;
            setEfficiencyData({
                efficiency: avgEfficiency,
            });
        }
      } catch (err) {
        console.error("Falha ao buscar dados detalhados:", err);
        setError('Não foi possível carregar os dados do usuário.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) return <p>Carregando relatório...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!user) return <p>Usuário não encontrado.</p>;

  const latestEvaluation = evaluations.length > 0 ? evaluations[0] : null;
  
  // Prepara os dados para o gráfico de radar
  const radarChartData = latestEvaluation ? [
    { subject: 'Qualidade do Serviço', score: latestEvaluation.serviceQuality_score, fullMark: 5 },
    { subject: 'Prazo de Execução', score: latestEvaluation.executionTimeframe_score, fullMark: 5 },
    { subject: 'Iniciativa/Resolução', score: latestEvaluation.problemSolvingInitiative_score, fullMark: 5 },
    { subject: 'Trabalho em Equipe', score: latestEvaluation.teamwork_score, fullMark: 5 },
    { subject: 'Comprometimento', score: latestEvaluation.commitment_score, fullMark: 5 },
    { subject: 'Proatividade', score: latestEvaluation.proactivity_score, fullMark: 5 },
  ] : [];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/team" className={styles.backButton}><FaArrowLeft /> Voltar</Link>
        <h1>Relatório de Desempenho</h1>
        <div className={styles.userInfo}>
          <h2>{user.name}</h2>
          <p>{user.role}</p>
        </div>
        {loggedInUser.role !== 'TÉCNICO' && (
             <Link to={`/avaliar/${userId}`} className={styles.actionButton}>
                <FaPlus /> Nova Avaliação
            </Link>
        )}
      </div>

      {!latestEvaluation && (
        <Card title="Nenhuma Avaliação Encontrada">
            <p>Este usuário ainda não possui uma avaliação de desempenho registrada.</p>
        </Card>
      )}

      <div className={styles.grid}>
        {/* Card de Eficiência */}
        <div className={styles.efficiencyGrid}>
            <Card title="Indicadores de Eficiência">
                <div className={styles.efficiencyMetrics}>
                    <div className={styles.metricItem}>
                        <span className={styles.metricValue}>
                            {efficiencyData ? `${efficiencyData.efficiency.toFixed(2)}%` : 'N/A'}
                        </span>
                        <span className={styles.metricLabel}>Eficiência Real (Automática)</span>
                    </div>
                    <div className={styles.metricItem}>
                        <span className={styles.metricValue}>
                            {latestEvaluation ? `${latestEvaluation.efficiency.toFixed(2)}%` : 'N/A'}
                        </span>
                        <span className={styles.metricLabel}>Eficiência da Avaliação</span>
                    </div>
                </div>
            </Card>
        </div>
        
        {/* Card de Competências com Gráfico Radar */}
        {latestEvaluation && (
            <Card title="Avaliação de Competências">
                <div className={styles.radarChartContainer}>
                    <CompetencyRadarChart data={radarChartData} />
                </div>
            </Card>
        )}

        {/* Card de Observações */}
        {latestEvaluation && (
          <Card title="Observações do Avaliador" fullWidth={true}>
            <div className={styles.notesSection}>
              <h4>Conhecimento Técnico:</h4>
              <p>{latestEvaluation.technicalKnowledge_notes || 'Nenhuma observação.'}</p>
              <h4>Certificações:</h4>
              <p>{latestEvaluation.certifications_notes || 'Nenhuma observação.'}</p>
              <h4>Tempo de Experiência:</h4>
              <p>{latestEvaluation.experienceTime_notes || 'Nenhuma observação.'}</p>
            </div>
          </Card>
        )}

        {/* Card de Metas e PDI */}
        <Card title="Metas e Plano de Desenvolvimento" fullWidth={true}>
          {goals.length > 0 ? (
            <ul className={styles.goalsList}>
              {goals.map(goal => (
                <li key={goal.id} className={styles.goalItem}>
                  <strong>{goal.title}:</strong> {goal.description} (Status: {goal.status})
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhuma meta de desenvolvimento foi definida para este usuário.</p>
          )}
           {loggedInUser.role !== 'TÉCNICO' && (
                <Link to={`/metas/atribuir/${userId}`} className={styles.assignGoalButton}>
                    <FaPlus /> Atribuir Nova Meta
                </Link>
           )}
        </Card>
      </div>
    </div>
  );
}

export default EvaluationDetailPage;
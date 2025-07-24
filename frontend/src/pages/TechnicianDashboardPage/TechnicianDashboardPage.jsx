// frontend/src/pages/TechnicianDashboardPage/TechnicianDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card/Card';
import CompetencyRadarChart from '../../components/charts/CompetencyRadarChart'; // Importar o gráfico
import styles from './TechnicianDashboardPage.module.css';
import { FaBullseye } from 'react-icons/fa';

function TechnicianDashboardPage() {
  const { user } = useAuth();
  const [latestEvaluation, setLatestEvaluation] = useState(null);
  const [goals, setGoals] = useState([]);
  const [oeeData, setOeeData] = useState(null); // Estado para os dados de OEE
  const [loading, setLoading] = useState(true);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Usuário';

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [evalRes, goalsRes, oeeRes] = await Promise.all([
          api.get(`/evaluations/user/${user.userId}`),
          api.get(`/goals/user/${user.userId}`),
          api.get(`/oee/user/${user.userId}`) // Nova chamada para buscar OEE
        ]);

        if (evalRes.data && evalRes.data.length > 0) {
          setLatestEvaluation(evalRes.data[0]);
        }
        setGoals(goalsRes.data);

        // Calcula a média de OEE se o usuário tiver múltiplas linhas
        if (oeeRes.data && oeeRes.data.length > 0) {
            const avgAvailability = oeeRes.data.reduce((sum, item) => sum + item.availability, 0) / oeeRes.data.length;
            const avgPerformance = oeeRes.data.reduce((sum, item) => sum + item.performance, 0) / oeeRes.data.length;
            const avgQuality = oeeRes.data.reduce((sum, item) => sum + item.quality, 0) / oeeRes.data.length;
            const overallOee = (avgAvailability / 100) * (avgPerformance / 100) * (avgQuality / 100);

            setOeeData({
                availability: avgAvailability,
                performance: avgPerformance,
                quality: avgQuality,
                oee: overallOee * 100
            });
        }

      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <p>Carregando dashboard...</p>;
  }

  const inProgressGoals = goals.filter(g => g.status === 'EM_ANDAMENTO');

  return (
    <div className={styles.container}>
      <h1>Bem-vindo, {firstName}!</h1>
      <p>Aqui está um resumo do seu desempenho e atividades recentes.</p>
      
      {/* Seção de KPIs de OEE */}
      {oeeData && (
        <div className={styles.kpiGrid}>
            <Card>
                <div className={styles.kpiCard} style={{borderColor: 'var(--color-primary)'}}>
                    <div className={styles.kpiValue}>{oeeData.oee.toFixed(1)}%</div>
                    <div className={styles.kpiLabel}>Meu OEE</div>
                </div>
            </Card>
            <Card>
                 <div className={styles.kpiCard} style={{borderColor: 'var(--color-mint)'}}>
                    <div className={styles.kpiValue}>{oeeData.availability.toFixed(1)}%</div>
                    <div className={styles.kpiLabel}>Disponibilidade</div>
                </div>
            </Card>
            <Card>
                 <div className={styles.kpiCard} style={{borderColor: 'var(--color-orange)'}}>
                    <div className={styles.kpiValue}>{oeeData.performance.toFixed(1)}%</div>
                    <div className={styles.kpiLabel}>Performance</div>
                </div>
            </Card>
            <Card>
                 <div className={styles.kpiCard} style={{borderColor: 'var(--color-tangerine)'}}>
                    <div className={styles.kpiValue}>{oeeData.quality.toFixed(1)}%</div>
                    <div className={styles.kpiLabel}>Qualidade</div>
                </div>
            </Card>
        </div>
      )}

      <div className={styles.mainGrid}>
        <div className={styles.mainCard}>
          <Card title="Resumo da Última Avaliação">
            {latestEvaluation ? (
              <div className={styles.chartContainer}>
                <CompetencyRadarChart evaluationData={latestEvaluation} />
              </div>
            ) : (
              <p>Você ainda não possui avaliações registradas.</p>
            )}
             <Link to="/avaliacoes" className={styles.detailsLink}>
                Ver histórico de avaliações
             </Link>
          </Card>
        </div>

        <div className={styles.sideCard}>
          <Card title="Metas em Andamento">
            {inProgressGoals.length > 0 ? (
              <div className={styles.goalsList}>
                {inProgressGoals.map(goal => (
                  <div key={goal.id} className={styles.goalItem}>
                    <FaBullseye /> <span>{goal.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>Nenhuma meta em andamento no momento.</p>
            )}
            <Link to="/metas" className={styles.detailsLink}>
              Ver todas as metas
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TechnicianDashboardPage;
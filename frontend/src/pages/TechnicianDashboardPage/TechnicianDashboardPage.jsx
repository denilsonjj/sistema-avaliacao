// frontend/src/pages/TechnicianDashboardPage/TechnicianDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card/Card';
import styles from './TechnicianDashboardPage.module.css';

function TechnicianDashboardPage() {
  const { user } = useAuth();
  const [latestEvaluation, setLatestEvaluation] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // CORREÇÃO: Pega o primeiro nome de forma segura
  const firstName = user?.name ? user.name.split(' ')[0] : 'Usuário';

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [evalRes, goalsRes] = await Promise.all([
          api.get(`/evaluations/user/${user.userId}`),
          api.get(`/goals/user/${user.userId}`)
        ]);

        if (evalRes.data && evalRes.data.length > 0) {
          setLatestEvaluation(evalRes.data[0]);
        }
        setGoals(goalsRes.data);
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
      {/* CORREÇÃO: Usa a variável segura */}
      <h1>Bem-vindo, {firstName}!</h1>
      <p>Aqui está um resumo do seu desenvolvimento e atividades.</p>

      <div className={styles.grid}>
        <div className={styles.mainCard}>
          <Card title="Resumo da Última Avaliação">
            {latestEvaluation ? (
              <div className={styles.evaluationSummary}>
                <p>
                  Sua avaliação mais recente destaca um bom desempenho em <strong>Trabalho em Equipe</strong>
                  (Nota {latestEvaluation.teamwork_score}) e <strong>Qualidade do Serviço</strong>
                  (Nota {latestEvaluation.serviceQuality_score}).
                </p>
                <Link to="/avaliacoes" className={styles.detailsLink}>
                  Ver todas as avaliações
                </Link>
              </div>
            ) : (
              <p>Você ainda não possui avaliações registradas.</p>
            )}
          </Card>
        </div>

        <div className={styles.sideCard}>
          <Card title="Metas em Andamento">
            <div className={styles.goalsList}>
              {inProgressGoals.length > 0 ? (
                inProgressGoals.map(goal => (
                  <div key={goal.id} className={styles.goalItem}>
                    {goal.title}
                  </div>
                ))
              ) : (
                <p>Nenhuma meta em andamento no momento.</p>
              )}
              <Link to="/metas" className={styles.detailsLink}>
                Ver todas as metas
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TechnicianDashboardPage;
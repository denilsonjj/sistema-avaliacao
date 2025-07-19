// frontend/src/pages/GoalsPage/GoalsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './GoalsPage.module.css';

function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState('');

  const fetchGoals = async () => {
    if (!user) return;
    const res = await api.get(`/goals/user/${user.userId}`);
    setGoals(res.data);
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api.post('/goals', {
      userId: user.userId,
      title: title,
    });
    setTitle('');
    fetchGoals(); // Re-busca as metas
  };

  const handleStatusChange = async (goalId, newStatus) => {
    await api.put(`/goals/${goalId}/status`, { status: newStatus });
    fetchGoals();
  };

  const filterGoalsByStatus = (status) => goals.filter(g => g.status === status);

  return (
    <div>
      <h1>Plano de Desenvolvimento</h1>
      <div className={styles.formCard}>
        <form onSubmit={handleCreateGoal}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Adicionar uma nova meta pessoal..."
          />
          <button type="submit">+ Adicionar Meta</button>
        </form>
      </div>

      <div className={styles.board}>
        {/* Coluna Pendente */}
        <div className={styles.column}>
          <h2>📋 Pendente</h2>
          {filterGoalsByStatus('PENDENTE').map(goal => (
            <div key={goal.id} className={styles.goalCard}>
              <p>{goal.title}</p>
              <small>Criado por: {goal.author.name}</small>
              <div className={styles.actions}>
                <button onClick={() => handleStatusChange(goal.id, 'EM_ANDAMENTO')}>▶️ Iniciar</button>
              </div>
            </div>
          ))}
        </div>
        {/* Coluna Em Andamento */}
        <div className={styles.column}>
          <h2>⏳ Em Andamento</h2>
          {filterGoalsByStatus('EM_ANDAMENTO').map(goal => (
             <div key={goal.id} className={styles.goalCard}>
              <p>{goal.title}</p>
              <small>Criado por: {goal.author.name}</small>
              <div className={styles.actions}>
                <button onClick={() => handleStatusChange(goal.id, 'CONCLUIDA')}>✅ Concluir</button>
              </div>
            </div>
          ))}
        </div>
        {/* Coluna Concluída */}
        <div className={styles.column}>
          <h2>✔️ Concluída</h2>
          {filterGoalsByStatus('CONCLUIDA').map(goal => (
             <div key={goal.id} className={`${styles.goalCard} ${styles.completed}`}>
              <p>{goal.title}</p>
              <small>Criado por: {goal.author.name}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GoalsPage;
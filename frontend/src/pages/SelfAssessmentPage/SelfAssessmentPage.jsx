// frontend/src/pages/SelfAssessmentPage/SelfAssessmentPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card/Card';
import styles from './SelfAssessmentPage.module.css';

function SelfAssessmentPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    strengths: '',
    improvementPoints: '',
    professionalGoals: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!user) return;
      try {
        const res = await api.get(`/self-assessment/user/${user.userId}`);
        if (res.data) {
          setFormData(res.data);
        }
      } catch (err) {
        console.error("Falha ao carregar dados da autoavaliação");
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await api.post(`/self-assessment/user/${user.userId}`, formData);
      setMessage('Autoavaliação salva com sucesso!');
    } catch (err) {
      setMessage('Erro ao salvar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className={styles.container}>
      <h1>Minha Autoavaliação e Metas</h1>
      <p>Reflita sobre seu desempenho e defina seus próximos passos.</p>
      <Card>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="strengths">Meus Pontos Fortes</label>
            <textarea id="strengths" name="strengths" value={formData.strengths} onChange={handleChange} rows="5" />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="improvementPoints">Pontos a Melhorar</label>
            <textarea id="improvementPoints" name="improvementPoints" value={formData.improvementPoints} onChange={handleChange} rows="5" />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="professionalGoals">Metas de Desenvolvimento Profissional</label>
            <textarea id="professionalGoals" name="professionalGoals" value={formData.professionalGoals} onChange={handleChange} rows="5" />
          </div>
          {message && <p className={styles.message}>{message}</p>}
          <button type="submit" className={styles.submitButton} disabled={submitting}>
            {submitting ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </Card>
    </div>
  );
}

export default SelfAssessmentPage;
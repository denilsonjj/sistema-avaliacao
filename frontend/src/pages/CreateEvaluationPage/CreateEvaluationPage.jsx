// frontend/src/pages/CreateEvaluationPage/CreateEvaluationPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import styles from './CreateEvaluationPage.module.css'; // Importe os novos estilos

function CreateEvaluationPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    technicalKnowledge: '',
    certifications: '',
    experienceTime: '',
    serviceQuality: '',
    executionTimeframe: '',
    problemSolvingInitiative: '',
    teamwork: '',
    commitment: '',
    proactivity: '',
    availability: 0,
    performance: 0,
    quality: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/auth/users/${userId}`);
        setUser(res.data);
      } catch (err) {
        setError('Usuário não encontrado.');
      }
    };
    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post(`/evaluations/user/${userId}`, formData);
      navigate(`/equipe/${userId}`);
    } catch (err) {
      setError('Falha ao submeter avaliação. Verifique os dados e tente novamente.');
    } finally {
        setSubmitting(false);
    }
  };

  if (!user) {
    return <p>Carregando...</p>;
  }

  return (
    <div className={styles.formContainer}>
      <h1>Nova Avaliação para {user.name}</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Card title="Avaliação Individual">
          <div className={styles.formGroup}>
            <label htmlFor="technicalKnowledge">Conhecimento Técnico:</label>
            <textarea id="technicalKnowledge" name="technicalKnowledge" value={formData.technicalKnowledge} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="certifications">Certificações:</label>
            <textarea id="certifications" name="certifications" value={formData.certifications} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="experienceTime">Tempo de Experiência:</label>
            <input type="text" id="experienceTime" name="experienceTime" value={formData.experienceTime} onChange={handleChange} required />
          </div>
        </Card>

        <Card title="Avaliação de Desempenho">
           <div className={styles.formGroup}>
             <label htmlFor="serviceQuality">Qualidade do Serviço Executado:</label>
             <textarea id="serviceQuality" name="serviceQuality" value={formData.serviceQuality} onChange={handleChange} required />
           </div>
           <div className={styles.formGroup}>
             <label htmlFor="executionTimeframe">Prazo de Execução (Análise de SLA/MTTR):</label>
             <textarea id="executionTimeframe" name="executionTimeframe" value={formData.executionTimeframe} onChange={handleChange} required />
           </div>
           <div className={styles.formGroup}>
             <label htmlFor="problemSolvingInitiative">Iniciativa e Resolução de Problemas:</label>
             <textarea id="problemSolvingInitiative" name="problemSolvingInitiative" value={formData.problemSolvingInitiative} onChange={handleChange} required />
           </div>
        </Card>

        <Card title="Avaliação Comportamental">
            <div className={styles.formGroup}>
              <label htmlFor="teamwork">Trabalho em Equipe:</label>
              <textarea id="teamwork" name="teamwork" value={formData.teamwork} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="commitment">Comprometimento e Disciplina:</label>
              <textarea id="commitment" name="commitment" value={formData.commitment} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="proactivity">Proatividade e Atitude Positiva:</label>
              <textarea id="proactivity" name="proactivity" value={formData.proactivity} onChange={handleChange} required />
            </div>
        </Card>

        <Card title="Indicadores de OEE (%)">
            <div className={styles.formGroup}>
              <label htmlFor="availability">Disponibilidade (A):</label>
              <input type="number" id="availability" name="availability" value={formData.availability} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="performance">Performance (P):</label>
              <input type="number" id="performance" name="performance" value={formData.performance} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="quality">Qualidade (Q):</label>
              <input type="number" id="quality" name="quality" value={formData.quality} onChange={handleChange} required />
            </div>
        </Card>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submitButton} disabled={submitting}>
          {submitting ? 'Enviando...' : 'Enviar Avaliação'}
        </button>
      </form>
    </div>
  );
}

export default CreateEvaluationPage;
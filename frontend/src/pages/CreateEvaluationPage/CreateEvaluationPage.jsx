// frontend/src/pages/CreateEvaluationPage/CreateEvaluationPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import styles from './CreateEvaluationPage.module.css';

function CreateEvaluationPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    // Campos de Notas (agora com sufixo _notes)
    technicalKnowledge_notes: '',
    certifications_notes: '',
    experienceTime_notes: '',
    
    // Campos de Pontuação (com sufixo _score e valor padrão 3)
    serviceQuality_score: 3,
    executionTimeframe_score: 3,
    problemSolvingInitiative_score: 3,
    teamwork_score: 3,
    commitment_score: 3,
    proactivity_score: 3,

    // OEE com valores padrão
    availability: 90,
    performance: 90,
    quality: 90,
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
      // Garante que campos numéricos sejam salvos como números
      [name]: type === 'number' || type === 'select-one' ? parseInt(value, 10) : value,
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
        <Card title="Observações Gerais">
          <div className={styles.formGroup}>
            <label htmlFor="technicalKnowledge_notes">Conhecimento Técnico (Observações)</label>
            <textarea id="technicalKnowledge_notes" name="technicalKnowledge_notes" value={formData.technicalKnowledge_notes} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="certifications_notes">Certificações (Observações)</label>
            <textarea id="certifications_notes" name="certifications_notes" value={formData.certifications_notes} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="experienceTime_notes">Tempo de Experiência (Observações)</label>
            <textarea id="experienceTime_notes" name="experienceTime_notes" value={formData.experienceTime_notes} onChange={handleChange} />
          </div>
        </Card>

        <Card title="Avaliação de Competências (Nota de 1 a 5)">
          <div className={styles.scoreGrid}>
            {[
              { key: 'serviceQuality_score', label: 'Qualidade do Serviço' },
              { key: 'executionTimeframe_score', label: 'Prazo de Execução' },
              { key: 'problemSolvingInitiative_score', label: 'Iniciativa' },
              { key: 'teamwork_score', label: 'Trabalho em Equipe' },
              { key: 'commitment_score', label: 'Comprometimento' },
              { key: 'proactivity_score', label: 'Proatividade' },
            ].map(item => (
              <div className={styles.formGroup} key={item.key}>
                <label htmlFor={item.key}>{item.label}</label>
                <select id={item.key} name={item.key} value={formData[item.key]} onChange={handleChange}>
                  <option value={1}>1 - Insatisfatório</option>
                  <option value={2}>2 - Precisa Melhorar</option>
                  <option value={3}>3 - Atende às Expectativas</option>
                  <option value={4}>4 - Supera as Expectativas</option>
                  <option value={5}>5 - Excepcional</option>
                </select>
              </div>
            ))}
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
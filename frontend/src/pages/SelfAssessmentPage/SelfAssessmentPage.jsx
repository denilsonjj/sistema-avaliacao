import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Importar Link
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card/Card';
import styles from './SelfAssessmentPage.module.css';
import { FaStar, FaChartLine, FaBullseye, FaTasks } from 'react-icons/fa'; // Importar ícones

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
      <h1>Minha Autoavaliação</h1>
      <p>Reflita sobre seu desempenho e defina seus próximos passos.</p>
      
      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          {/* Coluna da Esquerda: Autoavaliação */}
          <div className={styles.formColumn}>
            <Card title="Autoavaliação">
              <div className={styles.formGroup}>
                <label htmlFor="strengths"><FaStar /> Meus Pontos Fortes</label>
                <small>Habilidades técnicas e comportamentais em que você se destaca.</small>
                <textarea id="strengths" name="strengths" value={formData.strengths} onChange={handleChange} rows="8" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="improvementPoints"><FaChartLine /> Pontos a Melhorar</label>
                <small>Áreas e competências que você deseja desenvolver.</small>
                <textarea id="improvementPoints" name="improvementPoints" value={formData.improvementPoints} onChange={handleChange} rows="8" />
              </div>
            </Card>
          </div>

          {/* Coluna da Direita: Metas */}
          <div className={styles.formColumn}>
            <Card title="Metas de Desenvolvimento">
              <div className={styles.formGroup}>
                <label htmlFor="professionalGoals"><FaBullseye /> Objetivos Profissionais</label>
                <small>Descreva seus objetivos de carreira a médio e longo prazo.</small>
                <textarea id="professionalGoals" name="professionalGoals" value={formData.professionalGoals} onChange={handleChange} rows="8" />
              </div>
              <div className={styles.linkCard}>
                <FaTasks />
                <div>
                  <h4>Gerencie suas Metas</h4>
                  <p>Transforme seus objetivos em tarefas práticas no seu quadro de desenvolvimento.</p>
                  <Link to="/metas" className={styles.linkButton}>Ir para o Quadro de Metas</Link>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {message && <p className={styles.message}>{message}</p>}
        
        <div className={styles.saveButtonContainer}>
          <button type="submit" className={styles.submitButton} disabled={submitting}>
            {submitting ? 'Salvando...' : 'Salvar Autoavaliação'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SelfAssessmentPage;
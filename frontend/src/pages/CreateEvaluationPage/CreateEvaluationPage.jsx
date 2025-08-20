// frontend/src/pages/CreateEvaluationPage/CreateEvaluationPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import styles from './CreateEvaluationPage.module.css';

// Opções para o select de pontuação
const scoreOptions = [
  { value: 1, label: '1 - Insatisfatório' },
  { value: 2, label: '2 - Precisa Melhorar' },
  { value: 3, label: '3 - Atende às Expectativas' },
  { value: 4, label: '4 - Supera as Expectativas' },
  { value: 5, label: '5 - Excepcional' },
];

// Estilos customizados para o React Select que se adaptam ao tema
const customSelectStyles = (theme) => ({
  control: (provided) => ({
    ...provided,
    backgroundColor: theme === 'dark' ? '#1e2129' : '#ffffff',
    borderColor: theme === 'dark' ? '#313642' : '#dce1e6',
    color: theme === 'dark' ? '#e1e1e1' : '#282b34',
    minHeight: '46px',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: theme === 'dark' ? '#e1e1e1' : '#282b34',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: theme === 'dark' ? '#1e2129' : '#ffffff',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? (theme === 'dark' ? '#5a7ec7' : '#243782') : (state.isFocused ? (theme === 'dark' ? '#313642' : '#e8eaf6') : 'transparent'),
    color: state.isSelected ? 'white' : (theme === 'dark' ? '#e1e1e1' : '#282b34'),
  }),
  menuPortal: base => ({ ...base, zIndex: 9999 })
});

function CreateEvaluationPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const theme = document.body.getAttribute('data-theme');
  
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    technicalKnowledge_notes: '',
    certifications_notes: '',
    experienceTime_notes: '',
    serviceQuality_score: 3,
    executionTimeframe_score: 3,
    problemSolvingInitiative_score: 3,
    teamwork_score: 3,
    commitment_score: 3,
    proactivity_score: 3,
    eficiency:90
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
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSelectChange = (selectedOption, action) => {
    setFormData(prev => ({ ...prev, [action.name]: selectedOption.value }));
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
      console.error(err);
    } finally {
        setSubmitting(false);
    }
  };
  
  if (!user) return <p>Carregando...</p>;

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
                <Select
                  name={item.key}
                  inputId={item.key}
                  options={scoreOptions}
                  styles={customSelectStyles(theme)}
                  defaultValue={scoreOptions.find(opt => opt.value === formData[item.key])}
                  onChange={handleSelectChange}
                  menuPortalTarget={document.body}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Indicador de Eficiência (%)">
            <div className={styles.formGroup}>
                <label htmlFor="efficiency">Eficiência (Avaliação Manual):</label>
                <input type="number" id="efficiency" name="efficiency" value={formData.efficiency} onChange={handleChange} required min="0" max="200" />
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
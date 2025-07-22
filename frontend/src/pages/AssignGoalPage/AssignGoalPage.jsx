// frontend/src/pages/AssignGoalPage/AssignGoalPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker'; // Importe o DatePicker
import { registerLocale } from  "react-datepicker";
import ptBR from 'date-fns/locale/pt-BR'; // Importe a localização em português
import api from '../../services/api';
import Card from '../../components/Card/Card';
import styles from './AssignGoalPage.module.css';

registerLocale('pt-BR', ptBR); // Registra o português para o calendário

function AssignGoalPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: null, // O estado agora guarda null ou um objeto Date
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler específico para o DatePicker
  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, dueDate: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/goals', {
        userId: userId,
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate, // O backend já sabe lidar com o objeto Date
      });
      navigate(`/equipe/${userId}`);
    } catch (err) {
      setError('Falha ao atribuir a meta.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <p>Carregando...</p>;

  return (
    <div className={styles.container}>
      <h1>Atribuir Nova Meta para {user.name}</h1>
      <p>Defina um objetivo claro com um prazo, se necessário.</p>
      <Card>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Título da Meta</label>
            <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} placeholder="Ex: Concluir curso de Power BI" required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description">Descrição (Opcional)</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Detalhes sobre a meta, links para cursos, etc." />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="dueDate">Prazo Final (Opcional)</label>
            {/* SUBSTITUÍMOS O INPUT PELO DATEPICKER */}
            <DatePicker
              id="dueDate"
              selected={formData.dueDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              locale="pt-BR"
              placeholderText="Selecione uma data"
              className={styles.datePickerInput} // Classe para estilização
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submitButton} disabled={submitting}>
            {submitting ? 'Atribuindo...' : 'Atribuir Meta'}
          </button>
        </form>
      </Card>
    </div>
  );
}

export default AssignGoalPage;
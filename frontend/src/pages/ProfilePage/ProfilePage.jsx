// frontend/src/pages/ProfilePage/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card/Card';
import styles from './ProfilePage.module.css';

function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    technicalSkills: '',
    certifications: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        // A rota /users/:id que já existe é perfeita para pegar os dados mais atuais
        const res = await api.get(`/auth/users/${user.userId}`);
        setFormData({
          name: res.data.name || '',
          email: res.data.email || '', // O email não será editável
          technicalSkills: res.data.technicalSkills || '',
          certifications: res.data.certifications || '',
        });
      } catch (error) {
        console.error("Erro ao buscar dados do perfil", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
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
      await api.put('/auth/profile', {
        name: formData.name,
        technicalSkills: formData.technicalSkills,
        certifications: formData.certifications,
      });
      setMessage('Perfil atualizado com sucesso!');
    } catch (err) {
      setMessage('Erro ao atualizar o perfil.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Carregando perfil...</p>;

  return (
    <div className={styles.container}>
      <h1>Meu Perfil</h1>
      <p>Mantenha suas informações e competências atualizadas.</p>
      <Card>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nome Completo</label>
            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={formData.email} disabled />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="technicalSkills">Conhecimentos Técnicos</label>
            <textarea id="technicalSkills" name="technicalSkills" value={formData.technicalSkills} onChange={handleChange} rows="6" placeholder="Ex: CLP Siemens, Redes Profinet, Hidráulica Avançada..."/>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="certifications">Cursos e Certificações</label>
            <textarea id="certifications" name="certifications" value={formData.certifications} onChange={handleChange} rows="6" placeholder="Ex: NR-10 (Val: 12/2025), Curso de Excel Avançado..."/>
          </div>
          {message && <p className={styles.message}>{message}</p>}
          <button type="submit" className={styles.submitButton} disabled={submitting}>
            {submitting ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </Card>
    </div>
  );
}

export default ProfilePage;
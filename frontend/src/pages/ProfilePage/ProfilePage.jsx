// frontend/src/pages/ProfilePage/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card/Card';
import Avatar from '../../components/Avatar/Avatar'; // Importando o Avatar
import styles from './ProfilePage.module.css';
import { FaUser, FaEnvelope, FaTools, FaCertificate, FaSave } from 'react-icons/fa'; // Importando ícones

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
        const res = await api.get(`/auth/users/${user.userId}`);
        setFormData({
          name: res.data.name || '',
          email: res.data.email || '',
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
      
      <div className={styles.profileGrid}>
        {/* Coluna da Esquerda: Avatar e Infos */}
        <div className={styles.leftColumn}>
          <Card>
            <div className={styles.avatarCard}>
              <Avatar name={formData.name} />
              <h2 className={styles.userName}>{formData.name}</h2>
              <p className={styles.userEmail}>{formData.email}</p>
            </div>
          </Card>
        </div>

        {/* Coluna da Direita: Formulário de Edição */}
        <div className={styles.rightColumn}>
          <Card title="Editar Informações">
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name"><FaUser /> Nome Completo</label>
                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="technicalSkills"><FaTools /> Conhecimentos Técnicos</label>
                <textarea id="technicalSkills" name="technicalSkills" value={formData.technicalSkills} onChange={handleChange} rows="6" placeholder="Ex: CLP Siemens, Redes Profinet..."/>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="certifications"><FaCertificate /> Cursos e Certificações</label>
                <textarea id="certifications" name="certifications" value={formData.certifications} onChange={handleChange} rows="6" placeholder="Ex: NR-10 (Val: 12/2025)..."/>
              </div>
              
              {message && <p className={styles.message}>{message}</p>}
              
              <button type="submit" className={styles.submitButton} disabled={submitting}>
                <FaSave /> {submitting ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
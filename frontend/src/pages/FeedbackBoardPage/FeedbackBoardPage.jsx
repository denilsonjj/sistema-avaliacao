// frontend/src/pages/FeedbackBoardPage/FeedbackBoardPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import Avatar from '../../components/Avatar/Avatar';
import styles from './FeedbackBoardPage.module.css';
import { FaQuoteLeft, FaPaperPlane } from 'react-icons/fa'; // Importando ícones

function FeedbackBoardPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.get('/auth/users').then(res => {
      // Ordena os usuários por nome
      const sortedUsers = res.data.sort((a, b) => a.name.localeCompare(b.name));
      setUsers(sortedUsers);
    });
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setLoadingFeedbacks(true);
      api.get(`/feedbacks/user/${selectedUser.id}`)
        .then(res => setFeedbacks(res.data))
        .finally(() => setLoadingFeedbacks(false));
    }
  }, [selectedUser]);

  const handleUserSelect = (userId) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!newFeedback.trim() || !selectedUser) return;
    setIsSubmitting(true);

    await api.post('/feedbacks', {
      recipientId: selectedUser.id,
      content: newFeedback,
    });

    const res = await api.get(`/feedbacks/user/${selectedUser.id}`);
    setFeedbacks(res.data);
    setNewFeedback('');
    setIsSubmitting(false);
  };

  return (
    <div>
      <h1>Quadro de Feedbacks</h1>
      <div className={styles.container}>
        <div className={styles.userListPanel}>
          <Card title="Equipe">
            <div className={styles.userList}>
              {users.map(user => (
                <div
                  key={user.id}
                  className={`${styles.userItem} ${selectedUser?.id === user.id ? styles.selected : ''}`}
                  onClick={() => handleUserSelect(user.id)}
                >
                  <Avatar name={user.name} />
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.name}</span>
                    <span className={styles.userRole}>{user.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className={styles.feedbackArea}>
          {selectedUser ? (
            <>
              <h2>Feedbacks para <span className={styles.highlight}>{selectedUser.name}</span></h2>
              <div className={styles.feedbackList}>
                {loadingFeedbacks ? <p>Carregando feedbacks...</p> : feedbacks.map(fb => (
                  <div key={fb.id} className={styles.feedbackCard}>
                    <div className={styles.feedbackHeader}>
                      <FaQuoteLeft />
                    </div>
                    <p className={styles.feedbackContent}>"{fb.content}"</p>
                    <div className={styles.feedbackFooter}>
                      <div className={styles.feedbackAuthorInfo}>
                        <Avatar name={fb.author.name} />
                        <div>
                          <strong>{fb.author.name}</strong>
                          <small>{new Date(fb.createdAt).toLocaleDateString()}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {feedbacks.length === 0 && !loadingFeedbacks && <p>Nenhum feedback registrado para este usuário.</p>}
              </div>
               <form onSubmit={handleSubmitFeedback} className={styles.form}>
                <textarea
                  value={newFeedback}
                  onChange={e => setNewFeedback(e.target.value)}
                  placeholder="Escreva um novo feedback construtivo..."
                  rows="4"
                  disabled={isSubmitting}
                />
                <button type="submit" disabled={isSubmitting || !newFeedback.trim()}>
                  <FaPaperPlane /> {isSubmitting ? 'Enviando...' : 'Adicionar Feedback'}
                </button>
              </form>
            </>
          ) : (
            <div className={styles.placeholder}>
              <p>Selecione um membro da equipe para começar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FeedbackBoardPage;
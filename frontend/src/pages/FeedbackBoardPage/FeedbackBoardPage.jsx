// frontend/src/pages/FeedbackBoardPage/FeedbackBoardPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import styles from './FeedbackBoardPage.module.css';

function FeedbackBoardPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/auth/users').then(res => setUsers(res.data));
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setLoading(true);
      api.get(`/feedbacks/user/${selectedUser.id}`)
        .then(res => setFeedbacks(res.data))
        .finally(() => setLoading(false));
    }
  }, [selectedUser]);

  const handleUserSelect = (userId) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!newFeedback.trim() || !selectedUser) return;

    await api.post('/feedbacks', {
      recipientId: selectedUser.id,
      content: newFeedback,
    });

    // Atualiza a lista
    const res = await api.get(`/feedbacks/user/${selectedUser.id}`);
    setFeedbacks(res.data);
    setNewFeedback('');
  };

  return (
    <div>
      <h1>Quadro de Feedbacks</h1>
      <div className={styles.container}>
        <div className={styles.userList}>
          <Card title="Selecione um Usuário">
            {users.map(user => (
              <div 
                key={user.id} 
                className={`${styles.userItem} ${selectedUser?.id === user.id ? styles.selected : ''}`}
                onClick={() => handleUserSelect(user.id)}
              >
                {user.name}
              </div>
            ))}
          </Card>
        </div>
        <div className={styles.feedbackArea}>
          {selectedUser ? (
            <Card title={`Feedbacks para ${selectedUser.name}`}>
              <form onSubmit={handleSubmitFeedback} className={styles.form}>
                <textarea 
                  value={newFeedback} 
                  onChange={e => setNewFeedback(e.target.value)}
                  placeholder="Escreva um novo feedback..."
                  rows="4"
                />
                <button type="submit">Adicionar Feedback</button>
              </form>
              <div className={styles.feedbackList}>
                {loading ? <p>Carregando...</p> : feedbacks.map(fb => (
                  <div key={fb.id} className={styles.feedbackItem}>
                    <p>{fb.content}</p>
                    <span>- {fb.author.name} em {new Date(fb.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <p>Selecione um usuário da lista para ver ou adicionar feedbacks.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FeedbackBoardPage;
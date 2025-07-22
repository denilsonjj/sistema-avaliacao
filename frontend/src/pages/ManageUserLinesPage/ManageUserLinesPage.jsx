import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import styles from './ManageUserLinesPage.module.css';

function ManageUserLinesPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [allLines, setAllLines] = useState([]);
  const [assignedLines, setAssignedLines] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, allLinesRes, assignedLinesRes] = await Promise.all([
          api.get(`/auth/users/${userId}`),
          api.get('/production-lines'),
          api.get(`/production-lines/user/${userId}`)
        ]);
        setUser(userRes.data);
        setAllLines(allLinesRes.data);
        setAssignedLines(new Set(assignedLinesRes.data.map(line => line.id)));
      } catch (error) {
        console.error("Erro ao buscar dados", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleCheckboxChange = (lineId) => {
    setAssignedLines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lineId)) {
        newSet.delete(lineId);
      } else {
        newSet.add(lineId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    try {
      await api.post(`/production-lines/user/${userId}`, {
        lineIds: Array.from(assignedLines)
      });
      navigate('/gerenciar-usuarios');
    } catch (error) {
      alert("Falha ao salvar as alterações.");
    }
  };
  
  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <h1>Gerenciar Linhas de {user?.name}</h1>
      <p>Selecione as linhas de produção pelas quais este usuário é responsável.</p>
      <Card>
        <div className={styles.linesGrid}>
          {allLines.map(line => (
            <div key={line.id} className={styles.checkboxWrapper}>
              <input
                type="checkbox"
                id={line.id}
                checked={assignedLines.has(line.id)}
                onChange={() => handleCheckboxChange(line.id)}
              />
              <label htmlFor={line.id}>{line.name}</label>
            </div>
          ))}
        </div>
        <button onClick={handleSave} className={styles.saveButton}>Salvar Alterações</button>
      </Card>
    </div>
  );
}

export default ManageUserLinesPage;
// frontend/src/components/Header/Header.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';

function Header() {
  const { logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.headerTitle}>
        Sistema de Gestão de Avaliação
      </div>
      <div className={styles.headerActions}>
        {/* Futuramente, podemos adicionar o nome do usuário aqui */}
        <button onClick={logout} className={styles.logoutButton}>
          Sair
        </button>
      </div>
    </header>
  );
}

export default Header;
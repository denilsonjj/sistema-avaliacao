// frontend/src/components/Header/Header.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import styles from './Header.module.css';

function Header({ onMenuClick }) {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.header}>
      <button className={styles.menuButton} onClick={onMenuClick}>
        ☰
      </button>

      <div className={styles.headerTitle}>
        Sistema de Gestão e Avaliação
      </div>
      <div className={styles.headerActions}>
        <button onClick={toggleTheme} className={styles.themeButton}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button onClick={logout} className={styles.logoutButton}>
          Sair
        </button>
      </div>
    </header>
  );
}

export default Header;
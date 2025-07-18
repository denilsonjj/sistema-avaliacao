// frontend/src/components/Sidebar/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Importe o useAuth
import styles from './Sidebar.module.css';

function Sidebar() {
  const { user } = useAuth(); // Pegue os dados do usuário do contexto

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
          Início
        </NavLink>

        {/* O link "Minhas Avaliações" será para todos, exceto talvez PMM */}
        <NavLink to="/avaliacoes" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
          Minhas Avaliações
        </NavLink>

        {/* Renderização Condicional: Mostra o link "Equipe" apenas se o usuário for LIDER ou PMM */}
        {user && (user.role === 'LIDER' || user.role === 'PMM') && (
          <NavLink to="/equipe" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
            Equipe
          </NavLink>
        )}

        {user && user.role === 'PMM' && (
          <NavLink to="/gerenciar-usuarios" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
            Gerenciar Usuários
          </NavLink>
        )}
        {user && (user.role === 'TECNICO' || user.role === 'ESTAGIARIO' || user.role === 'PMS') && (
          <NavLink to="/autoavaliacao" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
            Autoavaliação
          </NavLink>
        )}
        {user && (user.role === 'LIDER' || user.role === 'PMM') && (
    <>
        <NavLink to="/feedbacks" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
            Quadro de Feedbacks
        </NavLink>
    </>
    )}
      </nav>
    </aside>
  );
}

export default Sidebar;
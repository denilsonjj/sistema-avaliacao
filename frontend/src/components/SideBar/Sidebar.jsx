// frontend/src/components/Sidebar/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';
import {
  FaTachometerAlt, FaUserCog, FaClipboardList, FaBullseye, FaPencilAlt,
  FaUsers, FaComments, FaUsersCog, FaChartBar
} from 'react-icons/fa';

function Sidebar({ isMobileOpen, isDesktopCollapsed, onLinkClick, onCollapseClick }) {
  const { user } = useAuth();

  const getLinkProps = (text) => ({
    className: ({ isActive }) => isActive ? styles.activeLink : styles.navLink,
    title: isDesktopCollapsed ? text : ''
  });

  return (
    <aside className={`${styles.sidebar} ${isMobileOpen ? styles.sidebarOpen : ''}`}>
      <div className={styles.sidebarContent}>
        <nav className={styles.nav} onClick={onLinkClick}>
          {/* O span do texto agora tem uma classe condicional */}
          <NavLink to="/dashboard" {...getLinkProps('Início')}>
            <span className={styles.icon}><FaTachometerAlt /></span>
            <span className={`${styles.text} ${isDesktopCollapsed ? styles.textCollapsed : ''}`}>Início</span>
          </NavLink>
          <NavLink to="/perfil" {...getLinkProps('Meu Perfil')}>
            <span className={styles.icon}><FaUserCog /></span>
            <span className={`${styles.text} ${isDesktopCollapsed ? styles.textCollapsed : ''}`}>Meu Perfil</span>
          </NavLink>
          <NavLink to="/avaliacoes" {...getLinkProps('Minhas Avaliações')}>
            <span className={styles.icon}><FaClipboardList /></span>
            <span className={`${styles.text} ${isDesktopCollapsed ? styles.textCollapsed : ''}`}>Minhas Avaliações</span>
          </NavLink>
          <NavLink to="/metas" {...getLinkProps('Minhas Metas')}>
            <span className={styles.icon}><FaBullseye /></span>
            <span className={`${styles.text} ${isDesktopCollapsed ? styles.textCollapsed : ''}`}>Minhas Metas</span>
          </NavLink>

          {user && (user.role === 'TECNICO' || user.role === 'ESTAGIARIO' || user.role === 'PMS') && (
            <NavLink to="/autoavaliacao" {...getLinkProps('Autoavaliação')}>
              <span className={styles.icon}><FaPencilAlt /></span>
              <span className={`${styles.text} ${isDesktopCollapsed ? styles.textCollapsed : ''}`}>Autoavaliação</span>
            </NavLink>
          )}

          {user && (user.role === 'LIDER' || user.role === 'PMM') && (
            <>
              <NavLink to="/equipe" {...getLinkProps('Equipe')}>
                <span className={styles.icon}><FaUsers /></span>
                <span className={`${styles.text} ${isDesktopCollapsed ? styles.textCollapsed : ''}`}>Equipe</span>
              </NavLink>
              <NavLink to="/feedbacks" {...getLinkProps('Quadro de Feedbacks')}>
                <span className={styles.icon}><FaComments /></span>
                <span className={`${styles.text} ${isDesktopCollapsed ? styles.textCollapsed : ''}`}>Quadro de Feedbacks</span>
              </NavLink>
            </>
          )}

          {user && user.role === 'PMM' && (
            <>
              <NavLink to="/gerenciar-usuarios" {...getLinkProps('Gerenciar Usuários')}>
                <span className={styles.icon}><FaUsersCog /></span>
                <span className={`${styles.text} ${isDesktopCollapsed ? styles.textCollapsed : ''}`}>Gerenciar Usuários</span>
              </NavLink>
              <NavLink to="/relatorios" {...getLinkProps('Relatórios')}>
                <span className={styles.icon}><FaChartBar /></span>
                <span className={`${styles.text} ${isDesktopCollapsed ? styles.textCollapsed : ''}`}>Relatórios</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>

      <button onClick={onCollapseClick} className={styles.collapseButton}>
        {isDesktopCollapsed ? '»' : '«'}
      </button>
    </aside>
  );
}

export default Sidebar;
// frontend/src/components/Layout/Layout.jsx
import React, { useState } from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import styles from './Layout.module.css';

function Layout({ children }) {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const toggleDesktopCollapse = () => {
    setDesktopSidebarCollapsed(!isDesktopSidebarCollapsed);
  };

  return (
    <div className={`${styles.layout} ${isDesktopSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
      <Header onMenuClick={toggleMobileSidebar} />
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        isDesktopCollapsed={isDesktopSidebarCollapsed}
        onLinkClick={toggleMobileSidebar}
        onCollapseClick={toggleDesktopCollapse}
      />
      {isMobileSidebarOpen && <div className={styles.overlay} onClick={toggleMobileSidebar}></div>}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}

export default Layout;
// frontend/src/components/Layout/Layout.jsx
import React from 'react';
import Header from '../Header/Header';
import Sidebar from '../SideBar/Sidebar'; // Assuming you have a Sidebar component
import styles from './Layout.module.css';

function Layout({ children }) {
  return (
    <div className={styles.layout}>
      <Header />
      <Sidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}

export default Layout;
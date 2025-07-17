import React from 'react';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const { logout } = useAuth();

  return (
    <div style={{ padding: '50px' }}>
      <h1>Dashboard</h1>
      <p>Login realizado com sucesso!</p>
      <button onClick={logout} style={{ padding: '10px 20px', color: 'white', backgroundColor: 'red', border: 'none', borderRadius: '4px' }}>
        Sair
      </button>
    </div>
  );
}

export default DashboardPage;
// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout/Layout'; // Importe o Layout

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Envolva o conteúdo protegido com o Layout
  return <Layout>{children}</Layout>;
}

export default ProtectedRoute;
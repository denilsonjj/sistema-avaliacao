// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';
// import DashboardPage from './pages/DashboardPage.jsx'; // Não precisamos mais deste import direto
import DashboardRouter from './pages/DashboardRouter.jsx'; // Importe o Roteador
import TeamDashboardPage from './pages/TeamDashboardPage/TeamDashboardPage.jsx';
import EvaluationDetailPage from './pages/EvaluationDetailPage/EvaluationDetailPage.jsx';
import CreateEvaluationPage from './pages/CreateEvaluationPage/CreateEvaluationPage.jsx';
import MyEvaluationsPage from './pages/MyEvaluationsPage/MyEvaluationsPage';
import UserManagementPage from './pages/UserManagementPage/UserManagementPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import SelfAssessmentPage from './pages/SelfAssessmentPage/SelfAssessmentPage';
import FeedbackBoardPage from './pages/FeedbackBoardPage/FeedbackBoardPage';
import RegisterPage from './pages/RegisterPage/RegisterPage.jsx';


import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <LoginPage /> },

      {
        path: '/cadastro',
        element: <RegisterPage />,
      },
     
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        ),
      },
      {
        path: '/avaliacoes',
        element: (
          <ProtectedRoute>
            <MyEvaluationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/equipe',
        element: <ProtectedRoute><TeamDashboardPage /></ProtectedRoute>,
      },
      {
        path: '/equipe/:userId',
        element: <ProtectedRoute><EvaluationDetailPage /></ProtectedRoute>,
      },
      {
        path: '/equipe/:userId/nova-avaliacao',
        element: <ProtectedRoute><CreateEvaluationPage /></ProtectedRoute>,
      },
      {
        path: '/gerenciar-usuarios',
        element: <ProtectedRoute><UserManagementPage /></ProtectedRoute>,
      },
      {
        path: '/autoavaliacao',
        element: <ProtectedRoute><SelfAssessmentPage /></ProtectedRoute>,
      },
      {
        path: '/feedbacks',
        element: <ProtectedRoute><FeedbackBoardPage /></ProtectedRoute>,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
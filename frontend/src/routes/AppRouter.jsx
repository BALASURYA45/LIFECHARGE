import { createBrowserRouter } from 'react-router-dom';
import App from '../App.jsx';
import BatteryDataFormPage from '../pages/BatteryDataFormPage.jsx';
import BatteryDataPage from '../pages/BatteryDataPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import ForgotPasswordPage from '../pages/ForgotPasswordPage.jsx';
import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import MachineLearningPage from '../pages/MachineLearningPage.jsx';
import PredictionPage from '../pages/PredictionPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import ReportsPage from '../pages/ReportsPage.jsx';
import ResetPasswordPage from '../pages/ResetPasswordPage.jsx';
import WhatIfPage from '../pages/WhatIfPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password/:token',
        element: <ResetPasswordPage />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'battery',
        element: (
          <ProtectedRoute>
            <BatteryDataPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'battery/new',
        element: (
          <ProtectedRoute>
            <BatteryDataFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'battery/:id/edit',
        element: (
          <ProtectedRoute>
            <BatteryDataFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'ml-training',
        element: (
          <ProtectedRoute>
            <MachineLearningPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'prediction',
        element: (
          <ProtectedRoute>
            <PredictionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'what-if',
        element: (
          <ProtectedRoute>
            <WhatIfPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports',
        element: (
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

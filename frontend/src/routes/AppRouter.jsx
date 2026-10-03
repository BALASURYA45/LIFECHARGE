import { lazy, Suspense } from 'react';
import { createBrowserRouter, Link, useRouteError } from 'react-router-dom';
import { BatteryCharging } from 'lucide-react';
import App from '../App.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import ForgotPasswordPage from '../pages/ForgotPasswordPage.jsx';
import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import MachineLearningPage from '../pages/MachineLearningPage.jsx';
import PredictionPage from '../pages/PredictionPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import ReportsPage from '../pages/ReportsPage.jsx';
import ResetPasswordPage from '../pages/ResetPasswordPage.jsx';
import RoutineAnalysisPage from '../pages/RoutineAnalysisPage.jsx';
import BatteryDataPage from '../pages/BatteryDataPage.jsx';
import BatteryDataFormPage from '../pages/BatteryDataFormPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

import EarlyLifePage from '../pages/EarlyLifePage.jsx';
import ModelComparisonPage from '../pages/ModelComparisonPage.jsx';
import ResearchExperimentsPage from '../pages/ResearchExperimentsPage.jsx';
import WhatIfPage from '../pages/WhatIfPage.jsx';
import DigitalTwinPage from '../pages/DigitalTwinPage.jsx';
import V2GOptimizerPage from '../pages/V2GOptimizerPage.jsx';

// LITHYX New Pages
import HealthIndicatorsPage from '../pages/HealthIndicatorsPage.jsx';
import LithyxPredictionPage from '../pages/LithyxPredictionPage.jsx';
import CrossChemistryPage from '../pages/CrossChemistryPage.jsx';
import UncertaintyPage from '../pages/UncertaintyPage.jsx';
import ExplainabilityPage from '../pages/ExplainabilityPage.jsx';
import AblationStudyPage from '../pages/AblationStudyPage.jsx';
import DatasetManagerPage from '../pages/DatasetManagerPage.jsx';

const VehicleShowcasePage = lazy(() => import('../pages/VehicleShowcasePage.jsx'));

function RouteErrorPage() {
  const error = useRouteError();
  console.error('Route error caught:', error);

  const is404 = error?.status === 404;

  return (
    <div className="mx-auto max-w-xl text-center py-16 px-4">
      <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 mb-4 border border-emerald-500/20">
        <BatteryCharging size={32} />
      </div>
      <h1 className="text-2xl font-black text-slate-900 dark:text-white">
        {is404 ? 'Page Not Found' : 'Application Error'}
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {error?.message || error?.statusText || 'An unexpected error occurred while loading this page.'}
      </p>
      <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 font-bold text-white shadow-lg shadow-emerald-950/40 hover:from-emerald-500 hover:to-teal-500 transition">
        Return to LITHYX Dashboard
      </Link>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouteErrorPage />,
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
        path: 'health-indicators',
        element: (
          <ProtectedRoute>
            <HealthIndicatorsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'lithyx-prediction',
        element: (
          <ProtectedRoute>
            <LithyxPredictionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'digital-twin',
        element: (
          <ProtectedRoute>
            <DigitalTwinPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'digitaltwin',
        element: (
          <ProtectedRoute>
            <DigitalTwinPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'twin',
        element: (
          <ProtectedRoute>
            <DigitalTwinPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'v2g-optimizer',
        element: (
          <ProtectedRoute>
            <V2GOptimizerPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cross-chemistry',
        element: (
          <ProtectedRoute>
            <CrossChemistryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'uncertainty',
        element: (
          <ProtectedRoute>
            <UncertaintyPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'explainability',
        element: (
          <ProtectedRoute>
            <ExplainabilityPage />
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
        path: 'model-comparison',
        element: (
          <ProtectedRoute>
            <ModelComparisonPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'ablation-study',
        element: (
          <ProtectedRoute>
            <AblationStudyPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'research-experiments',
        element: (
          <ProtectedRoute>
            <ResearchExperimentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dataset-manager',
        element: (
          <ProtectedRoute>
            <DatasetManagerPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'early-life',
        element: (
          <ProtectedRoute>
            <EarlyLifePage />
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
        path: 'routine',
        element: (
          <ProtectedRoute>
            <RoutineAnalysisPage />
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
        path: 'showroom',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div className="text-center py-20 text-white">Loading showroom...</div>}>
              <VehicleShowcasePage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'showroom/:category',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div className="text-center py-20 text-white">Loading showroom...</div>}>
              <VehicleShowcasePage />
            </Suspense>
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
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <RouteErrorPage />,
      },
    ],
  },
]);

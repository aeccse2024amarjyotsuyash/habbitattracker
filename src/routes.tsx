import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SleepTrackerPage from './pages/SleepTrackerPage';
import GoalsPage from './pages/GoalsPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Dashboard',
    path: '/',
    element: <DashboardPage />
  },
  {
    name: 'Analytics',
    path: '/analytics',
    element: <AnalyticsPage />
  },
  {
    name: 'Sleep Tracker',
    path: '/sleep',
    element: <SleepTrackerPage />
  },
  {
    name: 'Goals',
    path: '/goals',
    element: <GoalsPage />
  },
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
    visible: false
  }
];

export default routes;

import { Outlet, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import PageTransition from './components/PageTransition.jsx';

export default function App() {
  const location = useLocation();

  return (
    <MainLayout>
      <PageTransition pageKey={location.pathname}>
        <Outlet />
      </PageTransition>
    </MainLayout>
  );
}

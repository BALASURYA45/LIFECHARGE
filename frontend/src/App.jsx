import { Outlet } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';

export default function App() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

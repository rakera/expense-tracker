import { Outlet } from 'react-router-dom';

import { AppLayout } from './app/AppLayout';

export default function App() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

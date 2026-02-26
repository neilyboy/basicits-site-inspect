import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import OnlineStatus from './OnlineStatus';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <OnlineStatus />
      <Outlet />
      <BottomNav />
    </div>
  );
}

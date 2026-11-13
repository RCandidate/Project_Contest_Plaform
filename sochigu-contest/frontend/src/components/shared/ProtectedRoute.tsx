import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

interface Props {
  roles?: string[];
}

export function ProtectedRoute({ roles }: Props) {
  const isAuthenticated = useAuthStore(state => !!state.accessToken && !!state.user);
  const userRole = useAuthStore(state => state.user?.role);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && (!userRole || !roles.includes(userRole))) return <Navigate to="/" replace />;

  return <Outlet />;
}

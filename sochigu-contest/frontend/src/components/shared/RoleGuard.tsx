import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import type { Role } from '@/types';
import { AccessDenied } from './AccessDenied';

interface Props {
  roles: Role[];
  children: ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ roles, children, redirectTo }: Props) {
  const user = useAuthStore(state => state.user);
  if (!user || !roles.includes(user.role)) {
    if (redirectTo) return <Navigate to={redirectTo} replace />;
    return <AccessDenied />;
  }
  return <>{children}</>;
}

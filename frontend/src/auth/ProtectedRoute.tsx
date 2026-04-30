import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { TipoConta } from '../types/auth';
import { isBackoffice } from '../utils/roles';

interface Props {
  children: React.ReactNode;
  allowedRoles?: TipoConta[];
  requireBackoffice?: boolean;
}

export function ProtectedRoute({ children, allowedRoles, requireBackoffice }: Props) {
  const { isAuthenticated, utilizador } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !utilizador) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireBackoffice && !isBackoffice(utilizador.tipoConta)) {
    return <Navigate to="/portal" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(utilizador.tipoConta)) {
    return <Navigate to="/backoffice" replace />;
  }

  return <>{children}</>;
}

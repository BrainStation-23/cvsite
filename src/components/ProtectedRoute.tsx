
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  // New permission-based route protection
  requiredModuleAccess?: string;
  requiredSubModuleAccess?: string;
  requiredPermissionType?: 'create' | 'read' | 'update' | 'delete';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ['admin', 'manager', 'employee'],
  requiredModuleAccess,
  requiredSubModuleAccess,
  requiredPermissionType = 'read'
}) => {
  const { isAuthenticated, user, isLoading, hasModuleAccess, hasSubModulePermission, hasRouteAccess } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cvsite-teal"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check permission-based access first (if specified)
  if (user) {
    // Check route-based access
    if (!hasRouteAccess(location.pathname)) {
      return <Navigate to="/dashboard" replace />;
    }

    // Check module access
    if (requiredModuleAccess && !hasModuleAccess(requiredModuleAccess)) {
      return <Navigate to="/dashboard" replace />;
    }

    // Check sub-module permission
    if (requiredSubModuleAccess && !hasSubModulePermission(requiredSubModuleAccess, requiredPermissionType)) {
      return <Navigate to="/dashboard" replace />;
    }

    // Fallback to role-based access for backward compatibility
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * ProtectedRoute - Componente para proteger rutas que requieren autenticación
 * 
 * Props:
 * - children: Componente hijo a renderizar si está autenticado
 * - roles: Array de roles permitidos (opcional)
 * - permissions: Array de permisos requeridos (opcional)
 * - requireAll: Si es true, requiere TODOS los roles/permisos. Si es false, con uno es suficiente
 */
const ProtectedRoute = ({ 
  children, 
  roles = [], 
  permissions = [], 
  requireAll = false 
}) => {
  const { user, loading, isAuthenticated, hasRole, hasPermission } = useAuth();

  // Mostrar loading mientras se carga la información del usuario
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f7fa'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e0e0e0',
            borderTopColor: '#667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Verificar roles si se especificaron
  if (roles.length > 0) {
    const hasRequiredRoles = requireAll
      ? roles.every(role => hasRole(role))
      : roles.some(role => hasRole(role));

    if (!hasRequiredRoles) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Verificar permisos si se especificaron
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? permissions.every(permission => hasPermission(permission))
      : permissions.some(permission => hasPermission(permission));

    if (!hasRequiredPermissions) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Si pasa todas las verificaciones, renderizar el componente hijo
  return children;
};

export default ProtectedRoute;

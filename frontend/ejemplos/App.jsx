import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import LoginPanel from './LoginPanel';
import Dashboard from './Dashboard';
import Unauthorized from './Unauthorized';

// Componentes de ejemplo para las diferentes secciones
const EspecialidadesPage = () => <div style={{ padding: '40px' }}><h1>Especialidades</h1><p>Contenido de especialidades...</p></div>;
const RadiologiaPage = () => <div style={{ padding: '40px' }}><h1>Radiología</h1><p>Contenido de radiología...</p></div>;
const CitasPage = () => <div style={{ padding: '40px' }}><h1>Gestión de Citas</h1><p>Contenido de citas...</p></div>;
const ReportesPage = () => <div style={{ padding: '40px' }}><h1>Reportes</h1><p>Contenido de reportes...</p></div>;

// Componentes de Administración
const UsuariosAdminPage = () => <div style={{ padding: '40px' }}><h1>Administración de Usuarios</h1><p>Gestión de usuarios...</p></div>;
const RolesAdminPage = () => <div style={{ padding: '40px' }}><h1>Administración de Roles</h1><p>Gestión de roles...</p></div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ruta pública - Login */}
          <Route path="/login" element={<LoginPanel />} />
          
          {/* Ruta de acceso no autorizado */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Dashboard - Requiere autenticación */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Especialidades - Requiere permiso específico */}
          <Route 
            path="/especialidades" 
            element={
              <ProtectedRoute permissions={['ACCESO_APP_ESPECIALIDADES']}>
                <EspecialidadesPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Radiología - Requiere permiso específico */}
          <Route 
            path="/radiologia" 
            element={
              <ProtectedRoute permissions={['ACCESO_APP_RADIOLOGIA']}>
                <RadiologiaPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Gestión de Citas - Requiere permiso específico */}
          <Route 
            path="/citas" 
            element={
              <ProtectedRoute permissions={['ACCESO_APP_GESTION_CITAS']}>
                <CitasPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Reportes - Requiere permiso específico */}
          <Route 
            path="/reportes" 
            element={
              <ProtectedRoute permissions={['VER_REPORTES']}>
                <ReportesPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Administración de Usuarios - Solo SUPERADMIN y ADMIN */}
          <Route 
            path="/admin/usuarios" 
            element={
              <ProtectedRoute roles={['SUPERADMIN', 'ADMIN']}>
                <UsuariosAdminPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Administración de Roles - Solo SUPERADMIN y ADMIN */}
          <Route 
            path="/admin/roles" 
            element={
              <ProtectedRoute roles={['SUPERADMIN', 'ADMIN']}>
                <RolesAdminPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Ruta raíz - Redirige al dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Ruta 404 - No encontrada */}
          <Route path="*" element={
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '100vh',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <h1>404 - Página no encontrada</h1>
              <a href="/dashboard" style={{
                padding: '10px 20px',
                background: '#667eea',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px'
              }}>Volver al Dashboard</a>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

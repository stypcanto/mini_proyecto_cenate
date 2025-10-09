import React, { useEffect, useState } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener información del usuario desde localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Si no hay usuario, redirigir al login
      window.location.href = '/login';
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const hasPermission = (permission) => {
    return user?.permisos?.includes(permission) || false;
  };

  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>CENATE</h1>
          <span className="header-subtitle">Sistema de Telemedicina</span>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">{user.username}</span>
            <div className="user-roles">
              {user.roles.map(role => (
                <span key={role} className={`role-badge role-${role.toLowerCase()}`}>
                  {role}
                </span>
              ))}
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        <aside className="sidebar">
          <h3>Aplicaciones</h3>
          <nav className="sidebar-nav">
            {/* Especialidades */}
            {hasPermission('ACCESO_APP_ESPECIALIDADES') && (
              <a href="/especialidades" className="nav-item">
                <span className="nav-icon">🩺</span>
                <span>Especialidades</span>
              </a>
            )}

            {/* Radiología */}
            {hasPermission('ACCESO_APP_RADIOLOGIA') && (
              <a href="/radiologia" className="nav-item">
                <span className="nav-icon">🔬</span>
                <span>Radiología</span>
              </a>
            )}

            {/* Teleurgencias */}
            {hasPermission('ACCESO_APP_TELEURGENCIAS') && (
              <a href="/teleurgencias" className="nav-item">
                <span className="nav-icon">🚑</span>
                <span>Teleurgencias</span>
              </a>
            )}

            {/* Gestión de Citas */}
            {hasPermission('ACCESO_APP_GESTION_CITAS') && (
              <a href="/citas" className="nav-item">
                <span className="nav-icon">📅</span>
                <span>Gestión de Citas</span>
              </a>
            )}

            {/* Calidad */}
            {hasPermission('ACCESO_APP_CALIDAD') && (
              <a href="/calidad" className="nav-item">
                <span className="nav-icon">⭐</span>
                <span>Calidad</span>
              </a>
            )}

            {/* Gestión TI */}
            {hasPermission('ACCESO_GESTION_TI') && (
              <a href="/ti" className="nav-item">
                <span className="nav-icon">💻</span>
                <span>Gestión TI</span>
              </a>
            )}
          </nav>

          {/* Administración */}
          {(hasRole('SUPERADMIN') || hasRole('ADMIN')) && (
            <>
              <h3>Administración</h3>
              <nav className="sidebar-nav">
                {hasPermission('GESTIONAR_USUARIOS') && (
                  <a href="/admin/usuarios" className="nav-item">
                    <span className="nav-icon">👥</span>
                    <span>Usuarios</span>
                  </a>
                )}

                {hasPermission('GESTIONAR_ROLES') && (
                  <a href="/admin/roles" className="nav-item">
                    <span className="nav-icon">🔐</span>
                    <span>Roles</span>
                  </a>
                )}

                {hasPermission('VER_AUDITORIA') && (
                  <a href="/admin/auditoria" className="nav-item">
                    <span className="nav-icon">📋</span>
                    <span>Auditoría</span>
                  </a>
                )}
              </nav>
            </>
          )}

          {/* Reportes */}
          {hasPermission('VER_REPORTES') && (
            <>
              <h3>Reportes</h3>
              <nav className="sidebar-nav">
                <a href="/reportes" className="nav-item">
                  <span className="nav-icon">📊</span>
                  <span>Ver Reportes</span>
                </a>

                {hasPermission('GENERAR_REPORTES') && (
                  <a href="/reportes/generar" className="nav-item">
                    <span className="nav-icon">📈</span>
                    <span>Generar Reportes</span>
                  </a>
                )}

                {hasPermission('EXPORTAR_DATOS') && (
                  <a href="/reportes/exportar" className="nav-item">
                    <span className="nav-icon">💾</span>
                    <span>Exportar Datos</span>
                  </a>
                )}
              </nav>
            </>
          )}
        </aside>

        {/* Main Panel */}
        <main className="main-content">
          <div className="welcome-section">
            <h2>Bienvenido, {user.username}!</h2>
            <p>Selecciona una aplicación del menú lateral para comenzar</p>
          </div>

          {/* Cards de Acceso Rápido */}
          <div className="quick-access">
            <h3>Acceso Rápido</h3>
            <div className="cards-grid">
              {hasPermission('ACCESO_APP_ESPECIALIDADES') && (
                <div className="card">
                  <div className="card-icon">🩺</div>
                  <h4>Especialidades</h4>
                  <p>Consultas médicas especializadas</p>
                  <a href="/especialidades" className="card-link">Ir →</a>
                </div>
              )}

              {hasPermission('ACCESO_APP_RADIOLOGIA') && (
                <div className="card">
                  <div className="card-icon">🔬</div>
                  <h4>Radiología</h4>
                  <p>Interpretación de estudios radiológicos</p>
                  <a href="/radiologia" className="card-link">Ir →</a>
                </div>
              )}

              {hasPermission('ACCESO_APP_GESTION_CITAS') && (
                <div className="card">
                  <div className="card-icon">📅</div>
                  <h4>Citas</h4>
                  <p>Gestión y programación de citas</p>
                  <a href="/citas" className="card-link">Ir →</a>
                </div>
              )}

              {hasPermission('VER_REPORTES') && (
                <div className="card">
                  <div className="card-icon">📊</div>
                  <h4>Reportes</h4>
                  <p>Visualización de reportes y estadísticas</p>
                  <a href="/reportes" className="card-link">Ir →</a>
                </div>
              )}
            </div>
          </div>

          {/* Info de Permisos (solo para debug, remover en producción) */}
          {hasRole('SUPERADMIN') && (
            <div className="debug-info">
              <h3>Debug Info (Solo SUPERADMIN)</h3>
              <div className="debug-section">
                <h4>Roles:</h4>
                <ul>
                  {user.roles.map(role => (
                    <li key={role}>{role}</li>
                  ))}
                </ul>
              </div>
              <div className="debug-section">
                <h4>Permisos ({user.permisos.length}):</h4>
                <ul>
                  {user.permisos.map(permiso => (
                    <li key={permiso}>{permiso}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

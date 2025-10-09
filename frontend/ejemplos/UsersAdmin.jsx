import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import './UsersAdmin.css';

const UsersAdmin = () => {
  const { authenticatedFetch, hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    roleIds: [],
    estado: 'ACTIVO'
  });

  // Roles disponibles (en una app real, esto vendría del backend)
  const availableRoles = [
    { id: 1, name: 'SUPERADMIN' },
    { id: 2, name: 'ADMIN' },
    { id: 3, name: 'ESPECIALISTA' },
    { id: 4, name: 'RADIOLOGO' },
    { id: 5, name: 'USUARIO' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await authenticatedFetch('http://localhost:8080/api/usuarios');
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError('Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await authenticatedFetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        alert('Usuario creado exitosamente');
        setShowCreateModal(false);
        setNewUser({ username: '', password: '', roleIds: [], estado: 'ACTIVO' });
        fetchUsers();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al crear usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al crear usuario');
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      const response = await authenticatedFetch(
        `http://localhost:8080/api/usuarios/${userId}/activate`,
        { method: 'PUT' }
      );

      if (response.ok) {
        alert('Usuario activado exitosamente');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al activar usuario');
    }
  };

  const handleDeactivateUser = async (userId) => {
    try {
      const response = await authenticatedFetch(
        `http://localhost:8080/api/usuarios/${userId}/deactivate`,
        { method: 'PUT' }
      );

      if (response.ok) {
        alert('Usuario desactivado exitosamente');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al desactivar usuario');
    }
  };

  const handleUnlockUser = async (userId) => {
    try {
      const response = await authenticatedFetch(
        `http://localhost:8080/api/usuarios/${userId}/unlock`,
        { method: 'PUT' }
      );

      if (response.ok) {
        alert('Usuario desbloqueado exitosamente');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al desbloquear usuario');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!hasRole('SUPERADMIN')) {
      alert('Solo SUPERADMIN puede eliminar usuarios');
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar el usuario ${username}?`)) {
      try {
        const response = await authenticatedFetch(
          `http://localhost:8080/api/usuarios/${userId}`,
          { method: 'DELETE' }
        );

        if (response.ok) {
          alert('Usuario eliminado exitosamente');
          fetchUsers();
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar usuario');
      }
    }
  };

  const handleRoleChange = (roleId) => {
    setNewUser(prev => {
      const roleIds = prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId];
      return { ...prev, roleIds };
    });
  };

  if (loading) {
    return (
      <div className="users-admin-loading">
        <div className="spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="users-admin-container">
      <div className="users-admin-header">
        <h1>Gestión de Usuarios</h1>
        <button 
          className="btn-create" 
          onClick={() => setShowCreateModal(true)}
        >
          + Crear Usuario
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="users-stats">
        <div className="stat-card">
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Total Usuarios</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {users.filter(u => u.estado === 'ACTIVO').length}
          </div>
          <div className="stat-label">Activos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {users.filter(u => u.isLocked).length}
          </div>
          <div className="stat-label">Bloqueados</div>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Roles</th>
              <th>Estado</th>
              <th>Último Login</th>
              <th>Intentos Fallidos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.idUser}>
                <td>{user.idUser}</td>
                <td className="user-cell">
                  <div className="user-name">{user.username}</div>
                </td>
                <td>
                  <div className="roles-cell">
                    {user.roles.map(role => (
                      <span 
                        key={role} 
                        className={`role-badge role-${role.toLowerCase()}`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <span className={`status-badge status-${user.estado.toLowerCase()}`}>
                    {user.estado}
                  </span>
                  {user.isLocked && (
                    <span className="status-badge status-bloqueado">
                      🔒 BLOQUEADO
                    </span>
                  )}
                </td>
                <td>
                  {user.lastLoginAt 
                    ? new Date(user.lastLoginAt).toLocaleString('es-PE')
                    : 'Nunca'
                  }
                </td>
                <td>
                  <span className={user.failedAttempts > 3 ? 'text-danger' : ''}>
                    {user.failedAttempts}
                  </span>
                </td>
                <td>
                  <div className="actions-cell">
                    {user.estado === 'ACTIVO' ? (
                      <button
                        className="btn-action btn-warning"
                        onClick={() => handleDeactivateUser(user.idUser)}
                        title="Desactivar"
                      >
                        ⏸️
                      </button>
                    ) : (
                      <button
                        className="btn-action btn-success"
                        onClick={() => handleActivateUser(user.idUser)}
                        title="Activar"
                      >
                        ▶️
                      </button>
                    )}
                    
                    {user.isLocked && (
                      <button
                        className="btn-action btn-info"
                        onClick={() => handleUnlockUser(user.idUser)}
                        title="Desbloquear"
                      >
                        🔓
                      </button>
                    )}
                    
                    {hasRole('SUPERADMIN') && (
                      <button
                        className="btn-action btn-danger"
                        onClick={() => handleDeleteUser(user.idUser, user.username)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Crear Usuario */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Nuevo Usuario</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="modal-form">
              <div className="form-group">
                <label>Usuario *</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                  required
                  placeholder="Ingrese el nombre de usuario"
                />
              </div>

              <div className="form-group">
                <label>Contraseña *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  required
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label>Roles * (selecciona al menos uno)</label>
                <div className="roles-checkboxes">
                  {availableRoles.map(role => (
                    <label key={role.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newUser.roleIds.includes(role.id)}
                        onChange={() => handleRoleChange(role.id)}
                      />
                      <span>{role.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Estado</label>
                <select
                  value={newUser.estado}
                  onChange={e => setNewUser({...newUser, estado: e.target.value})}
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                </select>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={newUser.roleIds.length === 0}
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersAdmin;

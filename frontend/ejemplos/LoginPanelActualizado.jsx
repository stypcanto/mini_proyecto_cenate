import React, { useState } from 'react';
import './LoginPanel.css';

const LoginPanel = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Guardar token y datos del usuario en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          userId: data.userId,
          username: data.username,
          roles: data.roles,
          permisos: data.permisos
        }));

        // Redirigir al dashboard o página principal
        window.location.href = '/dashboard';
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="login-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" fill="#667eea"/>
              <path d="M6 21C6 17.686 8.686 15 12 15C15.314 15 18 17.686 18 21" stroke="#667eea" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1>Iniciar Sesión</h1>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Código de Usuario</label>
            <div className="input-with-icon">
              <span className="input-icon">👤</span>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingrese su código de usuario"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>
            <small className="input-hint">Ejemplo: superadmin, ADMIN001, etc.</small>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Iniciando sesión...
              </>
            ) : (
              <>
                <span>→</span>
                Iniciar sesión
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <a href="/recuperar">¿Olvidaste tu contraseña?</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPanel;

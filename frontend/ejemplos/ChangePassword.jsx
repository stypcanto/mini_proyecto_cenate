import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './ChangePassword.css';

const ChangePassword = () => {
  const { authenticatedFetch } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: ''
  });

  const checkPasswordStrength = (password) => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const strength = {
      0: { label: 'Muy débil', color: '#ff4444' },
      1: { label: 'Débil', color: '#ff8800' },
      2: { label: 'Débil', color: '#ff8800' },
      3: { label: 'Media', color: '#ffbb33' },
      4: { label: 'Buena', color: '#00C851' },
      5: { label: 'Fuerte', color: '#007E33' },
      6: { label: 'Muy fuerte', color: '#004D00' }
    };

    return {
      score: Math.min(score, 6),
      label: strength[Math.min(score, 6)].label,
      color: strength[Math.min(score, 6)].color
    };
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, newPassword });
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validaciones en frontend
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      setLoading(false);
      return;
    }

    try {
      const response = await authenticatedFetch('http://localhost:8080/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordStrength({ score: 0, label: '', color: '' });
        
        // Opcional: Cerrar sesión después de cambiar contraseña
        setTimeout(() => {
          if (window.confirm('Contraseña actualizada. ¿Desea cerrar sesión?')) {
            window.location.href = '/login';
          }
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al cambiar contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-box">
        <div className="change-password-header">
          <h2>Cambiar Contraseña</h2>
          <p>Asegúrate de usar una contraseña segura</p>
        </div>

        {success && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            <span>¡Contraseña actualizada exitosamente!</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Contraseña Actual *</label>
            <input
              type="password"
              id="currentPassword"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              required
              disabled={loading}
              placeholder="Ingrese su contraseña actual"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">Nueva Contraseña *</label>
            <input
              type="password"
              id="newPassword"
              value={formData.newPassword}
              onChange={handlePasswordChange}
              required
              disabled={loading}
              placeholder="Mínimo 8 caracteres"
              minLength={8}
            />
            
            {formData.newPassword && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill"
                    style={{
                      width: `${(passwordStrength.score / 6) * 100}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  ></div>
                </div>
                <span 
                  className="strength-label"
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.label}
                </span>
              </div>
            )}

            <div className="password-requirements">
              <p>La contraseña debe contener:</p>
              <ul>
                <li className={formData.newPassword.length >= 8 ? 'met' : ''}>
                  {formData.newPassword.length >= 8 ? '✓' : '○'} Al menos 8 caracteres
                </li>
                <li className={/[A-Z]/.test(formData.newPassword) ? 'met' : ''}>
                  {/[A-Z]/.test(formData.newPassword) ? '✓' : '○'} Una letra mayúscula
                </li>
                <li className={/[a-z]/.test(formData.newPassword) ? 'met' : ''}>
                  {/[a-z]/.test(formData.newPassword) ? '✓' : '○'} Una letra minúscula
                </li>
                <li className={/[0-9]/.test(formData.newPassword) ? 'met' : ''}>
                  {/[0-9]/.test(formData.newPassword) ? '✓' : '○'} Un número
                </li>
                <li className={/[^a-zA-Z0-9]/.test(formData.newPassword) ? 'met' : ''}>
                  {/[^a-zA-Z0-9]/.test(formData.newPassword) ? '✓' : '○'} Un carácter especial
                </li>
              </ul>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Nueva Contraseña *</label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              disabled={loading}
              placeholder="Repita la nueva contraseña"
            />
            
            {formData.confirmPassword && (
              <div className="password-match">
                {formData.newPassword === formData.confirmPassword ? (
                  <span className="match-success">✓ Las contraseñas coinciden</span>
                ) : (
                  <span className="match-error">✗ Las contraseñas no coinciden</span>
                )}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => window.history.back()}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
            >
              {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>

        <div className="security-tips">
          <h3>💡 Consejos de Seguridad</h3>
          <ul>
            <li>No uses información personal (nombre, fecha de nacimiento, etc.)</li>
            <li>No reutilices contraseñas de otras cuentas</li>
            <li>Cambia tu contraseña regularmente</li>
            <li>No compartas tu contraseña con nadie</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;

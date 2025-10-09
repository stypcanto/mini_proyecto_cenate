import React from 'react';
import { Link } from 'react-router-dom';
import './Unauthorized.css';

const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <div className="unauthorized-icon">🚫</div>
        <h1>Acceso Denegado</h1>
        <p>No tienes permisos para acceder a esta página.</p>
        <p className="unauthorized-subtitle">
          Si crees que esto es un error, contacta con el administrador del sistema.
        </p>
        <div className="unauthorized-actions">
          <Link to="/dashboard" className="btn-primary">
            Ir al Dashboard
          </Link>
          <Link to="/login" className="btn-secondary">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;

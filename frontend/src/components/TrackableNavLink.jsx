// ============================================================================
// TrackableNavLink.jsx - NavLink con tracking automático de accesos
// ============================================================================

import React from 'react';
import { NavLink } from 'react-router-dom';
import usePageTracker from '../hooks/usePageTracker';

/**
 * Componente NavLink que automáticamente rastrear accesos a páginas
 * 
 * Uso:
 * <TrackableNavLink 
 *   to="/roles/coordinador/configuracion-feriados"
 *   idPagina={123}
 *   nombrePagina="Configuración de Feriados"
 *   className="..."
 * >
 *   Icono + Texto
 * </TrackableNavLink>
 */
const TrackableNavLink = ({
  to,
  idPagina,
  nombrePagina,
  tipoAcceso = 'CLICK_MENU',
  children,
  className,
  onClick,
  ...props
}) => {
  const { trackPageAccess } = usePageTracker();

  const handleClick = async (e) => {
    // Rastrear el acceso
    if (idPagina && nombrePagina) {
      await trackPageAccess(idPagina, nombrePagina, tipoAcceso);
    }

    // Ejecutar el onClick original si existe
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <NavLink
      to={to}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </NavLink>
  );
};

export default TrackableNavLink;

// ============================================================================
// usePageTracker.js - Hook para rastrear accesos a páginas
// ============================================================================

import axios from 'axios';

/**
 * Hook para registrar accesos a páginas de usuarios
 * Uso: const { trackPageAccess } = usePageTracker();
 *      trackPageAccess(123, 'Nombre de Página', 'CLICK_MENU');
 */
export const usePageTracker = () => {
  const trackPageAccess = async (
    idPagina,
    nombrePagina,
    tipoAcceso = 'CLICK_MENU'
  ) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth.token');
      
      if (!token) {
        console.warn('No token available for page tracking');
        return;
      }

      const payload = {
        idPagina,
        nombrePagina,
        tipoAcceso
      };

      await axios.post('/api/historial-accesos/acceso-paginas', payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`📍 Acceso rastreado: ${nombrePagina}`);
    } catch (err) {
      // No queremos que los errores de tracking rompan la navegación
      console.warn('Error tracking page access:', err.message);
    }
  };

  return { trackPageAccess };
};

export default usePageTracker;

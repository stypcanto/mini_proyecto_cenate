import { useState, useEffect } from 'react';

/**
 * Hook para detectar estado de conexión en tiempo real
 * Retorna true si está conectado, false si está offline
 *
 * Uso:
 * const isOnline = useOnlineStatus();
 * {isOnline ? "Conectado" : "Sin conexión"}
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export default useOnlineStatus;

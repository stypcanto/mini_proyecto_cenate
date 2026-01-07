import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import apiClient from '../lib/apiClient';
import { useNavigate } from 'react-router-dom';

/**
 * 🔔 Componente de Campanita de Notificaciones
 *
 * Muestra un indicador visual cuando hay usuarios pendientes de asignar rol específico.
 * Solo visible para administradores.
 */
const NotificationBell = () => {
  const [pendientes, setPendientes] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Consultar cantidad de usuarios pendientes cada 30 segundos
  useEffect(() => {
    consultarPendientes();

    const intervalo = setInterval(() => {
      consultarPendientes();
    }, 30000); // 30 segundos

    return () => clearInterval(intervalo);
  }, []);

  const consultarPendientes = async () => {
    try {
      const response = await apiClient.get('/api/usuarios/pendientes-rol', false, { timeoutMs: 10000 });
      if (response?.pendientes !== undefined) {
        setPendientes(response.pendientes);
      }
    } catch (error) {
      console.error('❌ Error al consultar usuarios pendientes:', error);
    }
  };

  const handleBellClick = async () => {
    if (pendientes === 0) return;

    setShowDropdown(!showDropdown);

    if (!showDropdown && usuarios.length === 0) {
      // Cargar lista de usuarios al abrir el dropdown
      setLoading(true);
      try {
        const response = await apiClient.get('/api/usuarios/pendientes-rol/lista', false, { timeoutMs: 10000 });
        if (Array.isArray(response)) {
          setUsuarios(response);
        }
      } catch (error) {
        console.error('❌ Error al cargar lista de usuarios:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerTodos = () => {
    setShowDropdown(false);
    navigate('/admin/usuarios-pendientes-rol');
  };

  // Si no hay pendientes, no mostrar la campanita
  if (pendientes === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Campanita con Badge */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
        title={`${pendientes} usuario${pendientes > 1 ? 's' : ''} pendiente${pendientes > 1 ? 's' : ''} de asignar rol`}
      >
        <Bell size={24} />

        {/* Badge con número de pendientes */}
        {pendientes > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {pendientes > 99 ? '99+' : pendientes}
          </span>
        )}
      </button>

      {/* Dropdown con lista de usuarios */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              Usuarios Pendientes de Asignar Rol
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {pendientes} usuario{pendientes > 1 ? 's' : ''} con rol básico
            </p>
          </div>

          {/* Lista de usuarios */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm">Cargando...</p>
              </div>
            ) : usuarios.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {usuarios.slice(0, 5).map((usuario) => (
                  <div
                    key={usuario.idUser}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    onClick={handleVerTodos}
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {usuario.nombreCompleto || 'Sin nombre'}
                    </p>
                    <p className="text-xs text-gray-500">
                      DNI: {usuario.username}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        {usuario.roles && usuario.roles.length > 0
                          ? usuario.roles[0]
                          : 'Sin rol'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {usuario.ipress || 'Sin IPRESS'}
                      </span>
                    </div>
                  </div>
                ))}

                {usuarios.length > 5 && (
                  <div className="px-4 py-2 text-xs text-gray-500 text-center">
                    ... y {usuarios.length - 5} más
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <p className="text-sm">No hay usuarios pendientes</p>
              </div>
            )}
          </div>

          {/* Footer con botón "Ver Todos" */}
          {usuarios.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <button
                onClick={handleVerTodos}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Ver Todos ({pendientes})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cerrar dropdown al hacer click fuera */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </div>
  );
};

export default NotificationBell;

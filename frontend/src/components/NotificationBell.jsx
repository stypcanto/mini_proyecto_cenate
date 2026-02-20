import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import apiClient from '../lib/apiClient';
import gestionPacientesService from '../services/gestionPacientesService';
import { useNavigate } from 'react-router-dom';

/**
 * 🔔 Componente de Campanita de Notificaciones
 *
 * ⭐ v1.62.0: Expandido para mostrar:
 * - Usuarios pendientes de asignar rol (ADMIN/SUPERADMIN)
 * - Pacientes pendientes de atender (MEDICO)
 *
 * Polling cada 60 segundos para pacientes, 30 segundos para usuarios
 */
const NotificationBell = () => {
  const [pendientes, setPendientes] = useState(0);
  const [pendientesPacientes, setPendientesPacientes] = useState(0);
  const [esMedico, setEsMedico] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ⭐ v1.62.0: Detectar si el usuario es médico
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const roles = user.roles || [];
      const isMedico = roles.some(r =>
        r.toUpperCase() === 'MEDICO' || r.toUpperCase() === 'MÉDICO'
      );
      setEsMedico(isMedico);
    } catch (error) {
      console.warn('No se pudo detectar el rol del usuario');
    }
  }, []);

  // Consultar cantidad de notificaciones (usuarios + pacientes)
  useEffect(() => {
    consultarPendientes();

    const intervalo = setInterval(() => {
      consultarPendientes();
    }, 60000); // ⭐ v1.62.0: 1 minuto (60,000 ms) para polling

    return () => clearInterval(intervalo);
  }, [esMedico]);

  const consultarPendientes = async () => {
    try {
      // Consultar usuarios pendientes de rol (ADMIN/SUPERADMIN)
      const responseUsuarios = await apiClient.get(
        '/api/usuarios/pendientes-rol',
        false,
        { timeoutMs: 10000 }
      );
      if (responseUsuarios?.pendientes !== undefined) {
        setPendientes(responseUsuarios.pendientes);
      }

      // ⭐ v1.62.0: Consultar pacientes pendientes (MEDICO)
      if (esMedico) {
        try {
          const responsePacientes = await gestionPacientesService.obtenerContadorPendientes();
          setPendientesPacientes(responsePacientes || 0);
        } catch (error) {
          console.warn('⚠️ Error al consultar pacientes pendientes:', error);
          setPendientesPacientes(0);
        }
      }
    } catch (error) {
      console.error('❌ Error al consultar notificaciones:', error);
    }
  };

  const handleBellClick = async () => {
    // ⭐ v1.62.0: Mostrar dropdown si hay cualquier tipo de notificación
    const totalNotificaciones = pendientes + pendientesPacientes;
    if (totalNotificaciones === 0) return;

    setShowDropdown(!showDropdown);

    if (!showDropdown && usuarios.length === 0 && pacientes.length === 0) {
      // Cargar listas al abrir el dropdown
      setLoading(true);
      try {
        // Cargar usuarios pendientes (solo si hay)
        if (pendientes > 0) {
          try {
            const responseUsuarios = await apiClient.get(
              '/api/usuarios/pendientes-rol/lista',
              false,
              { timeoutMs: 10000 }
            );
            if (Array.isArray(responseUsuarios)) {
              setUsuarios(responseUsuarios);
            }
          } catch (error) {
            console.error('❌ Error al cargar usuarios:', error);
          }
        }

        // ⭐ v1.62.0: Cargar pacientes pendientes (solo si es médico)
        if (esMedico && pendientesPacientes > 0) {
          try {
            const responsePacientes = await gestionPacientesService.obtenerPacientesMedico();
            if (Array.isArray(responsePacientes)) {
              // Filtrar solo los pacientes con estado "Pendiente"
              const soloPendientes = responsePacientes.filter(p =>
                p.condicion === 'Pendiente'
              );
              setPacientes(soloPendientes);
            }
          } catch (error) {
            console.error('❌ Error al cargar pacientes:', error);
          }
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerTodos = () => {
    setShowDropdown(false);
    navigate('/admin/usuarios-pendientes-rol');
  };

  // ⭐ v1.62.0: Calcular total de notificaciones
  const totalNotificaciones = pendientes + pendientesPacientes;

  // Si no hay notificaciones, no mostrar la campanita
  if (totalNotificaciones === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Campanita con Badge */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
        title={`${totalNotificaciones} notificación${totalNotificaciones > 1 ? 'es' : ''}`}
      >
        <Bell size={24} />

        {/* Badge con número total de notificaciones */}
        {totalNotificaciones > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {totalNotificaciones > 99 ? '99+' : totalNotificaciones}
          </span>
        )}
      </button>

      {/* Dropdown con lista de notificaciones */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              Notificaciones
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {pendientes > 0 && `${pendientes} usuario${pendientes > 1 ? 's' : ''} con rol básico`}
              {pendientes > 0 && pendientesPacientes > 0 && ' • '}
              {pendientesPacientes > 0 && `${pendientesPacientes} paciente${pendientesPacientes > 1 ? 's' : ''} pendiente${pendientesPacientes > 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm">Cargando...</p>
              </div>
            ) : (
              <>
                {/* Sección de Usuarios Pendientes */}
                {usuarios.length > 0 && (
                  <div>
                    <div className="px-4 py-3 bg-yellow-50 border-b border-gray-200">
                      <h4 className="text-xs font-semibold text-yellow-900 uppercase">
                        👤 Usuarios por Asignar Rol
                      </h4>
                    </div>
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
                  </div>
                )}

                {/* Sección de Pacientes Pendientes (solo para médicos) */}
                {esMedico && pendientesPacientes > 0 && (
                  <>
                    {usuarios.length > 0 && <div className="border-t-2 border-gray-200"></div>}

                    <div className="px-4 py-3 bg-blue-50 border-b border-gray-200">
                      <h4 className="text-xs font-semibold text-blue-900 uppercase">
                        👨‍⚕️ Mis Pacientes Pendientes
                      </h4>
                    </div>

                    <div
                      className="px-4 py-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                      onClick={() => {
                        setShowDropdown(false);
                        navigate('/roles/profesionaldesalud/pacientes');
                      }}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {pendientesPacientes} paciente{pendientesPacientes > 1 ? 's' : ''} esperando atención
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Haz clic para ver tus pacientes pendientes
                        </p>
                      </div>
                      <div className="bg-amber-500 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
                        {pendientesPacientes}
                      </div>
                    </div>
                  </>
                )}

                {/* Sin notificaciones */}
                {usuarios.length === 0 && pendientesPacientes === 0 && (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <p className="text-sm">No hay notificaciones</p>
                  </div>
                )}
              </>
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

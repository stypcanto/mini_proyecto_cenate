import React, { useState, useEffect } from 'react';
import { AlertCircle, UserCog, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import apiClient from '../../../../../lib/apiClient';
import { useNavigate } from 'react-router-dom';

/**
 * 👥 Panel de Gestión de Usuarios Pendientes de Asignar Rol
 *
 * Permite a los administradores ver y gestionar usuarios que solo tienen rol básico
 * (USER o INSTITUCION_EX) y necesitan asignación de rol específico.
 */
const UsuariosPendientesRol = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/api/usuarios/pendientes-rol/lista', false, { timeoutMs: 15000 });
      if (Array.isArray(response)) {
        setUsuarios(response);
      } else {
        console.error('❌ Respuesta inesperada del servidor:', response);
        setError('Error al cargar usuarios');
      }
    } catch (error) {
      console.error('❌ Error al cargar usuarios pendientes:', error);
      setError('No se pudo cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleAsignarRol = (usuario) => {
    // Navegar a la página de edición del usuario
    // Asumiendo que hay una ruta de edición de usuario
    navigate(`/admin/users`); // Ajustar según la ruta real
  };

  const getRolBadgeColor = (rol) => {
    if (rol === 'USER') return 'bg-blue-100 text-blue-800';
    if (rol === 'INSTITUCION_EX') return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios pendientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Usuarios Pendientes de Asignar Rol
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Usuarios con rol básico que necesitan asignación de rol específico
              </p>
            </div>
            <button
              onClick={cargarUsuarios}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw size={16} className="mr-2" />
              Actualizar
            </button>
          </div>
        </div>

        {/* Alert de Error */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contador de Usuarios */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <UserCog className="h-12 w-12 text-yellow-500" />
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-900">{usuarios.length}</h2>
              <p className="text-sm text-gray-600">
                Usuario{usuarios.length !== 1 ? 's' : ''} pendiente{usuarios.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Usuarios */}
        {usuarios.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              ¡Todo al día!
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              No hay usuarios pendientes de asignar rol específico
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DNI
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol Actual
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IPRESS
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                  <tr key={usuario.idUser} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {usuario.nombreCompleto?.charAt(0) || 'U'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {usuario.nombreCompleto || 'Sin nombre'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {usuario.correoPersonal || usuario.correoCorporativo || 'Sin correo'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usuario.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRolBadgeColor(usuario.roles && usuario.roles.length > 0 ? usuario.roles[0] : 'N/A')}`}>
                        {usuario.roles && usuario.roles.length > 0 ? usuario.roles[0] : 'Sin rol'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {usuario.ipress || 'Sin IPRESS'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleAsignarRol(usuario)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <UserCog size={14} className="mr-1.5" />
                        Asignar Rol
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-blue-400" />
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> Los usuarios listados aquí solo tienen el rol básico asignado automáticamente al aprobar su solicitud de registro.
                Se recomienda asignarles un rol específico según su función (MEDICO, ENFERMERIA, COORD. ESPECIALIDADES, etc.).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsuariosPendientesRol;

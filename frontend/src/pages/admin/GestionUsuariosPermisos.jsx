// ========================================================================
// 👥 GestionUsuariosPermisos.jsx – Panel de Administración MBAC CENATE
// ------------------------------------------------------------------------
// Panel completo de gestión de usuarios y permisos
// Solo accesible para SUPERADMIN
// ========================================================================

import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Lock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { permisosService } from '../../services/permisosService';

export default function GestionUsuariosPermisos() {
  const { user: usuarioActual } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [permisosUsuario, setPermisosUsuario] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vistaActual, setVistaActual] = useState('lista');
  const [filtro, setFiltro] = useState('');
  const [filtroRol, setFiltroRol] = useState('TODOS');

  // Verificar que sea SUPERADMIN
  const rolesActual = (usuarioActual?.roles || []).map(r => 
    typeof r === 'string' ? r.replace('ROLE_', '').toUpperCase() : 
    r?.authority?.replace('ROLE_', '').toUpperCase()
  );
  const esSuperAdmin = rolesActual.includes('SUPERADMIN');

  useEffect(() => {
    if (esSuperAdmin) {
      cargarUsuarios();
    }
  }, [esSuperAdmin]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await permisosService.obtenerUsuarios();
      setUsuarios(data);
      toast.success(`${data.length} usuarios cargados`);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const cargarPermisosUsuario = async (username) => {
    try {
      setLoading(true);
      const permisos = await permisosService.obtenerPermisosUsuario(username);
      setPermisosUsuario(permisos);
    } catch (error) {
      console.error('Error al cargar permisos:', error);
      toast.error('Error al cargar permisos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const verDetalleUsuario = async (usuario) => {
    setUsuarioSeleccionado(usuario);
    await cargarPermisosUsuario(usuario.username);
    setVistaActual('detalle');
  };

  const volverALista = () => {
    setVistaActual('lista');
    setUsuarioSeleccionado(null);
    setPermisosUsuario([]);
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const coincideBusqueda = 
      u.username?.toLowerCase().includes(filtro.toLowerCase()) ||
      u.nombreCompleto?.toLowerCase().includes(filtro.toLowerCase()) ||
      u.correoCorporativo?.toLowerCase().includes(filtro.toLowerCase());

    const rolesUsuario = (u.roles || []).map(r => 
      typeof r === 'string' ? r.replace('ROLE_', '').toUpperCase() : 
      r?.authority?.replace('ROLE_', '').toUpperCase()
    );

    const coincideRol = 
      filtroRol === 'TODOS' || 
      rolesUsuario.includes(filtroRol);

    return coincideBusqueda && coincideRol;
  });

  const rolesUnicos = Array.from(
    new Set(
      usuarios.flatMap(u => 
        (u.roles || []).map(r => 
          typeof r === 'string' ? r.replace('ROLE_', '').toUpperCase() : 
          r?.authority?.replace('ROLE_', '').toUpperCase()
        )
      )
    )
  );

  if (!esSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] p-6">
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Acceso Denegado
          </h2>
          <p className="text-[var(--text-secondary)]">
            Solo los SUPERADMIN pueden acceder a esta sección
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                <Shield className="w-8 h-8 text-[var(--color-primary)]" />
                Gestión de Usuarios y Permisos
              </h1>
              <p className="text-[var(--text-secondary)] mt-2">
                Panel de administración MBAC - Control total de accesos
              </p>
            </div>
            <button
              onClick={cargarUsuarios}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white 
                       rounded-xl hover:brightness-110 transition-all disabled:opacity-50 
                       disabled:cursor-not-allowed font-medium"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>

        {vistaActual === 'lista' ? (
          <>
            {/* Barra de búsqueda */}
            <div className="bg-[var(--bg-card)] rounded-2xl shadow-lg p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 
                                   text-[var(--text-secondary)] w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por usuario, nombre o email..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[var(--bg-main)] border-2 
                             border-[var(--border-color)] rounded-xl 
                             focus:border-[var(--color-primary)] outline-none
                             text-[var(--text-primary)] transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="text-[var(--text-secondary)] w-5 h-5" />
                  <select
                    value={filtroRol}
                    onChange={(e) => setFiltroRol(e.target.value)}
                    className="px-4 py-2 bg-[var(--bg-main)] border-2 border-[var(--border-color)] 
                             rounded-xl focus:border-[var(--color-primary)] outline-none
                             text-[var(--text-primary)] cursor-pointer"
                  >
                    <option value="TODOS">Todos los Roles</option>
                    {rolesUnicos.map(rol => (
                      <option key={rol} value={rol}>{rol}</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={() => toast('Funcionalidad en desarrollo', { icon: '🚧' })}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white 
                           rounded-xl hover:bg-green-700 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Nuevo Usuario
                </button>
              </div>
            </div>

            {/* Tabla de usuarios */}
            <div className="bg-[var(--bg-card)] rounded-2xl shadow-lg overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <RefreshCw className="w-12 h-12 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
                  <p className="text-[var(--text-secondary)] font-medium">Cargando usuarios...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--bg-hover)]">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-secondary)] uppercase">
                          Usuario
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-secondary)] uppercase">
                          Roles
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-secondary)] uppercase">
                          Estado
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-secondary)] uppercase">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {usuariosFiltrados.map(usuario => {
                        const rolesUsuario = (usuario.roles || []).map(r => 
                          typeof r === 'string' ? r.replace('ROLE_', '').toUpperCase() : 
                          r?.authority?.replace('ROLE_', '').toUpperCase()
                        );

                        return (
                          <tr key={usuario.idUser} className="hover:bg-[var(--bg-hover)] transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 
                                              flex items-center justify-center">
                                  <User className="w-5 h-5 text-[var(--color-primary)]" />
                                </div>
                                <div>
                                  <div className="font-semibold text-[var(--text-primary)]">
                                    {usuario.username}
                                    {usuario.idUser === usuarioActual?.id && (
                                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        Tú
                                      </span>
                                    )}
                                  </div>
                                  {usuario.nombreCompleto && (
                                    <div className="text-sm text-[var(--text-secondary)]">
                                      {usuario.nombreCompleto}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {rolesUsuario.length > 0 ? (
                                  rolesUsuario.map(rol => (
                                    <span
                                      key={rol}
                                      className="px-2 py-1 text-xs font-medium bg-purple-100 
                                               text-purple-800 rounded-full"
                                    >
                                      {rol}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm text-[var(--text-secondary)]">Sin roles</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {usuario.activo ? (
                                <span className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                  <CheckCircle className="w-4 h-4" />
                                  Activo
                                </span>
                              ) : (
                                <span className="flex items-center gap-2 text-red-600 text-sm font-medium">
                                  <XCircle className="w-4 h-4" />
                                  Inactivo
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => verDetalleUsuario(usuario)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Ver detalles"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => toast('Funcionalidad en desarrollo', { icon: '🚧' })}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {usuariosFiltrados.length === 0 && (
                    <div className="p-12 text-center text-[var(--text-secondary)]">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium">No se encontraron usuarios</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <StatCard
                icon={Users}
                label="Total Usuarios"
                value={usuarios.length}
                color="blue"
              />
              <StatCard
                icon={CheckCircle}
                label="Usuarios Activos"
                value={usuarios.filter(u => u.activo).length}
                color="green"
              />
              <StatCard
                icon={Shield}
                label="SuperAdmins"
                value={usuarios.filter(u => {
                  const roles = (u.roles || []).map(r => 
                    typeof r === 'string' ? r.replace('ROLE_', '').toUpperCase() : 
                    r?.authority?.replace('ROLE_', '').toUpperCase()
                  );
                  return roles.includes('SUPERADMIN');
                }).length}
                color="purple"
              />
              <StatCard
                icon={AlertCircle}
                label="Sin Roles"
                value={usuarios.filter(u => !u.roles || u.roles.length === 0).length}
                color="orange"
              />
            </div>
          </>
        ) : (
          <DetalleUsuario
            usuario={usuarioSeleccionado}
            permisos={permisosUsuario}
            onVolver={volverALista}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--text-secondary)] font-medium">{label}</p>
          <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">{value}</p>
        </div>
        <div className={`w-14 h-14 rounded-2xl ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
}

function DetalleUsuario({ usuario, permisos, onVolver, loading }) {
  const permisosPorModulo = permisos.reduce((acc, permiso) => {
    const modulo = permiso.nombreModulo || 'Sin Módulo';
    if (!acc[modulo]) acc[modulo] = [];
    acc[modulo].push(permiso);
    return acc;
  }, {});

  const rolesUsuario = (usuario?.roles || []).map(r => 
    typeof r === 'string' ? r.replace('ROLE_', '').toUpperCase() : 
    r?.authority?.replace('ROLE_', '').toUpperCase()
  );

  return (
    <div className="space-y-6">
      <div className="bg-[var(--bg-card)] rounded-2xl shadow-lg p-6">
        <button
          onClick={onVolver}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] 
                   mb-6 transition-colors font-medium"
        >
          ← Volver a la lista
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 
                          flex items-center justify-center">
              <User className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">{usuario?.username}</h2>
              {usuario?.nombreCompleto && (
                <p className="text-[var(--text-secondary)] mt-1">{usuario.nombreCompleto}</p>
              )}
              <div className="flex gap-2 mt-3">
                {rolesUsuario.map(rol => (
                  <span key={rol} className="px-3 py-1 bg-purple-100 text-purple-800 
                                           rounded-full text-sm font-medium">
                    {rol}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-lg p-12 text-center">
          <RefreshCw className="w-12 h-12 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)] font-medium">Cargando permisos...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.keys(permisosPorModulo).length > 0 ? (
            Object.entries(permisosPorModulo).map(([modulo, permisos]) => (
              <div key={modulo} className="bg-[var(--bg-card)] rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-[var(--bg-hover)] px-6 py-4">
                  <h3 className="font-bold text-[var(--text-primary)] text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[var(--color-primary)]" />
                    {modulo}
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {permisos.map(permiso => (
                      <div key={permiso.idPermiso} 
                           className="flex items-center justify-between p-4 bg-[var(--bg-main)] 
                                    rounded-xl border-2 border-[var(--border-color)]">
                        <div className="flex-1">
                          <div className="font-medium text-[var(--text-primary)]">
                            {permiso.nombrePagina}
                          </div>
                          <div className="text-sm text-[var(--text-secondary)] mt-1">
                            {permiso.rutaPagina}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <PermisoChip activo={permiso.ver} label="Ver" />
                          <PermisoChip activo={permiso.crear} label="Crear" />
                          <PermisoChip activo={permiso.editar} label="Editar" />
                          <PermisoChip activo={permiso.eliminar} label="Eliminar" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[var(--bg-card)] rounded-2xl shadow-lg p-12 text-center text-[var(--text-secondary)]">
              <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Este usuario no tiene permisos asignados</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PermisoChip({ activo, label }) {
  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-full ${
        activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'
      }`}
    >
      {label}
    </span>
  );
}

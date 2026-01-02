// src/pages/admin/users/components/UsersTable.jsx
import React from 'react';
import { Users, Eye, Edit, Trash2, Circle, MapPin, Building, UserPlus, AlertCircle, Unlock, Lock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

// ============================================================
// 🔧 FUNCIONES AUXILIARES PARA TIPO DE PERSONAL
// ============================================================
const getTipoPersonal = (user) => {
  // La lógica real es basada en el IPRESS donde trabaja
  // INTERNO = trabaja en CENATE (id_ipress === 2)
  // EXTERNO = trabaja en cualquier otro IPRESS
  const idIpress = user.id_ipress || user.idIpress;
  const nombreIpress = user.nombre_ipress || '';
  
  if (idIpress === 2 || nombreIpress.includes('CENTRO NACIONAL DE TELEMEDICINA')) {
    return 'INTERNO';
  } else if (idIpress && idIpress !== 2) {
    return 'EXTERNO';
  }
  
  // Fallback: revisar el campo tipo_personal si existe
  return String(
    user.descOrigen || 
    user.desc_origen || 
    user.tipo_personal || 
    user.tipoPersonal || 
    ''
  ).toUpperCase().trim();
};

const UsersTable = ({ users, loading = false, onViewDetail, onEdit, onDelete, onToggleEstado, onUnlockUser, onCreateUser, selectedUsers = [], onSelectAll, onSelectUser, showBirthdayColumn = false }) => {
  const { user: currentUser } = useAuth();

  // Verificar si es SUPERADMIN (único que puede eliminar usuarios)
  const esSuperAdmin = currentUser?.roles?.includes('SUPERADMIN');
  const esAdmin = currentUser?.roles?.includes('ADMIN') || esSuperAdmin;

  // 🔒 Verificar si una cuenta está bloqueada
  const isAccountLocked = (user) => {
    // Verificar múltiples campos posibles del backend
    if (user.account_locked === true || user.accountLocked === true) return true;

    // Verificar por intentos fallidos >= 3
    const failedAttempts = user.failed_attempts || user.failedAttempts || 0;
    if (failedAttempts >= 3) return true;

    // Verificar por lock_time/lockTime activo
    const lockTime = user.lock_time || user.lockTime || user.locked_until || user.lockedUntil;
    if (lockTime) {
      const lockDate = new Date(lockTime);
      const now = new Date();
      // Si lockTime + 10 minutos > ahora, está bloqueado
      const unlockTime = new Date(lockDate.getTime() + 10 * 60 * 1000);
      if (unlockTime > now) return true;
    }

    return false;
  };

  // Función para obtener las iniciales del usuario
  const getInitials = (username) => {
    if (!username) return '?';
    return username.charAt(0).toUpperCase();
  };

  // Función para obtener color del avatar basado en el username
  const getAvatarColor = (username) => {
    const colors = [
      'bg-blue-500',
      'bg-emerald-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-cyan-500',
    ];
    const index = (username?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  // ✅ CORREGIDO: Badge de tipo personal - Estilo simple y limpio
  const getTipoBadge = (tipo) => {
    // Normalizar el valor para comparación case-insensitive
    const tipoNormalizado = tipo?.toUpperCase();

    if (tipoNormalizado === 'INTERNO' || tipoNormalizado === 'CENATE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
          <Building className="w-3 h-3" strokeWidth={2} />
          INTERNO
        </span>
      );
    }
    if (tipoNormalizado === 'EXTERNO') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
          <MapPin className="w-3 h-3" strokeWidth={2} />
          EXTERNO
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
        SIN_CLASIFICAR
      </span>
    );
  };

  // Verificar si todos los usuarios están seleccionados
  const allSelected = users.length > 0 && users.every(user => selectedUsers.includes(user.id_user));
  const someSelected = selectedUsers.length > 0 && !allSelected;

  // Función para formatear fecha de cumpleaños (solo día y mes)
  const formatBirthday = (fechaNacimiento) => {
    if (!fechaNacimiento) return '—';
    try {
      let day, month;

      if (typeof fechaNacimiento === 'string') {
        // Si es string "YYYY-MM-DD", extraer directamente los componentes
        // para evitar problemas de zona horaria con new Date()
        const parts = fechaNacimiento.split('T')[0].split('-');
        if (parts.length >= 3) {
          day = parseInt(parts[2], 10);
          month = parseInt(parts[1], 10) - 1; // Mes es 0-indexado
        } else {
          return '—';
        }
      } else if (Array.isArray(fechaNacimiento)) {
        // Si es array [year, month, day] del backend Java
        day = fechaNacimiento[2];
        month = fechaNacimiento[1] - 1; // Mes es 0-indexado
      } else {
        return '—';
      }

      // Verificar que los valores son válidos
      if (isNaN(day) || isNaN(month) || month < 0 || month > 11) return '—';

      const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      return `${day} de ${monthNames[month]}`;
    } catch (e) {
      console.error('Error al formatear fecha:', e);
      return '—';
    }
  };

  return (
  <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mb-10">
    <div className="relative overflow-hidden bg-white border border-gray-200 shadow-sm rounded-lg">
      <div className="overflow-x-auto relative">
        {/* Overlay de carga - Solo sobre el tbody */}
        {loading && (
          <div className="absolute left-0 right-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center" style={{ top: '48px', bottom: 0, minHeight: '300px' }}>
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0A5BA9]"></div>
              <p className="text-sm font-medium text-gray-600">Cargando usuarios...</p>
            </div>
          </div>
        )}
        <table className="w-full text-sm text-left">
          <thead className="text-xs font-semibold text-white uppercase tracking-wider bg-[#0A5BA9] relative z-20">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => {
                    if (input) {
                      input.indeterminate = someSelected;
                    }
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-white focus:ring-2 focus:ring-white/50 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3">USUARIO</th>
              <th className="px-4 py-3">NOMBRE COMPLETO</th>
              <th className="px-4 py-3">DOCUMENTO</th>
              <th className="px-4 py-3">ROL</th>
              <th className="px-4 py-3">TIPO</th>
              <th className="px-4 py-3">IPRESS</th>
              {showBirthdayColumn && (
                <th className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" />
                    </svg>
                    CUMPLEAÑOS
                  </div>
                </th>
              )}
              <th className="px-4 py-3">ESTADO</th>
              <th className="px-4 py-3 text-center">ACCIÓN</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              // 🔄 Estado de carga - Mostrar skeleton
              <tr>
                <td colSpan={showBirthdayColumn ? "10" : "9"} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-sm font-medium text-gray-600">Buscando usuarios...</p>
                    <p className="text-xs text-gray-400">Por favor espera un momento</p>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              // ❌ Sin resultados - Solo se muestra cuando YA terminó de cargar
              <tr>
                <td colSpan={showBirthdayColumn ? "10" : "9"} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-gray-100 rounded-full">
                      <Users className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-medium text-gray-500">No se encontraron usuarios</p>
                    <p className="text-xs text-gray-400">Intenta ajustar los filtros de búsqueda</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user.id_user} className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  {/* Checkbox */}
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id_user)}
                      onChange={() => onSelectUser(user.id_user)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                    />
                  </td>

                  {/* Usuario con avatar */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-full ${getAvatarColor(user.username)} flex items-center justify-center text-white font-semibold text-xs`}>
                        {getInitials(user.username)}
                      </div>
                      <span className="font-medium text-gray-700">@{user.username}</span>
                    </div>
                  </td>

                  {/* Nombre completo */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">{user.nombre_completo || '—'}</span>
                      {user.id_user === null && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                          <AlertCircle className="w-3 h-3" strokeWidth={2} />
                          Sin cuenta
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Documento */}
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div className="text-xs text-gray-500">{user.tipo_documento || 'DNI'}</div>
                      <div className="text-gray-700 font-medium">{user.numero_documento || '—'}</div>
                    </div>
                  </td>

                  {/* Rol */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {Array.isArray(user.roles) && user.roles.length > 0 ? (
                        user.roles.map((rol, index) => (
                          <span 
                            key={index}
                            className="inline-block px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded border border-blue-200"
                          >
                            {rol}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">USER</span>
                      )}
                    </div>
                  </td>

                  {/* Tipo */}
                  <td className="px-4 py-3">
                    {getTipoBadge(getTipoPersonal(user))}
                  </td>

                  {/* IPRESS */}
                  <td className="px-4 py-3 max-w-[250px]">
                    <span className="text-sm text-gray-700 truncate block">
                      {user.nombre_ipress || user.descIpress || user.ipress?.descIpress || user.ipress?.desc_ipress || '—'}
                    </span>
                  </td>

                  {/* Cumpleaños (condicional) */}
                  {showBirthdayColumn && (
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {formatBirthday(user.fecha_nacimiento || user.fech_naci_pers)}
                      </span>
                    </td>
                  )}

                  {/* Estado */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {/* Toggle de estado ACTIVO/INACTIVO */}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={user.estado_usuario === 'ACTIVO'}
                          onChange={() => onToggleEstado(user)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-red-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:peer-focus:ring-emerald-500/50 transition-all duration-200"></div>
                        <span className={`ml-2 text-xs font-medium ${user.estado_usuario === 'ACTIVO' ? 'text-emerald-700' : 'text-red-600'}`}>
                          {user.estado_usuario === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </label>

                      {/* 🔒 Indicador de cuenta bloqueada */}
                      {isAccountLocked(user) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                          <Lock className="w-3 h-3" strokeWidth={2} />
                          Bloqueado
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    {user.id_user === null ? (
                      // 🆕 Personal SIN usuario: Mostrar botón "Crear Usuario"
                      <div className="flex justify-center">
                        <button
                          onClick={() => onCreateUser && onCreateUser(user)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors duration-150"
                          title="Crear cuenta de usuario para este personal"
                        >
                          <UserPlus className="w-3.5 h-3.5" strokeWidth={2} />
                          Crear
                        </button>
                      </div>
                    ) : (
                      // ✅ Personal CON usuario: Mostrar acciones normales
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => onViewDetail(user)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors duration-150"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => onEdit(user)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors duration-150"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" strokeWidth={2} />
                        </button>
                        {/* 🔓 Botón de desbloquear (solo si está bloqueado y es ADMIN) */}
                        {isAccountLocked(user) && esAdmin && onUnlockUser && (
                          <button
                            onClick={() => onUnlockUser(user)}
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors duration-150"
                            title="Desbloquear cuenta"
                          >
                            <Unlock className="w-4 h-4" strokeWidth={2} />
                          </button>
                        )}
                        {/* Solo SUPERADMIN puede eliminar usuarios */}
                        {esSuperAdmin && (
                          <button
                            onClick={() => onDelete(user)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors duration-150"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={2} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
};

export default UsersTable;
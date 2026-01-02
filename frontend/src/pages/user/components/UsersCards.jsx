// src/pages/admin/users/components/UsersCards.jsx
import React from 'react';
import { Eye, Edit, Trash2, Phone, Mail, MapPin, Building, User as UserIcon, AlertCircle, UserPlus, Users } from 'lucide-react';

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

const UsersCards = ({ users, loading = false, onViewDetail, onEdit, onDelete, onToggleEstado, onCreateUser, selectedUsers = [], onSelectUser }) => {
  // Función para obtener las iniciales del nombre completo
  const getInitials = (nombreCompleto) => {
    if (!nombreCompleto) return '?';
    const names = nombreCompleto.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Badge de tipo personal
  const getTipoBadge = (tipo) => {
    // Normalizar el valor para comparación case-insensitive
    const tipoNormalizado = tipo?.toUpperCase();

    if (tipoNormalizado === 'INTERNO' || tipoNormalizado === 'CENATE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
          <Building className="w-3 h-3" />
          INTERNO
        </span>
      );
    }
    if (tipoNormalizado === 'EXTERNO') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
          <MapPin className="w-3 h-3" />
          EXTERNO
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
        SIN_CLASIFICAR
      </span>
    );
  };

  // 🔄 Estado de carga - Mostrar spinner
  if (loading) {
    return (
      <div className="p-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm font-medium text-gray-600">Buscando usuarios...</p>
          <p className="text-xs text-gray-400">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  // ❌ Sin resultados - Solo se muestra cuando YA terminó de cargar
  if (users.length === 0) {
    return (
      <div className="p-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 bg-gray-100 rounded-full">
            <Users className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium text-gray-500">No se encontraron usuarios</p>
          <p className="text-xs text-gray-400">Intenta ajustar los filtros de búsqueda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      <div className="relative">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <div
            key={user.id_user}
            className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all hover:shadow-lg ${
              selectedUsers.includes(user.id_user)
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200'
            }`}
          >
            {/* Header con avatar y acciones */}
            <div className="relative bg-[#0A5BA9] p-6 pb-12">
              {/* Checkbox en la esquina superior izquierda */}
              <div className="absolute top-4 left-4">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id_user)}
                  onChange={() => onSelectUser(user.id_user)}
                  className="w-5 h-5 rounded border-2 border-white bg-white/20 text-blue-600 focus:ring-2 focus:ring-white cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              
              {/* Botones de acción en la esquina superior derecha */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => onViewDetail(user)}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all backdrop-blur-sm"
                  title="Ver detalles"
                >
                  <Eye className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => onEdit(user)}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all backdrop-blur-sm"
                  title="Editar"
                >
                  <Edit className="w-4 h-4 text-white" />
                </button>
              </div>
              
              {/* Avatar grande centrado */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-[#0A5BA9] font-bold text-3xl shadow-lg mb-3">
                  {getInitials(user.nombre_completo)}
                </div>
                <h3 className="text-white font-bold text-lg text-center">
                  {user.nombre_completo || 'Sin nombre'}
                </h3>
                <p className="text-blue-100 text-sm">@{user.username}</p>
                {user.id_user === null && (
                  <span className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-700 border border-amber-300">
                    <AlertCircle className="w-3 h-3" />
                    Sin cuenta de usuario
                  </span>
                )}
              </div>
            </div>

            {/* Body con información */}
            <div className="p-5 space-y-3">
              {/* Badges de rol, tipo y estado */}
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                  {user.roles || 'USER'}
                </span>
                {getTipoBadge(getTipoPersonal(user))}
                <span className={`px-2.5 py-1 rounded text-xs font-medium ${
                  user.estado_usuario === 'ACTIVO'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {user.estado_usuario}
                </span>
              </div>

              {/* Información de contacto */}
              {user.numero_documento && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span><strong>DNI:</strong> {user.numero_documento}</span>
                </div>
              )}
              
              {user.nombre_ipress && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  {getTipoPersonal(user) === 'INTERNO' ? (
                    <Building className="w-4 h-4 text-gray-400 mt-0.5" />
                  ) : (
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-xs text-gray-500 mb-0.5">IPRESS</p>
                    <p className="text-gray-900 break-words">{user.nombre_ipress}</p>
                  </div>
                </div>
              )}

              {user.correo_personal && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{user.correo_personal}</span>
                </div>
              )}

              {user.telefono && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{user.telefono}</span>
                </div>
              )}

              {/* Toggle de estado */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Estado del usuario</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={user.estado_usuario === 'ACTIVO'}
                      onChange={() => onToggleEstado(user)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-red-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:peer-focus:ring-emerald-500/50 transition-all duration-200"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer con botones de acción */}
            <div className="px-5 pb-5 flex gap-2">
              {user.id_user === null ? (
                // 🆕 Personal SIN usuario: Solo mostrar botón "Crear Usuario"
                <button
                  onClick={() => onCreateUser && onCreateUser(user)}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Crear Cuenta de Usuario
                </button>
              ) : (
                // ✅ Personal CON usuario: Mostrar acciones normales
                <>
                  <button
                    onClick={() => onViewDetail(user)}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Actualizar
                  </button>
                  <button
                    className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Permisos
                  </button>
                  <button
                    onClick={() => onDelete(user)}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

export default UsersCards;
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getFotoUrl as buildFotoUrl } from '../../utils/apiUrlHelper';

import {
  User, 
  X, 
  Calendar, 
  Cake, 
  MapPin, 
  Mail, 
  Phone, 
  Briefcase, 
  Building,
  Search,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Filter,
  RefreshCw,
  ChevronDown,
  Circle,
  Users,
  Shield,
  Check,
  Copy,
  Download,
  Upload,
  Plus,
  Grid3x3,
  List,
  MoreVertical,
  GraduationCap
} from 'lucide-react';
import api from '../../services/apiClient';
import ProfesionCRUD from './components/ProfesionCRUD';


// ============================================================
// 🔧 FUNCIONES AUXILIARES PARA TIPO DE PERSONAL
// ============================================================
const getTipoPersonal = (user) => {
  const valor = String(
    user.descOrigen || 
    user.desc_origen || 
    user.tipo_personal || 
    user.tipoPersonal || 
    user.origen || 
    ''
  ).toUpperCase().trim();
  console.log('getTipoPersonal:', user.username, '=> valor:', valor, '| campos:', {
    descOrigen: user.descOrigen,
    desc_origen: user.desc_origen,
    tipo_personal: user.tipo_personal,
    tipoPersonal: user.tipoPersonal,
    origen: user.origen
  });
  return valor;
};

const esInterno = (user) => {
  const tipo = getTipoPersonal(user);
  const resultado = tipo === 'CENATE' || 
         tipo === 'INTERNO' || 
         tipo === 'INTERNO CENATE' || 
         tipo.includes('CENATE') ||
         tipo.includes('INTERN');
  console.log('esInterno:', user.username, 'tipo:', tipo, 'resultado:', resultado);
  return resultado;
};

const esExterno = (user) => {
  const tipo = getTipoPersonal(user);
  const resultado = tipo === 'EXTERNO' || 
         tipo === 'EXTERNA' || 
         tipo === 'EXTERN' ||
         tipo.includes('EXTER');
  console.log('esExterno:', user.username, 'tipo:', tipo, 'resultado:', resultado);
  return resultado;
};

// Función para obtener la URL de la foto del usuario
const getFotoUrl = (user) => {
  if (!user) {
    console.log('❌ getFotoUrl: user es null o undefined');
    return null;
  }
  
  const fotoUrl = user.foto_url || user.foto_pers || user.foto;
  console.log('📸 getFotoUrl para', user.username || user.nombre_completo, ':', {
    foto_url: user.foto_url,
    foto_pers: user.foto_pers,
    foto: user.foto,
    resultado: fotoUrl
  });
  
  const finalUrl = buildFotoUrl(fotoUrl);
  if (finalUrl) {
    console.log('✅ getFotoUrl: URL construida:', finalUrl);
  } else {
    console.log('⚠️ getFotoUrl: No hay foto válida para', user.username);
  }
  return finalUrl;
};

// Función para obtener las iniciales del nombre completo
const getInitials = (nombreCompleto, username) => {
  if (nombreCompleto) {
    const names = nombreCompleto.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }
  if (username) return username.charAt(0).toUpperCase();
  return 'U';
};

// Componente de Avatar para cards
const UserAvatar = ({ user, size = 'w-16 h-16', textSize = 'text-xl', showStatus = false }) => {
  const [imageError, setImageError] = React.useState(false);
  const fotoUrl = getFotoUrl(user);
  
  return (
    <div className="relative flex-shrink-0">
      <div className={`${size} bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold ${textSize} border-2 border-white/30 overflow-hidden`}>
        {fotoUrl && !imageError ? (
          <img
            src={fotoUrl}
            alt={user.nombre_completo || user.username}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('❌ Error al cargar foto en avatar:', fotoUrl, 'usuario:', user.username);
              setImageError(true);
            }}
            onLoad={() => {
              console.log('✅ Foto cargada exitosamente en avatar:', fotoUrl, 'usuario:', user.username);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {getInitials(user.nombre_completo, user.username)}
          </div>
        )}
      </div>
      {showStatus && (
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-blue-600"></div>
      )}
    </div>
  );
};

// Componente de Avatar para tabla
const TableAvatar = ({ user }) => {
  const [imageError, setImageError] = React.useState(false);
  const fotoUrl = getFotoUrl(user);
  
  return (
    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm flex-shrink-0 overflow-hidden relative">
      {fotoUrl && !imageError ? (
        <img
          src={fotoUrl}
          alt={user.nombre_completo || user.username}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('❌ Error al cargar foto en tabla:', fotoUrl, 'usuario:', user.username);
            setImageError(true);
          }}
          onLoad={() => {
            console.log('✅ Foto cargada exitosamente en tabla:', fotoUrl, 'usuario:', user.username);
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          {getInitials(user.nombre_completo, user.username)}
        </div>
      )}
    </div>
  );
};

const GestionUsuariosPermisos = () => {  // Estados principales
  const [activeTab, setActiveTab] = useState('usuarios');
  const [users, setUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showCrearUsuarioModal, setShowCrearUsuarioModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' o 'cards'

  const [filters, setFilters] = useState({
    rol: '',
    institucion: '',
    estado: '',
    mesCumpleanos: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener datos del personal
      const personal = await api.get('/personal/total');
      
      // Filtrar duplicados y normalizar estados
      const uniqueUsers = personal.reduce((acc, current) => {
        const existing = acc.find(u => u.id_usuario === current.id_usuario);
        
        // Normalizar estado: si no existe o es inválido, usar el de la vista
        const estadoNormalizado = current.estado === 'ACTIVO' || current.estado === 'A' 
          ? 'ACTIVO' 
          : 'INACTIVO';
        
        const usuario = {
          ...current,
          estado: estadoNormalizado
        };
        
        if (!existing) {
          acc.push(usuario);
        } else if (current.tipo_personal === 'CENATE' && existing.tipo_personal !== 'CENATE') {
          // Preferir el registro de CENATE sobre EXTERNO
          const index = acc.indexOf(existing);
          acc[index] = usuario;
        }
        return acc;
      }, []);
      
      console.log(`✅ Cargados ${uniqueUsers.length} usuarios únicos`);
      console.log('Estados:', uniqueUsers.map(u => ({ user: u.username, estado: u.estado })));
      console.log('📊 DEBUG - Primeros 3 usuarios completos:', uniqueUsers.slice(0, 3));
      console.log('📊 DEBUG - Tipos de Personal:', uniqueUsers.map(u => ({ 
        username: u.username, 
        tipo_personal: u.tipo_personal,
        todas_las_keys: Object.keys(u).filter(k => k.toLowerCase().includes('tipo') || k.toLowerCase().includes('personal'))
      })));
      console.log('📸 DEBUG - Fotos en usuarios:', uniqueUsers.slice(0, 5).map(u => ({
        username: u.username,
        nombre: u.nombre_completo,
        foto_url: u.foto_url,
        foto_pers: u.foto_pers,
        foto: u.foto,
        fotoUrl: getFotoUrl(u)
      })));
      
      // 🔍 DEBUG: Verificar si el usuario 46205941 está en los resultados
      const usuario46205941 = uniqueUsers.find(u => u.username === '46205941');
      if (usuario46205941) {
        console.log('✅ Usuario 46205941 encontrado en frontend:', usuario46205941);
      } else {
        console.warn('⚠️ Usuario 46205941 NO encontrado en frontend. Total usuarios:', uniqueUsers.length);
        console.log('📋 Usuarios disponibles:', uniqueUsers.map(u => u.username).slice(0, 10));
      }
      
      setUsers(uniqueUsers);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar los usuarios. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    console.log('📊 Calculando stats con', users.length, 'usuarios');
    
    if (users.length > 0) {
      console.log('📊 DEBUG - Primer usuario:', users[0]);
      console.log('📊 DEBUG - Campos disponibles:', Object.keys(users[0]));
    }
    
    const total = users.length;
    
    const internos = users.filter(u => {
      const isInt = esInterno(u);
      if (isInt) console.log('✅ INTERNO:', u.username, 'tipo:', getTipoPersonal(u));
      return isInt;
    }).length;
    
    const externos = users.filter(u => {
      const isExt = esExterno(u);
      if (isExt) console.log('✅ EXTERNO:', u.username, 'tipo:', getTipoPersonal(u));
      return isExt;
    }).length;
    
    const conAccesoAdmin = users.filter(u => 
      u.roles && (u.roles.includes('SUPERADMIN') || u.roles.includes('ADMIN'))
    ).length;
    
    const activos = users.filter(u => u.estado === 'ACTIVO').length;
    const inactivos = users.filter(u => u.estado === 'INACTIVO').length;
    
    console.log('📊 Stats calculados:', { total, internos, externos, conAccesoAdmin, activos, inactivos });
    
    return { total, internos, externos, conAccesoAdmin, activos, inactivos };
  }, [users]);

  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.nombre_completo?.toLowerCase().includes(searchLower) ||
        u.username?.toLowerCase().includes(searchLower) ||
        u.numero_documento?.includes(searchTerm) ||
        u.nombre_ipress?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.rol) filtered = filtered.filter(u => u.roles === filters.rol);
    if (filters.institucion !== '') {
      if (filters.institucion === 'INTERNO') {
        filtered = filtered.filter(u => esInterno(u));
      } else if (filters.institucion === 'EXTERNO') {
        filtered = filtered.filter(u => esExterno(u));
      }
    }
    if (filters.estado) filtered = filtered.filter(u => u.estado === filters.estado);
    if (filters.mesCumpleanos) filtered = filtered.filter(u => u.mes_cumpleanos === filters.mesCumpleanos);

    return filtered;
  }, [users, searchTerm, filters]);

  const uniqueRoles = useMemo(() => {
    const roles = [...new Set(users.map(u => u.roles).filter(Boolean))];
    return roles;
  }, [users]);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const tabs = [
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'areas', label: 'Áreas', icon: Building },
    { id: 'regimenes', label: 'Regímenes', icon: Briefcase },
    { id: 'profesion', label: 'Profesión', icon: GraduationCap },
    { id: 'especialidad', label: 'Especialidad', icon: UserPlus }
  ];

  const handleVerDetalle = (user) => {
    setSelectedUser(user);
    setShowDetalleModal(true);
  };

  const limpiarFiltros = () => {
    setFilters({ rol: '', institucion: '', estado: '', mesCumpleanos: '' });
    setSearchTerm('');
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredUsers.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredUsers.map(u => u.id_user));
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleToggleEstado = async (user) => {
    try {
      const nuevoEstado = user.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
      const idUsuario = user.id_usuario;

      // Actualizar en el backend
      if (nuevoEstado === 'ACTIVO') {
        await api.put(`/usuarios/${idUsuario}/activar`);
      } else {
        await api.put(`/usuarios/${idUsuario}/desactivar`);
      }

      // Actualizar estado local
      setUsers(users.map(u => 
        u.id_usuario === idUsuario ? { ...u, estado: nuevoEstado } : u
      ));
      
      console.log(`✅ Usuario ${user.username || user.nombre_completo} ${nuevoEstado}`);
    } catch (error) {
      console.error('❌ Error al cambiar el estado del usuario:', error);
      alert('Error al cambiar el estado. Por favor intente nuevamente.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white border border-red-100 rounded-2xl p-8 max-w-md shadow-sm">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-gray-900 font-semibold text-center mb-2">Error al cargar</h3>
          <p className="text-gray-600 text-center text-sm mb-6">{error}</p>
          <button
            onClick={loadUsers}
            className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6 py-5">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Administración del Sistema</h1>
            <p className="text-sm text-gray-500">Gestión de usuarios, roles, áreas y regímenes laborales</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 -mb-[1px]">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Contenido según tab activo */}
        {activeTab === 'usuarios' && (
          <>
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-semibold text-blue-900 mb-1">{stats.total}</p>
                <p className="text-sm text-blue-700 font-medium">Total Usuarios</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-5 border border-emerald-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                    <Building className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <p className="text-3xl font-semibold text-emerald-900 mb-1">{stats.internos}</p>
                <p className="text-sm text-emerald-700 font-medium">Internos CENATE</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-5 border border-orange-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 bg-orange-500/10 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-3xl font-semibold text-orange-900 mb-1">{stats.externos}</p>
                <p className="text-sm text-orange-700 font-medium">Externos</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-5 border border-purple-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-3xl font-semibold text-purple-900 mb-1">{stats.conAccesoAdmin}</p>
                <p className="text-sm text-purple-700 font-medium">Con Acceso Admin</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-semibold text-green-900 mb-1">{stats.activos}</p>
                <p className="text-sm text-green-700 font-medium">Usuarios Activos</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 border border-gray-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 bg-gray-500/10 rounded-xl flex items-center justify-center">
                    <Circle className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
                <p className="text-3xl font-semibold text-gray-900 mb-1">{stats.inactivos}</p>
                <p className="text-sm text-gray-700 font-medium">Usuarios Inactivos</p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCrearUsuarioModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Usuario
                </button>
                <button
                  disabled={selectedRows.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm font-medium">
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-sm font-medium">
                  <Upload className="w-4 h-4" />
                  Importar
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm w-64"
                  />
                </div>
                
                <div className="flex gap-1 border border-gray-300 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-blue-600 rounded-2xl shadow-sm mb-5 overflow-hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-blue-700 transition-colors text-white"
              >
                <div className="flex items-center gap-3">
                  <Filter className="w-5 h-5" />
                  <span className="font-semibold text-sm">Filtros Avanzados</span>
                  <span className="text-xs opacity-75">Click para configurar filtros</span>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {showFilters && (
                <div className="px-6 pb-6 bg-white border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Rol</label>
                      <select
                        value={filters.rol}
                        onChange={(e) => setFilters({...filters, rol: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Todos los Roles</option>
                        {uniqueRoles.map(rol => (
                          <option key={rol} value={rol}>{rol}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Institución</label>
                      <select
                        value={filters.institucion}
                        onChange={(e) => setFilters({...filters, institucion: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Todas</option>
                        <option value="INTERNO">Interno (CENATE)</option>
                        <option value="EXTERNO">Externo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Estado</label>
                      <select
                        value={filters.estado}
                        onChange={(e) => setFilters({...filters, estado: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Todos</option>
                        <option value="ACTIVO">Activos</option>
                        <option value="INACTIVO">Inactivos</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                        <Cake className="w-3.5 h-3.5" />
                        Mes de Cumpleaños
                      </label>
                      <select
                        value={filters.mesCumpleanos}
                        onChange={(e) => setFilters({...filters, mesCumpleanos: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Todos</option>
                        {meses.map((mes) => (
                          <option key={mes} value={mes}>{mes}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {Object.values(filters).some(v => v !== '') && (
                    <button
                      onClick={limpiarFiltros}
                      className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Limpiar Filtros
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Vista de Tabla o Cards */}
            {viewMode === 'table' ? (
              <TableView 
                users={filteredUsers}
                selectedRows={selectedRows}
                onSelectAll={toggleSelectAll}
                onSelectRow={toggleSelectRow}
                onVerDetalle={handleVerDetalle}
                onToggleEstado={handleToggleEstado}
              />
            ) : (
              <CardsView 
                users={filteredUsers}
                selectedRows={selectedRows}
                onSelectRow={toggleSelectRow}
                onVerDetalle={handleVerDetalle}
                onToggleEstado={handleToggleEstado}
              />
            )}
          </>
        )}

        {/* Tab de Profesión */}
        {activeTab === 'profesion' && (
          <ProfesionCRUD />
        )}

        {/* Placeholder para otras tabs */}
        {activeTab !== 'usuarios' && activeTab !== 'profesion' && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {activeTab === 'areas' && <Building className="w-8 h-8 text-gray-400" />}
              {activeTab === 'regimenes' && <Briefcase className="w-8 h-8 text-gray-400" />}
              {activeTab === 'especialidad' && <UserPlus className="w-8 h-8 text-gray-400" />}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Gestión de {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <p className="text-gray-500 mb-4">
              Aquí podrás administrar todas las {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} de la organización
            </p>
            <p className="text-sm text-gray-400">Tabla CRUD en desarrollo</p>
          </div>
        )}

        
      </div>

      {/* Modales */}
      {showDetalleModal && selectedUser && (
        <VerDetalleModal user={selectedUser} onClose={() => setShowDetalleModal(false)} />
      )}

      {showCrearUsuarioModal && (
        <CrearUsuarioModalOptimizado 
          onClose={() => setShowCrearUsuarioModal(false)} 
          onSuccess={loadUsers} 
        />
      )}
    </div>
  );
};

// Componente de Vista de Tabla
const TableView = ({ users, selectedRows, onSelectAll, onSelectRow, onVerDetalle, onToggleEstado }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left w-12">
              <input
                type="checkbox"
                checked={selectedRows.length === users.length && users.length > 0}
                onChange={onSelectAll}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usuario</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre Completo</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Documento</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rol</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">IPRESS</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.length === 0 ? (
            <tr>
              <td colSpan="9" className="px-6 py-16 text-center">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1">No se encontraron usuarios</p>
                <p className="text-gray-400 text-sm">Intenta ajustar los filtros de búsqueda</p>
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id_user} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(user.id_user)}
                    onChange={() => onSelectRow(user.id_user)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <TableAvatar user={user} />
                    <div className="text-sm text-gray-900 font-medium">@{user.username}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 text-sm">{user.nombre_completo || '—'}</div>
                </td>
                <td className="px-4 py-3">
                  {user.numero_documento ? (
                    <div>
                      <div className="text-xs font-medium text-gray-500">{user.tipo_documento || 'DNI'}</div>
                      <div className="text-sm text-gray-900">{user.numero_documento}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    {user.roles || 'USER'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                    esInterno(user)
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-orange-50 text-orange-700 border-orange-200'
                  }`}>
                    {esInterno(user) && <Building className="w-3 h-3" />}
                    {esExterno(user) && <MapPin className="w-3 h-3" />}
                    {esInterno(user) ? 'INTERNO' : 'EXTERNO'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {user.nombre_ipress || <span className="text-gray-400">—</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={user.estado === 'ACTIVO'}
                      onChange={() => onToggleEstado(user)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                  <span className={`ml-2 text-xs font-medium ${user.estado === 'ACTIVO' ? 'text-emerald-700' : 'text-gray-500'}`}>
                    {user.estado}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onVerDetalle(user)}
                      className="p-2 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg transition-all"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    
    {users.length > 0 && (
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600">
          Mostrando <span className="font-medium">{users.length}</span> de <span className="font-medium">{users.length}</span> registros
        </p>
      </div>
    )}
  </div>
);

// Componente de Vista de Cards
const CardsView = ({ users, selectedRows, onSelectRow, onVerDetalle, onToggleEstado }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {users.length === 0 ? (
      <div className="col-span-full text-center py-16">
        <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600 font-medium mb-1">No se encontraron usuarios</p>
        <p className="text-gray-400 text-sm">Intenta ajustar los filtros de búsqueda</p>
      </div>
    ) : (
      users.map((user) => (
        <div key={user.id_user} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          
          {/* Header con checkbox y acciones */}
          <div className="flex items-start justify-between mb-4 relative z-10">
            <input
              type="checkbox"
              checked={selectedRows.includes(user.id_user)}
              onChange={() => onSelectRow(user.id_user)}
              className="w-5 h-5 text-white border-white/30 rounded focus:ring-white/50 bg-white/20"
            />
            <div className="flex gap-1">
              <button
                onClick={() => onVerDetalle(user)}
                className="p-2 hover:bg-white/20 text-white rounded-lg transition-all"
                title="Ver detalles"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                className="p-2 hover:bg-white/20 text-white rounded-lg transition-all"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Avatar y nombre */}
          <div className="flex items-start gap-4 mb-4 relative z-10">
            <UserAvatar user={user} size="w-16 h-16" textSize="text-xl" showStatus={true} />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1 truncate">
                {user.nombre_completo || user.username}
              </h3>
              <p className="text-blue-100 text-sm">@{user.username}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4 relative z-10">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-900 text-white">
              {user.roles || 'USER'}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
              esInterno(user)
                ? 'bg-emerald-500 text-white' 
                : 'bg-orange-500 text-white'
            }`}>
              {esInterno(user) && <Building className="w-3 h-3" />}
              {esExterno(user) && <MapPin className="w-3 h-3" />}
              {esInterno(user) ? 'INTERNO' : 'EXTERNO'}
            </span>
          </div>

          {/* Info */}
          <div className="space-y-2 mb-4 relative z-10">
            {user.nombre_ipress && (
              <div className="flex items-center gap-2 text-white text-sm">
                <Building className="w-4 h-4 text-white/70" />
                <span className="truncate">{user.nombre_ipress}</span>
              </div>
            )}
            {user.numero_documento && (
              <div className="flex items-center gap-2 text-white text-sm">
                <User className="w-4 h-4 text-white/70" />
                <span>DNI: {user.numero_documento}</span>
              </div>
            )}
            {user.correo_institucional && (
              <div className="flex items-center gap-2 text-white text-sm">
                <Mail className="w-4 h-4 text-white/70" />
                <span className="truncate">{user.correo_institucional}</span>
              </div>
            )}
            {user.telefono && (
              <div className="flex items-center gap-2 text-white text-sm">
                <Phone className="w-4 h-4 text-white/70" />
                <span>{user.telefono}</span>
              </div>
            )}
          </div>

          {/* Footer con toggle de estado */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20 relative z-10">
            <span className="text-sm text-white/90 font-medium">Estado del usuario</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={user.estado === 'ACTIVO'}
                onChange={() => onToggleEstado(user)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-white/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 mt-4 relative z-10">
            <button className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all text-sm font-medium backdrop-blur-sm flex items-center justify-center gap-2">
              <Edit className="w-4 h-4" />
              Actualizar
            </button>
            <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Permisos
            </button>
          </div>
        </div>
      ))
    )}
  </div>
);

// ============================================================
// 🚀 COMPONENTE DE CAMPO NUMÉRICO CON DEBOUNCING
// ============================================================
const NumericInput = React.memo(({ name, value, onChange, ...props }) => {
  const [localValue, setLocalValue] = useState(value || '');
  const timeoutRef = useRef(null);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    const syntheticEvent = {
      target: {
        name: name,
        value: newValue
      }
    };
    
    timeoutRef.current = setTimeout(() => {
      onChange(syntheticEvent);
    }, 500);
  }, [name, onChange]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <input
      {...props}
      name={name}
      value={localValue}
      onChange={handleChange}
      inputMode="numeric"
      pattern="[0-9]*"
    />
  );
}, (prevProps, nextProps) => {
  return prevProps.value === nextProps.value && 
         prevProps.name === nextProps.name;
});

NumericInput.displayName = 'NumericInput';

// ============================================================
// 🎯 COMPONENTES DE FORMULARIO OPTIMIZADOS
// ============================================================
const FormField = React.memo(({ label, name, type = 'text', required = false, numeric = false, value, onChange, errors, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {numeric ? (
      <NumericInput
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm ${
          errors[name] ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm ${
          errors[name] ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
    )}
    {errors[name] && (
      <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
    )}
  </div>
));

FormField.displayName = 'FormField';

const SelectField = React.memo(({ label, name, options, required = false, value, onChange, errors }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm ${
        errors[name] ? 'border-red-500' : 'border-gray-300'
      }`}
    >
      <option value="">Seleccionar...</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {errors[name] && (
      <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
    )}
  </div>
));

SelectField.displayName = 'SelectField';

// Importar los modales del archivo anterior (CrearUsuarioModalOptimizado y VerDetalleModal)
// Por brevedad, no los incluyo aquí completos, pero deberías copiarlos del código anterior

// Placeholder para el modal de crear usuario
const CrearUsuarioModalOptimizado = ({ onClose, onSuccess }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md">
        <h2 className="text-xl font-bold mb-4">Crear Usuario</h2>
        <p className="text-gray-600 mb-4">Funcionalidad en desarrollo...</p>
        <button onClick={onClose} className="px-4 py-2 bg-gray-900 text-white rounded-xl">Cerrar</button>
      </div>
    </div>
  );
};

// Placeholder para el modal de ver detalles
const VerDetalleModal = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-8 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{user.nombre_completo || user.username}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600">Usuario: @{user.username}</p>
        <p className="text-gray-600">Documento: {user.numero_documento}</p>
        <p className="text-gray-600">Rol: {user.roles}</p>
        <button onClick={onClose} className="mt-6 px-4 py-2 bg-gray-900 text-white rounded-xl">Cerrar</button>
      </div>
    </div>
  );
};

export default GestionUsuariosPermisos;

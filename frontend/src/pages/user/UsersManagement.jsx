// src/pages/admin/users/UsersManagement.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api from '../../services/apiClient';
import TabsNavigation from './components/TabsNavigation';
import FiltersPanel from './components/FiltersPanel';
import UsersTable from './components/UsersTable';
import UsersCards from './components/UsersCards';
import CrearUsuarioModal from './components/common/CrearUsuarioModal';
import ActualizarModel from './components/common/ActualizarModel';
import VerDetalleModal from './components/common/VerDetalleModal';
import ConfirmDeleteModal from './components/common/ConfirmDeleteModal';
import PaginationControls from './components/PaginationControls';
import { useToast } from '../../components/ui/Toast';

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

const esInterno = (user) => {
  const tipo = getTipoPersonal(user);
  return tipo === 'INTERNO';
};

const esExterno = (user) => {
  const tipo = getTipoPersonal(user);
  return tipo === 'EXTERNO';
};

const UsersManagement = () => {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [viewMode, setViewMode] = useState('table');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🚀 Estados de paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(7); // Tamaño fijo de página: 7 usuarios por página
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('idPers');
  const [sortDirection, setSortDirection] = useState('asc');

  const [filters, setFilters] = useState({
    rol: '',
    institucion: '',
    estado: '',
    mesCumpleanos: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const [showCrearUsuarioModal, setShowCrearUsuarioModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // 🆕 Estado para selección múltiple
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [ipressMap, setIpressMap] = useState({});
  const [ipressList, setIpressList] = useState([]);
  
  // 🆕 Toast para notificaciones
  const { showToast, ToastComponent } = useToast();

  // 🚀 Refs para mantener valores actuales sin causar recargas
  const filtersRef = useRef(filters);
  const searchTermRef = useRef(searchTerm);
  
  useEffect(() => {
    filtersRef.current = filters;
    searchTermRef.current = searchTerm;
  }, [filters, searchTerm]);

  // ============================================================
  // 🔧 FUNCIÓN AUXILIAR: Aplicar filtros a una lista de usuarios
  // ============================================================
  const applyFilters = useCallback((usersList) => {
    let filtered = [...usersList];

    // 🔍 Búsqueda general (nombre, usuario, documento, IPRESS)
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(user => {
        const nombreCompleto = (user.nombre_completo || '').toLowerCase();
        const username = (user.username || '').toLowerCase();
        const numeroDocumento = (user.numero_documento || user.num_doc_pers || '').toString().toLowerCase();
        const nombreIpress = (user.nombre_ipress || user.descIpress || '').toLowerCase();
        
        return nombreCompleto.includes(searchLower) ||
               username.includes(searchLower) ||
               numeroDocumento.includes(searchLower) ||
               nombreIpress.includes(searchLower);
      });
    }

    // 🔍 Filtro por Rol
    if (filters.rol && filters.rol !== '') {
      filtered = filtered.filter(user => {
        if (!user.roles || !Array.isArray(user.roles)) return false;
        return user.roles.some(rol => rol === filters.rol);
      });
    }

    // 🔍 Filtro por Tipo de Personal (Interno/Externo)
    if (filters.institucion && filters.institucion !== '') {
      filtered = filtered.filter(user => {
        const idIpress = user.id_ipress || user.idIpress;
        const nombreIpress = (user.nombre_ipress || user.descIpress || '').toUpperCase();
        
        if (filters.institucion === 'Interno') {
          return idIpress === 2 || nombreIpress.includes('CENTRO NACIONAL DE TELEMEDICINA');
        } else if (filters.institucion === 'Externo') {
          return idIpress && idIpress !== 2 && !nombreIpress.includes('CENTRO NACIONAL DE TELEMEDICINA');
        }
        return true;
      });
    }

    // 🔍 Filtro por Estado
    if (filters.estado && filters.estado !== '') {
      filtered = filtered.filter(user => {
        const estadoUsuario = user.estado_usuario || user.statPers || '';
        return estadoUsuario.toUpperCase() === filters.estado.toUpperCase();
      });
    }

    // 🔍 Filtro por Mes de Cumpleaños
    if (filters.mesCumpleanos && filters.mesCumpleanos !== '') {
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const mesIndex = meses.indexOf(filters.mesCumpleanos);
      
      if (mesIndex !== -1) {
        filtered = filtered.filter(user => {
          const fechaNacimiento = user.fecha_nacimiento || user.fech_naci_pers;
          if (!fechaNacimiento) return false;
          
          try {
            let date;
            if (typeof fechaNacimiento === 'string') {
              date = new Date(fechaNacimiento);
            } else if (Array.isArray(fechaNacimiento)) {
              date = new Date(fechaNacimiento[0], fechaNacimiento[1] - 1, fechaNacimiento[2]);
            } else {
              date = new Date(fechaNacimiento);
            }
            
            if (isNaN(date.getTime())) return false;
            return date.getMonth() === mesIndex;
          } catch (e) {
            return false;
          }
        });
      }
    }

    return filtered;
  }, [searchTerm, filters]);

  // ============================================================
  // 🔍 FILTRADO: Aplicar filtros a los usuarios
  // ============================================================
  const filteredUsers = useMemo(() => {
    // Aplicar filtros
    return applyFilters(users);
  }, [users, applyFilters]);

  // ============================================================
  // 🚀 PAGINACIÓN LOCAL: Paginar los resultados filtrados
  // ============================================================
  const paginatedUsers = useMemo(() => {
    const hasActiveFilters = searchTerm || 
                             (filters.rol && filters.rol !== '') ||
                             (filters.institucion && filters.institucion !== '') ||
                             (filters.estado && filters.estado !== '') ||
                             (filters.mesCumpleanos && filters.mesCumpleanos !== '');
    
    // Si hay filtros activos, paginar localmente sobre los resultados filtrados
    // Si no hay filtros, usar todos los usuarios (ya vienen paginados del servidor)
    if (hasActiveFilters) {
      const startIndex = currentPage * pageSize;
      const endIndex = startIndex + pageSize;
      return filteredUsers.slice(startIndex, endIndex);
    }
    
    // Sin filtros, devolver todos los usuarios (ya están paginados del servidor)
    return filteredUsers;
  }, [filteredUsers, currentPage, pageSize, searchTerm, filters]);

  // ============================================================
  // 🔄 CARGA DE USUARIOS Y ROLES (PAGINADO)
  // ============================================================
  const loadUsers = useCallback(async (forceReload = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // 🔍 Usar valores actuales de los filtros desde las refs
      const currentFilters = filtersRef.current;
      const currentSearchTerm = searchTermRef.current;
      
      // 🔍 Si hay filtros activos, cargar TODOS los usuarios para buscar en toda la base de datos
      const hasActiveFilters = currentSearchTerm || 
                               (currentFilters.rol && currentFilters.rol !== '') ||
                               (currentFilters.institucion && currentFilters.institucion !== '') ||
                               (currentFilters.estado && currentFilters.estado !== '') ||
                               (currentFilters.mesCumpleanos && currentFilters.mesCumpleanos !== '');
      
      // Si hay filtros, cargar TODOS los usuarios (1000) para buscar en toda la base de datos
      // Si no hay filtros, usar paginación normal (7 usuarios)
      const sizeToLoad = hasActiveFilters ? 1000 : pageSize;
      const pageToLoad = hasActiveFilters ? 0 : currentPage;
      
      console.log('🔄 Cargando usuarios - Página:', pageToLoad, 'Tamaño:', sizeToLoad, 'Filtros activos:', hasActiveFilters, 'Forzar recarga:', forceReload);
      
      // 🚀 PAGINACIÓN: Construir URL con parámetros de paginación
      const params = new URLSearchParams({
        page: pageToLoad.toString(),
        size: sizeToLoad.toString(),
        sortBy: sortBy,
        direction: sortDirection
      });
      
      // 🚀 PAGINACIÓN: Usar endpoint con paginación para mejor rendimiento
      const [usersResponse, ipressResponse] = await Promise.all([
        api.get(`/usuarios/all-personal?${params.toString()}`),
        api.get('/ipress')
      ]);
      
      console.log('📥 Respuesta del servidor (usuarios):', usersResponse);
      console.log('📥 Respuesta del servidor (ipress):', ipressResponse);
      
      // 🔍 DEBUG: Verificar estructura de la respuesta
      if (!usersResponse) {
        console.error('❌ La respuesta de usuarios está vacía o es null');
        setUsers([]);
        setTotalElements(0);
        setTotalPages(0);
        return;
      }
      
      // Extraer datos paginados - puede venir como objeto con content o como array directo
      let usersData = [];
      let total = 0;
      let totalPagesCount = 0;
      
      if (Array.isArray(usersResponse)) {
        // Si la respuesta es un array directo (formato antiguo)
        console.warn('⚠️ La respuesta es un array, no un objeto paginado. Usando formato antiguo.');
        // Si hay filtros, guardar TODOS los usuarios; si no, limitar a pageSize
        usersData = hasActiveFilters ? usersResponse : usersResponse.slice(0, pageSize);
        total = usersResponse.length;
        totalPagesCount = Math.ceil(total / pageSize);
      } else if (usersResponse.content && Array.isArray(usersResponse.content)) {
        // Si la respuesta es un objeto paginado (formato nuevo)
        // Si hay filtros, guardar TODOS los usuarios cargados; si no, limitar a pageSize
        usersData = hasActiveFilters ? usersResponse.content : usersResponse.content.slice(0, pageSize);
        total = usersResponse.totalElements || usersResponse.total || 0;
        totalPagesCount = usersResponse.totalPages || Math.ceil(total / pageSize);
      } else {
        console.error('❌ Formato de respuesta desconocido:', usersResponse);
        setUsers([]);
        setTotalElements(0);
        setTotalPages(0);
        return;
      }
      
      console.log('✅ Usuarios extraídos:', usersData.length, 'de', total, 'total (solicitados:', sizeToLoad, ', filtros activos:', hasActiveFilters, ')');
      
      // Si no hay filtros activos, actualizar totales del servidor
      // Si hay filtros, los totales se calcularán después de filtrar
      if (!hasActiveFilters) {
        setTotalElements(total);
        setTotalPages(totalPagesCount);
      }
      
      // 🚀 OPTIMIZACIÓN: Crear Map de IPRESS para búsqueda O(1) en lugar de O(n)
      const ipressMap = new Map();
      if (Array.isArray(ipressResponse)) {
        ipressResponse.forEach(ip => {
          if (ip.idIpress) {
            ipressMap.set(ip.idIpress, ip);
          }
        });
      }
      
      // Guardar lista de IPRESS
      setIpressList(Array.isArray(ipressResponse) ? ipressResponse : []);
      
      // 🚀 OPTIMIZACIÓN: Asociar cada usuario con su IPRESS usando Map (O(1) vs O(n))
      const usersWithIpress = usersData.map(user => {
        // Intentar con ambos nombres de campo posibles
        const ipressId = user.idIpress || user.id_ipress;
        
        if (ipressId && ipressMap.has(ipressId)) {
          const ipress = ipressMap.get(ipressId);
          return {
            ...user,
            nombre_ipress: ipress.descIpress,
            codigo_ipress: ipress.codIpress
          };
        }
        return user;
      });
      
      // 🚀 Si hay filtros activos, guardar todos los usuarios cargados (se filtrarán después)
      // Si no hay filtros, limitar a pageSize
      const finalUsers = hasActiveFilters ? usersWithIpress : usersWithIpress.slice(0, pageSize);
      
      console.log('✅ Usuarios procesados:', finalUsers.length, '(esperados:', hasActiveFilters ? 'todos para filtrar' : pageSize, ')');
      
      setUsers(finalUsers);
      
      // Si hay filtros activos, los totales se calcularán después de filtrar
      // Si no hay filtros, usar los totales del servidor
      if (!hasActiveFilters) {
        setTotalElements(total);
        setTotalPages(totalPagesCount);
      }
    } catch (err) {
      console.error('❌ Error al cargar usuarios:', err);
      console.error('❌ Detalles del error:', err.message, err.stack);
      setError(`Error al cargar los usuarios: ${err.message || 'Error desconocido'}`);
      setUsers([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortBy, sortDirection]);

  const loadRoles = useCallback(async () => {
    try {
      const response = await api.get('/admin/roles');
      console.log('✅ Roles cargados:', response);
      setRoles(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('❌ Error al cargar roles:', error);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [loadUsers, loadRoles]);

  // 🚀 Resetear a primera página cuando cambian filtros o búsqueda (sin recargar del servidor)
  useEffect(() => {
    if (currentPage > 0) {
      setCurrentPage(0);
    }
  }, [filters, searchTerm]);

  // 🚀 Cargar todos los usuarios cuando se activan filtros por primera vez
  useEffect(() => {
    const hasActiveFilters = searchTerm || 
                             (filters.rol && filters.rol !== '') ||
                             (filters.institucion && filters.institucion !== '') ||
                             (filters.estado && filters.estado !== '') ||
                             (filters.mesCumpleanos && filters.mesCumpleanos !== '');
    
    // Si hay filtros activos y tenemos menos de 100 usuarios cargados, cargar todos
    if (hasActiveFilters && users.length < 100) {
      console.log('🔍 Filtros activos detectados, cargando todos los usuarios para buscar en toda la base de datos...');
      loadUsers(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filters.rol, filters.institucion, filters.estado, filters.mesCumpleanos]); // Solo cuando cambian los filtros

  // 🚀 Actualizar totales cuando hay filtros activos (basándose en filteredUsers)
  useEffect(() => {
    const hasActiveFilters = searchTerm || 
                             (filters.rol && filters.rol !== '') ||
                             (filters.institucion && filters.institucion !== '') ||
                             (filters.estado && filters.estado !== '') ||
                             (filters.mesCumpleanos && filters.mesCumpleanos !== '');
    
    if (hasActiveFilters) {
      // Calcular totales basándose en los resultados filtrados
      const filteredCount = filteredUsers.length;
      const totalPagesCount = Math.ceil(filteredCount / pageSize);
      setTotalElements(filteredCount);
      setTotalPages(totalPagesCount);
      console.log('🔍 Filtros activos - Total filtrado:', filteredCount, 'Páginas:', totalPagesCount);
    }
  }, [filteredUsers, searchTerm, filters, pageSize]);

  // 🚀 Función para actualizar manualmente la tabla
  const handleRefresh = useCallback(() => {
    console.log('🔄 Actualizando tabla manualmente...');
    loadUsers(true);
  }, [loadUsers]);

  // ============================================================
  // 🚀 HANDLERS DE PAGINACIÓN
  // ============================================================
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      // Cambiar dirección si es el mismo campo
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nuevo campo, ordenar ascendente por defecto
      setSortBy(field);
      setSortDirection('asc');
    }
    setCurrentPage(0); // Resetear a primera página
  }, [sortBy, sortDirection]);


  // 🚀 Actualizar totales cuando hay filtros activos
  useEffect(() => {
    const hasActiveFilters = searchTerm || 
                             (filters.rol && filters.rol !== '') ||
                             (filters.institucion && filters.institucion !== '') ||
                             (filters.estado && filters.estado !== '') ||
                             (filters.mesCumpleanos && filters.mesCumpleanos !== '');
    
    if (hasActiveFilters) {
      // Calcular totales basados en usuarios filtrados
      const filtered = applyFilters(users);
      const totalFiltered = filtered.length;
      const totalPagesFiltered = Math.ceil(totalFiltered / pageSize);
      
      setTotalElements(totalFiltered);
      setTotalPages(totalPagesFiltered);
    }
    // Si no hay filtros activos, los totales se actualizarán en loadUsers
  }, [users, applyFilters, pageSize, searchTerm, filters]);

  // ============================================================
  // 🆕 SELECCIÓN MÚLTIPLE
  // ============================================================
  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      // Seleccionar todos los usuarios filtrados
      setSelectedUsers(filteredUsers.map(u => u.id_user));
    } else {
      // Deseleccionar todos
      setSelectedUsers([]);
    }
  }, [filteredUsers]);

  const handleSelectUser = useCallback((userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        // Deseleccionar
        return prev.filter(id => id !== userId);
      } else {
        // Seleccionar
        return [...prev, userId];
      }
    });
  }, []);

  const handleEliminarSeleccionados = async () => {
    if (selectedUsers.length === 0) {
      alert('⚠️ Debe seleccionar al menos un usuario para eliminar');
      return;
    }

    const confirmacion = window.confirm(
      `¿Está seguro de eliminar ${selectedUsers.length} usuario(s) seleccionado(s)?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmacion) return;

    try {
      // Eliminar usuarios en paralelo
      await Promise.all(
        selectedUsers.map(userId => api.delete(`/usuarios/id/${userId}`))
      );
      
      alert(`✅ ${selectedUsers.length} usuario(s) eliminado(s) correctamente`);
      setSelectedUsers([]);
      loadUsers();
    } catch (error) {
      console.error('Error al eliminar usuarios:', error);
      alert('❌ Error al eliminar algunos usuarios. Por favor intente nuevamente.');
    }
  };

  // ============================================================
  // 🧩 ACCIONES DE USUARIO
  // ============================================================
  const handleVerDetalle = (user) => {
    setSelectedUser(user);
    setShowDetalleModal(true);
  };

  const handleEditarUsuario = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleEliminarUsuario = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // 🆕 NUEVA FUNCIÓN: Crear usuario para personal sin cuenta
  const handleCreateUser = (personalData) => {
    console.log('👨 Crear usuario para:', personalData);
    // Pre-cargar el modal con los datos del personal
    setSelectedUser(personalData);
    setShowCrearUsuarioModal(true);
  };

  // ✅ NUEVA FUNCIÓN: Cambiar estado ACTIVO/INACTIVO (con actualización optimista)
  const handleToggleEstado = async (user) => {
    try {
      const nuevoEstado = user.estado_usuario === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
      const accion = nuevoEstado === 'ACTIVO' ? 'activar' : 'desactivar';
      
      console.log(`🔄 Cambiando estado de ${user.username} a ${nuevoEstado}...`);

      // ✅ ACTUALIZACIÓN INMEDIATA EN LA UI (sin esperar respuesta del servidor)
      // Esto evita que la tabla se reordene mientras esperamos
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id_user === user.id_user
            ? { 
                ...u, 
                estado_usuario: nuevoEstado, 
                activo: nuevoEstado === 'ACTIVO',
                estado: nuevoEstado === 'ACTIVO' ? 'A' : 'I'
              }
            : u
        )
      );

      // Llamar al backend para persistir el cambio
      if (nuevoEstado === 'ACTIVO') {
        await api.put(`/usuarios/id/${user.id_user}/activate`);
      } else {
        await api.put(`/usuarios/id/${user.id_user}/deactivate`);
      }

      // ✅ Mostrar Toast de éxito
      showToast(
        `Usuario ${user.username} ${accion === 'activar' ? 'activado' : 'desactivado'} exitosamente`,
        'success'
      );

      console.log(`✅ Estado actualizado correctamente: ${user.username} → ${nuevoEstado}`);

    } catch (error) {
      console.error('❌ Error al cambiar estado:', error);
      
      // ❌ Si falla, revertir el cambio en la UI
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id_user === user.id_user
            ? { 
                ...u, 
                estado_usuario: user.estado_usuario, 
                activo: user.estado_usuario === 'ACTIVO',
                estado: user.estado_usuario === 'ACTIVO' ? 'A' : 'I'
              }
            : u
        )
      );

      // ✅ Mostrar Toast de error
      showToast(
        `Error al cambiar estado: ${error.response?.data?.message || error.message}`,
        'error'
      );
    }
  };

  const confirmarEliminar = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/usuarios/id/${userToDelete.id_user}`);
      alert(`Usuario eliminado correctamente`);
      loadUsers();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('No se pudo eliminar el usuario.');
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };


  // ============================================================
  // 🎨 RENDER
  // ============================================================
  return (
    <>
      {ToastComponent}
      <div className="min-h-screen bg-gray-50">
      <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'usuarios' && (
        <>
          <FiltersPanel
            filters={filters}
            setFilters={setFilters}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onNewUser={() => setShowCrearUsuarioModal(true)}
            selectedCount={selectedUsers.length}
            onDeleteSelected={handleEliminarSeleccionados}
            viewMode={viewMode}
            setViewMode={setViewMode}
            roles={roles}
            onRefresh={handleRefresh}
          />

          {viewMode === 'table' ? (
            <>
              <UsersTable
                users={paginatedUsers}
                loading={loading}
                onViewDetail={handleVerDetalle}
                onEdit={handleEditarUsuario}
                onDelete={handleEliminarUsuario}
                onToggleEstado={handleToggleEstado}  // ✅ Nueva prop
                onCreateUser={handleCreateUser}  // 🆕 Nueva prop para crear usuario
                selectedUsers={selectedUsers}
                onSelectAll={handleSelectAll}
                onSelectUser={handleSelectUser}
                showBirthdayColumn={!!filters.mesCumpleanos}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              {/* 🚀 Controles de paginación */}
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </>
          ) : (
            <>
              <UsersCards
                users={paginatedUsers}
                loading={loading}
                onViewDetail={handleVerDetalle}
                onEdit={handleEditarUsuario}
                onDelete={handleEliminarUsuario}
                onToggleEstado={handleToggleEstado}  // ✅ Nueva prop
                onCreateUser={handleCreateUser}  // 🆕 Nueva prop para crear usuario
                selectedUsers={selectedUsers}
                onSelectUser={handleSelectUser}
              />
              {/* 🚀 Controles de paginación */}
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </>
          )}
        </>
      )}

      {showCrearUsuarioModal && (
        <CrearUsuarioModal
          onClose={() => setShowCrearUsuarioModal(false)}
          onSuccess={loadUsers}
          ipressList={ipressList}
        />
      )}
      {showEditModal && selectedUser && (
        <ActualizarModel
          user={selectedUser}
          onClose={() => setShowEditModal(false)}
          onSuccess={loadUsers}
        />
      )}
      {showDetalleModal && selectedUser && (
        <VerDetalleModal
          user={selectedUser}
          onClose={() => setShowDetalleModal(false)}
        />
      )}
      {showDeleteModal && (
        <ConfirmDeleteModal
          user={userToDelete}
          onConfirm={confirmarEliminar}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
      </div>
    </>
  );
};

export default UsersManagement;
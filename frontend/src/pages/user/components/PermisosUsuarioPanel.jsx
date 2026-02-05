// ============================================================
// 🔐 PermisosUsuarioPanel.jsx - Panel de gestión de permisos por usuario
// ------------------------------------------------------------
// Diseño UX/UI mejorado con tabla visual de permisos
// ============================================================

import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
  Shield,
  ChevronDown,
  ChevronRight,
  Check,
  Loader2,
  FolderOpen,
  Eye,
  Plus,
  Edit3,
  Pencil,
  Trash2,
  Download,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  RotateCcw
} from 'lucide-react';
import axios from 'axios';
import { getToken } from '../../../constants/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Configuración de permisos con clases explícitas para Tailwind
const PERMISOS_CONFIG = [
  { key: 'ver', label: 'Ver', icon: Eye, bgActive: 'bg-blue-500', bgIcon: 'bg-blue-500', textIcon: 'text-blue-500' },
  { key: 'crear', label: 'Crear', icon: Plus, bgActive: 'bg-green-500', bgIcon: 'bg-green-500', textIcon: 'text-green-500' },
  { key: 'editar', label: 'Editar', icon: Edit3, bgActive: 'bg-amber-500', bgIcon: 'bg-amber-500', textIcon: 'text-amber-500' },
  { key: 'eliminar', label: 'Eliminar', icon: Trash2, bgActive: 'bg-red-500', bgIcon: 'bg-red-500', textIcon: 'text-red-500' },
  { key: 'exportar', label: 'Exportar', icon: Download, bgActive: 'bg-purple-500', bgIcon: 'bg-purple-500', textIcon: 'text-purple-500' },
  { key: 'aprobar', label: 'Aprobar', icon: CheckCircle, bgActive: 'bg-emerald-500', bgIcon: 'bg-emerald-500', textIcon: 'text-emerald-500' },
];

const PermisosUsuarioPanel = forwardRef(({
  userId,
  userRoles = [],
  onRolesChange,
  token,
  readOnly = false,
  onPermisosChange  // Callback para notificar cambios de permisos al padre
}, ref) => {
  // Estados
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingRolePermisos, setLoadingRolePermisos] = useState(false);
  const [error, setError] = useState(null);

  // Datos
  const [rolesSeleccionados, setRolesSeleccionados] = useState(userRoles);
  const [rolesAnteriores, setRolesAnteriores] = useState(userRoles); // Para detectar cambios de roles
  const [modulos, setModulos] = useState([]);
  const [permisosUsuario, setPermisosUsuario] = useState({});
  const [permisosOriginales, setPermisosOriginales] = useState({}); // Para detectar cambios
  const [modulosExpandidos, setModulosExpandidos] = useState({});

  // UI State
  const [mostrarRoles, setMostrarRoles] = useState(false);
  const [permisosPredeterminadosCargados, setPermisosPredeterminadosCargados] = useState(false);

  // Obtener headers con token
  const getHeaders = useCallback(() => {
    const storedToken = token || getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${storedToken}`
    };
  }, [token]);

  // Cargar módulos del sistema con sus páginas
  const cargarModulos = useCallback(async () => {
    try {
      const [modulosRes, paginasRes] = await Promise.all([
        axios.get(`${API_URL}/mbac/modulos`, { headers: getHeaders() }),
        axios.get(`${API_URL}/mbac/paginas`, { headers: getHeaders() })
      ]);

      const modulosData = modulosRes.data || [];
      const paginasData = paginasRes.data || [];

      // Agrupar páginas por idModulo
      const paginasPorModulo = {};
      paginasData.forEach(pagina => {
        const idMod = pagina.idModulo;
        if (!paginasPorModulo[idMod]) {
          paginasPorModulo[idMod] = [];
        }
        paginasPorModulo[idMod].push(pagina);
      });

      // Asignar páginas a cada módulo
      const modulosConPaginas = modulosData.map(modulo => ({
        ...modulo,
        paginas: paginasPorModulo[modulo.idModulo] || []
      }));

      setModulos(modulosConPaginas);
    } catch (err) {
      console.error('Error al cargar módulos:', err);
      throw err;
    }
  }, [getHeaders]);

  // Cargar permisos actuales del usuario
  const cargarPermisosUsuario = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await axios.get(
        `${API_URL}/permisos/usuario/${userId}`,
        { headers: getHeaders() }
      );

      const permisosMap = {};
      (response.data || []).forEach(permiso => {
        const ruta = permiso.rutaPagina || permiso.ruta_pagina;
        if (ruta) {
          permisosMap[ruta] = {
            ver: permiso.ver || permiso.puedeVer || false,
            crear: permiso.crear || permiso.puedeCrear || false,
            editar: permiso.editar || permiso.puedeEditar || false,
            eliminar: permiso.eliminar || permiso.puedeEliminar || false,
            exportar: permiso.exportar || permiso.puedeExportar || false,
            aprobar: permiso.aprobar || permiso.puedeAprobar || false,
          };
        }
      });

      setPermisosUsuario(permisosMap);
      setPermisosOriginales(JSON.parse(JSON.stringify(permisosMap))); // Copia profunda
    } catch (err) {
      console.error('Error al cargar permisos:', err);
    }
  }, [userId, getHeaders]);

  // Cargar permisos predeterminados por roles
  const cargarPermisosPredeterminadosPorRoles = useCallback(async (roles) => {
    if (!roles || roles.length === 0) {
      console.log('⚠️ No hay roles para cargar permisos predeterminados');
      return;
    }

    setLoadingRolePermisos(true);
    try {
      console.log('🔍 Cargando permisos predeterminados para roles:', roles);
      const response = await axios.post(
        `${API_URL}/permisos/roles/predeterminados`,
        roles,
        { headers: getHeaders() }
      );

      const permisosPredeterminados = response.data || [];
      console.log('📦 Permisos predeterminados recibidos:', permisosPredeterminados.length);

      if (permisosPredeterminados.length === 0) {
        console.log('⚠️ No se encontraron permisos predeterminados para estos roles');
        return;
      }

      // Convertir a mapa por ruta
      const permisosMap = {};
      permisosPredeterminados.forEach(permiso => {
        const ruta = permiso.rutaPagina || permiso.ruta_pagina;
        if (ruta) {
          permisosMap[ruta] = {
            ver: permiso.ver || permiso.puedeVer || false,
            crear: permiso.crear || permiso.puedeCrear || false,
            editar: permiso.editar || permiso.puedeEditar || false,
            eliminar: permiso.eliminar || permiso.puedeEliminar || false,
            exportar: permiso.exportar || permiso.puedeExportar || false,
            aprobar: permiso.aprobar || permiso.puedeAprobar || false,
          };
        }
      });

      console.log('✅ Aplicando permisos predeterminados:', Object.keys(permisosMap).length, 'rutas');
      setPermisosUsuario(permisosMap);
    } catch (err) {
      console.error('❌ Error al cargar permisos predeterminados:', err);
    } finally {
      setLoadingRolePermisos(false);
    }
  }, [getHeaders]);

  // Guardar permisos en el backend usando endpoint batch
  const guardarPermisos = useCallback(async () => {
    if (!userId || readOnly) return { success: true, message: 'Sin cambios' };

    setSaving(true);
    try {
      // Buscar información de páginas para obtener idModulo e idPagina
      const paginasMap = {};
      modulos.forEach(modulo => {
        modulo.paginas.forEach(pagina => {
          paginasMap[pagina.rutaPagina] = {
            idPagina: pagina.idPagina,
            idModulo: modulo.idModulo
          };
        });
      });

      // Preparar los permisos a guardar
      const permisosAGuardar = [];

      Object.entries(permisosUsuario).forEach(([rutaPagina, permisos]) => {
        const paginaInfo = paginasMap[rutaPagina];
        if (!paginaInfo) {
          console.warn(`No se encontró información para la ruta: ${rutaPagina}`);
          return;
        }

        // Solo guardar si hay al menos un permiso activo
        const tienePermisos = Object.values(permisos).some(v => v === true);
        if (tienePermisos) {
          permisosAGuardar.push({
            idUser: userId,
            idModulo: paginaInfo.idModulo,
            idPagina: paginaInfo.idPagina,
            rutaPagina: rutaPagina,
            accion: 'all',
            ver: permisos.ver || false,
            crear: permisos.crear || false,
            editar: permisos.editar || false,
            eliminar: permisos.eliminar || false,
            exportar: permisos.exportar || false,
            aprobar: permisos.aprobar || false
          });
        }
      });

      console.log('📤 Permisos a guardar:', permisosAGuardar);

      if (permisosAGuardar.length > 0) {
        // Usar endpoint batch para guardar todos los permisos de una vez
        await axios.post(
          `${API_URL}/permisos/batch/${userId}`,
          permisosAGuardar,
          { headers: getHeaders() }
        );
        console.log('✅ Permisos guardados exitosamente');
      }

      // Actualizar permisos originales
      setPermisosOriginales(JSON.parse(JSON.stringify(permisosUsuario)));

      return { success: true, message: 'Permisos guardados correctamente' };
    } catch (err) {
      console.error('Error al guardar permisos:', err);
      return { success: false, message: err.response?.data?.message || err.message };
    } finally {
      setSaving(false);
    }
  }, [userId, readOnly, modulos, permisosUsuario, getHeaders]);

  // Verificar si hay cambios sin guardar
  const hayCambios = useCallback(() => {
    return JSON.stringify(permisosUsuario) !== JSON.stringify(permisosOriginales);
  }, [permisosUsuario, permisosOriginales]);

  // Exponer métodos al componente padre via ref
  useImperativeHandle(ref, () => ({
    guardarPermisos,
    hayCambios,
    getPermisos: () => permisosUsuario,
    isSaving: () => saving,
    cargarPermisosPredeterminadosPorRoles // Exponer para que el padre pueda llamarlo
  }), [guardarPermisos, hayCambios, permisosUsuario, saving, cargarPermisosPredeterminadosPorRoles]);

  // Notificar cambios al padre
  useEffect(() => {
    if (onPermisosChange) {
      onPermisosChange(permisosUsuario, hayCambios());
    }
  }, [permisosUsuario, onPermisosChange, hayCambios]);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([cargarModulos(), cargarPermisosUsuario()]);
      } catch (err) {
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    const hasToken = token || getToken();
    if (hasToken && userId) {
      cargarDatos();
    } else if (!hasToken) {
      setLoading(false);
      setError('No se encontró token de autenticación');
    } else if (!userId) {
      setLoading(false);
    }
  }, [token, userId, cargarModulos, cargarPermisosUsuario]);

  // Sincronizar roles externos y detectar cambios
  useEffect(() => {
    setRolesSeleccionados(userRoles);

    // Detectar si los roles cambiaron (nuevo rol agregado o rol removido)
    const rolesActualesSet = new Set(userRoles);
    const rolesAnterioresSet = new Set(rolesAnteriores);

    // Verificar si hay diferencias
    const hayNuevosRoles = userRoles.some(rol => !rolesAnterioresSet.has(rol));
    const hayRolesRemovidos = rolesAnteriores.some(rol => !rolesActualesSet.has(rol));

    if (hayNuevosRoles || hayRolesRemovidos) {
      console.log('🔄 Cambio de roles detectado:', {
        anteriores: rolesAnteriores,
        actuales: userRoles,
        nuevos: userRoles.filter(r => !rolesAnterioresSet.has(r)),
        removidos: rolesAnteriores.filter(r => !rolesActualesSet.has(r))
      });

      if (hayNuevosRoles && userRoles.length > 0) {
        // Siempre cargar los permisos predeterminados cuando hay nuevos roles
        cargarPermisosPredeterminadosPorRoles(userRoles);
      }

      // Actualizar roles anteriores
      setRolesAnteriores(userRoles);
    }
  }, [userRoles, rolesAnteriores, cargarPermisosPredeterminadosPorRoles]);

  // Cargar permisos predeterminados en la carga inicial
  useEffect(() => {
    // Solo ejecutar después de que se cargaron los permisos del usuario y módulos
    if (!loading && userRoles.length > 0 && Object.keys(modulos).length > 0 && !permisosPredeterminadosCargados) {
      // Cargar los permisos predeterminados cuando hay roles
      // Esto asegura que se muestren todas las páginas del rol, incluso si el usuario
      // ya tiene algunos permisos personalizados guardados
      console.log('📋 Cargando permisos predeterminados para roles:', userRoles);
      cargarPermisosPredeterminadosPorRoles(userRoles);
      setPermisosPredeterminadosCargados(true);
    }
  }, [loading, userRoles, modulos, permisosPredeterminadosCargados, cargarPermisosPredeterminadosPorRoles]);

  // Toggle módulo expandido
  const toggleModulo = (idModulo) => {
    setModulosExpandidos(prev => ({
      ...prev,
      [idModulo]: !prev[idModulo]
    }));
  };

  // Toggle permiso individual
  const handlePermisoToggle = (rutaPagina, tipoPermiso) => {
    if (readOnly) return;

    setPermisosUsuario(prev => {
      const permisoActual = prev[rutaPagina] || {};
      const nuevoPermiso = {
        ...permisoActual,
        [tipoPermiso]: !permisoActual[tipoPermiso]
      };

      // 🔐 LÓGICA AUTOMÁTICA: Si se marca cualquier acción (crear, editar, eliminar, exportar, aprobar)
      // automáticamente marcar "ver" = true (no puedes actuar en algo que no puedes ver)
      const tieneAcciones = nuevoPermiso.crear || nuevoPermiso.editar ||
                           nuevoPermiso.eliminar || nuevoPermiso.exportar ||
                           nuevoPermiso.aprobar;

      if (tieneAcciones && !nuevoPermiso.ver) {
        nuevoPermiso.ver = true; // Auto-activar "ver" si hay cualquier otra acción
      }

      return {
        ...prev,
        [rutaPagina]: nuevoPermiso
      };
    });
  };

  // Toggle todos los permisos de una página
  // Si tiene al menos un permiso activo -> quita todos
  // Si no tiene ninguno -> activa todos
  const handleToggleAllPagina = (rutaPagina) => {
    if (readOnly) return;

    const permisosActuales = permisosUsuario[rutaPagina] || {};
    const tieneAlgunPermiso = Object.values(permisosActuales).some(v => v === true);

    setPermisosUsuario(prev => {
      const nuevoPermiso = PERMISOS_CONFIG.reduce((acc, p) => {
        // Si tiene algún permiso, quitar todos. Si no tiene ninguno, activar todos.
        acc[p.key] = !tieneAlgunPermiso;
        return acc;
      }, {});

      // 🔐 LÓGICA AUTOMÁTICA: Si se activan otros permisos, asegurar que "ver" también esté activo
      if (!tieneAlgunPermiso) { // Si estamos ACTIVANDO todos los permisos
        // Verificar si hay acciones marcadas y activar "ver" automáticamente
        const tieneAcciones = nuevoPermiso.crear || nuevoPermiso.editar ||
                             nuevoPermiso.eliminar || nuevoPermiso.exportar ||
                             nuevoPermiso.aprobar;
        if (tieneAcciones) {
          nuevoPermiso.ver = true;
        }
      }

      return {
        ...prev,
        [rutaPagina]: nuevoPermiso
      };
    });
  };

  // Toggle todos los permisos de un módulo
  const handleToggleAllModulo = (modulo) => {
    if (readOnly) return;

    // Verificar si todas las páginas tienen todos los permisos
    const todasActivas = modulo.paginas.every(pagina => {
      const permisos = permisosUsuario[pagina.rutaPagina] || {};
      return PERMISOS_CONFIG.every(p => permisos[p.key]);
    });

    const nuevosPermisos = { ...permisosUsuario };
    modulo.paginas.forEach(pagina => {
      const nuevoPermiso = PERMISOS_CONFIG.reduce((acc, p) => {
        acc[p.key] = !todasActivas;
        return acc;
      }, {});

      // 🔐 LÓGICA AUTOMÁTICA: Si se activan otros permisos, asegurar que "ver" también esté activo
      if (!todasActivas) { // Si estamos ACTIVANDO todos los permisos
        const tieneAcciones = nuevoPermiso.crear || nuevoPermiso.editar ||
                             nuevoPermiso.eliminar || nuevoPermiso.exportar ||
                             nuevoPermiso.aprobar;
        if (tieneAcciones) {
          nuevoPermiso.ver = true;
        }
      }

      nuevosPermisos[pagina.rutaPagina] = nuevoPermiso;
    });

    setPermisosUsuario(nuevosPermisos);
  };

  // Contar permisos activos en un módulo
  const contarPermisosModulo = (modulo) => {
    let count = 0;
    modulo.paginas.forEach(pagina => {
      const permisos = permisosUsuario[pagina.rutaPagina];
      if (permisos) {
        count += Object.values(permisos).filter(v => v === true).length;
      }
    });
    return count;
  };

  // Verificar si todos los permisos de un módulo están activos
  const moduloTodoActivo = (modulo) => {
    if (modulo.paginas.length === 0) return false;
    return modulo.paginas.every(pagina => {
      const permisos = permisosUsuario[pagina.rutaPagina] || {};
      return PERMISOS_CONFIG.every(p => permisos[p.key]);
    });
  };

  // Verificar si el módulo tiene al menos un permiso activo (tiene acceso)
  const moduloTieneAcceso = (modulo) => {
    if (modulo.paginas.length === 0) return false;
    return modulo.paginas.some(pagina => {
      const permisos = permisosUsuario[pagina.rutaPagina] || {};
      return Object.values(permisos).some(v => v === true);
    });
  };

  // Verificar si todos los permisos de una página están activos
  const paginaTodoActivo = (rutaPagina) => {
    const permisos = permisosUsuario[rutaPagina] || {};
    return PERMISOS_CONFIG.every(p => permisos[p.key]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Cargando permisos...</span>
      </div>
    );
  }

  if (loadingRolePermisos) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="ml-3 text-gray-600">Aplicando permisos predeterminados del rol...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16 text-red-600">
        <AlertCircle className="w-6 h-6 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sección de Roles - Compacta */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setMostrarRoles(!mostrarRoles)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Roles Asignados</span>
            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
              {rolesSeleccionados.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!mostrarRoles && rolesSeleccionados.length > 0 && (
              <div className="flex gap-1">
                {rolesSeleccionados.slice(0, 2).map((rol, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded">
                    {rol}
                  </span>
                ))}
                {rolesSeleccionados.length > 2 && (
                  <span className="px-2 py-0.5 bg-gray-400 text-white text-xs font-medium rounded">
                    +{rolesSeleccionados.length - 2}
                  </span>
                )}
              </div>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${mostrarRoles ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {mostrarRoles && (
          <div className="px-4 py-3 border-t border-blue-200 bg-white/50">
            <div className="flex flex-wrap gap-2">
              {rolesSeleccionados.map((rol, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  <Check className="w-3.5 h-3.5" />
                  {rol}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Modifica los roles en la pestaña "Roles del Sistema"
            </p>
          </div>
        )}
      </div>

      {/* Sección de Permisos - Diseño de Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header con título y descripción */}
        <div className="px-4 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-gray-900">Acceso a Páginas del Sistema</span>
            </div>
            <button
              type="button"
              onClick={() => {
                cargarPermisosUsuario();
                cargarModulos();
              }}
              className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Recargar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Selecciona las páginas a las que el usuario tendrá acceso. Los permisos están agrupados por módulos.
          </p>
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center">
                <Eye className="w-2.5 h-2.5 text-white" />
              </div>
              <span>Ver</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-green-500 flex items-center justify-center">
                <Plus className="w-2.5 h-2.5 text-white" />
              </div>
              <span>Crear</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-amber-500 flex items-center justify-center">
                <Pencil className="w-2.5 h-2.5 text-white" />
              </div>
              <span>Editar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-red-500 flex items-center justify-center">
                <Trash2 className="w-2.5 h-2.5 text-white" />
              </div>
              <span>Eliminar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-purple-500 flex items-center justify-center">
                <Download className="w-2.5 h-2.5 text-white" />
              </div>
              <span>Exportar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-2.5 h-2.5 text-white" />
              </div>
              <span>Aprobar</span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {/* Ordenar módulos alfabéticamente */}
          {[...modulos].sort((a, b) => a.nombreModulo.localeCompare(b.nombreModulo)).map((modulo) => {
            const isExpanded = modulosExpandidos[modulo.idModulo];
            const cantidadPermisos = contarPermisosModulo(modulo);
            const tieneAcceso = moduloTieneAcceso(modulo);
            const todoActivo = moduloTodoActivo(modulo);
            const tienePaginas = modulo.paginas.length > 0;

            return (
              <div key={modulo.idModulo} className={tieneAcceso ? 'bg-emerald-50/30' : ''}>
                {/* Header del Módulo */}
                <div
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isExpanded ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => tienePaginas && toggleModulo(modulo.idModulo)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* Indicador visual de acceso */}
                    <div className={`w-1 h-10 rounded-full ${tieneAcceso ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                    {tienePaginas ? (
                      isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )
                    ) : (
                      <div className="w-4" />
                    )}
                    <div>
                      <p className={`font-medium ${tieneAcceso ? 'text-gray-900' : 'text-gray-500'}`}>{modulo.nombreModulo}</p>
                      <p className="text-xs text-gray-500">{modulo.descripcion}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {tienePaginas && (
                      <>
                        <span className="text-xs text-gray-400">
                          {modulo.paginas.length} página{modulo.paginas.length !== 1 ? 's' : ''}
                        </span>
                        {cantidadPermisos > 0 && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                            {cantidadPermisos} permisos
                          </span>
                        )}
                        {!readOnly && (
                          <div className="flex items-center gap-1">
                            {/* Botón resetear a permisos del rol */}
                            {tieneAcceso && userRoles.length > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cargarPermisosPredeterminadosPorRoles(userRoles);
                                }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                title="Resetear a permisos del rol"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                            {/* Botón de acceso */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleAllModulo(modulo);
                              }}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                                tieneAcceso
                                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
                              }`}
                              title={tieneAcceso ? 'Quitar todos los permisos' : 'Activar todos los permisos'}
                            >
                              {tieneAcceso ? (
                                <>
                                  <Eye className="w-4 h-4" />
                                  <span className="text-xs font-medium">Con acceso</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-4 h-4" />
                                  <span className="text-xs font-medium">Sin acceso</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Contenido Expandido - Tabla de Permisos */}
                {isExpanded && tienePaginas && (
                  <div className="ml-6 mr-2 mb-3 mt-1 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    {/* Header de la tabla - Estilo destacado */}
                    <div className="flex items-center px-4 py-3 bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-200">
                      <div className="flex-1 min-w-[180px] flex items-center gap-2">
                        <div className="w-1.5 h-5 bg-blue-500 rounded-full"></div>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Página</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {PERMISOS_CONFIG.map(({ key, label, icon: Icon, bgIcon }) => (
                          <div key={key} className="w-9 flex justify-center" title={label}>
                            <div className={`w-6 h-6 rounded-md ${bgIcon} bg-opacity-20 flex items-center justify-center`}>
                              <Icon className={`w-3.5 h-3.5 ${bgIcon.replace('bg-', 'text-')}`} />
                            </div>
                          </div>
                        ))}
                        {/* Columna de acceso - solo título */}
                        <div className="w-9 flex justify-center" title="Acceso a la página">
                          <span className="text-xs font-medium text-gray-500">On/Off</span>
                        </div>
                      </div>
                    </div>

                    {/* Filas de páginas */}
                    {modulo.paginas.map((pagina, idx) => {
                      const permisos = permisosUsuario[pagina.rutaPagina] || {};
                      const todoActivo = paginaTodoActivo(pagina.rutaPagina);
                      const tieneAlguno = Object.values(permisos).some(v => v === true);
                      const isLast = idx === modulo.paginas.length - 1;

                      return (
                        <div
                          key={pagina.idPagina}
                          className={`flex items-center px-4 py-3 transition-all duration-150 ${
                            !isLast ? 'border-b border-gray-100' : ''
                          } ${
                            tieneAlguno
                              ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                              : 'bg-white hover:bg-gray-50/80'
                          }`}
                        >
                          {/* Indicador visual + Nombre de página */}
                          <div className="flex-1 min-w-[180px] pr-4 flex items-start gap-3">
                            <div className={`w-1 h-10 rounded-full mt-0.5 ${
                              tieneAlguno ? 'bg-emerald-400' : 'bg-gray-200'
                            }`}></div>
                            <div className="flex-1">
                              <p className={`text-sm font-medium truncate ${
                                tieneAlguno ? 'text-gray-800' : 'text-gray-600'
                              }`} title={pagina.nombrePagina}>
                                {pagina.nombrePagina}
                              </p>
                              <p className="text-xs text-gray-400 truncate" title={pagina.rutaPagina}>
                                {pagina.rutaPagina}
                              </p>
                            </div>
                          </div>

                          {/* Checkboxes de permisos */}
                          <div className="flex items-center gap-1">
                            {PERMISOS_CONFIG.map(({ key, bgActive }) => {
                              const isActive = permisos[key] || false;

                              return (
                                <div key={key} className="w-9 flex justify-center">
                                  <button
                                    type="button"
                                    onClick={() => handlePermisoToggle(pagina.rutaPagina, key)}
                                    disabled={readOnly}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 ${
                                      readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-105'
                                    } ${
                                      isActive
                                        ? `${bgActive} text-white shadow-md`
                                        : 'bg-gray-100 text-gray-300 hover:bg-gray-200 border border-gray-200'
                                    }`}
                                  >
                                    {isActive && <Check className="w-4 h-4" />}
                                  </button>
                                </div>
                              );
                            })}

                            {/* Toggle acceso - Se activa si tiene al menos un permiso */}
                            <div className="w-9 flex justify-center">
                              <button
                                type="button"
                                onClick={() => handleToggleAllPagina(pagina.rutaPagina)}
                                disabled={readOnly}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 border ${
                                  readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-105'
                                } ${
                                  tieneAlguno
                                    ? 'text-emerald-600 bg-emerald-100 border-emerald-300 hover:bg-emerald-200'
                                    : 'text-gray-400 bg-gray-50 border-gray-200 hover:bg-gray-100'
                                }`}
                                title={tieneAlguno ? 'Quitar todos los permisos' : 'Activar todos los permisos'}
                              >
                                {tieneAlguno ? (
                                  <ToggleRight className="w-4 h-4" />
                                ) : (
                                  <ToggleLeft className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Mensaje si no tiene páginas */}
                {isExpanded && !tienePaginas && (
                  <div className="px-4 py-6 text-center text-gray-500 text-sm bg-gray-50">
                    Este módulo no tiene páginas configuradas
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="flex flex-wrap items-center justify-center gap-4 px-4 py-3 bg-gray-50 rounded-xl text-xs text-gray-600">
        {PERMISOS_CONFIG.map(({ key, label, icon: Icon, bgIcon }) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded flex items-center justify-center ${bgIcon} text-white`}>
              <Icon className="w-3 h-3" />
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

PermisosUsuarioPanel.displayName = 'PermisosUsuarioPanel';

export default PermisosUsuarioPanel;

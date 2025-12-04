// ============================================================
// 🔐 PermisosUsuarioPanel.jsx - Panel de gestión de permisos por usuario
// ------------------------------------------------------------
// Diseño UX/UI mejorado con tabla visual de permisos
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
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
  Trash2,
  Download,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import axios from 'axios';
import { getToken } from '../../../constants/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Configuración de permisos con clases explícitas para Tailwind
const PERMISOS_CONFIG = [
  { key: 'ver', label: 'Ver', icon: Eye, bgActive: 'bg-blue-500', bgIcon: 'bg-blue-500', textIcon: 'text-blue-500' },
  { key: 'crear', label: 'Crear', icon: Plus, bgActive: 'bg-green-500', bgIcon: 'bg-green-500', textIcon: 'text-green-500' },
  { key: 'editar', label: 'Editar', icon: Edit3, bgActive: 'bg-amber-500', bgIcon: 'bg-amber-500', textIcon: 'text-amber-500' },
  { key: 'eliminar', label: 'Eliminar', icon: Trash2, bgActive: 'bg-red-500', bgIcon: 'bg-red-500', textIcon: 'text-red-500' },
  { key: 'exportar', label: 'Exportar', icon: Download, bgActive: 'bg-purple-500', bgIcon: 'bg-purple-500', textIcon: 'text-purple-500' },
  { key: 'aprobar', label: 'Aprobar', icon: CheckCircle, bgActive: 'bg-emerald-500', bgIcon: 'bg-emerald-500', textIcon: 'text-emerald-500' },
];

const PermisosUsuarioPanel = ({ userId, userRoles = [], onRolesChange, token, readOnly = false }) => {
  // Estados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Datos
  const [rolesSeleccionados, setRolesSeleccionados] = useState(userRoles);
  const [modulos, setModulos] = useState([]);
  const [permisosUsuario, setPermisosUsuario] = useState({});
  const [modulosExpandidos, setModulosExpandidos] = useState({});

  // UI State
  const [mostrarRoles, setMostrarRoles] = useState(false);

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
        axios.get(`${API_URL}/api/mbac/modulos`, { headers: getHeaders() }),
        axios.get(`${API_URL}/api/mbac/paginas`, { headers: getHeaders() })
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

      // Expandir primer módulo con páginas
      const primerModuloConPaginas = modulosConPaginas.find(m => m.paginas.length > 0);
      if (primerModuloConPaginas) {
        setModulosExpandidos({ [primerModuloConPaginas.idModulo]: true });
      }
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
        `${API_URL}/api/permisos/usuario/${userId}`,
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
    } catch (err) {
      console.error('Error al cargar permisos:', err);
    }
  }, [userId, getHeaders]);

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

  // Sincronizar roles externos
  useEffect(() => {
    setRolesSeleccionados(userRoles);
  }, [userRoles]);

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
      return {
        ...prev,
        [rutaPagina]: {
          ...permisoActual,
          [tipoPermiso]: !permisoActual[tipoPermiso]
        }
      };
    });
  };

  // Toggle todos los permisos de una página
  const handleToggleAllPagina = (rutaPagina) => {
    if (readOnly) return;

    const permisosActuales = permisosUsuario[rutaPagina] || {};
    const todosActivos = PERMISOS_CONFIG.every(p => permisosActuales[p.key]);

    setPermisosUsuario(prev => ({
      ...prev,
      [rutaPagina]: PERMISOS_CONFIG.reduce((acc, p) => {
        acc[p.key] = !todosActivos;
        return acc;
      }, {})
    }));
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
      nuevosPermisos[pagina.rutaPagina] = PERMISOS_CONFIG.reduce((acc, p) => {
        acc[p.key] = !todasActivas;
        return acc;
      }, {});
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
        <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-gray-900">Permisos por Módulo</span>
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

        <div className="divide-y divide-gray-100">
          {modulos.map((modulo) => {
            const isExpanded = modulosExpandidos[modulo.idModulo];
            const cantidadPermisos = contarPermisosModulo(modulo);
            const todoActivo = moduloTodoActivo(modulo);
            const tienePaginas = modulo.paginas.length > 0;

            return (
              <div key={modulo.idModulo}>
                {/* Header del Módulo */}
                <div
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isExpanded ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => tienePaginas && toggleModulo(modulo.idModulo)}
                >
                  <div className="flex items-center gap-3 flex-1">
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
                      <p className="font-medium text-gray-900">{modulo.nombreModulo}</p>
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
                            {cantidadPermisos} activos
                          </span>
                        )}
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleAllModulo(modulo);
                            }}
                            className={`p-1 rounded transition-colors ${
                              todoActivo
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                            title={todoActivo ? 'Quitar todos' : 'Activar todos'}
                          >
                            {todoActivo ? (
                              <ToggleRight className="w-5 h-5" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Contenido Expandido - Tabla de Permisos */}
                {isExpanded && tienePaginas && (
                  <div className="bg-gray-50/50 border-t border-gray-100">
                    {/* Header de la tabla */}
                    <div className="grid grid-cols-[1fr,repeat(6,48px),40px] gap-1 px-4 py-2 bg-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      <div className="pl-2">Página</div>
                      {PERMISOS_CONFIG.map(({ key, label, icon: Icon, textIcon }) => (
                        <div key={key} className="text-center" title={label}>
                          <Icon className={`w-3.5 h-3.5 mx-auto ${textIcon}`} />
                        </div>
                      ))}
                      <div className="text-center">Todo</div>
                    </div>

                    {/* Filas de páginas */}
                    {modulo.paginas.map((pagina, idx) => {
                      const permisos = permisosUsuario[pagina.rutaPagina] || {};
                      const todoActivo = paginaTodoActivo(pagina.rutaPagina);
                      const tieneAlguno = Object.values(permisos).some(v => v);

                      return (
                        <div
                          key={pagina.idPagina}
                          className={`grid grid-cols-[1fr,repeat(6,48px),40px] gap-1 px-4 py-2 items-center border-t border-gray-100 hover:bg-white transition-colors ${
                            tieneAlguno ? 'bg-emerald-50/30' : ''
                          }`}
                        >
                          {/* Nombre de página */}
                          <div className="pl-2">
                            <p className="text-sm font-medium text-gray-800 truncate" title={pagina.nombrePagina}>
                              {pagina.nombrePagina}
                            </p>
                            <p className="text-xs text-gray-400 truncate" title={pagina.rutaPagina}>
                              {pagina.rutaPagina}
                            </p>
                          </div>

                          {/* Checkboxes de permisos */}
                          {PERMISOS_CONFIG.map(({ key, bgActive }) => {
                            const isActive = permisos[key] || false;

                            return (
                              <div key={key} className="flex justify-center">
                                <button
                                  type="button"
                                  onClick={() => handlePermisoToggle(pagina.rutaPagina, key)}
                                  disabled={readOnly}
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                    readOnly ? 'cursor-default' : 'cursor-pointer'
                                  } ${
                                    isActive
                                      ? `${bgActive} text-white shadow-sm`
                                      : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                                  }`}
                                >
                                  {isActive && <Check className="w-4 h-4" />}
                                </button>
                              </div>
                            );
                          })}

                          {/* Toggle todo */}
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={() => handleToggleAllPagina(pagina.rutaPagina)}
                              disabled={readOnly}
                              className={`p-1 rounded transition-colors ${
                                readOnly ? 'cursor-default' : 'cursor-pointer'
                              } ${
                                todoActivo
                                  ? 'text-emerald-600 hover:bg-emerald-100'
                                  : 'text-gray-400 hover:bg-gray-200'
                              }`}
                              title={todoActivo ? 'Quitar todos' : 'Activar todos'}
                            >
                              {todoActivo ? (
                                <ToggleRight className="w-5 h-5" />
                              ) : (
                                <ToggleLeft className="w-5 h-5" />
                              )}
                            </button>
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
};

export default PermisosUsuarioPanel;

// ============================================================
// 👁️ VerPermisosUsuarioModal.jsx - Modal para ver permisos de usuario
// ------------------------------------------------------------
// Muestra de forma visual los roles asignados, páginas accesibles
// y permisos específicos que tiene un usuario
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Shield,
  FolderOpen,
  FileText,
  Eye,
  Plus,
  Edit3,
  Trash2,
  Download,
  CheckCircle,
  Check,
  Loader2,
  AlertCircle,
  User,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Configuración de permisos con iconos y colores
const PERMISOS_CONFIG = [
  { key: 'ver', label: 'Ver', icon: Eye, color: 'text-blue-600', bg: 'bg-blue-100' },
  { key: 'crear', label: 'Crear', icon: Plus, color: 'text-green-600', bg: 'bg-green-100' },
  { key: 'editar', label: 'Editar', icon: Edit3, color: 'text-amber-600', bg: 'bg-amber-100' },
  { key: 'eliminar', label: 'Eliminar', icon: Trash2, color: 'text-red-600', bg: 'bg-red-100' },
  { key: 'exportar', label: 'Exportar', icon: Download, color: 'text-purple-600', bg: 'bg-purple-100' },
  { key: 'aprobar', label: 'Aprobar', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
];

const VerPermisosUsuarioModal = ({ isOpen, onClose, usuario, token }) => {
  const [loading, setLoading] = useState(true);
  const [permisosAgrupados, setPermisosAgrupados] = useState([]);
  const [modulosExpandidos, setModulosExpandidos] = useState({});
  const [estadisticas, setEstadisticas] = useState({
    totalModulos: 0,
    totalPaginas: 0,
    totalPermisos: 0
  });

  // Obtener headers con token
  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }), [token]);

  // Cargar permisos del usuario
  const cargarPermisos = useCallback(async () => {
    if (!usuario?.id_user && !usuario?.idUser) return;

    setLoading(true);
    try {
      const userId = usuario.id_user || usuario.idUser;
      const response = await axios.get(
        `${API_URL}/api/permisos/usuario/${userId}`,
        { headers: getHeaders() }
      );

      const permisos = response.data || [];

      // Agrupar por módulo
      const modulosMap = {};
      permisos.forEach(permiso => {
        const moduloNombre = permiso.nombreModulo || permiso.nombre_modulo || 'Sin módulo';

        if (!modulosMap[moduloNombre]) {
          modulosMap[moduloNombre] = {
            nombre: moduloNombre,
            paginas: []
          };
        }

        modulosMap[moduloNombre].paginas.push({
          nombre: permiso.nombrePagina || permiso.nombre_pagina,
          ruta: permiso.rutaPagina || permiso.ruta_pagina,
          permisos: {
            ver: permiso.ver || permiso.puedeVer || false,
            crear: permiso.crear || permiso.puedeCrear || false,
            editar: permiso.editar || permiso.puedeEditar || false,
            eliminar: permiso.eliminar || permiso.puedeEliminar || false,
            exportar: permiso.exportar || permiso.puedeExportar || false,
            aprobar: permiso.aprobar || permiso.puedeAprobar || false,
          }
        });
      });

      const modulosArray = Object.values(modulosMap);
      setPermisosAgrupados(modulosArray);

      // Expandir todos los módulos por defecto
      const expandidos = {};
      modulosArray.forEach((m, idx) => {
        expandidos[idx] = true;
      });
      setModulosExpandidos(expandidos);

      // Calcular estadísticas
      let totalPermisos = 0;
      let totalPaginas = 0;
      modulosArray.forEach(modulo => {
        totalPaginas += modulo.paginas.length;
        modulo.paginas.forEach(pagina => {
          totalPermisos += Object.values(pagina.permisos).filter(v => v).length;
        });
      });

      setEstadisticas({
        totalModulos: modulosArray.length,
        totalPaginas,
        totalPermisos
      });

    } catch (err) {
      console.error('Error al cargar permisos:', err);
    } finally {
      setLoading(false);
    }
  }, [usuario, getHeaders]);

  useEffect(() => {
    if (isOpen && usuario) {
      cargarPermisos();
    }
  }, [isOpen, usuario, cargarPermisos]);

  // Toggle módulo
  const toggleModulo = (idx) => {
    setModulosExpandidos(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  if (!isOpen) return null;

  const roles = usuario?.roles || [];
  const nombreCompleto = usuario?.nombre_completo || usuario?.nombreCompleto ||
    `${usuario?.nombres || ''} ${usuario?.apellido_paterno || usuario?.apellidoPaterno || ''} ${usuario?.apellido_materno || usuario?.apellidoMaterno || ''}`.trim();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Permisos del Usuario</h2>
                <p className="text-blue-100 text-sm">{nombreCompleto}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Cargando permisos...</span>
            </div>
          ) : (
            <>
              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <FolderOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-700">{estadisticas.totalModulos}</p>
                      <p className="text-sm text-blue-600">Módulos</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500 rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-700">{estadisticas.totalPaginas}</p>
                      <p className="text-sm text-emerald-600">Páginas</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Unlock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-700">{estadisticas.totalPermisos}</p>
                      <p className="text-sm text-purple-600">Permisos</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Roles asignados */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Roles Asignados</h3>
                  </div>
                </div>
                <div className="p-5">
                  {roles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {roles.map((rol, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm"
                        >
                          <Check className="w-4 h-4" />
                          {typeof rol === 'string' ? rol : rol.descRol || rol.nombreRol}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Sin roles asignados
                    </p>
                  )}
                </div>
              </div>

              {/* Permisos por módulo */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-semibold text-gray-900">Acceso a Módulos y Páginas</h3>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {permisosAgrupados.length > 0 ? (
                    permisosAgrupados.map((modulo, idx) => (
                      <div key={idx}>
                        {/* Header del módulo */}
                        <button
                          onClick={() => toggleModulo(idx)}
                          className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {modulosExpandidos[idx] ? (
                              <ChevronDown className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                            <span className="font-medium text-gray-900">{modulo.nombre}</span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {modulo.paginas.length} páginas
                            </span>
                          </div>
                        </button>

                        {/* Páginas del módulo */}
                        {modulosExpandidos[idx] && (
                          <div className="px-5 pb-4 space-y-3">
                            {modulo.paginas.map((pagina, pIdx) => {
                              const permisosActivos = PERMISOS_CONFIG.filter(p => pagina.permisos[p.key]);

                              return (
                                <div
                                  key={pIdx}
                                  className="ml-8 p-4 bg-gray-50 rounded-xl border border-gray-100"
                                >
                                  <div className="flex items-center gap-2 mb-3">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium text-gray-800">{pagina.nombre}</span>
                                    <span className="text-xs text-gray-400 font-mono">{pagina.ruta}</span>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    {permisosActivos.length > 0 ? (
                                      permisosActivos.map(({ key, label, icon: Icon, color, bg }) => (
                                        <span
                                          key={key}
                                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${bg} ${color} rounded-lg text-sm font-medium`}
                                        >
                                          <Icon className="w-3.5 h-3.5" />
                                          {label}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-sm text-gray-400 flex items-center gap-1">
                                        <Lock className="w-3.5 h-3.5" />
                                        Sin permisos específicos
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Este usuario no tiene permisos asignados</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Los permisos se heredan de los roles asignados
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerPermisosUsuarioModal;

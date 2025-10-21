// ========================================================================
// 🔐 PermisosPage.jsx - Estilo Apple/iOS
// ========================================================================

import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import ToggleSwitch from "../../components/ui/ToggleSwitch";
import { apiClient } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";
import {
  Shield,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  AlertCircle,
  Loader2,
  RefreshCw,
  Users,
  Lock,
  Eye,
  Edit,
  Trash2,
  FileDown,
  CheckCircle,
  Plus,
} from "lucide-react";

export default function PermisosPage() {
  const { user } = useAuth();
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRol, setSelectedRol] = useState("TODOS");

  useEffect(() => {
    fetchPermisos();
  }, [user]);

  const fetchPermisos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = 1;
      console.log('Obteniendo permisos para usuario:', userId);
      
      const data = await apiClient.get(`/permisos/usuario/${userId}`, true);
      setPermisos(data);
      
      // Auto-expandir todos los módulos
      const allExpanded = {};
      data.forEach(p => {
        allExpanded[p.modulo] = true;
      });
      setExpandedModules(allExpanded);
    } catch (err) {
      setError(err.message);
      console.error("Error al cargar permisos:", err);
    } finally {
      setLoading(false);
    }
  };

  const groupedPermisos = permisos.reduce((acc, permiso) => {
    if (!acc[permiso.modulo]) {
      acc[permiso.modulo] = [];
    }
    acc[permiso.modulo].push(permiso);
    return acc;
  }, {});

  const roles = ["TODOS", ...new Set(permisos.map(p => p.rol))];

  const filteredModules = Object.entries(groupedPermisos).reduce((acc, [modulo, paginas]) => {
    const filtered = paginas.filter(p => {
      const matchesSearch = modulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.pagina.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRol = selectedRol === "TODOS" || p.rol === selectedRol;
      return matchesSearch && matchesRol;
    });
    
    if (filtered.length > 0) {
      acc[modulo] = filtered;
    }
    return acc;
  }, {});

  const toggleModule = (modulo) => {
    setExpandedModules(prev => ({
      ...prev,
      [modulo]: !prev[modulo]
    }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">Cargando permisos...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">Error al cargar permisos</h3>
            <p className="text-base text-red-700 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={fetchPermisos}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header estilo Apple */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Permisos de acceso
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gestiona los permisos de usuarios por módulo
            </p>
          </div>
          <button
            onClick={fetchPermisos}
            className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 
                     text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors 
                     flex items-center gap-2 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {/* Tabs estilo Apple */}
        <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
          <button className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400">
            Roles
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            Crear rol
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            Copiar del rol
          </button>
        </div>

        {/* Role chips */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {roles.slice(1).map(rol => (
            <button
              key={rol}
              onClick={() => setSelectedRol(rol)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedRol === rol
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {rol}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="space-y-4">
        {Object.entries(filteredModules).length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-16 text-center border border-gray-200 dark:border-gray-700">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No se encontraron permisos</p>
          </div>
        ) : (
          Object.entries(filteredModules).map(([modulo, paginas]) => {
            const isExpanded = expandedModules[modulo];

            return (
              <div
                key={modulo}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
              >
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(modulo)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{modulo}</h3>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                      <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </button>

                {/* Permissions Table */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <PermissionsTable permisos={paginas} roles={roles.slice(1)} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </AdminLayout>
  );
}

// ========================================================================
// 📊 PermissionsTable Component
// ========================================================================
function PermissionsTable({ permisos, roles }) {
  // Agrupar permisos por página
  const paginasUnicas = [...new Set(permisos.map(p => p.pagina))];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-6 py-3 text-left">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Activo</span>
              </div>
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
              
            </th>
            {roles.map(rol => (
              <th key={rol} className="px-6 py-3 text-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{rol}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {paginasUnicas.map((pagina, idx) => {
            const paginaPermisos = permisos.filter(p => p.pagina === pagina);
            
            return (
              <React.Fragment key={idx}>
                {/* Fila de la página */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" defaultChecked />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{pagina}</span>
                  </td>
                  {roles.map(rol => {
                    const permiso = paginaPermisos.find(p => p.rol === rol);
                    const hasAnyPermission = permiso && Object.values(permiso.permisos).some(v => v);
                    
                    return (
                      <td key={rol} className="px-6 py-4 text-center">
                        {permiso && (
                          <ToggleSwitch
                            enabled={hasAnyPermission}
                            onChange={() => {}}
                            size="md"
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
                
                {/* Filas de acciones */}
                {paginaPermisos[0] && Object.entries(paginaPermisos[0].permisos).map(([accion, _], actionIdx) => {
                  const accionLabels = {
                    ver: "Ver",
                    crear: "Crear",
                    editar: "Editar",
                    eliminar: "Eliminar",
                    exportar: "Exportar",
                    aprobar: "Aprobar"
                  };

                  return (
                    <tr key={actionIdx} className="bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-3"></td>
                      <td className="px-6 py-3 pl-12">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{accionLabels[accion] || accion}</span>
                      </td>
                      {roles.map(rol => {
                        const permiso = paginaPermisos.find(p => p.rol === rol);
                        const isEnabled = permiso?.permisos[accion];
                        
                        return (
                          <td key={rol} className="px-6 py-3 text-center">
                            {permiso && (
                              <ToggleSwitch
                                enabled={isEnabled}
                                onChange={() => {}}
                                size="sm"
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

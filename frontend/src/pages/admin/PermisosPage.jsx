// ========================================================================
// 🔐 PermisosPage.jsx – Versión final CENATE 2025 (sin AppLayout interno)
// ------------------------------------------------------------------------
// Diseño Apple/iOS unificado con layout global, sin duplicación de sidebar.
// Compatible con MBAC, tema oscuro y variables CSS globales.
// ========================================================================

import React, { useState, useEffect } from "react";
import ToggleSwitch from "../../components/ui/ToggleSwitch";
import { apiClient } from '../../lib/apiClient';
import { useAuth } from "../../context/AuthContext";
import {
  ChevronRight,
  ChevronDown,
  Search,
  RefreshCw,
  AlertCircle,
  Loader2,
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
      
      // ✅ Usa el username del usuario autenticado
      const username = user?.username || user?.nombreUsuario || user?.name_user;
      
      if (!username) {
        throw new Error("Usuario no autenticado o sin username");
      }
      
      console.log("🔍 Cargando permisos para:", username);
      const data = await apiClient.get(`/permisos/usuario/${username}`, true);
      
      setPermisos(data);
      const expanded = {};
      data.forEach((p) => (expanded[p.nombreModulo || p.modulo] = true));
      setExpandedModules(expanded);
    } catch (err) {
      setError(err.message);
      console.error("❌ Error al cargar permisos:", err);
    } finally {
      setLoading(false);
    }
  };

  const groupedPermisos = permisos.reduce((acc, permiso) => {
    if (!acc[permiso.modulo]) acc[permiso.modulo] = [];
    acc[permiso.modulo].push(permiso);
    return acc;
  }, {});

  const roles = ["TODOS", ...new Set(permisos.map((p) => p.rol))];

  const filteredModules = Object.entries(groupedPermisos).reduce((acc, [modulo, paginas]) => {
    const filtered = paginas.filter((p) => {
      const matchesSearch =
        modulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.pagina.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRol = selectedRol === "TODOS" || p.rol === selectedRol;
      return matchesSearch && matchesRol;
    });
    if (filtered.length > 0) acc[modulo] = filtered;
    return acc;
  }, {});

  const toggleModule = (modulo) => {
    setExpandedModules((prev) => ({ ...prev, [modulo]: !prev[modulo] }));
  };

  // ============================================================
  // 🌀 Loader y errores
  // ============================================================
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[var(--color-primary)] animate-spin mx-auto mb-6" />
          <p className="text-xl font-semibold text-[var(--text-secondary)]">
            Cargando permisos...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="rounded-xl p-8 border border-[var(--color-danger)]/30 bg-[var(--bg-card)]/70 flex items-start gap-4">
        <AlertCircle className="w-8 h-8 text-[var(--color-danger)] flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-xl font-bold text-[var(--color-danger)] mb-2">
            Error al cargar permisos
          </h3>
          <p className="text-base text-[var(--text-secondary)] mb-4">{error}</p>
          <button
            onClick={fetchPermisos}
            className="px-4 py-2 bg-[var(--color-primary)] hover:opacity-90 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      </div>
    );

  // ============================================================
  // 🧱 Render principal (sin AppLayout)
  // ============================================================
  return (
    <div className="p-8 bg-[var(--bg-main)] transition-colors min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Permisos de acceso
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Gestiona los permisos de usuarios por módulo
            </p>
          </div>
          <button
            onClick={fetchPermisos}
            className="px-4 py-2 rounded-lg border border-[var(--border-color)]
                       bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]
                       text-[var(--text-primary)] font-medium flex items-center gap-2 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-[var(--border-color)]">
          <button className="px-4 py-2 text-sm font-medium text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]">
            Roles
          </button>
          <button className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            Crear rol
          </button>
          <button className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            Copiar del rol
          </button>
        </div>

        {/* Filtros de roles */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {roles.slice(1).map((rol) => (
            <button
              key={rol}
              onClick={() => setSelectedRol(rol)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedRol === rol
                  ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                  : "bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
              }`}
            >
              {rol}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div className="space-y-4">
        {Object.entries(filteredModules).length === 0 ? (
          <div className="rounded-xl p-16 border border-[var(--border-color)] bg-[var(--bg-card)]/70 text-center">
            <Search className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
            <p className="text-lg font-medium text-[var(--text-primary)]">
              No se encontraron permisos
            </p>
          </div>
        ) : (
          Object.entries(filteredModules).map(([modulo, paginas]) => {
            const isExpanded = expandedModules[modulo];
            return (
              <div
                key={modulo}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/70 overflow-hidden shadow-sm"
              >
                {/* Encabezado del módulo */}
                <button
                  onClick={() => toggleModule(modulo)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-all"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-[var(--text-secondary)]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
                    )}
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">
                      {modulo}
                    </h3>
                  </div>
                  <button className="p-1 hover:bg-[var(--bg-hover)] rounded transition-colors">
                    <Plus className="w-4 h-4 text-[var(--text-secondary)]" />
                  </button>
                </button>

                {/* Tabla de permisos */}
                {isExpanded && (
                  <div className="border-t border-[var(--border-color)]">
                    <PermissionsTable permisos={paginas} roles={roles.slice(1)} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ========================================================================
// 📊 PermissionsTable Component
// ========================================================================
function PermissionsTable({ permisos, roles }) {
  const paginasUnicas = [...new Set(permisos.map((p) => p.pagina))];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border-color)]">
            <th className="px-6 py-3 text-left">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-[var(--border-color)]" />
                <span className="text-sm font-medium text-[var(--text-secondary)]">Activo</span>
              </div>
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]" />
            {roles.map((rol) => (
              <th key={rol} className="px-6 py-3 text-center">
                <span className="text-sm font-medium text-[var(--text-primary)]">{rol}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-color)]/60">
          {paginasUnicas.map((pagina, idx) => {
            const paginaPermisos = permisos.filter((p) => p.pagina === pagina);
            return (
              <React.Fragment key={idx}>
                <tr className="hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="w-4 h-4 rounded border-[var(--border-color)]" defaultChecked />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{pagina}</span>
                  </td>
                  {roles.map((rol) => {
                    const permiso = paginaPermisos.find((p) => p.rol === rol);
                    const hasAnyPermission = permiso && Object.values(permiso.permisos).some((v) => v);
                    return (
                      <td key={rol} className="px-6 py-4 text-center">
                        {permiso && (
                          <ToggleSwitch enabled={hasAnyPermission} onChange={() => {}} size="md" />
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Acciones */}
                {paginaPermisos[0] &&
                  Object.entries(paginaPermisos[0].permisos).map(([accion, _], i) => {
                    const accionLabels = {
                      ver: "Ver",
                      crear: "Crear",
                      editar: "Editar",
                      eliminar: "Eliminar",
                      exportar: "Exportar",
                      aprobar: "Aprobar",
                    };
                    return (
                      <tr
                        key={i}
                        className="bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        <td className="px-6 py-3"></td>
                        <td className="px-6 py-3 pl-12">
                          <span className="text-sm text-[var(--text-secondary)]">
                            {accionLabels[accion] || accion}
                          </span>
                        </td>
                        {roles.map((rol) => {
                          const permiso = paginaPermisos.find((p) => p.rol === rol);
                          const isEnabled = permiso?.permisos[accion];
                          return (
                            <td key={rol} className="px-6 py-3 text-center">
                              {permiso && (
                                <ToggleSwitch enabled={isEnabled} onChange={() => {}} size="sm" />
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
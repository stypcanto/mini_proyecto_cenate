// ========================================================================
// 👤 Profile.jsx – Perfil Institucional del Usuario (CENATE 2025)
// ------------------------------------------------------------------------
// Diseño moderno estilo Microsoft con permisos agrupados por módulo
// Incluye información del usuario, roles y área
// ========================================================================

import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ChevronLeft,
  User,
  Building2,
  Eye,
  Plus,
  Pencil,
  Trash2,
  Download,
  AlertCircle,
  Check,
  Briefcase,
} from "lucide-react";
import usePermissions from "../../hooks/usePermissions";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { permisos, loading, error } = usePermissions(user?.id);

  // ✅ Construir nombre completo
  const nombreCompleto =
    user?.nombreCompleto ||
    user?.nombre_completo ||
    `${user?.nombre || ""} ${user?.apellido || ""}`.trim() ||
    "Usuario";

  // ✅ Obtener roles
  const roles = (user?.roles || []).map((r) =>
    typeof r === "string"
      ? r.replace("ROLE_", "").toUpperCase()
      : r?.authority
      ? r.authority.replace("ROLE_", "").toUpperCase()
      : String(r || "").replace("ROLE_", "").toUpperCase()
  );

  // ✅ Asegurar que permisos sea un array válido
  const permisosArray = Array.isArray(permisos) ? permisos : [];

  // 📊 Agrupar permisos por módulo
  const permisosPorModulo = permisosArray.reduce((acc, permiso) => {
    const modulo = permiso.nombreModulo || "Sin módulo";
    if (!acc[modulo]) {
      acc[modulo] = [];
    }
    acc[modulo].push(permiso);
    return acc;
  }, {});

  // 📈 Calcular estadísticas de permisos
  const statsPermisos = {
    total: permisosArray.length,
    ver: permisosArray.filter((p) => p.ver).length,
    crear: permisosArray.filter((p) => p.crear).length,
    editar: permisosArray.filter((p) => p.editar).length,
    eliminar: permisosArray.filter((p) => p.eliminar).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 🎯 Header con breadcrumb */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <User className="w-4 h-4" />
              <span>Mi perfil</span>
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <span className="text-slate-700 font-medium">
                Permisos y accesos
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Mi Perfil Institucional
            </h1>
          </div>
          <button
            onClick={() => navigate("/user/dashboard")}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg transition-all text-sm font-medium border border-slate-200 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver al Panel
          </button>
        </div>

        {/* 👤 Card de Información del Usuario */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                {nombreCompleto[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">
                  {nombreCompleto}
                </h2>
                <div className="flex items-center gap-4 mt-1 text-blue-100 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{user?.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>CENATE - EsSalud</span>
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-white px-4 py-2 rounded-lg text-sm font-medium">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                Activo
              </div>
            </div>
          </div>

          {/* Información de Roles y Área */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card de Roles */}
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Roles Asignados
                    </h3>
                    <p className="text-xs text-slate-500">
                      {roles.length} rol(es) activo(s)
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {roles.length > 0 ? (
                    roles.map((rol, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium"
                      >
                        <Check className="w-3 h-3" />
                        {rol}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-sm">
                      Sin roles asignados
                    </span>
                  )}
                </div>
              </div>

              {/* Card de Área */}
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Área de Trabajo
                    </h3>
                    <p className="text-xs text-slate-500">
                      Unidad organizacional
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-medium">
                    <Building2 className="w-3 h-3" />
                    {user?.area || user?.areaDescripcion || "No especificada"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🛡️ Card de permisos con diseño moderno */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header del card de permisos - Estilo figura 1 */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Permisos y Accesos del Sistema
                  </h2>
                  <p className="text-emerald-100 text-sm">
                    Control de acceso basado en roles (MBAC)
                  </p>
                </div>
              </div>
              <div className="bg-white/20 px-3 py-1.5 rounded-lg">
                <span className="text-white text-sm font-semibold">
                  {statsPermisos.total} permisos activos
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
                <p className="text-red-700 font-medium">
                  Error al cargar permisos
                </p>
                <p className="text-red-600 text-sm mt-1">
                  {error.message || error}
                </p>
              </div>
            ) : (
              <>
                {/* Estadísticas de permisos */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <StatCard
                    icon={ShieldCheck}
                    label="Total"
                    value={statsPermisos.total}
                    color="blue"
                  />
                  <StatCard
                    icon={Eye}
                    label="Ver"
                    value={statsPermisos.ver}
                    color="cyan"
                  />
                  <StatCard
                    icon={Plus}
                    label="Crear"
                    value={statsPermisos.crear}
                    color="green"
                  />
                  <StatCard
                    icon={Pencil}
                    label="Editar"
                    value={statsPermisos.editar}
                    color="amber"
                  />
                  <StatCard
                    icon={Trash2}
                    label="Eliminar"
                    value={statsPermisos.eliminar}
                    color="red"
                  />
                </div>

                {/* Permisos agrupados por módulo */}
                {Object.keys(permisosPorModulo).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(permisosPorModulo).map(
                      ([modulo, permisosModulo]) => (
                        <div
                          key={modulo}
                          className="border border-slate-200 rounded-lg overflow-hidden"
                        >
                          {/* Header del módulo */}
                          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-600" />
                                <h4 className="font-semibold text-slate-900">
                                  {modulo}
                                </h4>
                              </div>
                              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full font-medium">
                                {permisosModulo.length} permisos
                              </span>
                            </div>
                          </div>

                          {/* Tabla de permisos del módulo */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-slate-100/50">
                                <tr>
                                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                    Página/Recurso
                                  </th>
                                  <th className="px-4 py-3 text-center font-semibold text-slate-700 w-24">
                                    <div className="flex items-center justify-center gap-1">
                                      <Eye className="w-3.5 h-3.5" />
                                      Ver
                                    </div>
                                  </th>
                                  <th className="px-4 py-3 text-center font-semibold text-slate-700 w-24">
                                    <div className="flex items-center justify-center gap-1">
                                      <Plus className="w-3.5 h-3.5" />
                                      Crear
                                    </div>
                                  </th>
                                  <th className="px-4 py-3 text-center font-semibold text-slate-700 w-24">
                                    <div className="flex items-center justify-center gap-1">
                                      <Pencil className="w-3.5 h-3.5" />
                                      Editar
                                    </div>
                                  </th>
                                  <th className="px-4 py-3 text-center font-semibold text-slate-700 w-24">
                                    <div className="flex items-center justify-center gap-1">
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Eliminar
                                    </div>
                                  </th>
                                  <th className="px-4 py-3 text-center font-semibold text-slate-700 w-24">
                                    <div className="flex items-center justify-center gap-1">
                                      <Download className="w-3.5 h-3.5" />
                                      Exportar
                                    </div>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {permisosModulo.map((perm, idx) => (
                                  <tr
                                    key={idx}
                                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                                  >
                                    <td className="px-4 py-3 text-slate-900">
                                      {perm.nombrePagina || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <PermissionBadge granted={perm.ver} />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <PermissionBadge granted={perm.crear} />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <PermissionBadge granted={perm.editar} />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <PermissionBadge granted={perm.eliminar} />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <PermissionBadge granted={perm.exportar} />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">
                      No se encontraron permisos activos
                    </p>
                    <p className="text-slate-400 text-sm mt-2">
                      Contacte al administrador del sistema para asignar permisos
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 🔧 Componente: Tarjeta de estadística
// ============================================================
function StatCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
    green: "bg-green-50 text-green-700 border-green-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div
      className={`${colorClasses[color]} border rounded-lg p-3 text-center`}
    >
      <div className="flex items-center justify-center mb-1">
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium opacity-75">{label}</div>
    </div>
  );
}

// ============================================================
// 🔧 Componente: Badge de permiso
// ============================================================
function PermissionBadge({ granted }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold text-xs ${
        granted
          ? "bg-green-100 text-green-700"
          : "bg-slate-100 text-slate-400"
      }`}
    >
      {granted ? <Check className="w-4 h-4" /> : "—"}
    </span>
  );
}

// ========================================================================
// 🛡️ AccesosTab.jsx – Pestaña de accesos y permisos del usuario
// ========================================================================

import React from "react";
import {
  ShieldCheck,
  Eye,
  Plus,
  Pencil,
  Trash2,
  Download,
  AlertCircle,
  Check,
  Building2,
} from "lucide-react";
import usePermissions from "../../hooks/usePermissions";

/**
 * 🛡️ Pestaña de accesos y permisos
 * Muestra tabla detallada de permisos por módulo
 */
export default function AccesosTab({ user }) {
  const { permisos, loading, error } = usePermissions(user?.id);

  // 📈 Calcular estadísticas de permisos
  const permisosArray = Array.isArray(permisos) ? permisos : [];
  const statsPermisos = {
    total: permisosArray.length,
    ver: permisosArray.filter((p) => p.ver).length,
    crear: permisosArray.filter((p) => p.crear).length,
    editar: permisosArray.filter((p) => p.editar).length,
    eliminar: permisosArray.filter((p) => p.eliminar).length,
  };

  // 📊 Agrupar permisos por módulo
  const permisosPorModulo = permisosArray.reduce((acc, permiso) => {
    const modulo = permiso.nombreModulo || "Sin módulo";
    if (!acc[modulo]) {
      acc[modulo] = [];
    }
    acc[modulo].push(permiso);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
          <p className="text-red-700 font-medium">Error al cargar permisos</p>
          <p className="text-red-600 text-sm mt-1">{error.message || error}</p>
        </div>
      ) : (
        <>
          {/* Estadísticas de permisos */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

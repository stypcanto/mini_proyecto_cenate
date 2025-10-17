// ========================================================================
// ⚙️ ADMINISTRACIÓN DE PERMISOS POR ROL - CENATE (Versión Extendida 2025)
// ========================================================================
// Este módulo permite:
//  ✅ Seleccionar un rol y visualizar sus permisos
//  ✅ Filtrar dinámicamente permisos por nombre o módulo
//  ✅ Editar acciones (ver, crear, actualizar, eliminar)
//  ✅ Guardar cambios con confirmación visual
//  ✅ Mostrar toasts modernos de estado (react-hot-toast)
// ========================================================================

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Check, X, Save, RefreshCw, Shield, Search } from "lucide-react";
import toast from "react-hot-toast";
import { getRoles } from "@/api/rolesApi";
import permisosApi from "@/api/permisosApi";

// ========================================================================
// 🚀 Componente principal
// ========================================================================
const PermisosManagement = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRol, setSelectedRol] = useState("");
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ======================================================================
  // 🧭 Cargar roles al montar el componente
  // ======================================================================
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data || []);
      } catch (err) {
        console.error("❌ Error cargando roles:", err);
        toast.error("No se pudieron cargar los roles.");
      }
    };
    fetchRoles();
  }, []);

  // ======================================================================
  // 📋 Cargar permisos del rol seleccionado
  // ======================================================================
  const fetchPermisosByRol = useCallback(async (rolId) => {
    if (!rolId) {
      setPermisos([]);
      return;
    }

    setLoading(true);
    try {
      const data = await permisosApi.getPermisosByRol(rolId);
      setPermisos(data || []);
    } catch (err) {
      console.error("❌ Error al obtener permisos:", err);
      toast.error("Error al obtener permisos del rol seleccionado.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ======================================================================
  // 🔍 Filtro dinámico por texto
  // ======================================================================
  const filteredPermisos = useMemo(() => {
    if (!searchTerm) return permisos;
    return permisos.filter((p) =>
      p.descPermiso.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [permisos, searchTerm]);

  // ======================================================================
  // 🧩 Cambiar estado de un permiso (en memoria)
  // ======================================================================
  const togglePermiso = (permisoId, campo) => {
    setPermisos((prev) =>
      prev.map((permiso) =>
        permiso.idPermiso === permisoId
          ? { ...permiso, [campo]: !permiso[campo] }
          : permiso
      )
    );
  };

  // ======================================================================
  // 💾 Guardar cambios masivos
  // ======================================================================
  const handleGuardar = async () => {
    if (!selectedRol) return toast.error("Seleccione un rol antes de guardar.");

    const confirm = window.confirm(
      "¿Deseas guardar los cambios de permisos para este rol?"
    );
    if (!confirm) return;

    setSaving(true);
    toast.loading("Guardando cambios...");

    try {
      await Promise.all(permisos.map((p) => permisosApi.updatePermiso(p.idPermiso, p)));
      toast.dismiss();
      toast.success("✅ Permisos actualizados correctamente.");
    } catch (err) {
      toast.dismiss();
      console.error("❌ Error al guardar permisos:", err);
      toast.error("Ocurrió un error al guardar los permisos.");
    } finally {
      setSaving(false);
    }
  };

  // ======================================================================
  // 🎨 Render principal
  // ======================================================================
  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      {/* 🔰 Encabezado */}
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-[#2e63a6]" />
        <h1 className="text-3xl font-bold text-[#2e63a6]">
          Administración de Permisos
        </h1>
      </div>

      {/* 🧭 Selector de Rol */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <label className="text-lg font-semibold">Seleccionar Rol:</label>
        <select
          value={selectedRol}
          onChange={(e) => {
            setSelectedRol(e.target.value);
            fetchPermisosByRol(e.target.value);
            setSearchTerm("");
          }}
          className="p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#2e63a6] w-64 bg-white"
        >
          <option value="">-- Seleccione un rol --</option>
          {roles.map((r) => (
            <option key={r.idRol} value={r.idRol}>
              {r.descRol}
            </option>
          ))}
        </select>

        <button
          onClick={() => fetchPermisosByRol(selectedRol)}
          disabled={!selectedRol || loading}
          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          Refrescar
        </button>
      </div>

      {/* 🔍 Buscador dinámico */}
      {permisos.length > 0 && (
        <div className="flex items-center gap-3 mb-6 max-w-md bg-white rounded-lg px-4 py-2 shadow-sm border">
          <Search className="text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar permiso o módulo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none text-gray-700 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* 🧩 Tabla de Permisos */}
      {loading ? (
        <div className="text-gray-600 text-center py-10">
          Cargando permisos del rol seleccionado...
        </div>
      ) : filteredPermisos.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#2e63a6] text-white text-sm uppercase">
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Módulo / Permiso</th>
                <th className="p-3 text-center">Ver</th>
                <th className="p-3 text-center">Crear</th>
                <th className="p-3 text-center">Actualizar</th>
                <th className="p-3 text-center">Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {filteredPermisos.map((permiso, index) => (
                <tr
                  key={permiso.idPermiso}
                  className={`border-b transition ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-blue-50`}
                >
                  <td className="p-3 text-gray-600 text-center font-medium">
                    {index + 1}
                  </td>
                  <td className="p-3 font-medium text-gray-800">
                    {permiso.descPermiso}
                  </td>
                  {["puedeVer", "puedeCrear", "puedeActualizar", "puedeEliminar"].map(
                    (campo) => (
                      <td key={campo} className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={permiso[campo] || false}
                          onChange={() => togglePermiso(permiso.idPermiso, campo)}
                          className="form-checkbox h-5 w-5 text-[#2e63a6] rounded focus:ring-[#2e63a6]"
                        />
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {/* 📊 Resumen de resultados */}
          <div className="p-4 text-sm text-gray-600 flex justify-between">
            <span>
              Mostrando {filteredPermisos.length} de {permisos.length} permisos
            </span>
            {searchTerm && (
              <span className="text-gray-400 italic">
                Filtro activo: “{searchTerm}”
              </span>
            )}
          </div>
        </div>
      ) : (
        <p className="text-gray-500 italic">
          {selectedRol
            ? "Este rol no tiene permisos asignados o no coinciden con la búsqueda."
            : "Seleccione un rol para visualizar sus permisos."}
        </p>
      )}

      {/* 🔘 Botones de acción */}
      {filteredPermisos.length > 0 && (
        <div className="flex justify-end mt-8 gap-3">
          <button
            onClick={handleGuardar}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
          <button
            onClick={() => fetchPermisosByRol(selectedRol)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default PermisosManagement;
// src/pages/admin/PermisosManagement.jsx
import React, { useEffect, useState } from "react";
import { Check, X, Save, RefreshCw } from "lucide-react";
import { getPermisosByRol, updatePermiso } from "../../api/permisosApi";
import { getRoles } from "../../api/rolesApi";

const PermisosManagement = () => {
    const [roles, setRoles] = useState([]);
    const [selectedRol, setSelectedRol] = useState("");
    const [permisos, setPermisos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // 🚀 Cargar roles al inicio
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const data = await getRoles();
                setRoles(data);
            } catch (err) {
                console.error("❌ Error cargando roles:", err);
            }
        };
        fetchRoles();
    }, []);

    // 📋 Cargar permisos del rol seleccionado
    const handleRolChange = async (rolId) => {
        setSelectedRol(rolId);
        if (!rolId) return;

        setLoading(true);
        try {
            const data = await getPermisosByRol(rolId);
            setPermisos(data);
        } catch (err) {
            console.error("❌ Error al obtener permisos:", err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Cambiar estado de permiso localmente
    const togglePermiso = (permisoId, campo) => {
        setPermisos((prev) =>
            prev.map((permiso) =>
                permiso.idPermiso === permisoId
                    ? { ...permiso, [campo]: !permiso[campo] }
                    : permiso
            )
        );
    };

    // 💾 Guardar cambios en backend
    const handleGuardar = async () => {
        if (!selectedRol) return;
        setSaving(true);
        try {
            await Promise.all(permisos.map((p) => updatePermiso(p.idPermiso, p)));
            alert("✅ Permisos actualizados correctamente");
        } catch (err) {
            alert("❌ Error al guardar permisos");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-[#2e63a6]">
                Gestión de Permisos por Rol
            </h1>

            {/* 🧭 Selector de rol */}
            <div className="mb-6 flex items-center gap-4">
                <label className="text-lg font-medium">Seleccionar Rol:</label>
                <select
                    value={selectedRol}
                    onChange={(e) => handleRolChange(e.target.value)}
                    className="p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#2e63a6] w-64"
                >
                    <option value="">-- Seleccione un rol --</option>
                    {roles.map((r) => (
                        <option key={r.idRol} value={r.idRol}>
                            {r.descRol}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => handleRolChange(selectedRol)}
                    disabled={!selectedRol || loading}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
                >
                    <RefreshCw className="w-5 h-5" />
                    Refrescar
                </button>
            </div>

            {/* 🧩 Tabla de permisos */}
            {loading ? (
                <div className="text-gray-500 text-center py-10">Cargando permisos...</div>
            ) : permisos.length > 0 ? (
                <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="bg-[#2e63a6] text-white">
                            <th className="p-3 text-left">#</th>
                            <th className="p-3 text-left">Módulo</th>
                            <th className="p-3 text-center">Ver</th>
                            <th className="p-3 text-center">Crear</th>
                            <th className="p-3 text-center">Actualizar</th>
                            <th className="p-3 text-center">Eliminar</th>
                        </tr>
                        </thead>
                        <tbody>
                        {permisos.map((permiso, index) => (
                            <tr
                                key={permiso.idPermiso}
                                className={`border-b hover:bg-gray-50 transition ${
                                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                }`}
                            >
                                <td className="p-3 text-gray-600 text-center">{index + 1}</td>
                                <td className="p-3 font-medium">{permiso.descPermiso}</td>
                                {["puedeVer", "puedeCrear", "puedeActualizar", "puedeEliminar"].map(
                                    (campo) => (
                                        <td key={campo} className="p-3 text-center">
                                            <label className="inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={permiso[campo]}
                                                    onChange={() => togglePermiso(permiso.idPermiso, campo)}
                                                    className="form-checkbox h-5 w-5 text-[#2e63a6] rounded focus:ring-[#2e63a6]"
                                                />
                                            </label>
                                        </td>
                                    )
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500">Seleccione un rol para ver sus permisos.</p>
            )}

            {/* 🔘 Botones */}
            {permisos.length > 0 && (
                <div className="flex justify-end mt-6 gap-3">
                    <button
                        onClick={handleGuardar}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button
                        onClick={() => handleRolChange(selectedRol)}
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
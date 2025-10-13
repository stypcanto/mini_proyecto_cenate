// ========================================================================
// 🧩 RolesManagement.jsx — Panel de Roles y Permisos (Estilo Apple Pro)
// ========================================================================

import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
    ShieldCheck,
    Key,
    CheckSquare,
    Users,
    RefreshCw,
    Plus,
    Search,
    Edit,
    Trash2,
    Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Endpoints backend
const API_ROLES = "http://localhost:8080/api/admin/roles";
const API_PERMISOS = "http://localhost:8080/api/admin/permisos";

export default function RolesManagement() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRol, setSelectedRol] = useState(null);
    const [permisos, setPermisos] = useState([]);
    const [busqueda, setBusqueda] = useState("");

    // ======================================================
    // 🧠 Cargar roles al iniciar
    // ======================================================
    useEffect(() => {
        cargarRoles();
    }, []);

    const cargarRoles = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(API_ROLES, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setRoles(await res.json());
        } catch (err) {
            console.error("❌ Error al cargar roles:", err);
        } finally {
            setLoading(false);
        }
    };

    const cargarPermisos = async (idRol) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_PERMISOS}/rol/${idRol}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setPermisos(await res.json());
        } catch (err) {
            console.error("⚠️ Error al cargar permisos:", err);
        }
    };

    // ======================================================
    // 🔁 Actualizar permisos dinámicamente
    // ======================================================
    const actualizarPermiso = async (permiso) => {
        const token = localStorage.getItem("token");
        try {
            await fetch(`${API_PERMISOS}/${permiso.idPermiso}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(permiso),
            });
        } catch (err) {
            console.error("⚠️ Error al actualizar permiso:", err);
        }
    };

    const togglePermiso = (permiso, campo) => {
        const actualizado = { ...permiso, [campo]: !permiso[campo] };
        setPermisos((prev) =>
            prev.map((p) => (p.idPermiso === permiso.idPermiso ? actualizado : p))
        );
        actualizarPermiso(actualizado);
    };

    // ======================================================
    // 🎨 Render principal
    // ======================================================
    return (
        <AdminLayout>
            {/* Header */}
            <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white p-8 shadow-lg">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-white/90" />
                        Gestión de Roles y Permisos
                    </h1>
                    <button
                        onClick={cargarRoles}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all text-sm font-semibold"
                    >
                        <RefreshCw className="w-4 h-4" /> Actualizar
                    </button>
                </div>
                <p className="text-green-100 mt-2">
                    Administra roles del sistema y sus permisos asociados.
                </p>
            </div>

            {/* Contenido principal */}
            <div className="max-w-7xl mx-auto p-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <RefreshCw className="w-10 h-10 animate-spin text-green-600 mb-3" />
                        Cargando datos, por favor espera...
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {/* Panel de roles */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                                    <Users className="text-green-600 w-5 h-5" /> Roles
                                </h2>
                                <button
                                    onClick={() => alert("Funcionalidad de nuevo rol próximamente")}
                                    className="text-sm flex items-center gap-1 text-green-600 hover:text-green-700 font-semibold"
                                >
                                    <Plus className="w-4 h-4" /> Nuevo
                                </button>
                            </div>

                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar rol..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div className="max-h-[400px] overflow-y-auto pr-2">
                                {roles
                                    .filter((r) =>
                                        r.descRol.toLowerCase().includes(busqueda.toLowerCase())
                                    )
                                    .map((r) => (
                                        <button
                                            key={r.idRol}
                                            onClick={() => {
                                                setSelectedRol(r);
                                                cargarPermisos(r.idRol);
                                            }}
                                            className={`block w-full text-left px-4 py-2 rounded-lg mb-2 transition-all ${
                                                selectedRol?.idRol === r.idRol
                                                    ? "bg-green-600 text-white shadow"
                                                    : "hover:bg-gray-50 text-gray-700"
                                            }`}
                                        >
                                            {r.descRol}
                                        </button>
                                    ))}
                            </div>
                        </div>

                        {/* Panel de permisos */}
                        <div className="md:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                            {selectedRol ? (
                                <>
                                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                                        <Key className="text-green-600 w-5 h-5" />
                                        Permisos del rol:{" "}
                                        <span className="font-bold text-green-700">
                      {selectedRol.descRol}
                    </span>
                                    </h2>

                                    {permisos.length === 0 ? (
                                        <p className="text-gray-500 text-sm">
                                            No hay permisos configurados.
                                        </p>
                                    ) : (
                                        <table className="w-full text-sm border-collapse">
                                            <thead>
                                            <tr className="bg-gray-50 text-gray-600 uppercase text-xs">
                                                <th className="p-3 text-left font-semibold">Permiso</th>
                                                <th>Ver</th>
                                                <th>Crear</th>
                                                <th>Editar</th>
                                                <th>Eliminar</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {permisos.map((perm) => (
                                                <tr
                                                    key={perm.idPermiso}
                                                    className="border-t hover:bg-gray-50 transition-all"
                                                >
                                                    <td className="p-2 font-medium text-gray-800">
                                                        {perm.descPermiso}
                                                    </td>
                                                    {[
                                                        "puedeVer",
                                                        "puedeCrear",
                                                        "puedeActualizar",
                                                        "puedeEliminar",
                                                    ].map((campo) => (
                                                        <td
                                                            key={campo}
                                                            className="text-center cursor-pointer"
                                                            onClick={() => togglePermiso(perm, campo)}
                                                        >
                                                            <CheckSquare
                                                                className={`inline w-5 h-5 ${
                                                                    perm[campo]
                                                                        ? "text-green-600"
                                                                        : "text-gray-300"
                                                                }`}
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-500 italic">
                                    Selecciona un rol para ver sus permisos.
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </AdminLayout>
    );
}
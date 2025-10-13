import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
    ShieldCheck,
    Plus,
    Search,
    Edit,
    Trash2,
    Key,
    Users,
    RefreshCw,
    XCircle,
    Save,
    CheckSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_ROLES = "http://localhost:8080/api/admin/roles";
const API_PERMISOS = "http://localhost:8080/api/admin/permisos";

const RolesManagement = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRol, setSelectedRol] = useState(null);
    const [permisos, setPermisos] = useState([]);

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

    return (
        <AdminLayout>
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 shadow-lg">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <ShieldCheck className="w-8 h-8" /> Roles y Permisos
                </h1>
            </div>

            <div className="max-w-6xl mx-auto p-8">
                {loading ? (
                    <p>Cargando...</p>
                ) : (
                    <div className="grid grid-cols-3 gap-6">
                        {/* Panel de roles */}
                        <div className="col-span-1 bg-white rounded-xl shadow p-4">
                            <h2 className="text-lg font-semibold mb-4">Roles</h2>
                            {roles.map((r) => (
                                <button
                                    key={r.idRol}
                                    onClick={() => {
                                        setSelectedRol(r);
                                        cargarPermisos(r.idRol);
                                    }}
                                    className={`block w-full text-left px-4 py-2 rounded-lg mb-2 border ${
                                        selectedRol?.idRol === r.idRol
                                            ? "bg-green-600 text-white"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    {r.descRol}
                                </button>
                            ))}
                        </div>

                        {/* Panel de permisos */}
                        <div className="col-span-2 bg-white rounded-xl shadow p-6">
                            {selectedRol ? (
                                <>
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <Key className="text-green-600 w-5 h-5" />
                                        Permisos del rol: {selectedRol.descRol}
                                    </h2>
                                    {permisos.length === 0 ? (
                                        <p className="text-gray-500">No hay permisos configurados.</p>
                                    ) : (
                                        <table className="w-full border-collapse">
                                            <thead>
                                            <tr className="bg-gray-100 text-sm text-gray-700">
                                                <th className="p-2 text-left">Permiso</th>
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
                                                    className="border-t text-sm hover:bg-gray-50"
                                                >
                                                    <td className="p-2 font-medium">{perm.descPermiso}</td>
                                                    {["puedeVer", "puedeCrear", "puedeActualizar", "puedeEliminar"].map(
                                                        (campo) => (
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
                                                        )
                                                    )}
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
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default RolesManagement;
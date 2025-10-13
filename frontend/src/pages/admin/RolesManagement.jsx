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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:8080/api/admin/roles";

const RolesManagement = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRol, setSelectedRol] = useState(null);
    const [form, setForm] = useState({ descRol: "" });
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Cargar roles al inicio
    useEffect(() => {
        cargarRoles();
    }, []);

    const cargarRoles = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(API_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setRoles(await res.json());
            }
        } catch (err) {
            console.error("❌ Error al cargar roles:", err);
        } finally {
            setLoading(false);
        }
    };

    const guardarRol = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const metodo = selectedRol ? "PUT" : "POST";
        const url = selectedRol ? `${API_URL}/${selectedRol.idRol}` : API_URL;

        try {
            const res = await fetch(url, {
                method: metodo,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                setModalOpen(false);
                setForm({ descRol: "" });
                setSelectedRol(null);
                cargarRoles();
            }
        } catch (err) {
            console.error("⚠️ Error al guardar rol:", err);
        }
    };

    const eliminarRol = async (idRol) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_URL}/${idRol}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setConfirmDelete(null);
                cargarRoles();
            }
        } catch (err) {
            console.error("⚠️ Error al eliminar rol:", err);
        }
    };

    const rolesFiltrados = roles.filter((rol) =>
        rol.descRol?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatFecha = (fecha) =>
        fecha
            ? new Date(fecha).toLocaleDateString("es-PE", {
                year: "numeric",
                month: "short",
                day: "numeric",
            })
            : "—";

    return (
        <AdminLayout>
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 shadow-lg">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <ShieldCheck className="w-8 h-8" /> Gestión de Roles y Permisos
                        </h1>
                        <p className="text-green-100">Administra accesos del sistema</p>
                    </div>
                    <button
                        onClick={() => {
                            setModalOpen(true);
                            setForm({ descRol: "" });
                            setSelectedRol(null);
                        }}
                        className="flex items-center space-x-2 px-6 py-3 bg-white text-green-700 rounded-xl hover:bg-green-50 transition shadow-lg font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Nuevo Rol</span>
                    </button>
                </div>
            </div>

            {/* Contenido */}
            <div className="max-w-7xl mx-auto p-8 space-y-8">
                {/* Buscador */}
                <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-3 w-full">
                        <Search className="text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar rol..."
                            className="flex-1 border-none outline-none text-gray-700 placeholder-gray-400"
                        />
                    </div>
                    <button
                        onClick={cargarRoles}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refrescar</span>
                    </button>
                </div>

                {/* Grid de roles */}
                {loading ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <RefreshCw className="w-10 h-10 mx-auto text-green-600 animate-spin mb-4" />
                        <p className="text-gray-600">Cargando roles...</p>
                    </div>
                ) : rolesFiltrados.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <ShieldCheck className="w-14 h-14 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 text-lg">No hay roles registrados</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rolesFiltrados.map((rol) => (
                            <motion.div
                                key={rol.idRol}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-2xl shadow-md p-6 border hover:border-green-300 transition-all hover:shadow-xl"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                            <ShieldCheck className="text-green-500 w-5 h-5" />
                                            {rol.descRol}
                                        </h3>
                                        <p className="text-sm text-gray-500">ID: #{rol.idRol}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedRol(rol);
                                                setForm({ descRol: rol.descRol });
                                                setModalOpen(true);
                                            }}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                            title="Editar"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setConfirmDelete(rol)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between mb-3">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Users className="w-4 h-4 text-blue-500" />{" "}
                      {rol.usuarios?.length || 0} usuarios
                  </span>
                                    <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Key className="w-4 h-4 text-purple-500" />{" "}
                                        {rol.permisos?.length || 0} permisos
                  </span>
                                </div>

                                <p className="text-xs text-gray-400 mt-3">
                                    Creado: {formatFecha(rol.createdAt)} <br />
                                    Actualizado: {formatFecha(rol.updatedAt)}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* 🔹 Modal Crear/Editar */}
            <AnimatePresence>
                {modalOpen && (
                    <Modal
                        title={selectedRol ? "Editar Rol" : "Nuevo Rol"}
                        onClose={() => setModalOpen(false)}
                    >
                        <form onSubmit={guardarRol} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nombre del Rol
                                </label>
                                <input
                                    type="text"
                                    value={form.descRol}
                                    onChange={(e) => setForm({ descRol: e.target.value })}
                                    placeholder="Ej: ADMIN, MEDICO, SOPORTE..."
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 transition"
                            >
                                <Save className="w-5 h-5" />{" "}
                                {selectedRol ? "Actualizar Rol" : "Guardar Rol"}
                            </button>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>

            {/* 🔹 Confirmar eliminación */}
            <AnimatePresence>
                {confirmDelete && (
                    <Modal
                        title="Eliminar Rol"
                        onClose={() => setConfirmDelete(null)}
                        danger
                    >
                        <p className="text-gray-700 mb-6">
                            ¿Estás seguro de que deseas eliminar el rol{" "}
                            <strong>{confirmDelete.descRol}</strong>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => eliminarRol(confirmDelete.idRol)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Eliminar
                            </button>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

/* 🔹 Componente Modal con animaciones */
const Modal = ({ title, onClose, children, danger = false }) => (
    <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 ${
                danger ? "border-t-4 border-red-600" : "border-t-4 border-green-600"
            }`}
        >
            <div className="flex justify-between items-center mb-4">
                <h2
                    className={`text-lg font-bold ${
                        danger ? "text-red-700" : "text-gray-800"
                    }`}
                >
                    {title}
                </h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                    <XCircle className="w-5 h-5" />
                </button>
            </div>
            {children}
        </motion.div>
    </motion.div>
);

export default RolesManagement;
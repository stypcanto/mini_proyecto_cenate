// ========================================================================
// 👥 ADMIN USERS MANAGEMENT — Gestión profesional de usuarios CENATE
// ========================================================================

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    UserCog,
    Building2,
    RefreshCw,
    Search,
    Plus,
    Edit,
    Trash2,
    UserCheck,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
    getUsuariosExternos,
    getUsuariosInternos,
    getUsuarioById,
} from "../../api/usuarios";
import UsuarioDetalle from "./UsuarioDetalle"; // ✅ Ajuste: import correcto

export default function AdminUsersManagement() {
    const [activeTab, setActiveTab] = useState("internos");
    const [usuarios, setUsuarios] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [detalle, setDetalle] = useState(null);
    const [modalEdit, setModalEdit] = useState(null);
    const [modalDelete, setModalDelete] = useState(null);
    const [modalCreate, setModalCreate] = useState(false);

    // ======================================================
    // 🔁 CARGA DE USUARIOS
    // ======================================================
    const cargarDatos = useCallback(async () => {
        setLoading(true);
        try {
            const data =
                activeTab === "internos"
                    ? await getUsuariosInternos()
                    : await getUsuariosExternos();

            setUsuarios(data || []);
        } catch (err) {
            console.error("❌ Error al cargar usuarios:", err);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // ======================================================
    // 📄 DETALLE DE USUARIO
    // ======================================================
    const verDetalleUsuario = async (id) => {
        try {
            const data = await getUsuarioById(id);
            setDetalle(data);
        } catch (err) {
            console.error("❌ Error al obtener detalle del usuario:", err);
        }
    };

    // ======================================================
    // 🔍 FILTRO DE BÚSQUEDA
    // ======================================================
    const filteredData = usuarios.filter((u) =>
        (u.username || u.nombreCompleto || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const tabs = [
        { key: "internos", label: "Usuarios Internos", icon: <UserCog /> },
        { key: "externos", label: "Usuarios Externos", icon: <Building2 /> },
    ];

    // ======================================================
    // ✨ RENDER PRINCIPAL
    // ======================================================
    return (
        <AdminLayout>
            {/* Header */}
            <header className="bg-gradient-to-br from-blue-900 to-indigo-800 text-white py-10 shadow-lg border-b border-blue-700">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex items-center space-x-3 mb-2">
                        <Users className="w-9 h-9 text-blue-300" />
                        <h1 className="text-4xl font-semibold tracking-tight">
                            Gestión de Usuarios
                        </h1>
                    </div>
                    <p className="text-blue-200 text-base font-light">
                        Control y administración del personal interno y externo del sistema CENATE.
                    </p>
                </div>
            </header>

            {/* Contenido */}
            <main className="max-w-7xl mx-auto px-8 py-10">
                {/* Tabs */}
                <div className="flex flex-wrap gap-4 mb-8">
                    {tabs.map((tab) => (
                        <motion.button
                            key={tab.key}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                activeTab === tab.key
                                    ? "bg-blue-700 text-white shadow-md"
                                    : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200"
                            }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </motion.button>
                    ))}

                    <button
                        onClick={() => setModalCreate(true)}
                        className="ml-auto flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Usuario
                    </button>
                </div>

                {/* Buscador */}
                <div className="relative mb-10">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar usuario, nombre o documento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 text-sm rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    />
                </div>

                {/* Tabla */}
                <section className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-16 flex flex-col items-center">
                            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                            <p className="text-gray-600 font-medium">
                                Cargando usuarios...
                            </p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="p-16 text-center">
                            <UserCog className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg font-medium">
                                No se encontraron usuarios.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <Th>ID</Th>
                                    <Th>Usuario</Th>
                                    <Th>Rol</Th>
                                    <Th>Estado</Th>
                                    <Th className="text-right pr-6">Acciones</Th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {filteredData.map((u, i) => (
                                    <tr key={i} className="hover:bg-blue-50 transition-all">
                                        <Td>#{u.idUser || i + 1}</Td>
                                        <Td>{u.username || "—"}</Td>
                                        <Td>{u.roles?.join(", ") || "Sin rol"}</Td>
                                        <Td>
                                            {["A", "ACTIVO"].includes(u.estado || u.statUser) ? (
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                        Activo
                                                    </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                                        Inactivo
                                                    </span>
                                            )}
                                        </Td>
                                        <Td className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => verDetalleUsuario(u.idUser)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Ver Detalle"
                                                >
                                                    <UserCheck className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setModalEdit(u)}
                                                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setModalDelete(u)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </Td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>

            {/* ==================== MODALES ==================== */}
            <AnimatePresence>
                {detalle && (
                    <UsuarioDetalle usuario={detalle} onClose={() => setDetalle(null)} />
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}

/* === SUBCOMPONENTES === */
const Th = ({ children, className }) => (
    <th
        className={`px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider ${className}`}
    >
        {children}
    </th>
);

const Td = ({ children, className }) => (
    <td className={`px-6 py-4 text-sm text-gray-700 ${className}`}>{children}</td>
);
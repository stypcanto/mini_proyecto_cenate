// src/pages/admin/AdminUsersManagement.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Users,
    UserCheck,
    UserCog,
    Building2,
    RefreshCw,
    Search,
    Shield,
    X,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
    getUsuariosExternos,
    getUsuariosInternos,
    getUsuarioById,
} from "../../api/usuarios";

export default function AdminUsersManagement() {
    const [activeTab, setActiveTab] = useState("internos");
    const [usuarios, setUsuarios] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [detalle, setDetalle] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, [activeTab]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            let data = [];
            if (activeTab === "internos") {
                data = await getUsuariosInternos();
            } else {
                data = await getUsuariosExternos();
            }

            // ✅ Mostrar usuarios activos (acepta 'A' o 'ACTIVO')
            const activos = (data || []).filter(
                (u) =>
                    u.statUser === "A" ||
                    u.statUser === "ACTIVO" ||
                    u.estado === "A" ||
                    u.estado === "ACTIVO"
            );
            setUsuarios(activos);
        } catch (err) {
            console.error("❌ Error al cargar usuarios:", err);
        } finally {
            setLoading(false);
        }
    };

    const verDetalleUsuario = async (id) => {
        try {
            const data = await getUsuarioById(id);
            setDetalle(data);
        } catch (err) {
            console.error("❌ Error al obtener detalle del usuario:", err);
        }
    };

    const tabs = [
        { key: "internos", label: "Usuarios Internos", icon: <UserCog /> },
        { key: "externos", label: "Usuarios Externos", icon: <Building2 /> },
    ];

    const filteredData = usuarios.filter((u) =>
        (u.username || u.nombreCompleto || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            {/* Encabezado */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center space-x-3 mb-2">
                        <Users className="w-8 h-8" />
                        <h1 className="text-4xl font-bold">Gestión de Usuarios</h1>
                    </div>
                    <p className="text-blue-100 text-lg">
                        Administra usuarios internos y externos del sistema CENATE
                    </p>
                </div>
            </div>

            {/* Contenido */}
            <div className="max-w-7xl mx-auto p-8">
                {/* Tabs */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {tabs.map((tab) => (
                        <motion.button
                            key={tab.key}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all ${
                                activeTab === tab.key
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "bg-white text-gray-700 hover:bg-blue-50"
                            }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </motion.button>
                    ))}
                </div>

                {/* Búsqueda */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar usuario, nombre o documento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        icon={<UserCheck className="text-green-600" />}
                        title="Usuarios Activos"
                        value={usuarios.length}
                        color="green"
                    />
                    <StatCard
                        icon={<Shield className="text-blue-600" />}
                        title="Roles Asignados"
                        value={usuarios.reduce(
                            (acc, u) => acc + (u.roles ? u.roles.length : 0),
                            0
                        )}
                        color="blue"
                    />
                    <StatCard
                        icon={<UserCog className="text-indigo-600" />}
                        title="Total Usuarios"
                        value={usuarios.length}
                        color="indigo"
                    />
                </div>

                {/* Tabla */}
                <div className="bg-white/80 rounded-3xl shadow-xl border border-gray-100 backdrop-blur-xl overflow-hidden">
                    {loading ? (
                        <div className="p-16 flex flex-col items-center">
                            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                            <p className="text-gray-600 font-medium">
                                Cargando datos, por favor espera...
                            </p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="p-16 text-center">
                            <UserCog className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg font-medium">
                                No se encontraron usuarios activos
                            </p>
                            <p className="text-gray-400 text-sm">
                                Intenta ajustar tu búsqueda o revisa otra pestaña.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/60 border-b border-gray-200">
                                <tr>
                                    <Th>ID</Th>
                                    <Th>Usuario</Th>
                                    <Th>Rol</Th>
                                    <Th>Estado</Th>
                                    <Th>Detalle</Th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {filteredData.map((u, i) => (
                                    <tr
                                        key={i}
                                        className="hover:bg-blue-50 cursor-pointer transition-all duration-150"
                                    >
                                        <Td>#{u.idUser || i + 1}</Td>
                                        <Td>
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                                    {(u.username || "?").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">
                                                        {u.username || "Sin nombre"}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {u.email || "—"}
                                                    </p>
                                                </div>
                                            </div>
                                        </Td>
                                        <Td>
                                            {u.roles && u.roles.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {u.roles.map((r, j) => (
                                                        <span
                                                            key={j}
                                                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                                                        >
                                {r}
                              </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Sin rol</span>
                                            )}
                                        </Td>
                                        <Td>
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                u.statUser === "A" || u.statUser === "ACTIVO"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                        >
                          {u.statUser === "A" ? "Activo" : "Inactivo"}
                        </span>
                                        </Td>
                                        <Td>
                                            <button
                                                onClick={() => verDetalleUsuario(u.idUser)}
                                                className="text-blue-600 hover:underline text-sm font-medium"
                                            >
                                                Ver Detalle
                                            </button>
                                        </Td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Detalle */}
            {detalle && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg relative"
                    >
                        <button
                            onClick={() => setDetalle(null)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                            👤 Detalle del Usuario
                        </h3>
                        <ul className="text-sm text-gray-700 space-y-2">
                            <li>
                                <strong>ID:</strong> {detalle.idUser}
                            </li>
                            <li>
                                <strong>Nombre:</strong> {detalle.nombreCompleto || "—"}
                            </li>
                            <li>
                                <strong>Email:</strong> {detalle.email || "—"}
                            </li>
                            <li>
                                <strong>Roles:</strong> {detalle.roles?.join(", ") || "—"}
                            </li>
                            <li>
                                <strong>Estado:</strong> {detalle.statUser}
                            </li>
                        </ul>
                    </motion.div>
                </div>
            )}
        </AdminLayout>
    );
}

/* === COMPONENTES REUTILIZABLES === */
const StatCard = ({ icon, title, value, color }) => (
    <motion.div
        whileHover={{ scale: 1.03 }}
        className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-md p-6 flex items-center justify-between"
    >
        <div>
            <p className="text-gray-600 text-sm font-semibold">{title}</p>
            <p className={`text-3xl font-bold text-${color}-600`}>{value || 0}</p>
        </div>
        <div className={`p-3 bg-${color}-100 rounded-xl`}>{icon}</div>
    </motion.div>
);

const Th = ({ children }) => (
    <th className="px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">
        {children}
    </th>
);

const Td = ({ children }) => (
    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
        {children}
    </td>
);
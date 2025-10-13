import React, { useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
    Users,
    Plus,
    Search,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    RefreshCw,
    Filter,
    Lock,
    AlertCircle,
    Eye,
    Building2,
    UserCircle,
    X,
} from "lucide-react";
import { useUsuarios } from "../../hooks/useUsuarios";
import { motion, AnimatePresence } from "framer-motion";

const UserManagement = () => {
    const { usuarios, loading, error, fetchUsuarios } = useUsuarios();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterEstado, setFilterEstado] = useState("");
    const [filterTipo, setFilterTipo] = useState(""); // 🔸 interno o externo
    const [selectedUser, setSelectedUser] = useState(null);

    // 🔍 Filtrado inteligente
    const usuariosFiltrados = usuarios.filter((usuario) => {
        if (!usuario) return false;

        const searchMatch =
            !searchTerm ||
            usuario.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            usuario.idUser?.toString().includes(searchTerm);

        const estadoMatch = !filterEstado || usuario.estado === filterEstado;
        const tipoMatch =
            !filterTipo ||
            (filterTipo === "INTERNO" && usuario.tipoUsuario === "INTERNO") ||
            (filterTipo === "EXTERNO" && usuario.tipoUsuario === "EXTERNO");

        return searchMatch && estadoMatch && tipoMatch;
    });

    const totalActivos = usuarios.filter((u) => u.estado === "ACTIVO").length;
    const totalInactivos = usuarios.filter((u) => u.estado === "INACTIVO").length;
    const totalExternos = usuarios.filter((u) => u.tipoUsuario === "EXTERNO").length;
    const totalInternos = usuarios.filter((u) => u.tipoUsuario === "INTERNO").length;

    const getEstadoBadge = (estado) => {
        const esActivo = estado === "ACTIVO";
        return (
            <span
                className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    esActivo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
            >
        {esActivo ? (
            <CheckCircle className="w-3 h-3 mr-1" />
        ) : (
            <XCircle className="w-3 h-3 mr-1" />
        )}
                {esActivo ? "Activo" : "Inactivo"}
      </span>
        );
    };

    const getTipoBadge = (tipo) => {
        const isInterno = tipo === "INTERNO";
        return (
            <span
                className={`px-2 py-1 text-xs font-semibold rounded-md ${
                    isInterno
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                }`}
            >
        {isInterno ? "Interno" : "Externo"}
      </span>
        );
    };

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
            {/* 🔷 HEADER */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 shadow-lg">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <Users className="w-8 h-8" />
                            <h1 className="text-4xl font-bold">Gestión de Usuarios</h1>
                        </div>
                        <p className="text-blue-100 text-lg">
                            Administra usuarios internos y externos del sistema
                        </p>
                    </div>
                    <button className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition shadow-lg font-semibold">
                        <Plus className="w-5 h-5" />
                        <span>Nuevo Usuario</span>
                    </button>
                </div>
            </div>

            {/* CONTENIDO */}
            <div className="max-w-7xl mx-auto p-8">
                {/* ❌ Mensaje de error */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                        <div>
                            <p className="text-red-800 font-semibold">Error</p>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* 🔍 FILTROS */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Buscar Usuario
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Nombre de usuario o ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tipo
                            </label>
                            <select
                                value={filterTipo}
                                onChange={(e) => setFilterTipo(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Todos</option>
                                <option value="INTERNO">Internos</option>
                                <option value="EXTERNO">Externos</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Estado
                            </label>
                            <select
                                value={filterEstado}
                                onChange={(e) => setFilterEstado(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Todos</option>
                                <option value="ACTIVO">Activos</option>
                                <option value="INACTIVO">Inactivos</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex space-x-3 mt-4">
                        <button
                            onClick={fetchUsuarios}
                            disabled={loading}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                            />
                            <span>Actualizar</span>
                        </button>
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setFilterEstado("");
                                setFilterTipo("");
                            }}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Limpiar Filtros</span>
                        </button>
                    </div>
                </div>

                {/* 📊 ESTADÍSTICAS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard label="Total Usuarios" value={usuarios.length} icon={Users} color="blue" />
                    <StatCard label="Activos" value={totalActivos} icon={CheckCircle} color="green" />
                    <StatCard label="Inactivos" value={totalInactivos} icon={XCircle} color="red" />
                    <StatCard label="Externos / Internos" value={`${totalExternos} / ${totalInternos}`} icon={Building2} color="amber" />
                </div>

                {/* 🧾 TABLA */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {loading ? (
                        <LoadingState />
                    ) : usuariosFiltrados.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                <tr>
                                    <Th>ID</Th>
                                    <Th>Usuario</Th>
                                    <Th>Tipo</Th>
                                    <Th>Estado</Th>
                                    <Th>Roles</Th>
                                    <Th>Creación</Th>
                                    <Th>Último Login</Th>
                                    <Th>Acciones</Th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {usuariosFiltrados.map((u) => (
                                    <tr key={u.idUser} className="hover:bg-gray-50 transition">
                                        <Td>#{u.idUser}</Td>
                                        <Td>
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {u.username?.charAt(0).toUpperCase() || "?"}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {u.username}
                                                    </div>
                                                    {u.isLocked && (
                                                        <div className="flex items-center text-xs text-red-600 mt-1">
                                                            <Lock className="w-3 h-3 mr-1" /> Bloqueado
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Td>
                                        <Td>{getTipoBadge(u.tipoUsuario)}</Td>
                                        <Td>{getEstadoBadge(u.estado)}</Td>
                                        <Td>
                                            <div className="flex flex-wrap gap-1">
                                                {u.roles?.length > 0 ? (
                                                    u.roles.map((rol, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium"
                                                        >
                                {rol}
                              </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 text-sm">Sin roles</span>
                                                )}
                                            </div>
                                        </Td>
                                        <Td>{formatFecha(u.createAt)}</Td>
                                        <Td>{formatFecha(u.lastLoginAt)}</Td>
                                        <Td>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => setSelectedUser(u)}
                                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Ver Detalle"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
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
                </div>

                {/* 🔍 MODAL DETALLE */}
                <AnimatePresence>
                    {selectedUser && (
                        <motion.div
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 50, opacity: 0 }}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <UserCircle className="text-blue-600 w-5 h-5" />
                                        Detalle de Usuario
                                    </h2>
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="text-gray-400 hover:text-gray-700"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-3 text-sm text-gray-700">
                                    <p>
                                        <strong>Usuario:</strong> {selectedUser.username}
                                    </p>
                                    <p>
                                        <strong>Tipo:</strong> {selectedUser.tipoUsuario}
                                    </p>
                                    <p>
                                        <strong>Estado:</strong> {selectedUser.estado}
                                    </p>
                                    <p>
                                        <strong>Roles:</strong>{" "}
                                        {selectedUser.roles?.join(", ") || "Sin roles"}
                                    </p>
                                    <p>
                                        <strong>Fecha creación:</strong>{" "}
                                        {formatFecha(selectedUser.createAt)}
                                    </p>
                                    <p>
                                        <strong>Último acceso:</strong>{" "}
                                        {formatFecha(selectedUser.lastLoginAt)}
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AdminLayout>
    );
};

/* 🔹 Subcomponentes reutilizables */
const Th = ({ children }) => (
    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
        {children}
    </th>
);
const Td = ({ children }) => (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{children}</td>
);

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center border border-gray-100 hover:shadow-lg transition">
        <div>
            <p className="text-gray-600 text-sm font-semibold mb-1">{label}</p>
            <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
            <Icon className={`w-7 h-7 text-${color}-600`} />
        </div>
    </div>
);

const LoadingState = () => (
    <div className="p-12 text-center">
        <RefreshCw className="w-12 h-12 mx-auto text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Cargando usuarios...</p>
    </div>
);
const EmptyState = () => (
    <div className="p-12 text-center">
        <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 text-lg">No se encontraron usuarios</p>
        <p className="text-gray-500 text-sm mt-2">
            Intenta cambiar los filtros de búsqueda
        </p>
    </div>
);

export default UserManagement;
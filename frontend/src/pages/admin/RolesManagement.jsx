import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
    ShieldCheck,
    Plus,
    Search,
    Edit,
    Trash2,
    Users,
    Key,
    RefreshCw,
} from "lucide-react";

const RolesManagement = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        cargarRoles();
    }, []);

    const cargarRoles = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8080/api/admin/roles", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setRoles(data);
            }
        } catch (error) {
            console.error("Error al cargar roles:", error);
        } finally {
            setLoading(false);
        }
    };

    const filtrarRoles = () => {
        return roles.filter((rol) =>
            rol.descRol.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const formatFecha = (fecha) => {
        if (!fecha) return "N/A";
        return new Date(fecha).toLocaleDateString("es-PE", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const rolesFiltrados = filtrarRoles();

    return (
        <AdminLayout>
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <ShieldCheck className="w-8 h-8" />
                                <h1 className="text-4xl font-bold">Gestión de Roles y Permisos</h1>
                            </div>
                            <p className="text-green-100 text-lg">
                                Configura los accesos del sistema
                            </p>
                        </div>
                        <button className="flex items-center space-x-2 px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors shadow-lg font-semibold">
                            <Plus className="w-5 h-5" />
                            <span>Nuevo Rol</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="max-w-7xl mx-auto p-8">
                {/* Filtros */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Buscar Rol
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Nombre del rol..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                        <div className="pt-7">
                            <button
                                onClick={cargarRoles}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Actualizar</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-semibold mb-1">
                                    Total de Roles
                                </p>
                                <p className="text-3xl font-bold text-gray-900">{roles.length}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <ShieldCheck className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-semibold mb-1">
                                    Roles Activos
                                </p>
                                <p className="text-3xl font-bold text-green-600">{roles.length}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Key className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-semibold mb-1">
                                    Permisos Configurados
                                </p>
                                <p className="text-3xl font-bold text-purple-600">
                                    {roles.reduce(
                                        (acc, rol) => acc + (rol.permisos?.length || 0),
                                        0
                                    )}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Users className="w-8 h-8 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid de Roles */}
                {loading ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <RefreshCw className="w-12 h-12 mx-auto text-green-600 animate-spin mb-4" />
                        <p className="text-gray-600">Cargando roles...</p>
                    </div>
                ) : rolesFiltrados.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <ShieldCheck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 text-lg">No se encontraron roles</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rolesFiltrados.map((rol) => (
                            <div
                                key={rol.idRol}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-2 border-gray-100 hover:border-green-300"
                            >
                                {/* Header del Card */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                                            <ShieldCheck className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {rol.descRol}
                                            </h3>
                                            <p className="text-sm text-gray-500">ID: #{rol.idRol}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Información */}
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <span className="text-sm text-gray-700 font-medium flex items-center">
                                            <Users className="w-4 h-4 mr-2 text-blue-600" />
                                            Usuarios
                                        </span>
                                        <span className="text-lg font-bold text-blue-600">
                                            {rol.usuarios?.length || 0}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                        <span className="text-sm text-gray-700 font-medium flex items-center">
                                            <Key className="w-4 h-4 mr-2 text-purple-600" />
                                            Permisos
                                        </span>
                                        <span className="text-lg font-bold text-purple-600">
                                            {rol.permisos?.length || 0}
                                        </span>
                                    </div>
                                </div>

                                {/* Permisos */}
                                {rol.permisos && rol.permisos.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xs font-semibold text-gray-600 mb-2">
                                            PERMISOS:
                                        </p>
                                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                                            {rol.permisos.slice(0, 5).map((permiso, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium"
                                                >
                                                    {permiso.nombre}
                                                </span>
                                            ))}
                                            {rol.permisos.length > 5 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                                    +{rol.permisos.length - 5} más
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Fechas */}
                                <div className="text-xs text-gray-500 mb-4 space-y-1">
                                    <p>Creado: {formatFecha(rol.createdAt)}</p>
                                    <p>Actualizado: {formatFecha(rol.updatedAt)}</p>
                                </div>

                                {/* Acciones */}
                                <div className="flex space-x-2 pt-4 border-t border-gray-100">
                                    <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        <Edit className="w-4 h-4" />
                                        <span className="text-sm font-medium">Editar</span>
                                    </button>
                                    <button className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default RolesManagement;

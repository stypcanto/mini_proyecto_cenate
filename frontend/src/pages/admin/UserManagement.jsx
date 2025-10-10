import React, { useState, useEffect } from "react";
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
    Unlock,
    AlertCircle
} from "lucide-react";

const UserManagement = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterEstado, setFilterEstado] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem("token");
            
            if (!token) {
                setError("No hay sesión activa. Por favor, inicia sesión nuevamente.");
                setLoading(false);
                return;
            }

            console.log("🔄 Cargando usuarios desde API...");
            
            const response = await fetch("http://localhost:8080/api/usuarios", {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            console.log("📡 Status HTTP:", response.status);

            if (!response.ok) {
                if (response.status === 401) {
                    setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
                    localStorage.removeItem("token");
                } else {
                    const errorText = await response.text();
                    setError(`Error del servidor: ${response.status} - ${errorText}`);
                }
                setLoading(false);
                return;
            }

            const data = await response.json();
            console.log("✅ Datos recibidos:", data);
            console.log("📊 Número de usuarios:", data.length);
            
            if (data.length > 0) {
                console.log("👤 Primer usuario completo:", JSON.stringify(data[0], null, 2));
            }
            
            setUsuarios(data);
            setError(null);
            
        } catch (error) {
            console.error("❌ Error en la petición:", error);
            setError(`Error de conexión: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const filtrarUsuarios = () => {
        if (!usuarios || !Array.isArray(usuarios)) {
            console.warn("⚠️ usuarios no es un array válido");
            return [];
        }

        return usuarios.filter((usuario) => {
            if (!usuario) return false;

            // Filtro de búsqueda
            const searchMatch = !searchTerm || 
                (usuario.username && usuario.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (usuario.idUser && usuario.idUser.toString().includes(searchTerm));

            // Filtro de estado
            const estadoMatch = !filterEstado || usuario.estado === filterEstado;

            return searchMatch && estadoMatch;
        });
    };

    const getEstadoBadge = (estado) => {
        const esActivo = estado === "ACTIVO";
        
        return (
            <span className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                esActivo 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
            }`}>
                {esActivo ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                {esActivo ? 'Activo' : 'Inactivo'}
            </span>
        );
    };

    const formatFecha = (fecha) => {
        if (!fecha) return "N/A";
        try {
            return new Date(fecha).toLocaleDateString("es-PE", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch (e) {
            return "N/A";
        }
    };

    const handleActivar = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/usuarios/${id}/activate`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (response.ok) {
                await cargarUsuarios();
                console.log(`✅ Usuario ${id} activado`);
            }
        } catch (error) {
            console.error("❌ Error al activar usuario:", error);
            setError("Error al activar el usuario");
        }
    };

    const handleDesactivar = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/usuarios/${id}/deactivate`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (response.ok) {
                await cargarUsuarios();
                console.log(`✅ Usuario ${id} desactivado`);
            }
        } catch (error) {
            console.error("❌ Error al desactivar usuario:", error);
            setError("Error al desactivar el usuario");
        }
    };

    const usuariosFiltrados = filtrarUsuarios();
    const totalActivos = usuarios.filter(u => u.estado === "ACTIVO").length;
    const totalInactivos = usuarios.filter(u => u.estado === "INACTIVO").length;

    return (
        <AdminLayout>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <Users className="w-8 h-8" />
                                <h1 className="text-4xl font-bold">Gestión de Usuarios</h1>
                            </div>
                            <p className="text-blue-100 text-lg">
                                Administra los usuarios del sistema
                            </p>
                        </div>
                        <button className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-lg font-semibold">
                            <Plus className="w-5 h-5" />
                            <span>Nuevo Usuario</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="max-w-7xl mx-auto p-8">
                {/* Mensaje de error */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                            <div>
                                <p className="text-red-800 font-semibold">Error</p>
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filtros */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                Estado
                            </label>
                            <select
                                value={filterEstado}
                                onChange={(e) => setFilterEstado(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Todos</option>
                                <option value="ACTIVO">Activos</option>
                                <option value="INACTIVO">Inactivos</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex space-x-3 mt-4">
                        <button
                            onClick={cargarUsuarios}
                            disabled={loading}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            <span>Actualizar</span>
                        </button>
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setFilterEstado("");
                            }}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Limpiar Filtros</span>
                        </button>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-semibold mb-1">
                                    Total Usuarios
                                </p>
                                <p className="text-3xl font-bold text-gray-900">{usuarios.length}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-semibold mb-1">
                                    Usuarios Activos
                                </p>
                                <p className="text-3xl font-bold text-green-600">{totalActivos}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-semibold mb-1">
                                    Usuarios Inactivos
                                </p>
                                <p className="text-3xl font-bold text-red-600">{totalInactivos}</p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-lg">
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <RefreshCw className="w-12 h-12 mx-auto text-blue-600 animate-spin mb-4" />
                            <p className="text-gray-600">Cargando usuarios...</p>
                        </div>
                    ) : usuariosFiltrados.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 text-lg">No se encontraron usuarios</p>
                            {usuarios.length > 0 && (
                                <p className="text-gray-500 text-sm mt-2">
                                    Intenta cambiar los filtros de búsqueda
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Usuario
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Roles
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Fecha Creación
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Último Login
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {usuariosFiltrados.map((usuario) => (
                                        <tr
                                            key={usuario.idUser}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-900">
                                                    #{usuario.idUser}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-bold text-sm">
                                                            {usuario.username ? usuario.username.charAt(0).toUpperCase() : '?'}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {usuario.username || 'Sin nombre'}
                                                        </div>
                                                        {usuario.isLocked && (
                                                            <div className="flex items-center text-xs text-red-600 mt-1">
                                                                <Lock className="w-3 h-3 mr-1" />
                                                                Bloqueado
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getEstadoBadge(usuario.estado)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {usuario.roles && Array.isArray(usuario.roles) && usuario.roles.length > 0 ? (
                                                        usuario.roles.map((rol, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium"
                                                            >
                                                                {rol}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">Sin roles</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatFecha(usuario.createAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatFecha(usuario.lastLoginAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    {usuario.estado === "ACTIVO" ? (
                                                        <button 
                                                            onClick={() => handleDesactivar(usuario.idUser)}
                                                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                            title="Desactivar usuario"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleActivar(usuario.idUser)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Activar usuario"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Editar usuario">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Eliminar usuario">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Info de Debug */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs font-mono">
                        <p className="font-bold mb-2">🐛 Debug Info:</p>
                        <p>Total usuarios cargados: {usuarios.length}</p>
                        <p>Usuarios filtrados: {usuariosFiltrados.length}</p>
                        <p>Activos: {totalActivos} | Inactivos: {totalInactivos}</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default UserManagement;

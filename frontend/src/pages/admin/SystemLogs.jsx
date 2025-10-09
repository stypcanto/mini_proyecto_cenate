import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
    ServerCog,
    Search,
    Filter,
    Download,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Info,
    XCircle,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const SystemLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterNivel, setFilterNivel] = useState("");
    const [filterEstado, setFilterEstado] = useState("");

    useEffect(() => {
        cargarLogs();
    }, [page, filterNivel, filterEstado]);

    const cargarLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            let url = `http://localhost:8080/api/admin/audit/logs?page=${page}&size=20&sortBy=fechaHora&direction=desc`;

            if (filterNivel) url += `&nivel=${filterNivel}`;
            if (filterEstado) url += `&estado=${filterEstado}`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setLogs(data.content);
                setTotalPages(data.totalPages);
            }
        } catch (error) {
            console.error("Error al cargar logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const getNivelIcon = (nivel) => {
        switch (nivel) {
            case "INFO":
                return <Info className="w-5 h-5 text-blue-600" />;
            case "WARNING":
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            case "ERROR":
                return <XCircle className="w-5 h-5 text-red-600" />;
            case "CRITICAL":
                return <XCircle className="w-5 h-5 text-red-800" />;
            default:
                return <Info className="w-5 h-5 text-gray-600" />;
        }
    };

    const getNivelBadge = (nivel) => {
        const classes = {
            INFO: "bg-blue-100 text-blue-800",
            WARNING: "bg-yellow-100 text-yellow-800",
            ERROR: "bg-red-100 text-red-800",
            CRITICAL: "bg-red-200 text-red-900",
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${classes[nivel] || "bg-gray-100 text-gray-800"}`}>
                {nivel}
            </span>
        );
    };

    const getEstadoBadge = (estado) => {
        return estado === "SUCCESS" ? (
            <span className="flex items-center text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-1" />
                Éxito
            </span>
        ) : (
            <span className="flex items-center text-red-600 text-sm font-medium">
                <XCircle className="w-4 h-4 mr-1" />
                Fallo
            </span>
        );
    };

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleString("es-PE", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    return (
        <AdminLayout>
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-8 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center space-x-3 mb-2">
                        <ServerCog className="w-8 h-8" />
                        <h1 className="text-4xl font-bold">Logs del Sistema</h1>
                    </div>
                    <p className="text-orange-100 text-lg">Monitoreo y auditoría de actividades</p>
                </div>
            </div>

            {/* Contenido */}
            <div className="max-w-7xl mx-auto p-8">
                {/* Filtros y búsqueda */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Búsqueda */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Buscar
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Usuario, acción, módulo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>

                        {/* Filtro por nivel */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nivel
                            </label>
                            <select
                                value={filterNivel}
                                onChange={(e) => {
                                    setFilterNivel(e.target.value);
                                    setPage(0);
                                }}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="">Todos</option>
                                <option value="INFO">INFO</option>
                                <option value="WARNING">WARNING</option>
                                <option value="ERROR">ERROR</option>
                                <option value="CRITICAL">CRITICAL</option>
                            </select>
                        </div>

                        {/* Filtro por estado */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Estado
                            </label>
                            <select
                                value={filterEstado}
                                onChange={(e) => {
                                    setFilterEstado(e.target.value);
                                    setPage(0);
                                }}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="">Todos</option>
                                <option value="SUCCESS">Éxito</option>
                                <option value="FAILURE">Fallo</option>
                            </select>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex space-x-3 mt-4">
                        <button
                            onClick={cargarLogs}
                            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Actualizar</span>
                        </button>
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setFilterNivel("");
                                setFilterEstado("");
                                setPage(0);
                            }}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Limpiar Filtros</span>
                        </button>
                    </div>
                </div>

                {/* Tabla de logs */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <RefreshCw className="w-12 h-12 mx-auto text-orange-600 animate-spin mb-4" />
                            <p className="text-gray-600">Cargando logs...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-12 text-center">
                            <ServerCog className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 text-lg">No hay logs registrados</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Nivel
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Usuario
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Acción
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Módulo
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Detalle
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Estado
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Fecha/Hora
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {logs.map((log) => (
                                            <tr
                                                key={log.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        {getNivelIcon(log.nivel)}
                                                        {getNivelBadge(log.nivel)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-medium text-gray-900">
                                                        {log.usuario}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-700">
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                                        {log.modulo}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-600 line-clamp-2">
                                                        {log.detalle}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getEstadoBadge(log.estado)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-500">
                                                        {formatFecha(log.fechaHora)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            {totalPages > 1 && (
                                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        <button
                                            onClick={() => setPage(page - 1)}
                                            disabled={page === 0}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Anterior
                                        </button>
                                        <button
                                            onClick={() => setPage(page + 1)}
                                            disabled={page >= totalPages - 1}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Página <span className="font-medium">{page + 1}</span> de{" "}
                                                <span className="font-medium">{totalPages}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                <button
                                                    onClick={() => setPage(page - 1)}
                                                    disabled={page === 0}
                                                    className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => setPage(page + 1)}
                                                    disabled={page >= totalPages - 1}
                                                    className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default SystemLogs;

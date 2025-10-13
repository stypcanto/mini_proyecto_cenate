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
    Eye,
    X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:8080/api/admin/audit/logs";

const SystemLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterNivel, setFilterNivel] = useState("");
    const [filterEstado, setFilterEstado] = useState("");
    const [selectedLog, setSelectedLog] = useState(null);

    useEffect(() => {
        cargarLogs();
    }, [page, filterNivel, filterEstado]);

    const cargarLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            let url = `${API_URL}?page=${page}&size=20&sortBy=fechaHora&direction=desc`;

            if (filterNivel) url += `&nivel=${filterNivel}`;
            if (filterEstado) url += `&estado=${filterEstado}`;
            if (searchTerm) url += `&search=${searchTerm}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setLogs(data.content);
                setTotalPages(data.totalPages);
            }
        } catch (err) {
            console.error("Error al cargar logs:", err);
        } finally {
            setLoading(false);
        }
    };

    const exportarCSV = () => {
        const csv = logs
            .map((log) =>
                [
                    log.nivel,
                    log.usuario,
                    log.action,
                    log.modulo,
                    log.estado,
                    log.fechaHora,
                ].join(",")
            )
            .join("\n");

        const blob = new Blob([`nivel,usuario,accion,modulo,estado,fecha\n${csv}`], {
            type: "text/csv",
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `logs_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
    };

    const getNivelBadge = (nivel) => {
        const styles = {
            INFO: "bg-blue-50 text-blue-700 border-blue-200",
            WARNING: "bg-yellow-50 text-yellow-700 border-yellow-200",
            ERROR: "bg-red-50 text-red-700 border-red-200",
            CRITICAL: "bg-red-100 text-red-800 border-red-300 font-semibold",
        };
        return (
            <span
                className={`px-3 py-1 text-xs rounded-full border font-medium ${
                    styles[nivel] || "bg-gray-50 text-gray-600 border-gray-200"
                }`}
            >
        {nivel}
      </span>
        );
    };

    const getEstadoBadge = (estado) =>
        estado === "SUCCESS" ? (
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

    const formatFecha = (fecha) =>
        new Date(fecha).toLocaleString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });

    return (
        <AdminLayout>
            {/* HEADER */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-8 shadow-lg">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <ServerCog className="w-8 h-8" />
                            Logs del Sistema
                        </h1>
                        <p className="text-orange-100">Monitoreo y auditoría en tiempo real</p>
                    </div>
                    <button
                        onClick={exportarCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-orange-700 rounded-xl hover:bg-orange-50 shadow font-semibold"
                    >
                        <Download className="w-5 h-5" /> Exportar CSV
                    </button>
                </div>
            </div>

            {/* CONTENIDO */}
            <div className="max-w-7xl mx-auto p-8">
                {/* FILTROS */}
                <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Buscador */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Buscar
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Usuario, acción o módulo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>

                        {/* Nivel */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nivel
                            </label>
                            <select
                                value={filterNivel}
                                onChange={(e) => setFilterNivel(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="">Todos</option>
                                <option value="INFO">Info</option>
                                <option value="WARNING">Warning</option>
                                <option value="ERROR">Error</option>
                                <option value="CRITICAL">Crítico</option>
                            </select>
                        </div>

                        {/* Estado */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Estado
                            </label>
                            <select
                                value={filterEstado}
                                onChange={(e) => setFilterEstado(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="">Todos</option>
                                <option value="SUCCESS">Éxito</option>
                                <option value="FAILURE">Fallo</option>
                            </select>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={cargarLogs}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Actualizar
                        </button>
                        <button
                            onClick={() => {
                                setFilterNivel("");
                                setFilterEstado("");
                                setSearchTerm("");
                                setPage(0);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            <Filter className="w-4 h-4" />
                            Limpiar filtros
                        </button>
                    </div>
                </div>

                {/* TABLA */}
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
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                <tr>
                                    {["Nivel", "Usuario", "Acción", "Módulo", "Estado", "Fecha", " "].map(
                                        (head) => (
                                            <th
                                                key={head}
                                                className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                                            >
                                                {head}
                                            </th>
                                        )
                                    )}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {logs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="hover:bg-gray-50 transition-colors"
                                        onClick={() => setSelectedLog(log)}
                                    >
                                        <td className="px-6 py-4">{getNivelBadge(log.nivel)}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                            {log.usuario}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {log.action}
                                        </td>
                                        <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium">
                          {log.modulo}
                        </span>
                                        </td>
                                        <td className="px-6 py-4">{getEstadoBadge(log.estado)}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {formatFecha(log.fechaHora)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Eye className="w-4 h-4 text-gray-400 hover:text-orange-500 transition" />
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* PAGINACIÓN */}
                {totalPages > 1 && (
                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200 mt-2 rounded-b-2xl">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 0}
                            className="p-2 rounded-lg bg-white border text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <p className="text-sm text-gray-700">
                            Página <span className="font-semibold">{page + 1}</span> de{" "}
                            <span className="font-semibold">{totalPages}</span>
                        </p>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page >= totalPages - 1}
                            className="p-2 rounded-lg bg-white border text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* 🔍 Modal Detalle */}
            <AnimatePresence>
                {selectedLog && (
                    <motion.div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <ServerCog className="text-orange-600 w-5 h-5" />
                                    Detalle del Log
                                </h2>
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="text-gray-400 hover:text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-3 text-sm text-gray-700">
                                <p>
                                    <strong>Usuario:</strong> {selectedLog.usuario}
                                </p>
                                <p>
                                    <strong>Acción:</strong> {selectedLog.action}
                                </p>
                                <p>
                                    <strong>Módulo:</strong> {selectedLog.modulo}
                                </p>
                                <p>
                                    <strong>Detalle:</strong> {selectedLog.detalle || "—"}
                                </p>
                                <p>
                                    <strong>Estado:</strong> {getEstadoBadge(selectedLog.estado)}
                                </p>
                                <p>
                                    <strong>Fecha:</strong> {formatFecha(selectedLog.fechaHora)}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

export default SystemLogs;
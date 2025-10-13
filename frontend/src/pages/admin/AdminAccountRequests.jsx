// src/pages/admin/AdminAccountRequests.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { ClipboardList, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

// ⚙️ Endpoint backend (ajústalo si tu API usa otro nombre)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

export default function AdminAccountRequests() {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ======================================================
    // 🔄 Cargar solicitudes desde el backend
    // ======================================================
    const fetchSolicitudes = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/recuperacion-cuenta`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) throw new Error("Error al obtener solicitudes");
            const data = await response.json();
            setSolicitudes(data);
        } catch (err) {
            console.error("❌ Error al cargar solicitudes:", err);
            setError("Error al obtener solicitudes desde el servidor");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSolicitudes();
    }, []);

    // ======================================================
    // 🟢 Cambiar estado de solicitud
    // ======================================================
    const actualizarEstado = async (id, nuevoEstado) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/recuperacion-cuenta/${id}/estado`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ estado: nuevoEstado }),
            });

            if (!response.ok) throw new Error("Error al actualizar estado");

            setSolicitudes((prev) =>
                prev.map((s) => (s.id === id ? { ...s, estado: nuevoEstado } : s))
            );
        } catch (err) {
            console.error("❌ Error al actualizar estado:", err);
            alert("No se pudo cambiar el estado de la solicitud.");
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto p-8">
                <div className="flex items-center gap-3 mb-8">
                    <ClipboardList className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-800">
                        Solicitudes de Recuperación de Cuenta
                    </h1>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-16">
                        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-3" />
                        <p className="text-gray-600">Cargando solicitudes...</p>
                    </div>
                ) : error ? (
                    <p className="text-red-600 text-center">{error}</p>
                ) : solicitudes.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <Clock className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                        No hay solicitudes registradas.
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-100">
                        <table className="w-full text-sm text-gray-700">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-3 text-left">ID</th>
                                <th className="px-6 py-3 text-left">Correo</th>
                                <th className="px-6 py-3 text-left">Fecha</th>
                                <th className="px-6 py-3 text-left">Estado</th>
                                <th className="px-6 py-3 text-left">Acciones</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {solicitudes.map((sol) => (
                                <tr key={sol.id} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">#{sol.id}</td>
                                    <td className="px-6 py-4">{sol.email}</td>
                                    <td className="px-6 py-4">
                                        {new Date(sol.fechaSolicitud).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                      <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              sol.estado === "ATENDIDO"
                                  ? "bg-green-100 text-green-700"
                                  : sol.estado === "RECHAZADO"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {sol.estado}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            className="flex items-center gap-1 text-green-600 hover:underline"
                                            onClick={() => actualizarEstado(sol.id, "ATENDIDO")}
                                        >
                                            <CheckCircle className="w-4 h-4" /> Atender
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            className="flex items-center gap-1 text-red-600 hover:underline"
                                            onClick={() => actualizarEstado(sol.id, "RECHAZADO")}
                                        >
                                            <XCircle className="w-4 h-4" /> Rechazar
                                        </motion.button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
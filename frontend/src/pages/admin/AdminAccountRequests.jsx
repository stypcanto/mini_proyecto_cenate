import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
    ClipboardList,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
} from "lucide-react";
import { motion } from "framer-motion";

// ⚙️ Configuración de API (compatible con CRA)
const API_URL =
    process.env.REACT_APP_API_URL || "http://localhost:8080/api/account-requests";

export default function AdminAccountRequests() {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ======================================================
    // 🔄 Cargar solicitudes pendientes
    // ======================================================
    const fetchSolicitudes = async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/pendientes`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.status === 403) {
                throw new Error(
                    "No tienes permisos para acceder a las solicitudes. Revisa tu rol o token."
                );
            }

            if (!response.ok) throw new Error("Error al obtener solicitudes");

            const data = await response.json();
            setSolicitudes(data);
        } catch (err) {
            console.error("❌ Error al cargar solicitudes:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSolicitudes();
    }, []);

    // ======================================================
    // 🟢 Aprobar / ❌ Rechazar solicitud
    // ======================================================
    const cambiarEstadoSolicitud = async (id, accion) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/${id}/${accion}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    motivo:
                        accion === "aprobar"
                            ? "Solicitud aprobada por el administrador."
                            : "Solicitud rechazada por el administrador.",
                }),
            });

            if (!response.ok) throw new Error("Error al actualizar estado");

            setSolicitudes((prev) => prev.filter((s) => s.idRequest !== id));
        } catch (err) {
            console.error("⚠️ Error al actualizar estado:", err);
            alert("No se pudo actualizar el estado de la solicitud.");
        }
    };

    // ======================================================
    // 🎨 Render principal
    // ======================================================
    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto p-8">
                {/* 🧭 Header */}
                <div className="flex items-center gap-3 mb-8">
                    <ClipboardList className="w-8 h-8 text-blue-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Solicitudes de Cuentas
                        </h1>
                        <p className="text-gray-500">
                            Gestiona las solicitudes de acceso al sistema CENATE
                        </p>
                    </div>
                </div>

                {/* 🌀 Estado de carga */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-16">
                        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-3" />
                        <p className="text-gray-600">Cargando solicitudes...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-16 text-red-600 font-medium">
                        ⚠️ {error}
                    </div>
                ) : solicitudes.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <Clock className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                        No hay solicitudes pendientes por revisar.
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-100">
                        <table className="w-full text-sm text-gray-700">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-3 text-left">ID</th>
                                <th className="px-6 py-3 text-left">Nombre Completo</th>
                                <th className="px-6 py-3 text-left">Tipo Usuario</th>
                                <th className="px-6 py-3 text-left">Documento</th>
                                <th className="px-6 py-3 text-left">Motivo</th>
                                <th className="px-6 py-3 text-left">Estado</th>
                                <th className="px-6 py-3 text-left">Fecha</th>
                                <th className="px-6 py-3 text-center">Acciones</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {solicitudes.map((sol) => (
                                <tr
                                    key={sol.idRequest}
                                    className="hover:bg-blue-50 transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        #{sol.idRequest}
                                    </td>
                                    <td className="px-6 py-4">{sol.nombreCompleto}</td>
                                    <td className="px-6 py-4">{sol.tipoUsuario}</td>
                                    <td className="px-6 py-4">{sol.numDocumento}</td>
                                    <td className="px-6 py-4 text-gray-600 truncate max-w-xs">
                                        {sol.motivo}
                                    </td>
                                    <td className="px-6 py-4">
                      <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              sol.estado === "PENDIENTE"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : sol.estado === "APROBADO"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                          }`}
                      >
                        {sol.estado}
                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(sol.fechaCreacion).toLocaleString("es-PE")}
                                    </td>
                                    <td className="px-6 py-4 flex gap-3 justify-center">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            className="flex items-center gap-1 text-green-600 hover:underline"
                                            onClick={() =>
                                                cambiarEstadoSolicitud(sol.idRequest, "aprobar")
                                            }
                                        >
                                            <CheckCircle className="w-4 h-4" /> Aprobar
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            className="flex items-center gap-1 text-red-600 hover:underline"
                                            onClick={() =>
                                                cambiarEstadoSolicitud(sol.idRequest, "rechazar")
                                            }
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
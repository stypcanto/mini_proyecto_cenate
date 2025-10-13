import React, { useEffect, useState } from "react";
import { Check, XCircle, Loader2, RefreshCw, ClipboardList } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";

const AdminRecoveries = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("PENDIENTE");

    useEffect(() => {
        fetchSolicitudes();
    }, [filter]);

    const fetchSolicitudes = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `/api/admin/recuperacion${filter ? `?estado=${filter}` : ""}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            setSolicitudes(data);
        } catch (err) {
            console.error("❌ Error al cargar solicitudes:", err);
        } finally {
            setLoading(false);
        }
    };

    const actualizarEstado = async (id, nuevoEstado) => {
        if (!window.confirm(`¿Seguro que deseas marcar como ${nuevoEstado}?`)) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/admin/recuperacion/${id}/estado`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ estado: nuevoEstado }),
            });
            if (res.ok) fetchSolicitudes();
        } catch (err) {
            console.error("❌ Error al actualizar estado:", err);
        }
    };

    return (
        <AdminLayout>
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <ClipboardList className="w-7 h-7 text-teal-600" />
                        Solicitudes de Recuperación
                    </h1>
                    <button
                        onClick={fetchSolicitudes}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Actualizar
                    </button>
                </div>

                {/* Filtros */}
                <div className="mb-6 flex gap-3">
                    {["PENDIENTE", "ATENDIDO", "RECHAZADO"].map((estado) => (
                        <button
                            key={estado}
                            onClick={() => setFilter(estado)}
                            className={`px-4 py-2 rounded-lg font-semibold border transition-all ${
                                filter === estado
                                    ? "bg-teal-600 text-white"
                                    : "bg-white border-gray-300 hover:bg-gray-100"
                            }`}
                        >
                            {estado}
                        </button>
                    ))}
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-100 text-left text-gray-700">
                        <tr>
                            <th className="p-4">#</th>
                            <th className="p-4">Correo</th>
                            <th className="p-4">Fecha solicitud</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4 text-center">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center">
                                    <Loader2 className="animate-spin w-6 h-6 mx-auto text-teal-600" />
                                </td>
                            </tr>
                        ) : solicitudes.length > 0 ? (
                            solicitudes.map((s, i) => (
                                <tr
                                    key={s.id}
                                    className="border-b hover:bg-gray-50 transition-all"
                                >
                                    <td className="p-4 font-medium text-gray-600">{i + 1}</td>
                                    <td className="p-4">{s.email}</td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {new Date(s.fechaSolicitud).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                      <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                              s.estado === "PENDIENTE"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : s.estado === "ATENDIDO"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                          }`}
                      >
                        {s.estado}
                      </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {s.estado === "PENDIENTE" && (
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => actualizarEstado(s.id, "ATENDIDO")}
                                                    className="p-2 bg-green-100 hover:bg-green-200 rounded-lg"
                                                >
                                                    <Check className="w-5 h-5 text-green-600" />
                                                </button>
                                                <button
                                                    onClick={() => actualizarEstado(s.id, "RECHAZADO")}
                                                    className="p-2 bg-red-100 hover:bg-red-200 rounded-lg"
                                                >
                                                    <XCircle className="w-5 h-5 text-red-600" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-6 text-center text-gray-500">
                                    No hay solicitudes con este estado.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminRecoveries;
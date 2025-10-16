// ========================================================================
// 🧾 ADMIN ACCOUNT REQUESTS - Gestión de Solicitudes de Creación de Cuenta
// Descripción: Módulo administrativo para revisar, aprobar o rechazar solicitudes
// ========================================================================

import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2, Mail, User, FileText, Search } from "lucide-react";
import toast from "react-hot-toast";
import { getAccountRequests, updateAccountRequest } from "@/api/accountRequestsApi";

const AdminAccountRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ======================================================
  // 🔁 Cargar solicitudes al montar
  // ======================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAccountRequests();
        setRequests(data || []);
        setFiltered(data || []);
      } catch (err) {
        console.error("❌ Error al cargar solicitudes:", err);
        toast.error("No se pudieron cargar las solicitudes");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ======================================================
  // 🔍 Búsqueda
  // ======================================================
  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      requests.filter(
        (r) =>
          r.nombreCompleto?.toLowerCase().includes(term) ||
          r.emailInstitucional?.toLowerCase().includes(term)
      )
    );
  }, [search, requests]);

  // ======================================================
  // 🧩 Aprobar / Rechazar
  // ======================================================
  const handleAction = async (id, action) => {
    try {
      toast.loading("Procesando...");
      await updateAccountRequest(id, action);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, estado: action === "aprobar" ? "APROBADA" : "RECHAZADA" } : r
        )
      );
      toast.dismiss();
      toast.success(
        `Solicitud ${action === "aprobar" ? "aprobada ✅" : "rechazada ❌"} correctamente`
      );
    } catch (err) {
      toast.dismiss();
      toast.error("No se pudo procesar la acción");
      console.error(err);
    }
  };

  // ======================================================
  // 🧱 Render
  // ======================================================
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0B2149]">Solicitudes de Cuentas</h1>
            <p className="text-gray-600 text-sm">Revisa las solicitudes pendientes del sistema.</p>
          </div>

          {/* Buscador */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#123C73] focus:outline-none"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#123C73] text-white text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Solicitante</th>
                <th className="px-6 py-3">Correo</th>
                <th className="px-6 py-3">Motivo</th>
                <th className="px-6 py-3 text-center">Estado</th>
                <th className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-10">
                    <Loader2 className="w-6 h-6 mx-auto animate-spin text-[#123C73]" />
                    <p className="text-gray-500 mt-2">Cargando solicitudes...</p>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 flex items-center gap-3">
                      <User className="w-4 h-4 text-[#0B2149]" />
                      <span className="font-medium text-gray-800">{req.nombreCompleto}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#0B2149]" />
                        {req.emailInstitucional}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-xs truncate">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#123C73]" />
                        <span>{req.motivo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          req.estado === "APROBADA"
                            ? "bg-green-100 text-green-700"
                            : req.estado === "RECHAZADA"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {req.estado || "PENDIENTE"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center space-x-2">
                      {req.estado === "PENDIENTE" ? (
                        <>
                          <button
                            onClick={() => handleAction(req.id, "aprobar")}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 transition-all"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleAction(req.id, "rechazar")}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 transition-all"
                          >
                            <XCircle className="w-4 h-4" />
                            Rechazar
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 italic text-xs">
                          {req.estado === "APROBADA"
                            ? "✔ Aprobada"
                            : "✖ Rechazada"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500">
                    No hay solicitudes registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAccountRequests;
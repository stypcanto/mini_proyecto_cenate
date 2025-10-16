// ========================================================================
// 👩‍⚕️ PacientesPage.jsx — Módulo de Asegurados del Sistema Intranet CENATE
// Descripción: Listado y búsqueda de asegurados con paginación y diseño moderno.
// ========================================================================

import React, { useEffect, useState } from "react";
import { Search, UserCircle2, FileText, Loader2 } from "lucide-react";
import { getAsegurados, getAseguradoByDoc } from "@/api/pacientes";

const PacientesPage = () => {
  const [asegurados, setAsegurados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [error, setError] = useState("");

  // 🔹 Carga inicial de asegurados
  useEffect(() => {
    fetchAsegurados();
  }, [page]);

  const fetchAsegurados = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAsegurados(page, size);
      setAsegurados(data?.content || data || []);
    } catch (err) {
      setError("No se pudieron cargar los asegurados.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Búsqueda por documento
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) return fetchAsegurados();

    setLoading(true);
    setError("");
    try {
      const data = await getAseguradoByDoc(busqueda.trim());
      setAsegurados(data ? [data] : []);
    } catch (err) {
      setError("Paciente no encontrado.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6 rounded-3xl">
      {/* 🔷 Encabezado */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#1d4f8a]">
          Módulo de Asegurados (Pacientes)
        </h1>
        <p className="text-gray-600 mt-1 text-sm">
          Consulta, filtra y gestiona la información de los asegurados del sistema.
        </p>
      </div>

      {/* 🔎 Barra de búsqueda */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row items-center gap-3 mb-8 bg-white p-4 rounded-xl shadow-md border border-gray-200"
      >
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por número de documento (DNI)"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2e63a6] outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-[#2e63a6] to-[#1d4f8a] text-white font-semibold rounded-lg shadow-md hover:scale-105 transition-all disabled:opacity-50"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {/* ⚠️ Estado de carga o error */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-[#2e63a6] animate-spin" />
        </div>
      )}
      {error && (
        <p className="text-center text-red-600 font-medium mb-4">{error}</p>
      )}

      {/* 📋 Tabla de resultados */}
      {!loading && asegurados.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-100">
          <table className="min-w-full text-sm text-gray-800">
            <thead className="bg-[#2e63a6] text-white text-left">
              <tr>
                <th className="px-5 py-3 rounded-tl-lg">#</th>
                <th className="px-5 py-3">Nombres</th>
                <th className="px-5 py-3">Documento</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Sexo</th>
                <th className="px-5 py-3">Fecha Nac.</th>
                <th className="px-5 py-3 rounded-tr-lg text-center">
                  <FileText className="inline w-4 h-4 mr-1" /> Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {asegurados.map((a, idx) => (
                <tr
                  key={a.id_asegurado || idx}
                  className="border-b hover:bg-blue-50 transition-all"
                >
                  <td className="px-5 py-3 text-gray-600">{idx + 1}</td>
                  <td className="px-5 py-3 font-semibold text-gray-900 flex items-center gap-2">
                    <UserCircle2 className="w-5 h-5 text-[#2e63a6]" />
                    {a.nombre_completo || "—"}
                  </td>
                  <td className="px-5 py-3">{a.doc_paciente || "—"}</td>
                  <td className="px-5 py-3">{a.tipo_doc || "—"}</td>
                  <td className="px-5 py-3">{a.sexo || "—"}</td>
                  <td className="px-5 py-3">{a.fecha_nac || "—"}</td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        a.estado === "ACTIVO"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {a.estado || "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && (
          <p className="text-center text-gray-500 mt-6">
            No se encontraron registros de asegurados.
          </p>
        )
      )}

      {/* 📄 Paginación */}
      {asegurados.length > 0 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            disabled={page === 0}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold disabled:opacity-50"
          >
            ← Anterior
          </button>
          <span className="text-sm text-gray-600">Página {page + 1}</span>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 rounded-lg bg-[#2e63a6] hover:bg-[#1d4f8a] text-white font-semibold"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
};

export default PacientesPage;
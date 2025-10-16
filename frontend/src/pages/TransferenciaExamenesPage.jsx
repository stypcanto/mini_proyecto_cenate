// ========================================================================
// 🧾 TransferenciaExamenesPage.jsx
// Descripción: Módulo para gestionar la transferencia de exámenes médicos
// Autor: Styp Canto — CENATE EsSalud
// ========================================================================

import React, { useState } from "react";
import { ArrowLeft, FileText, Search, UploadCloud, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TransferenciaExamenesPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [examenes, setExamenes] = useState([
    { id: 1, paciente: "Juan Pérez", tipo: "Radiografía", estado: "Pendiente" },
    { id: 2, paciente: "María López", tipo: "Tomografía", estado: "Transferido" },
  ]);

  const handleBuscar = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white p-6">
      {/* 🔹 Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white shadow hover:shadow-md border border-gray-200 px-3 py-2 rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">Volver</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" />
            Transferencia de Exámenes
          </h1>
        </div>
      </div>

      {/* 🔍 Barra de búsqueda */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center w-full md:w-1/2">
          <Search className="text-gray-400 w-5 h-5 mr-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar paciente o tipo de examen..."
            className="w-full border-0 outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
        <button
          onClick={handleBuscar}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2.5 rounded-lg font-semibold shadow hover:scale-105 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Buscando...
            </>
          ) : (
            "Buscar"
          )}
        </button>
      </div>

      {/* 📋 Tabla de exámenes */}
      <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-3 px-4 text-sm font-semibold">Paciente</th>
              <th className="py-3 px-4 text-sm font-semibold">Tipo de Examen</th>
              <th className="py-3 px-4 text-sm font-semibold">Estado</th>
              <th className="py-3 px-4 text-sm font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {examenes.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No se encontraron registros
                </td>
              </tr>
            ) : (
              examenes.map((examen) => (
                <tr
                  key={examen.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 text-gray-800 font-medium">
                    {examen.paciente}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{examen.tipo}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        examen.estado === "Pendiente"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {examen.estado}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="flex items-center justify-center gap-1 mx-auto bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold shadow hover:scale-105 transition">
                      <UploadCloud className="w-4 h-4" /> Transferir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransferenciaExamenesPage;
// ========================================================================
// 🧪 TestUsuarios.jsx – Página de prueba de usuarios MBAC (CENATE)
// ------------------------------------------------------------------------
// Usa permisosService (instancia singleton) para consultar backend
// ========================================================================

import React, { useEffect, useState } from "react";
import { permisosService } from "../services/permisosService";

export default function TestUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const data = await permisosService.obtenerUsuarios();
      setUsuarios(data);
      setError(null);
    } catch (err) {
      console.error("🚨 Error al cargar usuarios:", err);
      setError(err.message || "Error desconocido al obtener usuarios");
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-900">
        🧩 Test Usuarios – Sistema MBAC CENATE
      </h1>

      {loading && (
        <p className="text-blue-600 text-center animate-pulse">
          Cargando usuarios...
        </p>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded text-center">
          <p className="font-semibold mb-2">❌ No se pudo cargar la lista de usuarios</p>
          <p className="text-sm">{error}</p>
          <button onClick={fetchUsuarios} className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && usuarios.length > 0 && (
        <div className="grid gap-4 mt-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {usuarios.map((u) => (
            <div key={u.idUser} className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition">
              <p className="font-semibold text-lg text-gray-800">{u.username}</p>
              <p className="text-sm text-gray-600">
                Estado:{" "}
                <span className={`font-medium ${u.estado === "ACTIVO" ? "text-green-700" : "text-red-700"}`}>
                  {u.estado}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Rol: {u.roles?.length > 0 ? u.roles.join(", ") : "—"}
              </p>
              <p className="text-sm text-gray-600 mt-1 text-gray-500 text-xs">
                {u.message || ""}
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && usuarios.length === 0 && (
        <p className="text-gray-500 text-center mt-8">
          ⚠️ No se encontraron usuarios registrados.
        </p>
      )}
    </div>
  );
}
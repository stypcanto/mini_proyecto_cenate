// ========================================================================
// 👥 UsuariosTableProfesional.jsx - Tabla institucional CENATE
// ========================================================================

import React from "react";
import {
  Eye,
  UserPlus,
  Download,
  RefreshCw,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import EstadoBadge from "../ui/EstadoBadge";

export default function UsuariosTableProfesional({
  usuarios = [],
  loading,
  onVerDetalle,
  onRecargar,
}) {
  // ======================================================
  // 🔄 Estado de carga
  // ======================================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-md border border-gray-200">
        <div className="animate-spin mb-4">
          <RefreshCw className="w-12 h-12 text-teal-600" />
        </div>
        <p className="text-gray-600 font-medium text-lg">Cargando usuarios...</p>
        <p className="text-gray-500 text-sm mt-2">Por favor espera mientras obtenemos los datos</p>
      </div>
    );
  }

  // ======================================================
  // ⚠️ Sin resultados
  // ======================================================
  if (!usuarios.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-12 text-center bg-white rounded-2xl shadow-md border border-gray-200"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
          <AlertCircle className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-700 mb-2">
          No se encontraron usuarios
        </h3>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          No hay usuarios que coincidan con los filtros seleccionados. Intenta
          ajustar tus criterios de búsqueda.
        </p>
        <button
          onClick={onRecargar}
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all shadow-md font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Recargar lista
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
    >
      {/* Header con estadísticas */}
      <div className="px-6 py-5 bg-gradient-to-r from-teal-50 to-blue-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              Lista de Usuarios
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Mostrando{" "}
              <span className="font-bold text-teal-600">{usuarios.length}</span>{" "}
              usuarios del sistema
            </p>
          </div>
          <button
            onClick={onRecargar}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabla responsiva */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
            <tr>
              <Th>Nombre Completo</Th>
              <Th>Usuario</Th>
              <Th>IPRESS / Centro</Th>
              <Th>Tipo</Th>
              <Th>Rol Principal</Th>
              <Th>Estado</Th>
              <Th className="text-center">Acción</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usuarios.map((usuario, index) => (
              <motion.tr
                key={`${usuario.id_user}-${index}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="hover:bg-gray-50 transition-all duration-200"
              >
                {/* Nombre Completo */}
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {usuario.nombre_completo?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {usuario.nombre_completo || "Sin nombre"}
                      </div>
                      {usuario.numero_documento && (
                        <div className="text-xs text-gray-500">
                          {usuario.numero_documento}
                        </div>
                      )}
                    </div>
                  </div>
                </Td>

                {/* Usuario */}
                <Td>
                  <span className="font-mono text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                    {usuario.username}
                  </span>
                </Td>

                {/* IPRESS */}
                <Td>
                  <span className="text-sm text-gray-700 line-clamp-2">
                    {usuario.ipress_asignada || "—"}
                  </span>
                </Td>

                {/* Tipo Personal */}
                <Td>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                      usuario.tipo_personal === "CENATE"
                        ? "bg-teal-100 text-teal-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {usuario.tipo_personal}
                  </span>
                </Td>

                {/* Rol Principal */}
                <Td>
                  <span className="text-sm text-gray-700">
                    {Array.isArray(usuario.roles) && usuario.roles.length > 0
                      ? usuario.roles[0]
                      : "Sin rol"}
                  </span>
                </Td>

                {/* Estado */}
                <Td>
                  <EstadoBadge
                    estado={
                      usuario.estado_usuario === "A"
                        ? "Activo"
                        : usuario.estado_usuario
                    }
                  />
                </Td>

                {/* Acción */}
                <Td className="text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onVerDetalle(usuario)}
                    title="Ver detalle completo del usuario"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 hover:bg-teal-100 hover:text-teal-700 rounded-lg font-medium transition-all shadow-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Detalle</span>
                  </motion.button>
                </Td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer con información */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600">
        <span>
          Total de registros:{" "}
          <span className="font-bold text-teal-600">{usuarios.length}</span>
        </span>
        <div className="text-xs text-gray-500 mt-2 sm:mt-0">
          Última actualización: {new Date().toLocaleTimeString("es-ES")}
        </div>
      </div>
    </motion.div>
  );
}

// ========================================================================
// 🧩 Componentes auxiliares
// ========================================================================

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td className={`px-6 py-4 ${className}`}>
      {children}
    </td>
  );
}

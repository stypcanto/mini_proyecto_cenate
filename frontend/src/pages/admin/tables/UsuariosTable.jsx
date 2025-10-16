// ========================================================================
// 👥 UsuariosTable.jsx - Tabla profesional CENATE con acciones
// ========================================================================

import React, { useState } from "react";
import { Eye, UserPlus, Download, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import EstadoBadge from "../ui/EstadoBadge";
import UsuarioDetalleModal from "../components/UsuarioDetalleModal";
import toast from "react-hot-toast";

export default function UsuariosTable({ usuarios = [], loading, onRecargar }) {
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // ======================================================
  // 👁️ Ver detalle
  // ======================================================
  const handleVerDetalle = (usuario) => {
    setUsuarioSeleccionado(usuario);
  };

  // ======================================================
  // 📥 Exportar a Excel
  // ======================================================
  const handleExportar = () => {
    toast.success("Exportando lista de usuarios...");
    // Aquí implementarías la lógica de exportación
  };

  // ======================================================
  // ➕ Agregar usuario
  // ======================================================
  const handleAgregarUsuario = () => {
    toast.info("Función de agregar usuario en desarrollo");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-md">
        <RefreshCw className="w-12 h-12 animate-spin text-teal-600 mb-4" />
        <p className="text-gray-600 font-medium">Cargando usuarios...</p>
      </div>
    );
  }

  if (!usuarios.length) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl shadow-md border border-gray-100">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
          <UserPlus className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">
          No se encontraron usuarios
        </h3>
        <p className="text-gray-500 mb-6">
          No hay usuarios que coincidan con los filtros seleccionados
        </p>
        <button
          onClick={onRecargar}
          className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all shadow-md font-medium"
        >
          Recargar lista
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {/* Header con acciones */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Lista de Usuarios
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Total: <span className="font-semibold text-teal-600">{usuarios.length}</span> usuarios
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAgregarUsuario}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-xl font-medium transition-all shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                Agregar Usuario
              </button>
              <button
                onClick={handleExportar}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-xl font-medium transition-all shadow-md"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={onRecargar}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-medium transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Recargar
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <Th>Nombre Completo</Th>
                <Th>Usuario</Th>
                <Th>IPRESS</Th>
                <Th>Tipo</Th>
                <Th>Roles</Th>
                <Th>Estado</Th>
                <Th className="text-center">Acciones</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map((usuario, index) => (
                <motion.tr
                  key={usuario.id_user}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-gray-50 transition-all duration-150"
                >
                  {/* Nombre */}
                  <Td>
                    <div className="font-medium text-gray-900">
                      {usuario.nombre_completo || "Sin nombre"}
                    </div>
                    {usuario.numero_documento && (
                      <div className="text-xs text-gray-500">
                        {usuario.numero_documento}
                      </div>
                    )}
                  </Td>

                  {/* Usuario */}
                  <Td>
                    <span className="font-mono text-sm text-gray-700">
                      {usuario.username}
                    </span>
                  </Td>

                  {/* IPRESS */}
                  <Td>
                    <span className="text-sm text-gray-600">
                      {usuario.ipress_asignada || "—"}
                    </span>
                  </Td>

                  {/* Tipo */}
                  <Td>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        usuario.tipo_personal === "CENATE"
                          ? "bg-teal-100 text-teal-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {usuario.tipo_personal}
                    </span>
                  </Td>

                  {/* Roles */}
                  <Td>
                    <span className="text-sm text-gray-700">
                      {usuario.roles || "Sin rol"}
                    </span>
                  </Td>

                  {/* Estado */}
                  <Td>
                    <EstadoBadge estado={usuario.estado_usuario} />
                  </Td>

                  {/* Acciones */}
                  <Td className="text-center">
                    <button
                      onClick={() => handleVerDetalle(usuario)}
                      title="Ver detalle completo"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg font-medium transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Ver Detalle</span>
                    </button>
                  </Td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer con paginación (simulado) */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Mostrando <span className="font-semibold">{usuarios.length}</span> usuarios
            </span>
            <div className="text-xs text-gray-500">
              Última actualización: {new Date().toLocaleTimeString("es-ES")}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalle */}
      {usuarioSeleccionado && (
        <UsuarioDetalleModal
          usuario={usuarioSeleccionado}
          onClose={() => setUsuarioSeleccionado(null)}
        />
      )}
    </>
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
    <td className={`px-6 py-4 whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
}

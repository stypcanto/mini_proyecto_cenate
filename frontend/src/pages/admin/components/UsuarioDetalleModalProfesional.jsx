// ========================================================================
// 👁️ UsuarioDetalleModalProfesional.jsx - Modal detallado de usuario CENATE
// ========================================================================

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  Download,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UsuarioDetalleModalProfesional({ usuario, onClose }) {
  const [copiedText, setCopiedText] = useState("");

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // ======================================================
  // 📋 Funciones auxiliares
  // ======================================================

  const copiarAlPortapapeles = (texto, tipo) => {
    navigator.clipboard.writeText(texto);
    setCopiedText(tipo);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "—";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calcularEdad = (fecha_nacimiento) => {
    if (!fecha_nacimiento) return "—";
    const hoy = new Date();
    const nacimiento = new Date(fecha_nacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  // ======================================================
  // 🎨 Elementos de UI reutilizables
  // ======================================================

  const CopyButton = ({ text, tipo }) => (
    <button
      onClick={() => copiarAlPortapapeles(text, tipo)}
      title="Copiar al portapapeles"
      className="p-1 hover:bg-gray-200 rounded transition-all"
    >
      {copiedText === tipo ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4 text-gray-500" />
      )}
    </button>
  );

  const InfoField = ({ icon: Icon, label, value, copiable = false, tipo = "" }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-shrink-0">
        <Icon className="w-5 h-5 text-teal-600 mt-0.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <p className="text-gray-900 text-sm mt-1 break-words">{value || "—"}</p>
      </div>
      {copiable && value && (
        <CopyButton text={value} tipo={tipo} />
      )}
    </div>
  );

  const Seccion = ({ titulo, icon: Icon, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 rounded-xl p-5 border border-gray-200"
    >
      <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 text-lg">
        <Icon className="w-5 h-5 text-teal-600" />
        {titulo}
      </h3>
      {children}
    </motion.div>
  );

  // ======================================================
  // 🎯 Renderizado principal
  // ======================================================

  const tipoInterno = usuario.tipo_personal === "CENATE";

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-blue-600 px-6 py-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                {usuario.nombre_completo?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">
                  {usuario.nombre_completo || "Sin nombre"}
                </h2>
                <p className="text-teal-100 text-sm">@{usuario.username}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
              title="Cerrar"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Contenido */}
          <div className="px-6 py-8 space-y-6">
            {/* Badges principales */}
            <div className="flex flex-wrap gap-3 pb-6 border-b border-gray-200">
              <span
                className={`inline-flex px-4 py-2 rounded-full font-semibold text-sm ${
                  usuario.tipo_personal === "CENATE"
                    ? "bg-teal-100 text-teal-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {usuario.tipo_personal === "CENATE" ? "👨‍💼" : "🏢"} {usuario.tipo_personal}
              </span>
              <span
                className={`inline-flex px-4 py-2 rounded-full font-semibold text-sm ${
                  usuario.estado_usuario === "A" || usuario.estado_usuario === "Activo"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {usuario.estado_usuario === "A" || usuario.estado_usuario === "Activo"
                  ? "✓ Activo"
                  : "✕ Inactivo"}
              </span>
              {Array.isArray(usuario.roles) && usuario.roles.length > 0 && (
                <span className="inline-flex px-4 py-2 rounded-full font-semibold text-sm bg-purple-100 text-purple-700">
                  🔐 {usuario.roles[0]}
                </span>
              )}
            </div>

            {/* Grid principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna izquierda - Datos personales */}
              <div className="lg:col-span-1 space-y-6">
                <Seccion titulo="📄 Datos Personales" icon={User}>
                  <InfoField
                    icon={FileText}
                    label="Documento de Identidad"
                    value={`${usuario.tipo_documento || "DNI"} ${usuario.numero_documento || "—"}`}
                    copiable={true}
                    tipo="documento"
                  />
                  <InfoField
                    icon={Calendar}
                    label="Fecha de Nacimiento"
                    value={formatearFecha(usuario.fecha_nacimiento)}
                  />
                  <div className="py-3 border-b border-gray-100 last:border-0">
                    <p className="text-sm font-semibold text-gray-700">Edad</p>
                    <p className="text-gray-900 text-sm mt-1">
                      {usuario.edad_actual || calcularEdad(usuario.fecha_nacimiento)} años
                    </p>
                  </div>
                  <div className="py-3 border-b border-gray-100 last:border-0">
                    <p className="text-sm font-semibold text-gray-700">Género</p>
                    <p className="text-gray-900 text-sm mt-1">
                      {usuario.genero === "M" ? "Masculino" : usuario.genero === "F" ? "Femenino" : usuario.genero || "—"}
                    </p>
                  </div>
                </Seccion>

                <Seccion titulo="📞 Contacto" icon={Phone}>
                  {usuario.correo_corporativo && (
                    <InfoField
                      icon={Mail}
                      label="Correo Corporativo"
                      value={usuario.correo_corporativo}
                      copiable={true}
                      tipo="correo-corp"
                    />
                  )}
                  {usuario.correo_personal && (
                    <InfoField
                      icon={Mail}
                      label="Correo Personal"
                      value={usuario.correo_personal}
                      copiable={true}
                      tipo="correo-pers"
                    />
                  )}
                  {usuario.telefono && (
                    <InfoField
                      icon={Phone}
                      label="Teléfono"
                      value={usuario.telefono}
                      copiable={true}
                      tipo="telefono"
                    />
                  )}
                </Seccion>
              </div>

              {/* Columna central y derecha - Información laboral y dirección */}
              <div className="lg:col-span-2 space-y-6">
                {/* IPRESS */}
                <Seccion titulo="🏥 IPRESS Asignada" icon={Briefcase}>
                  <div className="py-3">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Centro de Salud</p>
                    <p className="text-gray-900 font-medium">
                      {usuario.ipress_asignada || "—"}
                    </p>
                  </div>
                </Seccion>

                {/* Información laboral (solo internos) */}
                {tipoInterno && (
                  <Seccion titulo="💼 Información Laboral" icon={Briefcase}>
                    {usuario.area && (
                      <InfoField
                        icon={Briefcase}
                        label="Área"
                        value={usuario.area}
                      />
                    )}
                    {usuario.profesion && (
                      <InfoField
                        icon={Briefcase}
                        label="Profesión"
                        value={usuario.profesion}
                      />
                    )}
                    {usuario.especialidades && usuario.especialidades.length > 0 && (
                      <div className="py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Especialidades
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {usuario.especialidades.map((esp, idx) => (
                            <span
                              key={idx}
                              className="inline-flex px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold"
                            >
                              {esp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {usuario.regimen_laboral && (
                      <InfoField
                        icon={FileText}
                        label="Régimen Laboral"
                        value={usuario.regimen_laboral}
                      />
                    )}
                  </Seccion>
                )}

                {/* Dirección */}
                <Seccion titulo="📍 Dirección" icon={MapPin}>
                  {usuario.domicilio && (
                    <InfoField
                      icon={MapPin}
                      label="Domicilio"
                      value={usuario.domicilio}
                    />
                  )}
                  <div className="grid grid-cols-2 gap-4 py-3">
                    {usuario.distrito && (
                      <div className="border-b border-gray-100 pb-3">
                        <p className="text-sm font-semibold text-gray-700">Distrito</p>
                        <p className="text-gray-900 text-sm mt-1">{usuario.distrito}</p>
                      </div>
                    )}
                    {usuario.provincia && (
                      <div className="border-b border-gray-100 pb-3">
                        <p className="text-sm font-semibold text-gray-700">Provincia</p>
                        <p className="text-gray-900 text-sm mt-1">{usuario.provincia}</p>
                      </div>
                    )}
                  </div>
                  {usuario.departamento && (
                    <InfoField
                      icon={MapPin}
                      label="Departamento"
                      value={usuario.departamento}
                    />
                  )}
                </Seccion>
              </div>
            </div>

            {/* Roles y permisos */}
            {Array.isArray(usuario.roles) && usuario.roles.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-purple-50 rounded-xl p-5 border border-purple-200"
              >
                <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                  🔐 Roles Asignados
                </h3>
                <div className="flex flex-wrap gap-2">
                  {usuario.roles.map((rol, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-purple-200 text-purple-800 rounded-lg font-semibold text-sm"
                    >
                      {rol}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer con acciones */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-wrap gap-3 justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition-all"
            >
              ✕ Cerrar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all shadow-md"
            >
              <Edit className="w-4 h-4" />
              Editar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              PDF
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all shadow-md"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

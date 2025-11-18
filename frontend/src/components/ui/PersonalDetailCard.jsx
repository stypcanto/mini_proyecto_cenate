// ========================================================================
// 🎨 PersonalDetailCard.jsx – Detalle completo del personal (CENATE)
// ------------------------------------------------------------------------
// Muestra el detalle completo de un miembro del personal (CENATE o EXTERNO)
// con un diseño limpio y animado estilo Apple Card View.
// Compatible con el endpoint /api/personal/detalle/{id}
// ========================================================================

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getFotoUrl as buildFotoUrl } from '../../utils/apiUrlHelper';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  Shield,
  Award,
  FileText,
  Users,
  Cake,
} from "lucide-react";

// ========================================================================
// 💠 Componente principal
// ========================================================================
const PersonalDetailCard = ({ data, onClose }) => {
  if (!data || !data.personal) return null;

  const { personal, username, estado_usuario, roles = [], fechas } = data;
  const { contacto = {}, direccion = {}, laboral = {} } = personal;
  const isCenate = laboral?.area !== undefined;

  // ========================================================================
  // 📸 Construcción de la URL de la foto
  // ========================================================================
  const fotoUrl = personal.foto ? buildFotoUrl(personal.foto) : null;

  // ========================================================================
  // 🗓️ Funciones de formato
  // ========================================================================
  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    try {
      return new Date(fecha).toLocaleDateString("es-PE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return fecha;
    }
  };

  const formatCumpleanos = (cumpleanos) => {
    if (!cumpleanos) return null;
    const { mes, dia } = cumpleanos;
    return `${dia} de ${mes}`;
  };

  // ========================================================================
  // 🧩 Subcomponente: campo con ícono
  // ========================================================================
  const Campo = ({ icon: Icon, label, value, highlight = false }) => {
    if (!value || value === "N/A" || value === "null") return null;
    return (
      <div
        className={`flex items-start space-x-3 py-3 ${
          highlight ? "bg-blue-50 -mx-4 px-4 rounded-lg" : ""
        }`}
      >
        <div className="mt-0.5">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
            {label}
          </p>
          <p className="text-sm text-gray-900 break-words">{value}</p>
        </div>
      </div>
    );
  };

  // ========================================================================
  // 🧩 Subcomponente: badge de rol
  // ========================================================================
  const RolBadge = ({ rol }) => (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
      {rol}
    </span>
  );

  // ========================================================================
  // 🎨 Render principal
  // ========================================================================
  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 pb-20">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-20 backdrop-blur-md hover:bg-opacity-30 transition-all duration-200"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="flex flex-col items-center">
              {/* Foto */}
              <div className="relative">
                {fotoUrl ? (
                  <motion.img
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    src={fotoUrl}
                    alt={personal.nombre_completo}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white bg-opacity-20 backdrop-blur-md flex items-center justify-center border-4 border-white shadow-xl">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>

              {/* Nombre y tipo */}
              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="mt-4 text-2xl font-bold text-white text-center"
              >
                {personal.nombre_completo}
              </motion.h2>

              <motion.span
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-white bg-opacity-20 backdrop-blur-md text-white"
              >
                Personal {isCenate ? "CENATE" : "EXTERNO"}
              </motion.span>
            </div>
          </div>

          {/* Contenido */}
          <div className="px-8 pb-8 -mt-12 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Roles */}
            {roles.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-xl shadow-lg p-6 mb-6"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Roles del Sistema
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {roles.map((rol, idx) => (
                    <RolBadge key={idx} rol={rol} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Información Personal */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Información Personal
                </h3>
              </div>
              <Campo
                icon={FileText}
                label="Documento"
                value={`${personal.tipo_documento || "DNI"} - ${
                  personal.numero_documento
                }`}
                highlight
              />
              <Campo
                icon={User}
                label="Género"
                value={
                  personal.genero === "M"
                    ? "Masculino"
                    : personal.genero === "F"
                    ? "Femenino"
                    : personal.genero
                }
              />
              <Campo
                icon={Calendar}
                label="Fecha de Nacimiento"
                value={formatFecha(personal.fecha_nacimiento)}
              />
              <Campo
                icon={Cake}
                label="Cumpleaños"
                value={formatCumpleanos(personal.cumpleanos)}
              />
              <Campo
                icon={Calendar}
                label="Edad Actual"
                value={personal.edad_actual ? `${personal.edad_actual} años` : null}
              />
            </motion.div>

            {/* Contacto */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Mail className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Contacto</h3>
              </div>
              <Campo
                icon={Mail}
                label="Correo Corporativo"
                value={contacto.correo_corporativo}
                highlight
              />
              <Campo
                icon={Mail}
                label="Correo Personal"
                value={contacto.correo_personal}
              />
              <Campo icon={Phone} label="Teléfono" value={contacto.telefono} />
              <Campo
                icon={MapPin}
                label="Dirección"
                value={[
                  direccion.domicilio,
                  direccion.distrito,
                  direccion.provincia,
                  direccion.departamento,
                ]
                  .filter(Boolean)
                  .join(", ")}
              />
            </motion.div>

            {/* Laboral */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Información Laboral
                </h3>
              </div>

              <Campo
                icon={Building2}
                label="IPRESS Asignada"
                value={personal.ipress}
                highlight
              />

              {isCenate && (
                <>
                  <Campo icon={Users} label="Área" value={laboral.area} />
                  <Campo icon={Briefcase} label="Tipo de Profesional" value={laboral.tipo_profesional} />
                  <Campo
                    icon={Briefcase}
                    label="Régimen Laboral"
                    value={laboral.regimen_laboral}
                  />
                  <Campo icon={Award} label="Profesión" value={laboral.profesion} />
                  <Campo
                    icon={Award}
                    label="Especialidad"
                    value={laboral.especialidad}
                  />
                  <Campo
                    icon={FileText}
                    label="Código Planilla"
                    value={laboral.codigo_planilla}
                  />
                  <Campo
                    icon={FileText}
                    label="Colegiatura"
                    value={laboral.colegiatura}
                  />
                  <Campo
                    icon={FileText}
                    label="RNE Especialista"
                    value={laboral.rne_especialista}
                  />
                </>
              )}
            </motion.div>

            {/* Usuario */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Cuenta de Usuario
                </h3>
              </div>
              <Campo icon={User} label="Usuario" value={username} highlight />
              <Campo
                icon={Shield}
                label="Estado de Cuenta"
                value={estado_usuario}
              />
              {fechas && (
                <>
                  <Campo
                    icon={Calendar}
                    label="Fecha de Registro"
                    value={formatFecha(fechas.registro)}
                  />
                  <Campo
                    icon={Calendar}
                    label="Última Actualización"
                    value={formatFecha(fechas.ultima_actualizacion)}
                  />
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PersonalDetailCard;
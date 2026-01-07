import React from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Building2,
  Briefcase,
  X,
  Phone,
  UserCircle2,
  Calendar,
  MapPin,
  User,
  Cake,
  Building,
  Star,
} from "lucide-react";

/**
 * 🎯 Modal de Detalle de Usuario - Estilo PersonalCard reutilizable
 */
export default function UserDetailModal({ user, onClose }) {
  if (!user) return null;

  const personal = user.personal || {};
  const contacto = personal.contacto || {};
  const direccion = personal.direccion || {};
  const laboral = personal.laboral || {};
  const cumpleanos = personal.cumpleanos || {};
  const roles = user.roles || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden border border-gray-100 w-full max-w-4xl max-h-[92vh] overflow-y-auto"
      >
        {/* ================================
          ENCABEZADO (Avatar + Datos principales)
        ================================= */}
        <div className="relative bg-gradient-to-r from-slate-100 to-slate-200 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/50 rounded-full transition-all"
          >
            <X size={20} className="text-gray-600" />
          </button>

          <div className="flex items-center gap-5">
            {/* Avatar elegante */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-4 border-white shadow-lg flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              {user.estado_usuario === "ACTIVO" && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 border-4 border-white rounded-full shadow-md"></div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">
                {personal.nombre_completo || user.username}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                @{user.username}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.estado_usuario === "ACTIVO"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {user.estado_usuario === "ACTIVO" ? "Activo" : "Inactivo"}
                </span>
                {roles.map((rol, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full"
                  >
                    {rol}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================================
          DETALLES PRINCIPALES
        ================================= */}
        <div className="p-6 grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <InfoRow
            icon={<User size={16} className="text-blue-500" />}
            label="Documento"
            value={`${personal.tipo_documento || "DNI"}: ${personal.numero_documento || "—"}`}
          />
          <InfoRow
            icon={<Cake size={16} className="text-pink-500" />}
            label="Fecha de Nacimiento"
            value={personal.fecha_nacimiento || "—"}
          />
          <InfoRow
            icon={<UserCircle2 size={16} className="text-purple-500" />}
            label="Edad"
            value={personal.edad_actual ? `${personal.edad_actual} años` : "—"}
          />
          <InfoRow
            icon={<UserCircle2 size={16} className="text-indigo-500" />}
            label="Género"
            value={
              personal.genero === "M"
                ? "Masculino"
                : personal.genero === "F"
                ? "Femenino"
                : "—"
            }
          />
          <EmailRow
            icon={<Mail size={16} className="text-blue-500" />}
            label="Correo Institucional"
            value={contacto.correo_corporativo || contacto.correo_institucional || "—"}
            isFavorite={contacto.email_preferido === "INSTITUCIONAL"}
          />
          <EmailRow
            icon={<Mail size={16} className="text-indigo-500" />}
            label="Correo Personal"
            value={contacto.correo_personal || "—"}
            isFavorite={contacto.email_preferido === "PERSONAL" || !contacto.email_preferido}
          />
          <InfoRow
            icon={<Phone size={16} className="text-green-500" />}
            label="Teléfono"
            value={contacto.telefono || "—"}
          />
          <InfoRow
            icon={<Building2 size={16} className="text-orange-500" />}
            label="IPRESS"
            value={personal.ipress || "—"}
          />
        </div>

        {/* ================================
          INFORMACIÓN LABORAL
        ================================= */}
        <div className="border-t border-gray-100 p-6">
          <SectionHeader
            icon={<Briefcase size={18} className="text-yellow-500" />}
            title="Información Laboral"
          />
          <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm text-gray-700">
            <InfoItem label="Área" value={laboral.area || "—"} />
            <InfoItem label="Régimen Laboral" value={laboral.regimen_laboral || "—"} />
            <InfoItem label="Tipo de Profesional" value={laboral.tipo_profesional || "—"} />
            <InfoItem label="Profesión" value={laboral.profesion || "—"} />
            <InfoItem label="Colegiatura" value={laboral.colegiatura || "—"} />
            <InfoItem label="RNE Especialista" value={laboral.rne_especialista || "—"} />
            <InfoItem label="Especialidad" value={laboral.especialidad || "—"} />
            <InfoItem label="Código Planilla" value={laboral.codigo_planilla || "—"} />
          </div>
        </div>

        {/* ================================
          DIRECCIÓN
        ================================= */}
        {direccion.domicilio && (
          <div className="border-t border-gray-100 p-6">
            <SectionHeader
              icon={<MapPin size={18} className="text-red-500" />}
              title="Dirección"
            />
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <p>
                <strong>Domicilio:</strong> {direccion.domicilio}
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <p>
                  <strong>Distrito:</strong> {direccion.distrito || "—"}
                </p>
                <p>
                  <strong>Provincia:</strong> {direccion.provincia || "—"}
                </p>
                <p>
                  <strong>Departamento:</strong> {direccion.departamento || "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================================
          INFORMACIÓN DEL SISTEMA
        ================================= */}
        {user.fechas && (
          <div className="border-t border-gray-100 p-6">
            <SectionHeader
              icon={<Calendar size={18} className="text-teal-500" />}
              title="Sistema"
            />
            <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm text-gray-700">
              <p>
                <strong>Fecha de Registro:</strong>{" "}
                {new Date(user.fechas.registro).toLocaleString("es-PE")}
              </p>
              <p>
                <strong>Última Actualización:</strong>{" "}
                {new Date(user.fechas.ultima_actualizacion).toLocaleString("es-PE")}
              </p>
            </div>
          </div>
        )}

        {/* ================================
          FOOTER
        ================================= */}
        <div className="border-t border-gray-100 bg-gray-50 p-4 flex justify-between items-center">
          <span className="text-xs text-gray-500">ID: {user.id_user}</span>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white text-sm px-6 py-2.5 rounded-xl shadow hover:bg-blue-700 transition-all font-medium"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ================================
// 🧩 Componentes auxiliares
// ================================

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>
        <strong>{label}:</strong> {value}
      </span>
    </div>
  );
}

function EmailRow({ icon, label, value, isFavorite }) {
  return (
    <div className="flex items-center gap-2 group">
      {icon}
      <span className="flex items-center gap-2 flex-1">
        <strong>{label}:</strong> <span className="truncate">{value}</span>
        {isFavorite && value && value !== "—" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-300 rounded-full text-xs font-semibold shadow-sm animate-pulse">
            <Star size={12} className="fill-amber-500 text-amber-500" />
            Favorito
          </span>
        )}
      </span>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <h3 className="font-semibold text-gray-800 text-base uppercase tracking-wide">
        {title}
      </h3>
    </div>
  );
}

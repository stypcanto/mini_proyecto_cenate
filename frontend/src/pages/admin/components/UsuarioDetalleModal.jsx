// ========================================================================
// 👤 UsuarioDetalleModal.jsx - Modal profesional de detalle de usuario
// ========================================================================

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  FileText,
  Building2,
  ShieldCheck,
  Heart,
  Edit,
  Trash2,
  Printer,
  Loader
} from "lucide-react";
import { usePersonalTotal } from "@/hooks/usePersonalTotal";
import { API_BASE } from "@/config/api";
import toast from "react-hot-toast";

export default function UsuarioDetalleModal({ usuario, onClose }) {
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const { obtenerDetalle } = usePersonalTotal();

  // ======================================================
  // 🔍 Cargar detalle completo al abrir modal
  // ======================================================
  useEffect(() => {
    const cargarDetalle = async () => {
      if (!usuario?.id_user) return;

      setLoading(true);
      try {
        const data = await obtenerDetalle(usuario.id_user);
        setDetalle(data);
      } catch (error) {
        toast.error("No se pudo cargar el detalle del usuario");
        console.error("❌", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDetalle();

    // Bloquear scroll del body
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [usuario, obtenerDetalle]);

  // ======================================================
  // 🎨 URL de la foto
  // ======================================================
  const getFotoUrl = () => {
    if (!detalle?.personal?.foto) return null;
    if (detalle.personal.foto.startsWith("http")) {
      return detalle.personal.foto;
    }
    return `${API_BASE}/personal-cnt/${detalle.personal.id_personal}/foto`;
  };

  // ======================================================
  // 🖨️ Imprimir PDF
  // ======================================================
  const handleImprimir = () => {
    window.print();
    toast.success("Imprimiendo perfil...");
  };

  // ======================================================
  // ✏️ Editar (simulado)
  // ======================================================
  const handleEditar = () => {
    toast.info("Función de edición en desarrollo");
  };

  // ======================================================
  // 🗑️ Eliminar (simulado)
  // ======================================================
  const handleEliminar = () => {
    const confirmar = window.confirm("¿Está seguro de eliminar este usuario?");
    if (confirmar) {
      toast.success("Usuario eliminado (simulación)");
      onClose();
    }
  };

  if (!usuario) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header con acciones */}
          <div className="flex-shrink-0 p-6 text-white bg-gradient-to-r from-teal-600 to-teal-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-3 text-2xl font-bold">
                <User className="w-7 h-7" />
                Detalle del Usuario
              </h2>
              <button
                onClick={onClose}
                className="p-2 transition-all hover:bg-white/20 rounded-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleEditar}
                className="flex items-center gap-2 px-4 py-2 font-medium text-teal-600 transition-all bg-white shadow-md hover:bg-teal-50 rounded-xl"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={handleEliminar}
                className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-all bg-red-500 shadow-md hover:bg-red-600 rounded-xl"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
              <button
                onClick={handleImprimir}
                className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-all bg-blue-500 shadow-md hover:bg-blue-600 rounded-xl"
              >
                <Printer className="w-4 h-4" />
                Imprimir PDF
              </button>
            </div>
          </div>

          {/* Contenido scrollable */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Loader className="w-12 h-12 mb-4 text-teal-600 animate-spin" />
                <p className="text-lg font-medium">Cargando información...</p>
              </div>
            ) : detalle ? (
              <div className="space-y-6">
                {/* Perfil principal */}
                <div className="flex flex-col items-center gap-6 p-6 border border-gray-100 md:flex-row md:items-start bg-gradient-to-br from-gray-50 to-white rounded-2xl">
                  {/* Foto de perfil */}
                  <div className="flex-shrink-0">
                    {getFotoUrl() ? (
                      <img
                        src={getFotoUrl()}
                        alt={detalle.personal.nombre_completo}
                        className="object-cover w-32 h-32 border-4 border-white shadow-lg rounded-2xl"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-32 h-32 border-4 border-white shadow-lg rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200">
                        <User className="w-16 h-16 text-teal-600" />
                      </div>
                    )}
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="mb-2 text-3xl font-bold text-gray-900">
                      {detalle.personal.nombre_completo}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-3 md:justify-start">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                        usuario.tipo_personal === "CENATE"
                          ? "bg-teal-100 text-teal-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {usuario.tipo_personal}
                      </span>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                        detalle.estado_usuario === "ACTIVO"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {detalle.estado_usuario}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2 text-gray-600 md:justify-start">
                      <ShieldCheck className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">
                        {detalle.roles?.join(", ") || "Sin rol"}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-gray-600 md:justify-start">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <span className="text-sm">{detalle.personal.ipress}</span>
                    </div>
                  </div>
                </div>

                {/* 📄 Datos Personales */}
                <Seccion titulo="Datos Personales" icono={FileText}>
                  <InfoItem
                    label="Tipo Documento"
                    valor={detalle.personal.tipo_documento}
                  />
                  <InfoItem
                    label="Número Documento"
                    valor={detalle.personal.numero_documento}
                  />
                  <InfoItem
                    label="Género"
                    valor={detalle.personal.genero === "M" ? "Masculino" : detalle.personal.genero === "F" ? "Femenino" : detalle.personal.genero}
                  />
                  <InfoItem
                    label="Fecha de Nacimiento"
                    valor={detalle.personal.fecha_nacimiento}
                  />
                  <InfoItem
                    label="Edad"
                    valor={`${detalle.personal.edad_actual} años`}
                  />
                  {detalle.personal.cumpleanos && (
                    <InfoItem
                      label="Cumpleaños"
                      valor={`${detalle.personal.cumpleanos.dia} de ${detalle.personal.cumpleanos.mes}`}
                      icono={<Heart className="w-4 h-4 text-pink-500" />}
                    />
                  )}
                </Seccion>

                {/* 📞 Contacto */}
                <Seccion titulo="Información de Contacto" icono={Mail}>
                  <InfoItem
                    label="Correo Corporativo"
                    valor={detalle.personal.contacto?.correo_corporativo}
                    icono={<Mail className="w-4 h-4 text-blue-500" />}
                  />
                  <InfoItem
                    label="Correo Personal"
                    valor={detalle.personal.contacto?.correo_personal}
                    icono={<Mail className="w-4 h-4 text-gray-500" />}
                  />
                  <InfoItem
                    label="Teléfono"
                    valor={detalle.personal.contacto?.telefono}
                    icono={<Phone className="w-4 h-4 text-green-500" />}
                  />
                </Seccion>

                {/* 🏢 Información Laboral (solo CENATE) */}
                {usuario.tipo_personal === "CENATE" && detalle.personal.laboral && (
                  <Seccion titulo="Información Laboral" icono={Briefcase}>
                    <InfoItem
                      label="Área"
                      valor={detalle.personal.laboral.area}
                    />
                    <InfoItem
                      label="Profesión"
                      valor={detalle.personal.laboral.profesion}
                    />
                    {detalle.personal.laboral.especialidades?.length > 0 && (
                      <InfoItem
                        label="Especialidades"
                        valor={detalle.personal.laboral.especialidades.join(", ")}
                      />
                    )}
                    <InfoItem
                      label="Régimen Laboral"
                      valor={detalle.personal.laboral.regimen_laboral}
                    />
                    <InfoItem
                      label="Número de Colegiatura"
                      valor={detalle.personal.laboral.numero_colegiatura}
                    />
                    <InfoItem
                      label="RNE Especialista"
                      valor={detalle.personal.laboral.rne_especialista}
                    />
                    <InfoItem
                      label="Código de Planilla"
                      valor={detalle.personal.laboral.codigo_planilla}
                    />
                  </Seccion>
                )}

                {/* 📍 Dirección */}
                <Seccion titulo="Dirección" icono={MapPin}>
                  <InfoItem
                    label="Domicilio"
                    valor={detalle.personal.direccion?.domicilio}
                  />
                  <InfoItem
                    label="Distrito"
                    valor={detalle.personal.direccion?.distrito}
                  />
                  <InfoItem
                    label="Provincia"
                    valor={detalle.personal.direccion?.provincia}
                  />
                  <InfoItem
                    label="Departamento"
                    valor={detalle.personal.direccion?.departamento}
                  />
                </Seccion>

                {/* 📅 Fechas del Sistema */}
                <Seccion titulo="Información del Sistema" icono={Calendar}>
                  <InfoItem
                    label="Usuario"
                    valor={detalle.username}
                  />
                  <InfoItem
                    label="Fecha de Registro"
                    valor={new Date(detalle.fechas?.fecha_registro).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  />
                  <InfoItem
                    label="Última Actualización"
                    valor={new Date(detalle.fechas?.ultima_actualizacion).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  />
                </Seccion>
              </div>
            ) : (
              <div className="py-20 text-center text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No se pudo cargar la información del usuario</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end flex-shrink-0 p-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-all shadow-md"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ========================================================================
// 🧩 COMPONENTES AUXILIARES
// ========================================================================

function Seccion({ titulo, icono: Icono, children }) {
  return (
    <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h4 className="flex items-center gap-3 text-lg font-bold text-gray-800">
          <Icono className="w-5 h-5 text-teal-600" />
          {titulo}
        </h4>
      </div>
      <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

function InfoItem({ label, valor, icono }) {
  if (!valor || valor === "null" || valor === "undefined") {
    return null;
  }

  return (
    <div className="flex flex-col">
      <span className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
        {label}
      </span>
      <div className="flex items-center gap-2">
        {icono}
        <span className="font-medium text-gray-900">{valor}</span>
      </div>
    </div>
  );
}

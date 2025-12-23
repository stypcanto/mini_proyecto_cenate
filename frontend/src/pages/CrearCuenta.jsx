// ========================================================================
// 🔐 CrearCuenta.jsx – Registro de Usuario (UI Profesional CENATE 2025)
// ------------------------------------------------------------------------
// Solicitud de registro -> revisión administrativa -> activación manual.
// Diseño institucional con foco en claridad y experiencia fluida.
// ========================================================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  Mail,
  User,
  Building,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../lib/apiClient";
import { VERSION } from "../config/version";

export default function CrearCuenta() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [redes, setRedes] = useState([]);
  const [ipress, setIpress] = useState([]);
  const [loadingRedes, setLoadingRedes] = useState(false);
  const [loadingIpress, setLoadingIpress] = useState(false);

  const [formData, setFormData] = useState({
    tipo_documento: "DNI",
    numero_documento: "",
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    genero: "",
    fecha_nacimiento: "",
    correo_personal: "",
    correo_institucional: "",
    telefono: "",
    tipo_personal: "Externo",
    id_red: null,
    id_ipress: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    cargarRedes();
  }, []);

  // Cargar IPRESS cuando se selecciona una RED
  useEffect(() => {
    if (formData.id_red) {
      cargarIpressPorRed(formData.id_red);
    } else {
      setIpress([]);
      setFormData(prev => ({ ...prev, id_ipress: null }));
    }
  }, [formData.id_red]);

  const cargarRedes = async () => {
    try {
      setLoadingRedes(true);
      const response = await apiClient.get('/redes/publicas');
      const todasRedes = Array.isArray(response) ? response : [];

      // Ordenar por descripción
      todasRedes.sort((a, b) => {
        const descA = a.descRed || '';
        const descB = b.descRed || '';
        return descA.localeCompare(descB);
      });

      setRedes(todasRedes);
      console.log(`✅ Cargadas ${todasRedes.length} REDs`);
    } catch (e) {
      console.error('❌ Error al cargar REDs:', e);
      toast.error("Error al cargar Redes de Salud");
    } finally {
      setLoadingRedes(false);
    }
  };

  const cargarIpressPorRed = async (idRed) => {
    try {
      setLoadingIpress(true);
      setIpress([]);

      const response = await apiClient.get(`/ipress/publicas/por-red/${idRed}`);
      const ipressFiltradas = Array.isArray(response) ? response : [];

      // Ordenar alfabéticamente por descripción
      ipressFiltradas.sort((a, b) => {
        const descA = a.descIpress || '';
        const descB = b.descIpress || '';
        return descA.localeCompare(descB);
      });

      setIpress(ipressFiltradas);
      console.log(`✅ Cargadas ${ipressFiltradas.length} IPRESS para RED ${idRed}`);
    } catch (e) {
      console.error('❌ Error al cargar IPRESS:', e);
      toast.error("Error al cargar IPRESS");
    } finally {
      setLoadingIpress(false);
    }
  };

  const handleDocumentoChange = (e) => {
    let v = e.target.value;
    if (formData.tipo_documento === "DNI") v = v.replace(/\D/g, "").slice(0, 8);
    else if (formData.tipo_documento === "CE")
      v = v.replace(/\D/g, "").slice(0, 20);
    else if (formData.tipo_documento === "PASAPORTE")
      v = v.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20).toUpperCase();
    setFormData((p) => ({ ...p, numero_documento: v }));
  };

  const handleTelefonoChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 9);
    setFormData((p) => ({ ...p, telefono: v }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = {};
    if (!formData.numero_documento) errs.numero_documento = "Campo obligatorio";
    if (!formData.nombres) errs.nombres = "Campo obligatorio";
    if (!formData.apellido_paterno) errs.apellido_paterno = "Campo obligatorio";
    if (!formData.apellido_materno) errs.apellido_materno = "Campo obligatorio";
    if (!formData.genero) errs.genero = "Campo obligatorio";
    if (!formData.fecha_nacimiento) errs.fecha_nacimiento = "Campo obligatorio";
    if (!formData.correo_personal) errs.correo_personal = "Campo obligatorio";
    if (!formData.telefono) errs.telefono = "Campo obligatorio";
    if (!formData.id_red) errs.id_red = "Debe seleccionar una Red de Salud";
    if (!formData.id_ipress) errs.id_ipress = "Debe seleccionar una IPRESS";

    const emailRgx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      formData.correo_institucional &&
      !emailRgx.test(formData.correo_institucional)
    )
      errs.correo_institucional = "Formato inválido";
    if (formData.correo_personal && !emailRgx.test(formData.correo_personal))
      errs.correo_personal = "Formato inválido";

    if (formData.tipo_documento === "DNI") {
      if (formData.numero_documento.length !== 8)
        errs.numero_documento = "El DNI debe tener 8 dígitos";
      if (!/^\d{8}$/.test(formData.numero_documento))
        errs.numero_documento = "Solo números";
    } else if (formData.tipo_documento === "CE") {
      if (
        formData.numero_documento.length < 9 ||
        formData.numero_documento.length > 20
      )
        errs.numero_documento = "Entre 9 y 20 dígitos";
    } else if (formData.tipo_documento === "PASAPORTE") {
      if (
        formData.numero_documento.length < 6 ||
        formData.numero_documento.length > 20
      )
        errs.numero_documento = "Entre 6 y 20 caracteres";
    }

    if (formData.telefono && formData.telefono.length !== 9)
      errs.telefono = "Debe tener 9 dígitos";

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      toast.error("Complete los campos correctamente");
      return;
    }

    setLoading(true);
    try {
      // Convertir snake_case a camelCase para el backend
      const payload = {
        tipoDocumento: formData.tipo_documento,
        numeroDocumento: formData.numero_documento,
        nombres: formData.nombres,
        apellidoPaterno: formData.apellido_paterno,
        apellidoMaterno: formData.apellido_materno,
        genero: formData.genero,
        fechaNacimiento: formData.fecha_nacimiento,
        correoPersonal: formData.correo_personal,
        correoInstitucional: formData.correo_institucional,
        telefono: formData.telefono,
        tipoPersonal: formData.tipo_personal,
        idIpress: formData.id_ipress
      };
      
      console.log('📤 Enviando solicitud:', payload);
      
      await apiClient.post("/auth/solicitar-registro", payload, false);
      setSolicitudEnviada(true);
      toast.success("Solicitud enviada correctamente");
    } catch (err) {
      console.error(err);
      // El mensaje viene directamente en err.message desde apiClient
      toast.error(err.message || "Error al enviar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de éxito
  if (solicitudEnviada) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: "url('/images/fondo-portal-web-cenate-2025.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-[#003d7a]/70"></div>

        <div className="absolute left-10 top-10 z-10">
          <img
            src="/cenate-logo.png"
            alt="CENATE"
            className="h-20 opacity-90 drop-shadow-2xl"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>

        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-full shadow-lg">
                <CheckCircle2 className="w-16 h-16 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-slate-900 mb-3">
              ¡Solicitud Enviada!
            </h1>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-slate-700 text-center leading-relaxed">
                Tu solicitud de registro ha sido enviada correctamente.
              </p>
              <p className="text-slate-600 text-center text-sm mt-2">
                El equipo administrativo la revisará y te notificará por correo.
              </p>
            </div>

            <div className="space-y-2 mb-8">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-sm">{formData.correo_personal}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <User className="w-5 h-5 text-blue-600" />
                <span className="text-sm">
                  {formData.nombres} {formData.apellido_paterno}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 bg-gradient-to-r from-[#0A5BA9] to-[#094580] text-white
                         rounded-xl font-semibold hover:from-[#094580] hover:to-[#073663]
                         transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]
                         flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al inicio de sesión
            </button>

            <p className="text-center text-sm text-slate-500 mt-4">
              Tiempo estimado de aprobación: 24-48 horas
            </p>

            <p className="text-center text-xs text-slate-400 mt-3">
              ¿No recibió respuesta? Contáctenos:{" "}
              <a
                href="mailto:cenate.analista@essalud.gob.pe"
                className="text-blue-600 hover:underline"
              >
                cenate.analista@essalud.gob.pe
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de registro
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/fondo-portal-web-cenate-2025.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-[#003d7a]/70"></div>

      {/* Logos */}
      <div className="absolute left-10 top-10 z-10">
        <img
          src="/cenate-logo.png"
          alt="CENATE"
          className="h-20 opacity-90 drop-shadow-2xl"
          onError={(e) => (e.target.style.display = "none")}
        />
      </div>
      <div className="absolute right-10 top-10 z-10">
        <img
          src="/essalud-logo.png"
          alt="EsSalud"
          className="h-20 opacity-90 drop-shadow-2xl"
          onError={(e) => (e.target.style.display = "none")}
        />
      </div>

      {/* Card principal */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
          {/* Logo EsSalud centrado */}
          <div className="flex justify-center pt-6 pb-2">
            <img
              src="/essalud-logo.png"
              alt="EsSalud"
              className="h-16"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>

          {/* Header */}
          <div className="px-8 py-4 text-center">
            <h1 className="text-3xl font-bold text-[#0A5BA9] mb-2">
              Crear Nueva Cuenta
            </h1>
            <p className="text-slate-600 text-sm">
              Centro Nacional de Telemedicina – CENATE
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Información Personal */}
            <section>
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#0A5BA9]" /> Información Personal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Tipo Documento */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tipo de Documento <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tipo_documento"
                    value={formData.tipo_documento}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/30 outline-none transition-all"
                  >
                    <option value="DNI">DNI</option>
                    <option value="CE">Carnet de Extranjería</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>

                {/* Número Documento */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Número de Documento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.numero_documento}
                    onChange={handleDocumentoChange}
                    placeholder={
                      formData.tipo_documento === "DNI"
                        ? "Ej: 12345678"
                        : "Número de documento"
                    }
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.numero_documento
                        ? "border-red-500"
                        : "border-slate-300"
                    } focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/30 outline-none transition-all`}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.tipo_documento === "DNI"
                      ? "8 dígitos numéricos"
                      : formData.tipo_documento === "CE"
                      ? "Hasta 20 dígitos"
                      : "Hasta 20 caracteres"}
                  </p>
                  {errors.numero_documento && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.numero_documento}
                    </p>
                  )}
                </div>

                {/* Nombres */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleChange}
                    placeholder="Ej: Juan Carlos"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.nombres ? "border-red-500" : "border-slate-300"
                    } focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/30 outline-none transition-all`}
                  />
                  {errors.nombres && (
                    <p className="text-red-500 text-xs mt-1">{errors.nombres}</p>
                  )}
                </div>

                {/* Apellido Paterno */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Apellido Paterno <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="apellido_paterno"
                    value={formData.apellido_paterno}
                    onChange={handleChange}
                    placeholder="Ej: García"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.apellido_paterno
                        ? "border-red-500"
                        : "border-slate-300"
                    } focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/30 outline-none transition-all`}
                  />
                  {errors.apellido_paterno && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.apellido_paterno}
                    </p>
                  )}
                </div>

                {/* Apellido Materno */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Apellido Materno <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="apellido_materno"
                    value={formData.apellido_materno}
                    onChange={handleChange}
                    placeholder="Ej: López"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.apellido_materno
                        ? "border-red-500"
                        : "border-slate-300"
                    } focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/30 outline-none transition-all`}
                  />
                  {errors.apellido_materno && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.apellido_materno}
                    </p>
                  )}
                </div>

                {/* Género */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Género <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.genero ? "border-red-500" : "border-slate-300"
                    } focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/30 outline-none transition-all`}
                  >
                    <option value="">Seleccione...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                  {errors.genero && (
                    <p className="text-red-500 text-xs mt-1">{errors.genero}</p>
                  )}
                </div>

                {/* Fecha de nacimiento */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fecha de Nacimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.fecha_nacimiento
                        ? "border-red-500"
                        : "border-slate-300"
                    } focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/30 outline-none transition-all`}
                  />
                  {errors.fecha_nacimiento && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fecha_nacimiento}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Información de Contacto */}
            <section>
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#0A5BA9]" /> Información de
                Contacto
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Correo personal */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Correo Personal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="correo_personal"
                    value={formData.correo_personal}
                    onChange={handleChange}
                    placeholder="usuario@gmail.com"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.correo_personal
                        ? "border-red-500"
                        : "border-slate-300"
                    } focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/30 outline-none transition-all`}
                  />
                  {errors.correo_personal && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.correo_personal}
                    </p>
                  )}
                </div>

                {/* Correo institucional */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Correo Institucional
                  </label>
                  <input
                    type="email"
                    name="correo_institucional"
                    value={formData.correo_institucional}
                    onChange={handleChange}
                    placeholder="usuario@essalud.gob.pe (opcional)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/30 outline-none transition-all"
                  />
                  {errors.correo_institucional && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.correo_institucional}
                    </p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={handleTelefonoChange}
                    placeholder="Ej: 987654321"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.telefono ? "border-red-500" : "border-slate-300"
                    } focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/30 outline-none transition-all`}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    9 dígitos numéricos{" "}
                    {formData.telefono && `(${formData.telefono.length}/9)`}
                  </p>
                  {errors.telefono && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.telefono}
                    </p>
                  )}
                </div>

                {/* Red de Salud */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Red de Salud <span className="text-red-500">*</span>
                  </label>
                  {loadingRedes ? (
                    <div className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-gray-50 flex items-center">
                      <div className="inline-block w-4 h-4 border-2 border-[#0A5BA9] border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-sm text-gray-500">
                        Cargando Redes...
                      </span>
                    </div>
                  ) : (
                    <select
                      name="id_red"
                      value={formData.id_red || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          id_red: e.target.value ? parseInt(e.target.value) : null,
                          id_ipress: null, // Limpiar IPRESS al cambiar RED
                        }))
                      }
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.id_red ? "border-red-500" : "border-slate-300"
                      } focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/30 outline-none transition-all`}
                    >
                      <option value="">Seleccione una Red de Salud</option>
                      {redes.map((red) => (
                        <option key={red.idRed} value={red.idRed}>
                          {red.descRed}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.id_red && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.id_red}
                    </p>
                  )}
                </div>

                {/* IPRESS */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    IPRESS <span className="text-red-500">*</span>
                  </label>
                  {loadingIpress ? (
                    <div className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-gray-50 flex items-center">
                      <div className="inline-block w-4 h-4 border-2 border-[#0A5BA9] border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-sm text-gray-500">
                        Cargando IPRESS...
                      </span>
                    </div>
                  ) : (
                    <select
                      name="id_ipress"
                      value={formData.id_ipress || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          id_ipress: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        }))
                      }
                      disabled={!formData.id_red}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.id_ipress ? "border-red-500" : "border-slate-300"
                      } focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/30 outline-none transition-all ${
                        !formData.id_red ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    >
                      <option value="">
                        {formData.id_red
                          ? "Seleccione su IPRESS"
                          : "Primero seleccione una Red"}
                      </option>
                      {ipress.map((ip) => (
                        <option key={ip.idIpress} value={ip.idIpress}>
                          {ip.codIpress} - {ip.descIpress}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.id_ipress && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.id_ipress}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Nota:</strong> Tu solicitud será revisada por el equipo
                administrativo. Una vez aprobada, recibirás un correo con tus
                credenciales.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex-1 py-3 bg-white text-slate-700 border border-slate-300
                           rounded-xl font-semibold hover:bg-slate-50 transition-all
                           flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-[#0A5BA9] text-white
                           rounded-xl font-semibold hover:bg-[#094580]
                           transition-all shadow-md hover:shadow-lg disabled:opacity-50
                           flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Enviar Solicitud
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="px-8 pb-6 text-center border-t pt-4">
            <p className="text-xs text-slate-500">Sistema CENATE – EsSalud 2025</p>
            <p className="text-xs text-slate-400 mt-1">
              Autenticación segura con validaciones de servidor
            </p>
          </div>
        </div>
      </div>

      {/* Versión */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white/80 text-sm drop-shadow z-10">
        CENATE v{VERSION.number} – Plataforma institucional
      </div>
    </div>
  );
}

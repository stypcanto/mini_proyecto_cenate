// ========================================================================
// 🧾 ACCOUNT REQUEST - Solicitud de Creación de Cuenta (CENATE Intranet)
// ========================================================================

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, User, FileText, Send, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const AccountRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    emailInstitucional: "",
    motivo: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      // Aquí podrías llamar a tu API para enviar la solicitud (POST /api/account-requests)
      console.log("📤 Enviando solicitud:", formData);

      // Simulación de éxito
      setTimeout(() => {
        toast.success("✅ Solicitud enviada correctamente");
        navigate("/login");
      }, 1200);
    } catch (err) {
      toast.error("❌ No se pudo enviar la solicitud. Inténtalo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#0B2149] via-[#123C73] to-[#0B2149]"
      style={{
        backgroundImage:
          "url('/images/fondo-portal-web-cenate-2025.png'), radial-gradient(circle at top right, rgba(18,60,115,0.3), transparent)",
        backgroundBlendMode: "overlay",
        backgroundSize: "cover",
      }}
    >
      {/* Patrón decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:36px_36px] opacity-10" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Volver */}
        <button
          onClick={() => navigate("/login")}
          className="inline-flex items-center gap-2 text-white/90 hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Volver al login</span>
        </button>

        {/* Encabezado */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-2xl shadow-xl">
              <img
                src="/images/Logo CENATE Azul.png"
                alt="Logo del Sistema CENATE"
                className="h-14 object-contain"
              />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
            Solicitud de Creación de Cuenta
          </h1>
          <p className="text-blue-100 text-sm">
            Completa los siguientes campos para solicitar acceso
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white/95 rounded-3xl shadow-2xl p-8 border border-gray-100 backdrop-blur-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="nombreCompleto"
                  placeholder="Ej. Juan Pérez"
                  value={formData.nombreCompleto}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#123C73] focus:border-transparent text-gray-900 font-medium"
                />
              </div>
            </div>

            {/* Correo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo institucional
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="emailInstitucional"
                  placeholder="Ej. juan.perez@essalud.gob.pe"
                  value={formData.emailInstitucional}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#123C73] focus:border-transparent text-gray-900 font-medium"
                />
              </div>
            </div>

            {/* Motivo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Motivo de la solicitud
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-3 text-gray-400" />
                <textarea
                  name="motivo"
                  rows="3"
                  placeholder="Describe brevemente el motivo de la solicitud"
                  value={formData.motivo}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#123C73] focus:border-transparent text-gray-900 font-medium resize-none"
                ></textarea>
              </div>
            </div>

            {/* Botón principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 bg-gradient-to-r from-[#123C73] to-[#0B2149] text-white font-semibold rounded-xl shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Enviar Solicitud</span>
                </>
              )}
            </button>

            {/* Volver */}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full flex items-center justify-center gap-2 py-3 border border-gray-300 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-all duration-300"
            >
              Volver al Login
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/80 text-xs">
            © {new Date().getFullYear()} CENATE - EsSalud · Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountRequest;
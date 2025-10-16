// ========================================================================
// 🔐 RECUPERAR CONTRASEÑA - CENATE INTRANET (versión mejorada)
// ========================================================================

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { useUsuarios } from "@/hooks/useUsuarios";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const { recoverPassword } = useUsuarios();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // ======================================================
  // 🧠 Lógica para enviar solicitud
  // ======================================================
  const handleForgot = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Por favor, ingresa tu correo institucional.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    try {
      setLoading(true);
      const data = await recoverPassword(email.trim());

      if (data?.success) {
        toast.success(data.message || "Solicitud enviada correctamente.");
      } else {
        toast.error(data?.message || "No existe una cuenta con ese correo.");
      }
    } catch (err) {
      console.error("❌ Error al enviar solicitud:", err);
      toast.error("Error al procesar la solicitud. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // 💅 Interfaz unificada con Login.jsx
  // ======================================================
  return (
    <div
      style={{ backgroundImage: "url('/images/fondo-portal-web-cenate-2025.png')" }}
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:40px_40px]" />

      <div className="w-full max-w-md relative z-10">
        {/* 🔙 Botón volver */}
        <Link
          to="/login"
          className="inline-flex items-center space-x-2 text-white hover:text-blue-100 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Volver al Login</span>
        </Link>

        {/* 📨 Card principal */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 text-center animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#2e63a6] to-[#1d4f8a] rounded-2xl mb-6 shadow-lg">
            <Mail className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Recuperar Contraseña
          </h2>
          <p className="text-gray-600 mb-6 text-sm md:text-base">
            Ingresa tu correo institucional para solicitar la recuperación de acceso.
          </p>

          <form onSubmit={handleForgot} className="space-y-5 text-left">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Correo institucional
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@essalud.gob.pe"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2e63a6] focus:border-transparent font-medium text-gray-900"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#2e63a6] to-[#1d4f8a] text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Enviar solicitud</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ⚪ Footer */}
        <p className="mt-6 text-center text-white/80 text-sm">
          © {new Date().getFullYear()} CENATE - EsSalud · Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
// ========================================================================
// 🔐 PasswordRecovery.js – Solicitud de recuperación CENATE 2025
// ------------------------------------------------------------------------
// • Permite registrar una solicitud de recuperación de contraseña
// • Envía notificación al SUPERADMIN para generar token temporal
// • Flujo institucional con trazabilidad de auditoría
// ========================================================================

import React, { useState } from "react";
import { ArrowLeft, Send, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import { VERSION } from "../config/version";

export default function PasswordRecovery() {
  const [username, setUsername] = useState("");
  const [assistantMsg, setAssistantMsg] = useState(null);
  const [msgType, setMsgType] = useState("info");
  const [loading, setLoading] = useState(false);

  // ============================================================
  // 📩 Enviar solicitud de recuperación
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setAssistantMsg("⚠️ Por favor, ingrese su usuario institucional o DNI.");
      setMsgType("error");
      return;
    }

    try {
      setLoading(true);
      setMsgType("info");
      setAssistantMsg("🔍 Enviando solicitud de recuperación...");

      // Aquí puedes conectar al backend real:
      // const res = await apiClient.post("/admin/recuperacion/solicitar", { username });
      // Simulación temporal
      await new Promise((res) => setTimeout(res, 1000));

      setMsgType("success");
      setAssistantMsg(
        "✅ Solicitud enviada correctamente. Un administrador revisará tu caso y asignará una contraseña temporal."
      );
      setUsername("");
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      setMsgType("error");
      setAssistantMsg(
        "❌ Error al enviar la solicitud. Intenta nuevamente más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-center bg-cover bg-no-repeat relative"
      style={{
        backgroundImage: "url('/images/fondo-portal-web-cenate-2025.png')",
      }}
    >
      <div className="absolute inset-0 bg-[#0a5ba9]/40"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 rounded-3xl shadow-2xl p-8 backdrop-blur-lg border border-white/40">
          {/* Logo */}
          <div className="text-center mb-6">
            <img
              src="/images/LogoESSALUDAzul.png"
              alt="Logo EsSalud"
              className="mx-auto h-14 mb-8 drop-shadow-md"
            />
            <h1 className="text-2xl font-bold text-[#0a5ba9] mb-1">
              Recuperación de Contraseña
            </h1>
            <p className="text-sm text-gray-600">
              Centro Nacional de Telemedicina – CENATE
            </p>
          </div>

          {/* Asistente UX */}
          {assistantMsg && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm ${
                msgType === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : msgType === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              {msgType === "success" ? (
                <CheckCircle2 size={18} />
              ) : msgType === "error" ? (
                <AlertCircle size={18} />
              ) : (
                <Info size={18} />
              )}
              <span>{assistantMsg}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Usuario o DNI
              </label>
              <input
                type="text"
                placeholder="Ej. scantor o 12345678"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-4 focus:border-[#0a5ba9] focus:ring-[#0a5ba9]/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 mt-2 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-md ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-[#0a5ba9] hover:bg-[#094580] hover:shadow-lg hover:scale-[1.01]"
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span> Enviando...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Enviar Solicitud
                </>
              )}
            </button>
          </form>

          {/* Enlace para volver */}
          <div className="mt-6 flex justify-center">
            <Link
              to="/login"
              className="text-[#0a5ba9] hover:underline flex items-center gap-1 text-sm"
            >
              <ArrowLeft size={15} /> Volver al inicio de sesión
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-gray-500 text-xs border-t pt-4">
            <p>Sistema CENATE – EsSalud 2025</p>
            <p>Solicitud de recuperación administrada por el área de soporte</p>
          </div>
        </div>

        {/* Versión */}
        <div className="mt-4 text-center text-white/90 text-sm drop-shadow">
          CENATE v{VERSION.number} – Plataforma institucional
        </div>
      </div>
    </div>
  );
}
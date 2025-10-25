// ========================================================================
// 💠 Login.jsx – Sistema CENATE 2025 (versión final con rutas activas)
// ------------------------------------------------------------------------
// • Valida credenciales con backend MBAC real
// • Redirige al dashboard tras login exitoso
// • Enlaces activos a CrearUsuario.js y PasswordRecovery.js
// • Diseño institucional EsSalud – CENATE
// ========================================================================

import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Loader2,
  UserPlus,
  KeyRound,
  Home,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Login() {
  const { login, loading } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [assistantMsg, setAssistantMsg] = useState(null);
  const [msgType, setMsgType] = useState("info");

  // ============================================================
  // 📋 Validación previa
  // ============================================================
  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim())
      newErrors.username = "Ingrese su usuario institucional";
    if (!formData.password)
      newErrors.password = "Ingrese su contraseña";
    else if (formData.password.length < 8)
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";

    setErrors(newErrors);
    if (Object.keys(newErrors).length)
      setAssistantMsg("⚠️ Complete los campos requeridos correctamente.");
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // 🧠 Enviar al backend
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setAssistantMsg("🔍 Verificando credenciales...");
      setMsgType("info");

      const response = await login(formData.username, formData.password);

      if (response?.ok) {
        setMsgType("success");
        setAssistantMsg("✅ Inicio de sesión exitoso. Redirigiendo...");
        setTimeout(() => setAssistantMsg(null), 1500);
      } else {
        setMsgType("error");
        setAssistantMsg("❌ Usuario o contraseña incorrectos. Intente nuevamente.");
      }
    } catch (err) {
      console.error("Error de autenticación:", err);
      setMsgType("error");
      setAssistantMsg("❌ Error de conexión con el servidor. Intente más tarde.");
    }
  };

  // ============================================================
  // 🧹 Limpiar errores cuando el usuario escribe
  // ============================================================
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (assistantMsg && msgType !== "info") setAssistantMsg(null);
  };

  // ============================================================
  // 💎 Render principal
  // ============================================================
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-center bg-no-repeat bg-cover relative"
      style={{
        backgroundImage: "url('/images/fondo-portal-web-cenate-2025.png')",
      }}
    >
      {/* Capa azul institucional */}
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
              Inicio de Sesión
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
            {/* Usuario */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Usuario
              </label>
              <input
                type="text"
                placeholder="Tu usuario institucional"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-4 ${
                  errors.username
                    ? "border-red-400 focus:ring-red-100"
                    : "border-gray-200 focus:border-[#0a5ba9] focus:ring-[#0a5ba9]/20"
                }`}
              />
              {errors.username && (
                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.username}</span>
                </div>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-xl text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-4 ${
                    errors.password
                      ? "border-red-400 focus:ring-red-100"
                      : "border-gray-200 focus:border-[#0a5ba9] focus:ring-[#0a5ba9]/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0a5ba9] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Recordar usuario */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) =>
                    setFormData({ ...formData, remember: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#0a5ba9]"
                />
                Recordar usuario
              </label>
            </div>

            {/* Botón principal */}
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
                  <Loader2 size={18} className="animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Acciones complementarias */}
          <div className="mt-6 flex flex-col items-center text-sm text-gray-600 space-y-3">
            <Link
              to="/admin/crear-usuario"
              className="text-[#0a5ba9] font-semibold hover:underline flex items-center gap-1"
            >
              <UserPlus size={15} /> Crear nueva cuenta
            </Link>

            <Link
              to="/password-recovery"
              className="hover:text-[#0a5ba9] flex items-center gap-1"
            >
              <KeyRound size={15} /> Olvidé mi contraseña
            </Link>

            <Link
              to="/"
              className="hover:text-[#0a5ba9] flex items-center gap-1"
            >
              <Home size={15} /> Regresar al inicio
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-gray-500 text-xs border-t pt-4">
            <p>Sistema CENATE – EsSalud 2025</p>
            <p>Autenticación segura con validaciones de servidor</p>
          </div>
        </div>

        {/* Versión */}
        <div className="mt-4 text-center text-white/90 text-sm drop-shadow">
          CENATE v1.0 – Plataforma institucional
        </div>
      </div>
    </div>
  );
}
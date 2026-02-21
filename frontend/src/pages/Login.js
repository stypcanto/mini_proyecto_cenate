// ========================================================================
// 💠 Login.jsx – Sistema CENATE 2025 (validación real con backend)
// ------------------------------------------------------------------------
// • Validación real con backend + redirección automática según rol MBAC
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
  Lock,
} from "lucide-react";
import { VERSION } from "../config/version";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import ForgotPasswordModal from "../components/modals/ForgotPasswordModal";
import PrimerAccesoModal from "../components/modals/PrimerAccesoModal.jsx";


export default function Login() {
  const [showForgot, setShowForgot] = useState(false);
  const [showPrimerAcceso, setShowPrimerAcceso] = useState(false);
  const [primerAccesoUsername, setPrimerAccesoUsername] = useState("");
  const { login, loading, user, logout } = useAuth();
  const navigate = useNavigate();

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
  // 📋 Validación de campos (previa al backend)
  // ============================================================
  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Ingrese su usuario institucional";
    if (!formData.password) newErrors.password = "Ingrese su contraseña";
    else if (formData.password.length < 8)
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";

    setErrors(newErrors);
    if (Object.keys(newErrors).length)
      setAssistantMsg("⚠️ Por favor, complete los campos requeridos correctamente.");
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // 🚀 Redirección según rol MBAC
  // 👋 v1.40.0: Redirigir a Bienvenida específica por rol + variaciones
  // ============================================================
  const redirectByRole = (roles = []) => {
    const has = (r) => roles?.some(rol => rol?.toUpperCase() === r?.toUpperCase());
    const hasAny = (patterns) => roles?.some(r =>
      patterns.some(p => r?.toUpperCase().includes(p.toUpperCase()))
    );

    // Flexible detection for PERSONAL_107 (supports variations like PERSONAL-107)
    const isPersonal107 = roles?.some(r => r?.includes("PERSONAL") && r?.includes("107"));

    if (has("SUPERADMIN") || has("ADMIN")) return "/admin/bienvenida";
    if (isPersonal107) return "/roles/personal107/bienvenida";
    if (hasAny(["MEDICO", "ENFERMERIA", "OBSTETRA", "LABORATORIO", "RADIOLOGIA", "FARMACIA", "PSICOLOGO", "TERAPISTA_LENG", "TERAPISTA_FISI", "NUTRICION"])) return "/roles/profesionaldesalud/bienvenida";
    if (has("COORDINADOR_MEDICO_TELEURGENCIAS")) return "/roles/coordinador/teleurgencias/bienvenida";
    if (has("COORDINADOR")) return "/roles/coordinador/bienvenida";
    // ✅ v1.40.0: Mejorada detección flexible para GESTOR DE CITAS
    if (hasAny(["GESTOR_CITAS", "GESTOR DE CITAS", "GESTORCITAS"])) return "/citas/bienvenida";
    if (hasAny(["COORDINADOR_GESTION_CITAS", "COORD. GESTION CITAS", "COORD_GESTION_CITAS"])) return "/roles/coordcitas/bienvenida";
    if (has("EXTERNO") || has("INSTITUCION_EX")) return "/roles/externo/bienvenida";
    if (hasAny(["MESA_DE_AYUDA", "MESA DE AYUDA", "MESAAYUDA"])) return "/mesa-ayuda/bienvenida";
    return "/citas/bienvenida"; // ruta por defecto → Gestor de Citas
  };

  // ============================================================
  // 🧠 Enviar formulario y validar con backend real
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setAssistantMsg("🔍 Verificando credenciales...");
      setMsgType("info");

      const response = await login(formData.username, formData.password);

      // login() devuelve { ok: true, user, roles, ... }
      if (response?.ok) {
        // 🔑 Verificar si requiere cambio de contraseña
        if (response?.user?.requiereCambioPassword) {
          setMsgType("info");
          setAssistantMsg("🔐 Configuración de cuenta requerida...");
          setPrimerAccesoUsername(formData.username);
          setShowPrimerAcceso(true);
          return; // No redirigir aún
        }

        setMsgType("success");
        setAssistantMsg("✅ Inicio de sesión exitoso. Redirigiendo...");

        // Detectar roles desde respuesta o AuthContext
        const roles = response?.roles || response?.user?.roles || user?.roles || [];
        const destination = redirectByRole(roles);

        // Redirigir tras breve delay UX
        setTimeout(() => navigate(destination, { replace: true }), 800);
      } else {
        setMsgType("error");
        // Mostrar mensaje específico del backend si existe
        const errorMsg = response?.error || "Usuario o contraseña incorrectos";
        setAssistantMsg(`❌ ${errorMsg}`);
      }
    } catch (err) {
      console.error("Error de autenticación:", err);
      setMsgType("error");

      // SEC-002: Detectar mensaje de cuenta bloqueada
      const errorMessage = err.message || "";
      if (errorMessage.toLowerCase().includes("bloqueada") ||
          errorMessage.toLowerCase().includes("locked")) {
        setMsgType("warning");
        setAssistantMsg("Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intente nuevamente en 10 minutos.");
      } else if (errorMessage.toLowerCase().includes("inactiva")) {
        setMsgType("warning");
        setAssistantMsg("La cuenta está inactiva. Contacte al administrador.");
      } else if (errorMessage.includes("Usuario no encontrado")) {
        setAssistantMsg("Usuario no encontrado en el sistema.");
      } else if (errorMessage.includes("Credenciales")) {
        setAssistantMsg("Usuario o contraseña incorrectos.");
      } else {
        setAssistantMsg(errorMessage || "Error de conexión con el servidor. Intente más tarde.");
      }
    }
  };

  // ============================================================
  // 💎 Render principal
  // ============================================================
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-center bg-no-repeat bg-cover relative overflow-y-auto"
      style={{
        backgroundImage: "url('/images/fondo-portal-web-cenate-2025.png')",
      }}
    >
      {/* Capa azul institucional */}
      <div className="absolute inset-0 bg-[#0a5ba9]/40"></div>

      {/* ✅ v1.50.1: Wider, simpler login - less compressed, not too tall */}
      {/* Mobile: max-w-md | Tablet: md:max-w-2xl | Landscape: landscape:max-w-lg */}
      <div className="w-full max-w-md md:max-w-2xl landscape:max-w-lg relative z-10 px-4 md:px-6 py-4 md:py-0">
        <div className="bg-white/95 rounded-2xl shadow-2xl p-5 md:p-8 backdrop-blur-lg border border-white/40">
          {/* Logo */}
          <div className="text-center mb-5 md:mb-6">
            <img
              src="/images/LogoESSALUDAzul.png"
              alt="Logo EsSalud"
              className="mx-auto h-12 md:h-14 mb-4 md:mb-5 drop-shadow-md"
            />

            <h1 className="text-xl md:text-2xl font-bold text-[#0a5ba9] mb-1">
              Inicio de Sesión
            </h1>
            <p className="text-xs md:text-sm text-gray-600">
              CENATE – Sistema de Telemedicina
            </p>
          </div>

          {/* Asistente UX */}
          {assistantMsg && (
            <div
              className={`flex items-center gap-2 p-2.5 rounded-lg mb-3 text-xs md:text-sm ${
                msgType === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : msgType === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : msgType === "warning"
                  ? "bg-orange-50 text-orange-700 border border-orange-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              {msgType === "success" ? (
                <CheckCircle2 size={16} />
              ) : msgType === "error" ? (
                <AlertCircle size={16} />
              ) : msgType === "warning" ? (
                <Lock size={16} />
              ) : (
                <Info size={16} />
              )}
              <span>{assistantMsg}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            {/* Usuario */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">
                Usuario
              </label>
              <input
                type="text"
                placeholder="DNI / Pasaporte / CE"
                value={formData.username}
                onChange={(e) => {
                  // Solo permitir números y letras (para DNI, pasaporte, carnet extranjería)
                  const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                  setFormData({ ...formData, username: value });
                }}
                maxLength={12}
                inputMode="numeric"
                autoComplete="username"
                className={`w-full px-3 py-2.5 md:py-3 border-2 rounded-lg text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-4 text-sm md:text-base ${
                  errors.username
                    ? "border-red-400 focus:ring-red-100"
                    : "border-gray-200 focus:border-[#0a5ba9] focus:ring-[#0a5ba9]/20"
                }`}
              />
              {errors.username && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs md:text-sm">
                  <AlertCircle size={12} />
                  <span>{errors.username}</span>
                </div>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={`w-full px-3 py-2.5 md:py-3 pr-10 border-2 rounded-lg text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-4 text-sm md:text-base ${
                    errors.password
                      ? "border-red-400 focus:ring-red-100"
                      : "border-gray-200 focus:border-[#0a5ba9] focus:ring-[#0a5ba9]/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0a5ba9] transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-xs md:text-sm">
                  <AlertCircle size={12} />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Recordar usuario */}
            <div className="flex items-center justify-between text-xs md:text-sm text-gray-600">
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

            {/* ✅ Botón principal con responsive sizing */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 md:py-3 mt-2 md:mt-3 rounded-lg font-semibold text-white text-sm md:text-base flex items-center justify-center gap-2 transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-[#0a5ba9]/50 ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-[#0a5ba9] hover:bg-[#094580] hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span className="hidden md:inline">Verificando...</span>
                  <span className="md:hidden">Verificando</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* ✅ Acciones complementarias con responsive sizing */}
          <div className="mt-4 md:mt-5 flex flex-col items-center text-xs md:text-sm text-gray-600 space-y-1.5 md:space-y-2">
            <Link
              to="/crear-cuenta"
              className="text-[#0a5ba9] font-semibold hover:text-[#083d78] hover:underline flex items-center gap-2 py-1.5 md:py-2 px-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <UserPlus size={16} /> Crear cuenta
            </Link>
            <button
              onClick={() =>{
                //alert("Función de recuperación de contraseña en desarrollo.")
                  setShowForgot(true)
                }
              }
              className="hover:text-[#0a5ba9] flex items-center gap-2 py-1.5 md:py-2 px-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              <KeyRound size={16} /> Recuperar contraseña
            </button>
            <Link
              to="/"
              className="hover:text-[#0a5ba9] flex items-center gap-2 py-1.5 md:py-2 px-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Home size={16} /> Regresar
            </Link>
          </div>

          {/* Modal de recuperacion */}
              {
                showForgot && <ForgotPasswordModal onClose={()=> setShowForgot(false)} />
              }

          {/* Modal de primer acceso */}
              {
                showPrimerAcceso && (
                  <PrimerAccesoModal 
                    username={primerAccesoUsername}
                    onCompleted={() => {
                      // Cerrar modal y redirigir al dashboard según el rol
                      setShowPrimerAcceso(false);
                      
                      // Obtener roles del usuario actual
                      const currentUser = user || {};
                      const roles = currentUser.roles || [];
                      
                      // Normalizar roles (remover ROLE_ si existe)
                      const normalizedRoles = roles.map(r => {
                        if (typeof r === 'string') return r.replace('ROLE_', '').toUpperCase();
                        if (r?.authority) return r.authority.replace('ROLE_', '').toUpperCase();
                        return String(r || '').replace('ROLE_', '').toUpperCase();
                      }).filter(Boolean);
                      
                      // Determinar destino según rol
                      const has = (r) => normalizedRoles.includes(r);
                      let destination = "/user/dashboard"; // ruta por defecto
                      
                      if (has("SUPERADMIN") || has("ADMIN")) {
                        destination = "/admin/dashboard";
                      } else if (has("MEDICO")) {
                        destination = "/roles/profesionaldesalud/dashboard";
                      } else if (has("COORDINADOR")) {
                        destination = "/roles/coordinador/dashboard";
                      } else if (has("EXTERNO")) {
                        destination = "/roles/externo/dashboard";
                      }
                      
                      setMsgType("success");
                      setAssistantMsg("✅ Contraseña actualizada. Redirigiendo...");
                      
                      // Redirigir al dashboard
                      setTimeout(() => {
                        navigate(destination, { replace: true });
                      }, 1000);
                    }}
                  />
                )
              }



          {/* Footer */}
          <div className="mt-4 md:mt-5 text-center text-gray-500 text-[10px] md:text-xs border-t pt-3 md:pt-4">
            <p className="font-medium">CENATE – EsSalud 2025</p>
            <p>Autenticación segura</p>
          </div>
        </div>

        {/* Versión */}
        <div className="mt-4 md:mt-6 text-center text-white/90 text-sm drop-shadow">
          CENATE v{VERSION.number} – Plataforma institucional
        </div>
      </div>
    </div>
  );
}
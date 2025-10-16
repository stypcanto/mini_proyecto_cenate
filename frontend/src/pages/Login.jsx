// ========================================================================
// 🔐 LOGIN - SISTEMA DE INTRANET CENATE (versión profesional mejorada)
// ========================================================================

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Eye, 
  EyeOff, 
  LogIn, 
  User, 
  Lock, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle,
  Mail,
  ShieldCheck,
  AlertCircle,
  UserPlus,
  Home
} from "lucide-react";
import { useUsuarios } from "@/hooks/useUsuarios";
import toast from "react-hot-toast";

const Login = () => {
  const { loginUser } = useUsuarios();
  const navigate = useNavigate();
  
  // Estados principales
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [showPasswordHints, setShowPasswordHints] = useState(false);

  // Cargar credenciales guardadas si existen
  useEffect(() => {
    const savedUsername = localStorage.getItem("savedUsername");
    if (savedUsername) {
      setFormData(prev => ({ ...prev, username: savedUsername }));
      setRememberMe(true);
    }
  }, []);

  // ======================================================
  // 🔒 Validación de seguridad de contraseña (igual al backend)
  // ======================================================
  const validatePasswordSecurity = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const strength = Object.values(checks).filter(Boolean).length;
    const strengthLevels = {
      0: { label: "Muy débil", color: "bg-red-500", width: "w-1/5" },
      1: { label: "Débil", color: "bg-orange-500", width: "w-2/5" },
      2: { label: "Regular", color: "bg-yellow-500", width: "w-3/5" },
      3: { label: "Buena", color: "bg-blue-500", width: "w-4/5" },
      4: { label: "Fuerte", color: "bg-green-500", width: "w-4/5" },
      5: { label: "Muy fuerte", color: "bg-green-600", width: "w-full" }
    };

    return {
      isValid: strength === 5,
      strength: strengthLevels[strength],
      checks
    };
  };

  // Actualizar fuerza de contraseña en tiempo real
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(validatePasswordSecurity(formData.password));
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password]);

  // ======================================================
  // ✅ Validación de formulario
  // ======================================================
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "El usuario o correo es requerido";
    } else if (formData.username.includes("@")) {
      // Validar formato de email si parece ser un correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.username)) {
        newErrors.username = "Formato de correo electrónico inválido";
      }
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ======================================================
  // 🧠 Lógica de autenticación mejorada
  // ======================================================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, corrige los errores en el formulario");
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser(formData.username, formData.password);

      if (!data?.token) {
        toast.error(data?.message || "Credenciales incorrectas");
        setLoading(false);
        return;
      }

      // Gestionar "Recordar usuario"
      if (rememberMe) {
        localStorage.setItem("savedUsername", formData.username);
      } else {
        localStorage.removeItem("savedUsername");
      }

      // Guardar datos del usuario autenticado
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", formData.username);
      localStorage.setItem("nombreCompleto", data.nombreCompleto || "");
      localStorage.setItem("roles", JSON.stringify(data.roles || []));
      localStorage.setItem("permisos", JSON.stringify(data.permisos || []));

      // Notificación de éxito personalizada
      toast.success(
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          <span>Bienvenido {data.nombreCompleto || formData.username}</span>
        </div>
      );

      // Determinar ruta de destino según rol principal
      const rol = (data.roles?.[0] || "").toUpperCase();
      const rutasPorRol = {
        SUPERADMIN: "/admin",
        ADMIN: "/admin",
        MEDICO: "/medico",
        COORDINADOR_MEDICO: "/coordinador",
        COORDINACION: "/coordinador",
        COORD_TRANSFER: "/coordinador",
        EXTERNO: "/externo",
        CITAS: "/citas",
        COORD_LINEAMIENTOS_IPRESS: "/lineamientos",
      };

      const destino = rutasPorRol[rol] || "/user/dashboard";
      navigate(destino, { replace: true });
    } catch (err) {
      console.error("❌ Error en login:", err);
      
      // Mensajes de error específicos
      if (err.message?.includes("fetch") || err.message?.includes("network")) {
        toast.error(
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>No se pudo conectar con el servidor</span>
          </div>
        );
      } else if (err.message?.includes("inactiva") || err.message?.includes("bloqueada")) {
        toast.error("Tu cuenta está inactiva o bloqueada. Contacta al administrador.");
      } else {
        toast.error("Usuario o contraseña incorrectos");
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // ======================================================
  // 💅 Interfaz profesional mejorada
  // ======================================================
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Fondo animado con gradientes */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-blue-600/20 animate-pulse" />
        <div className="absolute inset-0 bg-[url('/images/pattern-dots.svg')] opacity-5" />
      </div>

      {/* Círculos decorativos animados */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 w-full max-w-5xl px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Panel izquierdo - Información */}
          <div className="hidden lg:block text-white">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-8 group"
            >
              <Home className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Volver al inicio</span>
            </Link>

            <div className="mb-8">
              <img
                src="/images/Logo CENATE Blanco.png"
                alt="CENATE"
                className="h-20 object-contain mb-6"
              />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Portal de Acceso
                <span className="block text-3xl md:text-4xl text-blue-300 mt-2">
                  Intranet CENATE
                </span>
              </h1>
              <p className="text-lg text-blue-100/80 leading-relaxed">
                Sistema de gestión integral para profesionales de la salud.
                Accede con tus credenciales institucionales.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Conexión Segura</h3>
                  <p className="text-sm text-blue-100/60">
                    Todos tus datos están protegidos con encriptación de extremo a extremo
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Soporte 24/7</h3>
                  <p className="text-sm text-blue-100/60">
                    ¿Problemas para acceder? Contacta a soporte@cenate.gob.pe
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel derecho - Formulario */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
              
              {/* Header del formulario */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
                <p className="text-gray-600 mt-1">
                  Ingresa tus credenciales para continuar
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Campo Usuario/Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Usuario o Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {formData.username.includes("@") ? (
                        <Mail className="w-5 h-5" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <input
                      type="text"
                      name="username"
                      placeholder="usuario@essalud.gob.pe"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg transition-all
                        ${errors.username 
                          ? "border-red-500 focus:ring-red-500" 
                          : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                        } focus:ring-2 focus:outline-none`}
                      disabled={loading}
                      autoComplete="username"
                    />
                    {errors.username && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {errors.username}
                      </p>
                    )}
                  </div>
                </div>

                {/* Campo Contraseña */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Ingresa tu contraseña"
                      value={formData.password}
                      onChange={handleInputChange}
                      onFocus={() => setShowPasswordHints(true)}
                      onBlur={() => setTimeout(() => setShowPasswordHints(false), 200)}
                      className={`w-full pl-11 pr-11 py-3 border-2 rounded-lg transition-all
                        ${errors.password 
                          ? "border-red-500 focus:ring-red-500" 
                          : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                        } focus:ring-2 focus:outline-none`}
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Indicador de fuerza de contraseña */}
                  {passwordStrength && showPasswordHints && (
                    <div className="mt-3 space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full transition-all ${passwordStrength.strength.color} ${passwordStrength.strength.width}`}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {passwordStrength.strength.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {[
                          { key: 'length', text: 'Mínimo 8 caracteres' },
                          { key: 'uppercase', text: 'Una mayúscula' },
                          { key: 'lowercase', text: 'Una minúscula' },
                          { key: 'number', text: 'Un número' },
                          { key: 'special', text: 'Un símbolo especial' }
                        ].map(({ key, text }) => (
                          <div key={key} className="flex items-center gap-1">
                            {passwordStrength.checks[key] ? (
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-gray-400" />
                            )}
                            <span className={passwordStrength.checks[key] ? "text-green-700" : "text-gray-500"}>
                              {text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Opciones adicionales */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Recordar usuario</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {/* Botón de login */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Iniciando sesión...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Iniciar Sesión</span>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">¿No tienes cuenta?</span>
                </div>
              </div>

              {/* Link a registro */}
              <Link
                to="/register"
                className="w-full py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>Solicitar Acceso</span>
              </Link>
            </div>

            {/* Footer móvil */}
            <div className="mt-6 text-center lg:hidden">
              <p className="text-white/70 text-xs">
                © {new Date().getFullYear()} CENATE – EsSalud
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
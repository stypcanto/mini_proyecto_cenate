// ========================================================================
// 🔐 LOGIN - SISTEMA DE INTRANET CENATE (versión institucional optimizada)
// ========================================================================

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, User, Lock, ArrowLeft } from "lucide-react";
import { useUsuarios } from "@/hooks/useUsuarios";
import toast from "react-hot-toast";

const Login = () => {
  const { loginUser } = useUsuarios();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ======================================================
  // 🧠 Lógica de autenticación con redirección por rol
  // ======================================================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Por favor, ingresa usuario y contraseña.");
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser(username, password);

      if (!data?.token) {
        toast.error(data?.message || "Credenciales incorrectas.");
        setLoading(false);
        return;
      }

      // ✅ Guardar datos del usuario autenticado
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);
      localStorage.setItem("nombreCompleto", data.nombreCompleto || "");
      localStorage.setItem("roles", JSON.stringify(data.roles || []));
      localStorage.setItem("permisos", JSON.stringify(data.permisos || []));

      toast.success(`Bienvenido ${data.nombreCompleto || username}`);

      // 🚀 Determinar ruta de destino según rol principal
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

      // 🧭 Si el rol no coincide, enviar al dashboard de usuario genérico
      const destino = rutasPorRol[rol] || "/user/dashboard";
      navigate(destino, { replace: true });
    } catch (err) {
      console.error("❌ Error en login:", err);
      toast.error(
        err.message?.includes("fetch")
          ? "No se pudo conectar con el servidor."
          : "Error al iniciar sesión. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // 💅 Interfaz institucional con estilo EsSalud-CENATE
  // ======================================================
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
      {/* Patrón de puntos institucional */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:36px_36px] opacity-10" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Enlace volver */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/90 hover:text-white transition mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Volver al inicio</span>
        </Link>

        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-2xl shadow-xl">
              <img
                src="/images/Logo CENATE Azul.png"
                alt="CENATE"
                className="h-16 object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Intranet CENATE
          </h1>
          <p className="text-blue-100 text-sm">
            Acceso exclusivo para personal autorizado
          </p>
        </div>

        {/* Tarjeta del formulario */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#0B2149] to-[#123C73] rounded-2xl mb-6 shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
            <p className="text-gray-600 text-sm mt-2">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Usuario */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#123C73] focus:border-transparent text-gray-900 font-medium"
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#123C73] focus:border-transparent text-gray-900 font-medium"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#123C73] transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Recuperación */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-[#123C73] hover:text-[#0B2149] font-semibold transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botón principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#123C73] to-[#0B2149] text-white text-base font-bold rounded-xl shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Iniciar sesión</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/80 text-xs">
            © {new Date().getFullYear()} CENATE – EsSalud · Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
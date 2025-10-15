// ========================================================================
// 🔐 LOGIN - SISTEMA DE INTRANET CENATE (Versión conectada con roles)
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // ======================================================
  // 🧠 Lógica de Login con roles
  // ======================================================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Por favor, ingresa usuario y contraseña.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await loginUser(username, password);
      console.log("📡 Respuesta del backend:", data);

      if (data?.token) {
        // ✅ Guardamos los datos esenciales
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        localStorage.setItem("nombreCompleto", data.nombreCompleto || "");
        localStorage.setItem("roles", JSON.stringify(data.roles || []));
        localStorage.setItem("permisos", JSON.stringify(data.permisos || []));

        toast.success(`Bienvenido ${data.nombreCompleto || username}`);

        // 🚀 Redirección según el primer rol
        const rol = data.roles?.[0]?.toUpperCase() || "";

        switch (rol) {
          case "SUPERADMIN":
          case "ADMIN":
            navigate("/admin");
            break;

          case "MEDICO":
            navigate("/medico");
            break;

          case "COORDINADOR_MEDICO":
          case "COORDINACION":
          case "COORD_TRANSFER":
            navigate("/coordinador");
            break;

          case "EXTERNO":
            navigate("/externo");
            break;

          case "CITAS":
            navigate("/citas");
            break;

          case "COORD_LINEAMIENTOS_IPRESS":
            navigate("/lineamientos");
            break;

          default:
            navigate("/user/dashboard");
            break;
        }
      } else {
        setError(
            data?.message ||
            "Usuario o contraseña incorrectos. Si olvidaste tu clave, selecciona '¿Olvidaste tu contraseña?'."
        );
      }
    } catch (err) {
      console.error("❌ Error al iniciar sesión:", err);
      setError(
          err.message ||
          "Usuario o contraseña incorrectos. Si olvidaste tu clave, selecciona '¿Olvidaste tu contraseña?'."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // 💅 Interfaz moderna (sin cambios)
  // ======================================================
  return (
      <div
          style={{
            backgroundImage: "url('/images/fondo-portal-web-cenate-2025.png')",
          }}
          className="min-h-screen bg-cover bg-center flex items-center justify-center p-4 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:40px_40px]" />

        <div className="w-full max-w-md relative z-10">
          <Link
              to="/"
              className="inline-flex items-center space-x-2 text-white hover:text-blue-100 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver al inicio</span>
          </Link>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-2xl shadow-2xl">
                <img
                    src="/images/Logo CENATE Azul.png"
                    alt="Logo del Sistema CENATE"
                    className="h-16 object-contain"
                />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Sistema de Intranet
            </h1>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#2e63a6] to-[#1d4f8a] rounded-2xl mb-6 shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Iniciar Sesión
              </h2>
              <p className="text-gray-600 mt-2">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
            )}

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
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2e63a6] focus:border-transparent text-gray-900 font-medium"
                      disabled={loading}
                      autoComplete="username"
                      autoFocus
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
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2e63a6] focus:border-transparent text-gray-900 font-medium"
                      disabled={loading}
                      autoComplete="current-password"
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#2e63a6] transition"
                      disabled={loading}
                  >
                    {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                    ) : (
                        <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Enlace de recuperación */}
              <div className="text-right">
                <Link
                    to="/forgot-password"
                    className="text-sm text-[#2e63a6] hover:text-[#1d4f8a] font-semibold transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón principal */}
              <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#2e63a6] to-[#1d4f8a] text-white text-base font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
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

          <div className="mt-8 text-center">
            <p className="text-white/80 text-sm">
              © {new Date().getFullYear()} CENATE - EsSalud · Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
  );
};

export default Login;

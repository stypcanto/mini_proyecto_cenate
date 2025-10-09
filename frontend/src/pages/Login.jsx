import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/config";
import { Eye, EyeOff, LogIn, User, Lock, ArrowLeft } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId || "");
        localStorage.setItem("username", data.username || "");
        localStorage.setItem("roles", JSON.stringify(data.roles || []));
        localStorage.setItem("permisos", JSON.stringify(data.permisos || []));

        // ✅ Redirección profesional según roles
        const roles = data.roles || [];
        if (roles.includes("SUPERADMIN") || roles.includes("ADMIN")) {
          navigate("/admin");
        } else {
          navigate("/user/dashboard");
        }
      } else {
        setError(data?.message || "Credenciales incorrectas.");
      }
    } catch (err) {
      console.error("❌ Error al iniciar sesión:", err);
      setError(err.message || "Usuario y/o contraseña incorrecta o inexistente.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div
          style={{
            backgroundImage: "url('/images/fondo-portal-web-cenate-2025.png')",
          }}
          className="min-h-screen bg-cover bg-center flex items-center justify-center p-4 relative overflow-hidden"
      >
        {/* Patrón decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                    "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "40px 40px",
              }}
          ></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Botón volver */}
          <Link
              to="/"
              className="inline-flex items-center space-x-2 text-white hover:text-blue-100 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver al inicio</span>
          </Link>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-2xl shadow-2xl">
                <img
                    src="/images/Logo CENATE Azul.png"
                    alt="CENATE"
                    className="h-16 object-contain"
                />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Sistema de Intranet
            </h1>
          </div>

          {/* Formulario */}
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
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                      id="username"
                      type="text"
                      placeholder="Ingresa tu usuario"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2e63a6] focus:border-transparent transition-all text-gray-900 font-medium"
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
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2e63a6] focus:border-transparent transition-all text-gray-900 font-medium"
                      disabled={loading}
                      autoComplete="current-password"
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#2e63a6] transition-colors"
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

              {/* Link contraseña */}
              <div className="text-right">
                <Link
                    to="/forgot-password"
                    className="text-sm text-[#2e63a6] hover:text-[#1d4f8a] font-semibold transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón de Login */}
              <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#2e63a6] to-[#1d4f8a] text-white text-base font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#2e63a6] focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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

            {/* Registro */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">
                ¿No tienes una cuenta?
              </span>
              </div>
            </div>

            <div className="text-center space-y-4">
              <button
                  type="button"
                  onClick={() => navigate("/registro")}
                  className="w-full py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
              >
                Crear una cuenta
              </button>

              <p className="text-sm text-gray-600">
                Al crear una cuenta, aceptas nuestros{" "}
                <a
                    href="#"
                    className="text-[#2e63a6] hover:underline font-semibold"
                >
                  Términos y Condiciones
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-white/80 text-sm">
              © {new Date().getFullYear()} CENATE - EsSalud · Todos los derechos
              reservados
            </p>
          </div>
        </div>
      </div>
  );
};

export default Login;

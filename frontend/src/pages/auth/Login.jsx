// ========================================================================
// 🔐 LOGIN - SISTEMA DE INTRANET CENATE
// ------------------------------------------------------------------------
// Componente de autenticación principal:
//  - Maneja inicio de sesión con recordatorio de usuario
//  - Validación mínima con notificaciones toast
//  - Redirección según roles gestionados por useAuth()
// ========================================================================

import React, { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Eye, EyeOff, LogIn, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const Login = () => {
  const { login, loading } = useAuth();

  const [username, setUsername] = useState(localStorage.getItem("rememberedUser") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberUser, setRememberUser] = useState(!!localStorage.getItem("rememberedUser"));

  // 🧭 Configurar título de pestaña
  useEffect(() => {
    document.title = "Intranet CENATE - Iniciar Sesión";
  }, []);

  // 🧠 Lógica de inicio de sesión
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error("Por favor, ingresa usuario y contraseña.");
      return;
    }

    try {
      await login(username.trim(), password);
      rememberUser
        ? localStorage.setItem("rememberedUser", username.trim())
        : localStorage.removeItem("rememberedUser");
    } catch (err) {
      console.error("❌ Error al iniciar sesión:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-[#001a3a] to-[#002b5c] text-white relative">
      {/* 🔙 Volver al inicio */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center text-sm text-gray-300 hover:text-white transition-all"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Volver al inicio
      </Link>

      {/* 💼 Tarjeta principal de login */}
      <section className="flex flex-col items-center w-full max-w-md p-8 bg-white/95 rounded-2xl shadow-2xl text-gray-800 mx-4">
        <img
          src="/logo512.png"
          alt="Logo CENATE"
          className="w-36 mb-4"
          onError={(e) => (e.target.style.display = "none")}
        />

        <h2 className="text-2xl font-bold text-center text-[#002b5c] mb-1">
          Iniciar Sesión
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Acceso exclusivo para personal autorizado
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Usuario */}
          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="username">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="password">
              Contraseña
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                aria-label="Mostrar u ocultar contraseña"
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Opciones de sesión */}
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                checked={rememberUser}
                onChange={() => setRememberUser(!rememberUser)}
                className="mr-2 accent-blue-600"
              />
              Recordar usuario
            </label>

            <Link
              to="/auth/forgot-password"
              className="text-sm text-blue-700 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Botón de login */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg flex justify-center items-center gap-2 transition-all mt-2 ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-800 text-white"
            }`}
          >
            <LogIn size={18} />
            {loading ? "Verificando..." : "Iniciar sesión"}
          </button>
        </form>

        {/* Enlace de registro */}
        <p className="text-sm text-gray-600 mt-5 text-center">
          ¿No tienes una cuenta?{" "}
          <Link
            to="/auth/register"
            className="text-blue-700 font-medium hover:underline"
          >
            Crear una nueva
          </Link>
        </p>
      </section>

      {/* 🏥 Footer institucional */}
      <footer className="absolute bottom-6 flex items-center justify-center gap-8 opacity-80">
        <img
          src="/logo512.png"
          alt="Logo CENATE"
          className="w-28"
          onError={(e) => (e.target.style.display = "none")}
        />
        <img
          src="/logo192.png"
          alt="Logo EsSalud"
          className="w-24"
          onError={(e) => (e.target.style.display = "none")}
        />
      </footer>
    </div>
  );
};

export default Login;
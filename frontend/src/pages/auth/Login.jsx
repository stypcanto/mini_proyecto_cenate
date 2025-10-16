import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Eye, EyeOff, LogIn, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import cenateLogo from "@/assets/cenate-logo.svg";
import essaludLogo from "@/assets/essalud-logo.svg";

const Login = () => {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState(localStorage.getItem("rememberedUser") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberUser, setRememberUser] = useState(!!localStorage.getItem("rememberedUser"));

  useEffect(() => {
    document.title = "Intranet CENATE - Iniciar Sesión";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Por favor, ingresa usuario y contraseña.");
      return;
    }
    try {
      await login(username, password);
      if (rememberUser) {
        localStorage.setItem("rememberedUser", username);
      } else {
        localStorage.removeItem("rememberedUser");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-[#001a3a] to-[#002b5c] text-white relative">
      {/* Volver */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center text-sm text-gray-300 hover:text-white transition-all"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Volver al inicio
      </Link>

      <div className="flex flex-col items-center w-full max-w-md p-8 bg-white/95 rounded-2xl shadow-2xl text-gray-800 mx-4">
        <img src={cenateLogo} alt="CENATE" className="w-36 mb-4" />
        <h2 className="text-2xl font-bold text-center text-[#002b5c] mb-1">
          Iniciar Sesión
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Acceso exclusivo para personal autorizado
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Usuario</label>
            <input
              type="text"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Contraseña</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-blue-500"
              />
              <span
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg flex justify-center items-center gap-2 transition-all mt-2"
          >
            <LogIn size={18} />
            {loading ? "Verificando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-5 text-center">
          ¿No tienes una cuenta?{" "}
          <Link to="/auth/register" className="text-blue-700 font-medium hover:underline">
            Crear una nueva
          </Link>
        </p>
      </div>

      <div className="absolute bottom-6 flex items-center justify-center gap-8 opacity-80">
        <img src={cenateLogo} alt="CENATE" className="w-28" />
        <img src={essaludLogo} alt="EsSalud" className="w-24" />
      </div>
    </div>
  );
};

export default Login;
// ========================================================================
// CambiarContrasena.js - Pagina para establecer nueva contrasena con token
// ========================================================================

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Home,
  LogIn,
} from "lucide-react";
import { apiClient } from "../../lib/apiClient";

export default function CambiarContrasena() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  // Estados
  const [validando, setValidando] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [errorToken, setErrorToken] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState("");

  // Calcular nivel de seguridad de la contraseña
  const calcularNivelSeguridad = (pwd) => {
    if (!pwd) return { nivel: 0, texto: "", color: "bg-gray-200" };

    let puntos = 0;

    // Longitud
    if (pwd.length >= 8) puntos += 1;
    if (pwd.length >= 12) puntos += 1;

    // Mayúsculas
    if (/[A-Z]/.test(pwd)) puntos += 1;

    // Minúsculas
    if (/[a-z]/.test(pwd)) puntos += 1;

    // Números
    if (/[0-9]/.test(pwd)) puntos += 1;

    // Caracteres especiales
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) puntos += 1;

    if (puntos <= 2) return { nivel: 1, texto: "Débil", color: "bg-red-500" };
    if (puntos <= 3) return { nivel: 2, texto: "Regular", color: "bg-orange-500" };
    if (puntos <= 4) return { nivel: 3, texto: "Buena", color: "bg-yellow-500" };
    if (puntos <= 5) return { nivel: 4, texto: "Fuerte", color: "bg-lime-500" };
    return { nivel: 5, texto: "Muy fuerte", color: "bg-green-500" };
  };

  const seguridadPassword = calcularNivelSeguridad(password);

  // Validar token al cargar
  useEffect(() => {
    if (!token) {
      setValidando(false);
      setErrorToken("No se proporcionó un token de acceso.");
      return;
    }

    const validarToken = async () => {
      try {
        const response = await apiClient.get(
          `/auth/password/validar-token?token=${token}`
        );
        if (response.valido) {
          setTokenValido(true);
          setUsuario(response.usuario || "");
        } else {
          setErrorToken(response.mensaje || "Token inválido");
        }
      } catch (err) {
        setErrorToken(err.message || "Error al validar el token");
      } finally {
        setValidando(false);
      }
    };

    validarToken();
  }, [token]);

  // Validar formulario
  const validarFormulario = () => {
    if (password.length < 8) {
      setError("La contrasena debe tener al menos 8 caracteres");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden");
      return false;
    }
    return true;
  };

  // Enviar nueva contrasena
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const response = await apiClient.post("/auth/password/cambiar", {
        token,
        nuevaContrasena: password,
        confirmarContrasena: confirmPassword,
      });

      if (response.exitoso) {
        setExito(true);
      } else {
        setError(response.mensaje || "Error al cambiar la contrasena");
      }
    } catch (err) {
      setError(err.message || "Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de carga
  if (validando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Validando enlace...</p>
        </div>
      </div>
    );
  }

  // Token invalido
  if (!tokenValido) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Enlace no valido
          </h1>
          <p className="text-gray-600 mb-6">{errorToken}</p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              <LogIn size={18} />
              Ir al inicio de sesion
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
            >
              <Home size={18} />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Exito al cambiar contrasena
  if (exito) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Contrasena actualizada
          </h1>
          <p className="text-gray-600 mb-6">
            Tu contrasena ha sido configurada exitosamente. Ya puedes iniciar
            sesion con tu nueva contrasena.
          </p>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            <LogIn size={18} />
            Iniciar sesion
          </Link>
        </div>
      </div>
    );
  }

  // Formulario de cambio de contrasena
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Configura tu contrasena
          </h1>
          <p className="text-gray-600 mt-2">
            Establece una nueva contrasena para tu cuenta
          </p>
          {usuario && (
            <div className="mt-3 px-4 py-2 bg-gray-100 rounded-lg inline-block">
              <span className="text-sm text-gray-500">Usuario: </span>
              <span className="font-semibold text-gray-700">{usuario}</span>
            </div>
          )}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nueva contrasena */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contrasena
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Minimo 8 caracteres"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Indicador de nivel de seguridad */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Nivel de seguridad</span>
                  <span className={`text-xs font-medium ${
                    seguridadPassword.nivel <= 1 ? "text-red-600" :
                    seguridadPassword.nivel === 2 ? "text-orange-600" :
                    seguridadPassword.nivel === 3 ? "text-yellow-600" :
                    seguridadPassword.nivel === 4 ? "text-lime-600" :
                    "text-green-600"
                  }`}>
                    {seguridadPassword.texto}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((nivel) => (
                    <div
                      key={nivel}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        nivel <= seguridadPassword.nivel
                          ? seguridadPassword.color
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>

                {/* Lista de criterios */}
                <div className="mt-3 space-y-1">
                  <div className={`flex items-center gap-2 text-xs ${password.length >= 8 ? "text-green-600" : "text-gray-400"}`}>
                    <CheckCircle2 size={14} className={password.length >= 8 ? "text-green-500" : "text-gray-300"} />
                    Mínimo 8 caracteres
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${/[A-Z]/.test(password) ? "text-green-600" : "text-gray-400"}`}>
                    <CheckCircle2 size={14} className={/[A-Z]/.test(password) ? "text-green-500" : "text-gray-300"} />
                    Una letra mayúscula
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${/[a-z]/.test(password) ? "text-green-600" : "text-gray-400"}`}>
                    <CheckCircle2 size={14} className={/[a-z]/.test(password) ? "text-green-500" : "text-gray-300"} />
                    Una letra minúscula
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${/[0-9]/.test(password) ? "text-green-600" : "text-gray-400"}`}>
                    <CheckCircle2 size={14} className={/[0-9]/.test(password) ? "text-green-500" : "text-gray-300"} />
                    Un número
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-600" : "text-gray-400"}`}>
                    <CheckCircle2 size={14} className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-500" : "text-gray-300"} />
                    Un carácter especial (!@#$%...)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirmar contrasena */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contrasena
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Repite tu contrasena"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Requisitos de contrasena (COMENTADO - ahora se usa el indicador visual de seguridad)
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">La contrasena debe tener:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Minimo 8 caracteres</li>
              <li>Se recomienda incluir mayusculas, minusculas y numeros</li>
            </ul>
          </div>
          */}

          {/* Boton enviar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Guardar contrasena
              </>
            )}
          </button>
        </form>

        {/* Link al login */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Volver al inicio de sesion
          </Link>
        </div>
      </div>
    </div>
  );
}

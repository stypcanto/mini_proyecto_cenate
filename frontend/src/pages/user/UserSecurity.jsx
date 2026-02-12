// ========================================================================
// 🛡️ UserSecurity.jsx – Centro de Seguridad del Usuario (CENATE 2025)
// ------------------------------------------------------------------------
// Estilo Microsoft Security Center con consejos profesionales
// + Logout automático después de cambiar contraseña
// ========================================================================

import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from '../../lib/apiClient';
import toast from "react-hot-toast";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ChevronLeft,
  AlertTriangle,
  Info,
  Key,
  Shield,
  Lock,
  UserCheck,
  User,
  Clock,
  Lightbulb,
  LogOut
} from "lucide-react";

export default function UserSecurity() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [validation, setValidation] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    symbol: false,
    match: false,
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // ============================================================
  // ⏱️ Contador regresivo para logout automático
  // ============================================================
  useEffect(() => {
    if (showLogoutModal && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showLogoutModal && countdown === 0) {
      handleLogout();
    }
  }, [showLogoutModal, countdown]);

  // ============================================================
  // 🚪 Función de cierre de sesión
  // ============================================================
  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada por seguridad");
    navigate("/auth/login", { replace: true });
  };

  // ============================================================
  // 🎯 Calcular fortaleza de contraseña
  // ============================================================
  const passwordStrength = useMemo(() => {
    const { length, upper, lower, number, symbol } = validation;
    const score = [length, upper, lower, number, symbol].filter(Boolean).length;
    
    if (score === 0) return { level: 0, label: "", color: "" };
    if (score <= 2) return { level: 1, label: "Débil", color: "bg-red-500" };
    if (score === 3) return { level: 2, label: "Regular", color: "bg-yellow-500" };
    if (score === 4) return { level: 3, label: "Buena", color: "bg-blue-500" };
    return { level: 4, label: "Muy fuerte", color: "bg-green-500" };
  }, [validation]);

  // ============================================================
  // 🧩 Validación de contraseña
  // ============================================================
  const validatePassword = (newPass, confirmPass) => {
    const rules = {
      length: newPass.length >= 8,
      upper: /[A-Z]/.test(newPass),
      lower: /[a-z]/.test(newPass),
      number: /\d/.test(newPass),
      symbol: /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(newPass),
      match: newPass && confirmPass && newPass === confirmPass,
    };
    setValidation(rules);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "newPassword" || name === "confirmPassword") {
      validatePassword(
        name === "newPassword" ? value : form.newPassword,
        name === "confirmPassword" ? value : form.confirmPassword
      );
    }
  };

  const toggleShow = (field) => setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  // ============================================================
  // 🔐 Enviar solicitud de cambio de contraseña
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!Object.values(validation).every(Boolean)) {
      toast.error("La nueva contraseña no cumple con los requisitos de seguridad.");
      return;
    }

    try {
      await apiClient.put(
        "/auth/change-password",
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        },
        true
      );

      toast.success("✅ Contraseña actualizada correctamente");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setValidation({ length: false, upper: false, lower: false, number: false, symbol: false, match: false });
      
      // 🚨 Mostrar modal de logout
      setShowLogoutModal(true);
    } catch (err) {
      console.error("❌ Error al cambiar contraseña:", err);
      toast.error("No se pudo cambiar la contraseña. Verifica tus datos.");
    }
  };

  // ============================================================
  // 💎 Render principal
  // ============================================================
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-4 md:py-8 px-3 md:px-4">
        <div className="w-full space-y-4 md:space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Centro de Seguridad
                  </h1>
                  <p className="text-sm md:text-base text-gray-600">
                    Gestiona tu contraseña, sesiones y configuraciones de seguridad del sistema CENATE
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/user/dashboard")}
              className="flex items-center justify-center gap-2 bg-[#0A5BA9] hover:bg-[#084b8a] text-white px-4 md:px-6 py-2 md:py-3 rounded-xl transition-all shadow-md hover:shadow-lg font-medium text-sm md:text-base w-full md:w-auto"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              Volver al Panel
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Columna principal - Cambio de contraseña */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Formulario de cambio de contraseña */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-200 p-4 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <LockKeyhole className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Cambio de Contraseña</h2>
                    <p className="text-xs md:text-sm text-gray-600">Actualiza tu contraseña para mantener tu cuenta segura</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Contraseña actual */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña actual
                    </label>
                    <div className="relative">
                      <input
                        type={show.current ? "text" : "password"}
                        name="currentPassword"
                        value={form.currentPassword}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                        placeholder="Ingresa tu contraseña actual"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => toggleShow("current")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        {show.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Nueva contraseña */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={show.new ? "text" : "password"}
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                        placeholder="Crea una contraseña segura"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => toggleShow("new")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        {show.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Indicador de fortaleza */}
                    {form.newPassword && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs md:text-sm text-gray-600">Fortaleza:</span>
                          <span className={`text-xs md:text-sm font-semibold ${
                            passwordStrength.level === 1 ? "text-red-600" :
                            passwordStrength.level === 2 ? "text-yellow-600" :
                            passwordStrength.level === 3 ? "text-blue-600" :
                            "text-green-600"
                          }`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-full flex-1 transition-all duration-300 ${
                                level <= passwordStrength.level ? passwordStrength.color : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirmar contraseña */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={show.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                        placeholder="Repite la nueva contraseña"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => toggleShow("confirm")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        {show.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Requisitos */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Requisitos de la nueva contraseña:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { key: "length", label: "Al menos 8 caracteres" },
                        { key: "upper", label: "Una letra mayúscula" },
                        { key: "lower", label: "Una letra minúscula" },
                        { key: "number", label: "Un número" },
                        { key: "symbol", label: "Un símbolo especial" },
                        { key: "match", label: "Coincide con la confirmación" },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-2">
                          {validation[key] ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                          )}
                          <span className={`text-xs md:text-sm ${validation[key] ? "text-green-700 font-medium" : "text-gray-600"}`}>
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#0A5BA9] hover:bg-[#084b8a] text-white font-semibold py-3 md:py-4 rounded-xl transition-all shadow-md hover:shadow-lg text-sm md:text-base"
                  >
                    Guardar nueva contraseña
                  </button>
                </form>
              </div>

              {/* Alerta de seguridad */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-xl p-4 md:p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">
                      ¿Detectaste actividad sospechosa?
                    </h3>
                    <p className="text-xs md:text-sm text-gray-700">
                      Si no recuerdas haber cambiado tu contraseña o detectas actividad inusual en tu cuenta, 
                      contacta inmediatamente al <strong>Área de Gestión TI CENATE</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna lateral - Consejos y recomendaciones */}
            <div className="space-y-4 md:space-y-6">
              {/* Información del usuario */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">Tu Cuenta</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{user?.username}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span>Estado: Activa</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Última sesión: Hoy</span>
                  </div>
                </div>
              </div>

              {/* Consejos profesionales */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl md:rounded-2xl border border-blue-200 p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">Consejos de Seguridad</h3>
                </div>
                <div className="space-y-3 text-xs md:text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <Key className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Usa contraseñas únicas</p>
                      <p className="text-gray-600 mt-0.5">No reutilices contraseñas entre diferentes servicios</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Cámbiala periódicamente</p>
                      <p className="text-gray-600 mt-0.5">Actualiza tu contraseña cada 3-6 meses</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Evita información personal</p>
                      <p className="text-gray-600 mt-0.5">No uses fechas de nacimiento, nombres o datos obvios</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">No la compartas</p>
                      <p className="text-gray-600 mt-0.5">Tu contraseña es personal e intransferible</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips adicionales */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6">
                <h3 className="font-bold text-gray-900 mb-3 text-sm md:text-base">💡 Recomendaciones</h3>
                <ul className="space-y-2 text-xs md:text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Combina letras mayúsculas, minúsculas, números y símbolos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Usa frases fáciles de recordar pero difíciles de adivinar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Considera usar un gestor de contraseñas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Nunca compartas tu contraseña por correo o chat</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 🚨 MODAL DE CIERRE DE SESIÓN AUTOMÁTICO */}
      {/* ========================================== */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in-up">
            {/* Icono */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <LogOut className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            {/* Contenido */}
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Contraseña Actualizada
              </h2>
              <p className="text-gray-600">
                Por seguridad, estamos cerrando tu sesión.
                <br />
                Vuelve a conectarte con tu nueva contraseña.
              </p>

              {/* Contador regresivo */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                <p className="text-sm text-gray-700 mb-2">Cerrando sesión en:</p>
                <div className="text-4xl font-bold text-blue-600">
                  {countdown}
                </div>
              </div>

              {/* Botón de cerrar ahora */}
              <button
                onClick={handleLogout}
                className="w-full bg-[#0A5BA9] hover:bg-[#084b8a] text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg mt-6"
              >
                Cerrar sesión ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

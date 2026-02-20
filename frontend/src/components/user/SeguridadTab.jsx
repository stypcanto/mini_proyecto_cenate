// ========================================================================
// 🔐 SeguridadTab.jsx – Pestaña de seguridad y cambio de contraseña
// ========================================================================

import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import apiClient from '../../lib/apiClient';
import toast from "react-hot-toast";

/**
 * 🔐 Pestaña de seguridad
 * Permite cambiar contraseña y ver actividad reciente
 */
export default function SeguridadTab({ user }) {
  // Estado para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 📝 Validaciones de contraseña
  const passwordRequirements = {
    length: passwordData.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(passwordData.newPassword),
    lowercase: /[a-z]/.test(passwordData.newPassword),
    number: /[0-9]/.test(passwordData.newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword),
  };

  const passwordsMatch =
    passwordData.newPassword === passwordData.confirmPassword;
  const isPasswordValid = Object.values(passwordRequirements).every(
    (v) => v === true
  );
  const canSubmit =
    passwordData.oldPassword &&
    passwordData.newPassword &&
    passwordData.confirmPassword &&
    isPasswordValid &&
    passwordsMatch;

  // 📊 Calcular fortaleza de contraseña
  const strengthScore = Object.values(passwordRequirements).filter(
    (v) => v === true
  ).length;

  const getStrengthColor = () => {
    if (strengthScore <= 2) return "bg-red-500";
    if (strengthScore <= 3) return "bg-amber-500";
    if (strengthScore <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (strengthScore <= 2) return "Débil";
    if (strengthScore <= 3) return "Medio";
    if (strengthScore <= 4) return "Fuerte";
    return "Muy fuerte";
  };

  // 🔄 Manejar cambio de contraseña
  const handleChangePassword = async () => {
    // Validaciones
    const newErrors = {};

    if (!passwordData.oldPassword.trim()) {
      newErrors.oldPassword = "La contraseña actual es requerida";
    }

    if (!isPasswordValid) {
      newErrors.newPassword =
        "La nueva contraseña no cumple con los requisitos";
    }

    if (!passwordsMatch) {
      newErrors.confirmPassword =
        "Las contraseñas no coinciden";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await apiClient.put(
        "/usuarios/change-password",
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        true
      );

      // Limpiar formulario
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});

      toast.success("Contraseña actualizada correctamente");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Error al cambiar la contraseña";
      toast.error(errorMsg);
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // 📅 Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "Nunca";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* 🔐 Sección Cambiar Contraseña */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a5ba9]/8 to-[#073b6c]/5 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0a5ba9]/10 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#0a5ba9]" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Cambiar Contraseña
              </h3>
              <p className="text-xs text-slate-500">
                Actualiza tu contraseña para mantener tu cuenta segura
              </p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-5">
          {/* Contraseña Actual */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                type={showPasswords.old ? "text" : "password"}
                value={passwordData.oldPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    oldPassword: e.target.value,
                  })
                }
                className={`w-full px-4 py-2.5 border-2 rounded-lg transition-all ${
                  errors.oldPassword
                    ? "border-red-500 bg-red-50"
                    : "border-slate-200 focus:border-[#0a5ba9] focus:ring-1 focus:ring-[#0a5ba9]/30"
                }`}
                placeholder="Ingresa tu contraseña actual"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({ ...showPasswords, old: !showPasswords.old })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showPasswords.old ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.oldPassword && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.oldPassword}
              </p>
            )}
          </div>

          {/* Nueva Contraseña */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-[#0a5ba9] focus:ring-1 focus:ring-[#0a5ba9]/30 transition-all"
                placeholder="Crea una contraseña fuerte"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showPasswords.new ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Indicador de fortaleza */}
            {passwordData.newPassword && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-600">
                    Fortaleza de contraseña
                  </span>
                  <span className={`text-xs font-semibold ${
                    strengthScore <= 2
                      ? "text-red-600"
                      : strengthScore <= 3
                      ? "text-amber-600"
                      : strengthScore <= 4
                      ? "text-[#0a5ba9]"
                      : "text-green-600"
                  }`}>
                    {getStrengthLabel()}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${getStrengthColor()} h-full transition-all`}
                    style={{
                      width: `${(strengthScore / 5) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Requisitos */}
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-slate-600">
                Requisitos de contraseña:
              </p>
              <div className="space-y-1">
                <PasswordRequirement
                  met={passwordRequirements.length}
                  text="Mínimo 8 caracteres"
                />
                <PasswordRequirement
                  met={passwordRequirements.uppercase}
                  text="Una letra mayúscula (A-Z)"
                />
                <PasswordRequirement
                  met={passwordRequirements.lowercase}
                  text="Una letra minúscula (a-z)"
                />
                <PasswordRequirement
                  met={passwordRequirements.number}
                  text="Un número (0-9)"
                />
                <PasswordRequirement
                  met={passwordRequirements.special}
                  text="Un carácter especial (!@#$%^&*...)"
                />
              </div>
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className={`w-full px-4 py-2.5 border-2 rounded-lg transition-all ${
                  errors.confirmPassword
                    ? "border-red-500 bg-red-50"
                    : passwordData.confirmPassword &&
                      !passwordsMatch
                    ? "border-amber-500 bg-amber-50"
                    : "border-slate-200 focus:border-[#0a5ba9] focus:ring-1 focus:ring-[#0a5ba9]/30"
                }`}
                placeholder="Confirma tu nueva contraseña"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({
                    ...showPasswords,
                    confirm: !showPasswords.confirm,
                  })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.confirmPassword}
              </p>
            )}
            {passwordData.confirmPassword && !passwordsMatch && (
              <p className="text-amber-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Las contraseñas no coinciden
              </p>
            )}
          </div>

          {/* Error general */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Botón cambiar */}
          <button
            onClick={handleChangePassword}
            disabled={!canSubmit || loading}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-all shadow-sm ${
              canSubmit && !loading
                ? "bg-gradient-to-r from-[#0a5ba9] to-[#073b6c] hover:from-[#0d4e90] hover:to-[#0a5ba9] text-white cursor-pointer shadow-[#0a5ba9]/30 hover:shadow-md"
                : "bg-slate-200 text-slate-500 cursor-not-allowed"
            }`}
          >
            {loading ? "Actualizando..." : "Cambiar Contraseña"}
          </button>
        </div>
      </div>

    </div>
  );
}

// ============================================================
// 🔧 Componente: Elemento de actividad
// ============================================================
function ActivityItem({ icon, title, value, color }) {
  const colorClasses = {
    blue: "bg-[#0a5ba9]/5 border-[#0a5ba9]/20",
    green: "bg-green-50 border-green-200",
    amber: "bg-amber-50 border-amber-200",
  };

  const iconColorClasses = {
    blue: "text-[#0a5ba9]",
    green: "text-green-600",
    amber: "text-amber-600",
  };

  return (
    <div
      className={`${colorClasses[color]} border rounded-lg p-4 flex items-start gap-3`}
    >
      <div className={`${iconColorClasses[color]} mt-0.5`}>{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-600 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ============================================================
// 🔧 Componente: Requisito de contraseña
// ============================================================
function PasswordRequirement({ met, text }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
          met ? "bg-green-100" : "bg-slate-200"
        }`}
      >
        {met && <CheckCircle2 className="w-3 h-3 text-green-600" />}
      </div>
      <span
        className={`text-xs ${
          met
            ? "text-green-700"
            : "text-slate-500"
        }`}
      >
        {text}
      </span>
    </div>
  );
}

// ============================================================
// 🔧 Utilidad: Obtener información del navegador
// ============================================================
function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browserName = "Navegador desconocido";
  let version = "Versión desconocida";

  if (ua.indexOf("Firefox") > -1) {
    browserName = "Firefox";
    const versionMatch = ua.match(/Firefox\/(\d+)/);
    if (versionMatch) version = versionMatch[1];
  } else if (ua.indexOf("Chrome") > -1 && ua.indexOf("Chromium") === -1) {
    browserName = "Chrome";
    const versionMatch = ua.match(/Chrome\/(\d+)/);
    if (versionMatch) version = versionMatch[1];
  } else if (ua.indexOf("Safari") > -1) {
    browserName = "Safari";
    const versionMatch = ua.match(/Version\/(\d+)/);
    if (versionMatch) version = versionMatch[1];
  } else if (ua.indexOf("Edg") > -1) {
    browserName = "Edge";
    const versionMatch = ua.match(/Edg\/(\d+)/);
    if (versionMatch) version = versionMatch[1];
  }

  return `${browserName} ${version}`;
}

// ========================================================================
// 🔐 PrimerAccesoModal.jsx – Configuración obligatoria de cuenta
// ------------------------------------------------------------------------
// Modal que se muestra cuando un usuario inicia sesión por primera vez
// o después de que un admin resetea su contraseña.
// ========================================================================

import React, { useState } from "react";
import { 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Lock,
  Info
} from "lucide-react";
import { apiClient } from "../../lib/apiClient";

export default function PrimerAccesoModal({ username, onCompleted }) {
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    passwordActual: "",
    passwordNueva: "",
    passwordConfirmacion: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("info");

  // ============================================================
  // 🔐 Validación de contraseña fuerte
  // ============================================================
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("Mínimo 8 caracteres");
    if (!/[A-Z]/.test(password)) errors.push("Una mayúscula");
    if (!/[a-z]/.test(password)) errors.push("Una minúscula");
    if (!/\d/.test(password)) errors.push("Un número");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("Un símbolo");
    return errors;
  };

  const passwordStrength = (password) => {
    const errors = validatePassword(password);
    if (errors.length === 0) return { level: "strong", color: "green", text: "Fuerte" };
    if (errors.length <= 2) return { level: "medium", color: "yellow", text: "Media" };
    return { level: "weak", color: "red", text: "Débil" };
  };

  // ============================================================
  // 📝 Validación del paso 1 (Contraseña)
  // ============================================================
  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.passwordActual.trim()) {
      newErrors.passwordActual = "Ingrese la contraseña temporal";
    }

    if (!formData.passwordNueva.trim()) {
      newErrors.passwordNueva = "Ingrese una nueva contraseña";
    } else {
      const passwordErrors = validatePassword(formData.passwordNueva);
      if (passwordErrors.length > 0) {
        newErrors.passwordNueva = `Falta: ${passwordErrors.join(", ")}`;
      }
    }

    if (!formData.passwordConfirmacion.trim()) {
      newErrors.passwordConfirmacion = "Confirme la nueva contraseña";
    } else if (formData.passwordNueva !== formData.passwordConfirmacion) {
      newErrors.passwordConfirmacion = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  // ============================================================
  // 🚀 Enviar formulario - Solo cambio de contraseña
  // ============================================================
  const handleSubmit = async () => {
    if (!validateStep1()) return;

    try {
      setLoading(true);
      setMessage("🔄 Cambiando tu contraseña...");
      setMessageType("info");

      // Usar el endpoint de cambio de contraseña
      const response = await apiClient.put(
        "/auth/change-password",
        {
          currentPassword: formData.passwordActual,
          newPassword: formData.passwordNueva,
          confirmPassword: formData.passwordConfirmacion,
        },
        true // Requiere autenticación
      );

      setMessageType("success");
      setMessage("✅ Contraseña cambiada exitosamente");

      // Esperar 2 segundos y llamar al callback para redirigir
      setTimeout(() => {
        onCompleted();
      }, 2000);

    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      setMessageType("error");
      setMessage(error.message || error.error || "❌ Error al cambiar la contraseña");
      setLoading(false);
    }
  };

  // ============================================================
  // 🎨 Render principal
  // ============================================================
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a5ba9] to-[#0d6ecc] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h2 className="text-xl font-bold">Configuración de Cuenta</h2>
              <p className="text-blue-100 text-sm">
                Cambiar Contraseña
              </p>
            </div>
          </div>
        </div>

        {/* Mensaje de alerta */}
        <div className="px-6 pt-5">
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">
                Configuración obligatoria
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Por seguridad, debes cambiar tu contraseña temporal antes de continuar.
              </p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4 mt-5">
              <div className="flex items-center gap-2 mb-4">
                <KeyRound className="w-5 h-5 text-[#0a5ba9]" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Cambiar Contraseña
                </h3>
              </div>

              {/* Contraseña actual */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña Actual <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={formData.passwordActual}
                    onChange={(e) => setFormData({ ...formData, passwordActual: e.target.value })}
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-[#0a5ba9]/20 focus:border-[#0a5ba9] ${
                      errors.passwordActual ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Ingresa tu contraseña temporal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0a5ba9]"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.passwordActual && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.passwordActual}
                  </p>
                )}
              </div>

              {/* Nueva contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={formData.passwordNueva}
                    onChange={(e) => setFormData({ ...formData, passwordNueva: e.target.value })}
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-[#0a5ba9]/20 focus:border-[#0a5ba9] ${
                      errors.passwordNueva ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0a5ba9]"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Indicador de fortaleza */}
                {formData.passwordNueva && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            passwordStrength(formData.passwordNueva).level === "strong" ? "bg-green-500 w-full" :
                            passwordStrength(formData.passwordNueva).level === "medium" ? "bg-yellow-500 w-2/3" :
                            "bg-red-500 w-1/3"
                          }`}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${
                        passwordStrength(formData.passwordNueva).level === "strong" ? "text-green-600" :
                        passwordStrength(formData.passwordNueva).level === "medium" ? "text-yellow-600" :
                        "text-red-600"
                      }`}>
                        {passwordStrength(formData.passwordNueva).text}
                      </span>
                    </div>
                  </div>
                )}

                {errors.passwordNueva && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.passwordNueva}
                  </p>
                )}

                {/* Requisitos */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-2">La contraseña debe contener:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center gap-1 ${formData.passwordNueva.length >= 8 ? "text-green-600" : "text-gray-500"}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      Mínimo 8 caracteres
                    </div>
                    <div className={`flex items-center gap-1 ${/[A-Z]/.test(formData.passwordNueva) ? "text-green-600" : "text-gray-500"}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      Una mayúscula
                    </div>
                    <div className={`flex items-center gap-1 ${/[a-z]/.test(formData.passwordNueva) ? "text-green-600" : "text-gray-500"}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      Una minúscula
                    </div>
                    <div className={`flex items-center gap-1 ${/\d/.test(formData.passwordNueva) ? "text-green-600" : "text-gray-500"}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      Un número
                    </div>
                    <div className={`flex items-center gap-1 ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.passwordNueva) ? "text-green-600" : "text-gray-500"}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      Un símbolo (!@#...)
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nueva Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={formData.passwordConfirmacion}
                    onChange={(e) => setFormData({ ...formData, passwordConfirmacion: e.target.value })}
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-[#0a5ba9]/20 focus:border-[#0a5ba9] ${
                      errors.passwordConfirmacion ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Repite la nueva contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0a5ba9]"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.passwordConfirmacion && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.passwordConfirmacion}
                  </p>
                )}
              </div>
          </div>

          {/* Mensaje de estado */}
          {message && (
            <div className={`mt-4 p-4 rounded-xl border-2 flex items-center gap-3 ${
              messageType === "success" ? "bg-green-50 border-green-300 text-green-700" :
              messageType === "error" ? "bg-red-50 border-red-300 text-red-700" :
              "bg-blue-50 border-blue-300 text-blue-700"
            }`}>
              {messageType === "success" ? <CheckCircle2 className="w-5 h-5" /> :
               messageType === "error" ? <AlertCircle className="w-5 h-5" /> :
               <Info className="w-5 h-5" />}
              <span className="text-sm font-medium">{message}</span>
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
          <p className="text-xs text-gray-500">
            <span className="text-red-500">*</span> Campos obligatorios
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-[#0a5ba9] hover:bg-[#094580] text-white rounded-xl font-medium transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Cambiar Contraseña
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

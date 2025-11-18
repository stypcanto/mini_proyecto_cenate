// ========================================================================
// 🔐 PasswordForm.jsx – Cambio de contraseña (CENATE 2025)
// API: PUT /api/auth/change-password  (auth=true)
// ========================================================================

import React, { useState } from "react";
import { apiClient } from "../../../lib/apiClient";
import toast from "react-hot-toast";

export default function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]       = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Completa todos los campos");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas nuevas no coinciden");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    try {
      setLoading(true);
      await apiClient.put(
        "/auth/change-password",
        { currentPassword, newPassword, confirmPassword },
        true // ← enviar Authorization: Bearer
      );
      toast.success("✅ Contraseña actualizada correctamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field
        label="Contraseña actual"
        value={currentPassword}
        onChange={setCurrentPassword}
      />
      <Field
        label="Nueva contraseña"
        value={newPassword}
        onChange={setNewPassword}
      />
      <Field
        label="Repetir nueva contraseña"
        value={confirmPassword}
        onChange={setConfirmPassword}
      />
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition-all duration-200 ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-[var(--color-primary)] hover:opacity-90"
        }`}
      >
        {loading ? "Actualizando..." : "Cambiar Contraseña"}
      </button>
    </form>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-[var(--text-secondary)] mb-1">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[var(--border-color)] rounded-lg p-2 bg-[var(--bg-input)]
                   focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        placeholder="********"
      />
    </div>
  );
}
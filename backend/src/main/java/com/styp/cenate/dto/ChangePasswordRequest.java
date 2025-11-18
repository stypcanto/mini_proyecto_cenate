package com.styp.cenate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 🔐 DTO: Solicitud de cambio de contraseña.
 *
 * Se utiliza en:
 *  - AuthController.changePassword()
 *
 * Valida que los campos requeridos estén presentes y que la nueva
 * contraseña cumpla la longitud mínima recomendada.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {

    // ============================================================
    // 🔑 CONTRASEÑA ACTUAL
    // ============================================================
    @NotBlank(message = "La contraseña actual es requerida")
    private String currentPassword;

    // ============================================================
    // 🆕 NUEVA CONTRASEÑA
    // ============================================================
    @NotBlank(message = "La nueva contraseña es requerida")
    @Size(min = 8, message = "La nueva contraseña debe tener al menos 8 caracteres")
    private String newPassword;

    // ============================================================
    // 🔁 CONFIRMACIÓN DE CONTRASEÑA
    // ============================================================
    @NotBlank(message = "La confirmación de contraseña es requerida")
    private String confirmPassword;

    // ============================================================
    // 🧠 VALIDACIÓN LÓGICA (opcional, para uso manual si se necesita)
    // ============================================================
    public boolean isMatchingPasswords() {
        return newPassword != null && newPassword.equals(confirmPassword);
    }
}
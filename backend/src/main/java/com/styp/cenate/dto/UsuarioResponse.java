// ============================================================================
// 🧩 UsuarioResponse.java – DTO de respuesta de usuario (CENATE 2025)
// ----------------------------------------------------------------------------
// Representa la respuesta completa de un usuario autenticado o consultado
// en el sistema MBAC CENATE, incluyendo datos personales, roles y permisos.
// ============================================================================

package com.styp.cenate.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class UsuarioResponse {

    // ============================================================
    // 🧩 Datos de la cuenta (dim_usuarios)
    // ============================================================
    private Long idUser;
    private String username;
    private String estado;
    private boolean activo;
    private boolean locked;

    private Integer failedAttempts;
    private LocalDateTime lockedUntil;

    private LocalDateTime lastLoginAt;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;

    private Set<String> roles;
    private Set<String> permisos;

    // ============================================================
    // 👤 Datos personales (dim_personal_cnt)
    // ============================================================
    private Long idPersonal;
    private String nombreCompleto;
    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String numeroDocumento;
    private String tipoDocumento;
    private LocalDate fechaNacimiento;
    private String genero;
    private String correoPersonal;
    private String correoCorporativo;
    private String telefono;
    private String direccion;
    private String fotoUrl; // 📸 URL o base64 de la foto

    // ============================================================
    // 🧑‍⚕️ Datos profesionales
    // ============================================================
    private String profesionPrincipal;
    private List<String> profesiones; // Varias profesiones (si existen)
    private String colegiatura;
    private String regimenLaboral;
    private String areaTrabajo;
    private List<String> ordenesCompra;     // OC vinculadas al personal
    private List<String> firmasDigitales;   // Firmas registradas (ej. jpg o PDF)

    // ============================================================
    // 💬 Campo informativo opcional
    // ============================================================
    private String message;
}
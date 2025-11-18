// ============================================================================
// 🧩 UsuarioResponse.java – DTO de respuesta de usuario (CENATE 2025)
// ----------------------------------------------------------------------------
// Representa la respuesta completa de un usuario autenticado o consultado
// en el sistema MBAC CENATE, incluyendo datos personales, roles y permisos.
// ============================================================================

package com.styp.cenate.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("id_user")
    private Long idUser;
    private String username;
    private String estado;
    private boolean activo;
    @JsonProperty("estado_usuario") // ✅ Serializar como snake_case para el frontend
    private String estadoUsuario; // 🔄 "ACTIVO" o "INACTIVO" (para frontend)
    private boolean locked;
    @JsonProperty("requiere_cambio_password")
    private Boolean requiereCambioPassword; // 🔑 Debe cambiar contraseña

    @JsonProperty("failed_attempts")
    private Integer failedAttempts;
    @JsonProperty("locked_until")
    private LocalDateTime lockedUntil;

    @JsonProperty("last_login_at")
    private LocalDateTime lastLoginAt;
    @JsonProperty("create_at")
    private LocalDateTime createAt;
    @JsonProperty("update_at")
    private LocalDateTime updateAt;

    private Set<String> roles;
    private Set<String> permisos;

    // ============================================================
    // 👤 Datos personales (dim_personal_cnt)
    // ============================================================
    @JsonProperty("id_personal")
    private Long idPersonal;
    @JsonProperty("nombre_completo")
    private String nombreCompleto;
    private String nombres;
    @JsonProperty("apellido_paterno")
    private String apellidoPaterno;
    @JsonProperty("apellido_materno")
    private String apellidoMaterno;
    @JsonProperty("numero_documento")
    private String numeroDocumento;
    @JsonProperty("tipo_documento")
    private String tipoDocumento;
    @JsonProperty("fecha_nacimiento")
    private LocalDate fechaNacimiento;
    private String genero;
    @JsonProperty("correo_personal")
    private String correoPersonal;
    @JsonProperty("correo_corporativo")
    private String correoCorporativo;
    @JsonProperty("correo_institucional")
    private String correoInstitucional;
    private String telefono;
    private String direccion;
    @JsonProperty("foto_url")
    private String fotoUrl; // 📸 URL o base64 de la foto

    // ============================================================
    // 🧑‍⚕️ Datos profesionales (dim_personal_prof)
    // ============================================================
    @JsonProperty("id_profesion")
    private Long idProfesion;
    @JsonProperty("nombre_profesion")
    private String nombreProfesion;
    @JsonProperty("profesion_principal")
    private String profesionPrincipal;
    private List<String> profesiones; // Varias profesiones (si existen)
    private String colegiatura;
    @JsonProperty("id_especialidad")
    private Long idEspecialidad;
    @JsonProperty("nombre_especialidad")
    private String nombreEspecialidad;
    private String rne;

    // ============================================================
    // 💼 Datos laborales (dim_personal_cnt)
    // ============================================================
    @JsonProperty("id_regimen_laboral")
    private Long idRegimenLaboral;
    @JsonProperty("regimen_laboral")
    private String regimenLaboral;
    @JsonProperty("nombre_regimen")
    private String nombreRegimen;
    @JsonProperty("id_area")
    private Long idArea;
    @JsonProperty("area_trabajo")
    private String areaTrabajo;
    @JsonProperty("nombre_area")
    private String nombreArea;
    @JsonProperty("codigo_planilla")
    private String codigoPlanilla;
    @JsonProperty("periodo_ingreso")
    private String periodoIngreso;
    @JsonProperty("ordenes_compra")
    private List<String> ordenesCompra;     // OC vinculadas al personal
    @JsonProperty("firmas_digitales")
    private List<String> firmasDigitales;   // Firmas registradas (ej. jpg o PDF)

    // ============================================================
    // 👔 TIPO DE PROFESIONAL (dim_tipo_personal) ✨ NUEVO
    // ============================================================
    /**
     * ID del tipo de profesional (administrativo, asistencial, etc.)
     */
    @JsonProperty("id_tipo_profesional")
    private Long idTipoProfesional;

    /**
     * Descripción del tipo de profesional
     * Ejemplos: "ADMINISTRATIVO", "ASISTENCIAL", "MÉDICO", etc.
     */
    @JsonProperty("nombre_tipo_profesional")
    private String nombreTipoProfesional;

    /**
     * Alias alternativo para compatibilidad con frontend
     */
    @JsonProperty("desc_tip_pers")
    private String descTipPers;

    /**
     * Alias alternativo para compatibilidad
     */
    @JsonProperty("tipo_profesional_desc")
    private String tipoProfesionalDesc;

    /**
     * 🔥 Campo adicional para compatibilidad con frontend (ActualizarModel.jsx)
     * Mapea al mismo valor que idTipoProfesional
     */
    @JsonProperty("id_tip_pers")
    private Long id_tip_pers;

    // ============================================================
    // 🏥 DATOS DE IPRESS (NUEVOS - CRÍTICOS) ✨
    // ============================================================
    @JsonProperty("id_ipress")
    private Long idIpress;

    @JsonProperty("nombre_ipress")
    private String nombreIpress;

    @JsonProperty("codigo_ipress")
    private String codigoIpress;

    // ============================================================
    // 📋 TIPO DE PERSONAL (NUEVO) ✨
    // ============================================================
    /**
     * Tipo de personal: "INTERNO" o "EXTERNO"
     * - INTERNO: Trabaja en CENTRO NACIONAL DE TELEMEDICINA
     * - EXTERNO: Trabaja en otra IPRESS
     */
    @JsonProperty("tipo_personal")
    private String tipoPersonal;

    @JsonProperty("tipo_personal_detalle")
    private String tipoPersonalDetalle;

    // ============================================================
    // 💬 Campo informativo opcional
    // ============================================================
    private String message;
}

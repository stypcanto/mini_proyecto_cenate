// ============================================================================
// 🧩 AuditoriaModularView.java – Entidad de solo lectura (MBAC / CENATE 2025)
// ----------------------------------------------------------------------------
// Mapea la vista SQL vw_auditoria_modular_detallada, la cual registra de forma
// detallada los eventos de auditoría de los módulos y permisos MBAC.
// Incluye información del usuario, acción ejecutada y contexto del evento.
// ============================================================================

package com.styp.cenate.model.view;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

@Entity
@Table(name = "vw_auditoria_modular_detallada")
@Immutable // Evita operaciones de persistencia, solo lectura
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AuditoriaModularView {

    // =========================================================================
    // 🔹 Identificador y metadatos base
    // =========================================================================
    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @Column(name = "fecha_formateada", length = 50)
    private String fechaFormateada;

    // =========================================================================
    // 🔹 Información del usuario y sesión
    // =========================================================================
    @Column(name = "usuario_sesion", length = 150)
    private String usuarioSesion;

    @Column(name = "id_user")
    private Long idUser;

    @Column(name = "username", length = 100)
    private String username;

    @Column(name = "dni", length = 20)
    private String dni;

    @Column(name = "nombre_completo", length = 255)
    private String nombreCompleto;

    @Column(name = "roles", columnDefinition = "TEXT")
    private String roles;

    @Column(name = "correo_corporativo", length = 255)
    private String correoCorporativo;

    @Column(name = "correo_personal", length = 255)
    private String correoPersonal;

    // =========================================================================
    // 🔹 Detalle del evento auditado
    // =========================================================================
    @Column(name = "modulo", length = 150)
    private String modulo;

    @Column(name = "accion", length = 100)
    private String accion;

    @Column(name = "estado", length = 50)
    private String estado;

    @Column(name = "detalle", columnDefinition = "TEXT")
    private String detalle;

    // =========================================================================
    // 🔹 Contexto del dispositivo y red
    // =========================================================================
    @Column(name = "ip", length = 50)
    private String ip;

    @Column(name = "dispositivo", columnDefinition = "TEXT")
    private String dispositivo;

    // =========================================================================
    // 🔹 Referencia al registro afectado
    // =========================================================================
    @Column(name = "id_afectado")
    private Long idAfectado;

    @Column(name = "tipo_evento", length = 100)
    private String tipoEvento;
}
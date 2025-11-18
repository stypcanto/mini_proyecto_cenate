// ========================================================================
// 🧩 RecuperacionCuenta.java – Entidad JPA (CENATE 2025)
// ------------------------------------------------------------------------
// Representa las solicitudes de recuperación de contraseña registradas
// por los usuarios del sistema MBAC CENATE.
// Incluye trazabilidad por fecha, estado y observaciones.
// ========================================================================

package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recuperacion_cuenta")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class RecuperacionCuenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 👤 Usuario o identificador institucional que solicitó la recuperación */
    @Column(nullable = false)
    private String username; // ⚙️ antes era "email", ahora se alinea con login MBAC

    /** 🕒 Fecha en la que se realizó la solicitud */
    @Builder.Default
    @Column(name = "fecha_solicitud", nullable = false, updatable = false)
    private LocalDateTime fechaSolicitud = LocalDateTime.now();

    /** 🔄 Estado de la solicitud: PENDIENTE, ATENDIDO, RECHAZADO */
    @Column(nullable = false, length = 20)
    private String estado;

    /** 🗒️ Observaciones opcionales del administrador o sistema */
    @Column(length = 255)
    private String observacion;

    /** 🕓 Fecha de última actualización (cuando cambia el estado) */
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
}
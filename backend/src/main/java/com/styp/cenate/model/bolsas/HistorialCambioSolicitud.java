package com.styp.cenate.model.bolsas;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;

/**
 * Historial permanente de cambios relevantes en solicitudes de bolsa.
 * Guarda el estado previo antes de limpiar campos (devolucion, anulacion, etc.)
 * para que la trazabilidad no pierda información histórica.
 *
 * v1.81.6
 */
@Entity
@Table(name = "dim_historial_cambios_solicitud")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistorialCambioSolicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial")
    private Long idHistorial;

    /** FK a dim_solicitud_bolsa */
    @Column(name = "id_solicitud", nullable = false)
    private Long idSolicitud;

    /** Tipo: DEVOLUCION_A_PENDIENTE, ANULACION, etc. */
    @Column(name = "tipo_cambio", nullable = false, length = 50)
    private String tipoCambio;

    /** Motivo ingresado por el usuario */
    @Column(name = "motivo", columnDefinition = "TEXT")
    private String motivo;

    // ── Estado anterior ──────────────────────────────────────────────────────
    @Column(name = "estado_anterior_id")
    private Long estadoAnteriorId;

    @Column(name = "estado_anterior_desc", length = 200)
    private String estadoAnteriorDesc;

    // ── Médico anterior ──────────────────────────────────────────────────────
    @Column(name = "medico_anterior_id")
    private Long medicoAnteriorId;

    @Column(name = "medico_anterior_nombre", length = 255)
    private String medicoAnteriorNombre;

    // ── Cita anterior ────────────────────────────────────────────────────────
    @Column(name = "fecha_cita_anterior")
    private LocalDate fechaCitaAnterior;

    @Column(name = "hora_cita_anterior")
    private LocalTime horaCitaAnterior;

    // ── Auditoría ────────────────────────────────────────────────────────────
    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(name = "usuario_nombre", length = 100)
    private String usuarioNombre;

    @Column(name = "fecha_cambio", nullable = false,
            columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT NOW()")
    @Builder.Default
    private OffsetDateTime fechaCambio = OffsetDateTime.now();
}

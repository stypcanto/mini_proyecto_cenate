package com.styp.cenate.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Modelo de entidad para los detalles de la solicitud de disponibilidad médica.
 * Representa cada día/turno solicitado en una solicitud de disponibilidad.
 */
@Entity
@Table(name = "solicitud_disponibilidad_medico_det")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudDisponibilidadMedicoDet {

    /**
     * ID único del detalle
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_det")
    private Long idDetalle;

    /**
     * Relación con la solicitud principal
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_solicitud_disp", nullable = false)
    @JsonBackReference
    private SolicitudDisponibilidadMedico solicitud;

    /**
     * Fecha de la disponibilidad
     */
    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    /**
     * Turno: 'M' (Mañana), 'T' (Tarde), 'N' (Noche)
     */
    @Column(name = "turno", nullable = false, length = 1)
    private String turno;

    /**
     * Relación con el horario (opcional)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_horario")
    private DimHorario horario;

    /**
     * Estado del detalle: PROPUESTO, APROBADO, RECHAZADO
     */
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private String estado = "PROPUESTO";

    /**
     * Fecha de creación
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Callback antes de persistir
     */
    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = "PROPUESTO";
        }
    }
}

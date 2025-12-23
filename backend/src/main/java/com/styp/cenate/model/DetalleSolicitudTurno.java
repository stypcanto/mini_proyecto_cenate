package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

/**
 * Entidad que representa el detalle de turnos solicitados por especialidad.
 * Cada registro indica cuantos turnos solicita una IPRESS para una especialidad especifica.
 * Tabla: detalle_solicitud_turno
 */
@Entity
@Table(name = "detalle_solicitud_turno", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"solicitud", "especialidad"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DetalleSolicitudTurno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_detalle")
    private Long idDetalle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_solicitud", nullable = false)
    private SolicitudTurnoIpress solicitud;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_servicio", nullable = false)
    private DimServicioEssi especialidad;

    @Column(name = "turnos_solicitados")
    @Builder.Default
    private Integer turnosSolicitados = 0;

    @Column(name = "turno_preferente", length = 100)
    private String turnoPreferente; // "Manana", "Tarde", "Noche"

    @Column(name = "dia_preferente", length = 200)
    private String diaPreferente; // "Lunes, Miercoles, Viernes"

    @Column(name = "observacion", columnDefinition = "TEXT")
    private String observacion;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    // ==========================================================
    // Metodos utilitarios
    // ==========================================================

    /**
     * Obtiene el nombre de la especialidad
     */
    public String getNombreEspecialidad() {
        return especialidad != null ? especialidad.getDescServicio() : null;
    }

    /**
     * Obtiene el codigo de la especialidad
     */
    public String getCodigoEspecialidad() {
        return especialidad != null ? especialidad.getCodServicio() : null;
    }

    /**
     * Indica si hay turnos solicitados
     */
    public boolean tieneTurnosSolicitados() {
        return turnosSolicitados != null && turnosSolicitados > 0;
    }
}

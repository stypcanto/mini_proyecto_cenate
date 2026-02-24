package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Entidad que representa la asignación de un paciente a una estrategia institucional
 * Permite asociar pacientes con estrategias (CENACRON, TELECAM, TELETARV, etc.)
 * para seguimiento y reportería
 */
@Entity
@Table(name = "paciente_estrategia")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PacienteEstrategia {

    /**
     * ID único de la asignación
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asignacion")
    private Long idAsignacion;

    /**
     * Referencia al asegurado (paciente)
     * Usa VARCHAR(255) para compatibilidad con tabla asegurados
     */
    @Column(name = "pk_asegurado", nullable = false)
    private String pkAsegurado;

    /**
     * Referencia a la estrategia institucional
     * Relación @ManyToOne con EstrategiaInstitucional
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_estrategia", nullable = false)
    private EstrategiaInstitucional estrategia;

    /**
     * Referencia opcional a la atención donde se asignó la estrategia
     */
    @Column(name = "id_atencion_asignacion")
    private Long idAtencionAsignacion;

    /**
     * Usuario que realizó la asignación (médico, enfermero, coordinador)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_asigno")
    private Usuario usuarioAsigno;

    /**
     * Usuario que solicitó la baja/retiro del paciente de la estrategia.
     * Registrado en el momento de la desvinculación para auditoría.
     * NULL en registros históricos anteriores a v6.2.0.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_desvinculo")
    private Usuario usuarioDesvinculo;

    /**
     * Fecha y hora de inicio de la asignación
     */
    @Column(name = "fecha_asignacion", nullable = false)
    private LocalDateTime fechaAsignacion;

    /**
     * Fecha y hora cuando se desvincló del paciente (NULL si sigue activo)
     */
    @Column(name = "fecha_desvinculacion")
    private LocalDateTime fechaDesvinculacion;

    /**
     * Estado de la asignación: ACTIVO, INACTIVO, COMPLETADO
     */
    @Column(name = "estado", nullable = false)
    private String estado; // ACTIVO, INACTIVO, COMPLETADO

    /**
     * Observación sobre por qué se desvincló (opcional)
     */
    @Column(name = "observacion_desvinculacion")
    private String observacionDesvinculacion;

    /**
     * Auditoría - Fecha de creación
     */
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    /**
     * Auditoría - Fecha de última actualización
     */
    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    /**
     * Calcula los días que el paciente estuvo en la estrategia
     * Si sigue activo, calcula hasta hoy
     * Si ya se desvincló, calcula hasta fecha_desvinculacion
     */
    @Transient
    public long getDiasEnEstrategia() {
        if (fechaAsignacion == null) {
            return 0;
        }
        LocalDateTime hasta = fechaDesvinculacion != null
                ? fechaDesvinculacion
                : LocalDateTime.now();
        return ChronoUnit.DAYS.between(
                fechaAsignacion.toLocalDate(),
                hasta.toLocalDate()
        );
    }

    /**
     * Verifica si la asignación está activa
     */
    @Transient
    public boolean isActivo() {
        return "ACTIVO".equals(estado);
    }

    /**
     * Verifica si la asignación ha sido completada
     */
    @Transient
    public boolean isCompletado() {
        return "COMPLETADO".equals(estado);
    }

    /**
     * Verifica si la asignación está pausada/inactiva
     */
    @Transient
    public boolean isInactivo() {
        return "INACTIVO".equals(estado);
    }
}

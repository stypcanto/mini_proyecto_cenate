package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

/**
 * Entidad para registrar la adherencia al tratamiento prescrito
 * Permite trackear si el paciente tomó sus medicamentos según lo indicado
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Entity
@Table(name = "adherencia_tratamiento")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdherenciaTratamiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_adherencia")
    private Long idAdherencia;

    // Relación con atención clínica
    @Column(name = "id_atencion", nullable = false)
    private Long idAtencion;

    // Datos del paciente (desnormalizado)
    @Column(name = "pk_asegurado", nullable = false, length = 50)
    private String pkAsegurado;

    // Información del medicamento
    @Column(name = "nombre_medicamento", nullable = false, length = 200)
    private String nombreMedicamento;

    @Column(name = "dosis", length = 100)
    private String dosis;

    @Column(name = "frecuencia", length = 100)
    private String frecuencia;

    // Registro de toma
    @Column(name = "fecha_programada", nullable = false)
    private OffsetDateTime fechaProgramada;

    @Column(name = "fecha_toma_real")
    private OffsetDateTime fechaTomaReal;

    @Column(name = "tomo_medicamento")
    @Builder.Default
    private Boolean tomoMedicamento = false;

    // Observaciones
    @Column(name = "motivo_no_toma", columnDefinition = "TEXT")
    private String motivoNoToma;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    // Auditoría
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}

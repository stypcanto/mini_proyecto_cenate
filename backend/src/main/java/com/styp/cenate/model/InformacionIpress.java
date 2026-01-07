package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 🏥 Entidad InformacionIpress - Información específica de IPRESS según lineamientos
 * Tabla: informacion_ipress
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-06
 */
@Entity
@Table(name = "informacion_ipress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InformacionIpress {

    /**
     * ID único del registro
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_informacion_ipress")
    private Long idInformacionIpress;

    /**
     * Relación con Lineamiento
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_lineamiento", nullable = false)
    private Lineamiento lineamiento;

    /**
     * Relación con IPRESS
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_ipress", nullable = false)
    private Ipress ipress;

    /**
     * Contenido específico para esta IPRESS
     */
    @Column(name = "contenido", columnDefinition = "TEXT")
    private String contenido;

    /**
     * Requisitos específicos de esta IPRESS
     */
    @Column(name = "requisitos", columnDefinition = "TEXT")
    private String requisitos;

    /**
     * Fecha de implementación en la IPRESS
     */
    @Column(name = "fecha_implementacion")
    private LocalDateTime fechaImplementacion;

    /**
     * Estado de cumplimiento (CUMPLE, NO_CUMPLE, EN_PROGRESO, PENDIENTE)
     */
    @Column(name = "estado_cumplimiento", length = 50)
    private String estadoCumplimiento;

    /**
     * Observaciones o comentarios
     */
    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    /**
     * Responsable de cumplimiento en la IPRESS
     */
    @Column(name = "responsable", length = 255)
    private String responsable;

    /**
     * Auditoría - Fecha de creación
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Auditoría - Fecha de última actualización
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Verifica si cumple con el lineamiento
     */
    public boolean cumple() {
        return "CUMPLE".equalsIgnoreCase(estadoCumplimiento);
    }
}

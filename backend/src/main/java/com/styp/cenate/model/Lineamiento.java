package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 📋 Entidad Lineamiento - Lineamientos técnicos y operativos del CENATE
 * Tabla: lineamiento
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-06
 */
@Entity
@Table(name = "lineamiento")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lineamiento {

    /**
     * ID único del lineamiento
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_lineamiento")
    private Long idLineamiento;

    /**
     * Código único del lineamiento (ej: LIN-001)
     */
    @Column(name = "codigo", unique = true, nullable = false, length = 50)
    private String codigo;

    /**
     * Título del lineamiento
     */
    @Column(name = "titulo", nullable = false, length = 255)
    private String titulo;

    /**
     * Descripción detallada del lineamiento
     */
    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    /**
     * Categoría del lineamiento (TÉCNICO, OPERATIVO, ADMINISTRATIVO, CLÍNICO)
     */
    @Column(name = "categoria", nullable = false, length = 100)
    private String categoria;

    /**
     * Versión del lineamiento (ej: 1.0, 2.1)
     */
    @Column(name = "version", length = 20)
    private String version;

    /**
     * Fecha de aprobación
     */
    @Column(name = "fecha_aprobacion")
    private LocalDateTime fechaAprobacion;

    /**
     * Usuario que aprobó
     */
    @Column(name = "aprobado_por", length = 255)
    private String aprobadoPor;

    /**
     * Estado del lineamiento (ACTIVO, INACTIVO, OBSOLETO)
     */
    @Column(name = "estado", nullable = false, length = 50)
    private String estado;

    /**
     * Documento PDF o enlace a documento (opcional)
     */
    @Column(name = "url_documento")
    private String urlDocumento;

    /**
     * Relación uno a muchos con InformacionIpress
     */
    @OneToMany(mappedBy = "lineamiento", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<InformacionIpress> informacionesIpress;

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
     * Verifica si el lineamiento está activo
     */
    public boolean isActivo() {
        return "ACTIVO".equalsIgnoreCase(estado);
    }
}

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
 * 🎯 Entidad para configuración de módulos disponibles por IPRESS
 * Permite habilitar/deshabilitar módulos dinámicamente para cada IPRESS
 * Tabla: ipress_modulos_config
 */
@Entity
@Table(name = "ipress_modulos_config", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"id_ipress", "modulo_codigo"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IpressModuloConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * IPRESS a la que se aplica esta configuración
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ipress", nullable = false)
    private Ipress ipress;

    /**
     * Código único del módulo (TELEECG, FORMULARIO_DIAGNOSTICO, etc)
     */
    @Column(name = "modulo_codigo", nullable = false, length = 50)
    private String moduloCodigo;

    /**
     * Nombre descriptivo del módulo
     */
    @Column(name = "modulo_nombre", nullable = false, length = 100)
    private String moduloNombre;

    /**
     * ✅ Si el módulo está habilitado para esta IPRESS
     */
    @Column(name = "habilitado", nullable = false)
    private Boolean habilitado;

    /**
     * Descripción del módulo (mostrada en el frontend)
     */
    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    /**
     * Nombre del ícono (Lucide React: Activity, FileText, Calendar, etc)
     */
    @Column(name = "icono", length = 50)
    private String icono;

    /**
     * Color para la tarjeta (indigo, blue, purple, rose, red, etc)
     */
    @Column(name = "color", length = 20)
    private String color;

    /**
     * Orden de aparición en el frontend (1, 2, 3, 4...)
     */
    @Column(name = "orden")
    private Integer orden;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

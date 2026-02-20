package com.styp.cenate.model.mesaayuda;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad JPA para motivos predefinidos de Mesa de Ayuda
 * Tabla: dim_motivos_mesadeayuda
 *
 * Contiene los 7 motivos disponibles para que los médicos soliciten ayuda:
 * 1. Citar paciente adicional
 * 2. Actualizar listado de pacientes
 * 3. Contactar paciente para evitar deserción
 * 4. Eliminar paciente excedente
 * 5. Enviar acto médico / receta / referencia
 * 6. Envío de imágenes / resultados
 * 7. Programación de cita adicional
 *
 * @author Styp Canto Rondón
 * @version v1.64.0 (2026-02-18) - Módulo Mesa de Ayuda
 * @since 2026-02-18
 */
@Entity
@Table(
    name = "dim_motivos_mesadeayuda",
    schema = "public",
    indexes = {
        @Index(name = "idx_motivos_activo", columnList = "activo"),
        @Index(name = "idx_motivos_orden", columnList = "orden")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DimMotivosMesaAyuda {

    /**
     * ID único del motivo
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Código único del motivo para referencia interna
     * Ej: PS_CITAR_ADICIONAL, PS_ENVIO_IMAGENES
     */
    @Column(nullable = false, length = 100, unique = true)
    private String codigo;

    /**
     * Descripción completa y legible del motivo
     * Será mostrada en el combo del formulario de creación de ticket
     */
    @Column(nullable = false, length = 500)
    private String descripcion;

    /**
     * Indica si el motivo está activo (visible en combos)
     * Si es FALSE, no se mostrará en la UI pero los registros históricos lo mantendrán
     */
    @Column(nullable = false)
    private Boolean activo;

    /**
     * Orden de visualización en el combo
     * Motivos con orden menor aparecen primero
     */
    @Column(nullable = false)
    private Integer orden;

    /**
     * Prioridad predeterminada del motivo: ALTA, MEDIA, BAJA
     * Se usará como sugerencia al crear un ticket con este motivo
     */
    @Column(nullable = false, length = 10)
    private String prioridad;

    /**
     * Timestamp de creación (auditoría)
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
        if (activo == null) {
            activo = true;
        }
        if (orden == null) {
            orden = 0;
        }
        if (prioridad == null) {
            prioridad = "MEDIA";
        }
    }
}

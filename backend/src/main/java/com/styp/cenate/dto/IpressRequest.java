package com.styp.cenate.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * 📥 DTO para recibir datos en las operaciones de creación y actualización de IPRESS.
 * 🏥 Institución Prestadora de Servicios de Salud
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IpressRequest {

    /**
     * Código único de la IPRESS (RENIPRESS)
     */
    @NotBlank(message = "El código de IPRESS es obligatorio")
    @Size(max = 50, message = "El código no puede exceder 50 caracteres")
    private String codIpress;

    /**
     * Descripción/Nombre de la IPRESS
     */
    @NotBlank(message = "La descripción de IPRESS es obligatoria")
    @Size(max = 255, message = "La descripción no puede exceder 255 caracteres")
    private String descIpress;

    /**
     * ID de la Red de salud a la que pertenece
     */
    @NotNull(message = "La red asistencial es obligatoria")
    @Positive(message = "El ID de red debe ser un número positivo")
    private Long idRed;

    /**
     * ID del Nivel de atención (I, II, III)
     */
    @NotNull(message = "El nivel de atención es obligatorio")
    @Positive(message = "El ID de nivel de atención debe ser un número positivo")
    private Long idNivAten;

    /**
     * ID de Modalidad de atención (TELECONSULTA, TELECONSULTORIO, MIXTA, NO SE BRINDA SERVICIO)
     */
    private Long idModAten;

    /**
     * Detalles de uso de la modalidad TELECONSULTA (solo cuando modalidad = MIXTA)
     * Incluye horarios, especialidades, y detalles adicionales
     */
    @Size(max = 1000, message = "Los detalles de teleconsulta no pueden exceder 1000 caracteres")
    private String detallesTeleconsulta;

    /**
     * Detalles de uso de la modalidad TELECONSULTORIO (solo cuando modalidad = MIXTA)
     * Incluye horarios, especialidades, y detalles adicionales
     */
    @Size(max = 1000, message = "Los detalles de teleconsultorio no pueden exceder 1000 caracteres")
    private String detallesTeleconsultorio;

    /**
     * Dirección de la IPRESS
     */
    @NotBlank(message = "La dirección es obligatoria")
    @Size(max = 500, message = "La dirección no puede exceder 500 caracteres")
    private String direcIpress;

    /**
     * ID del Tipo de IPRESS (Hospital, Centro de Salud, Puesto, etc.)
     */
    @NotNull(message = "El tipo de IPRESS es obligatorio")
    @Positive(message = "El ID de tipo de IPRESS debe ser un número positivo")
    private Long idTipIpress;

    /**
     * ID del Distrito donde se ubica
     */
    @NotNull(message = "El distrito es obligatorio")
    @Positive(message = "El ID de distrito debe ser un número positivo")
    private Long idDist;

    /**
     * Latitud (coordenada GPS)
     */
    @DecimalMin(value = "-90.0", message = "La latitud debe estar entre -90 y 90")
    @DecimalMax(value = "90.0", message = "La latitud debe estar entre -90 y 90")
    private BigDecimal latIpress;

    /**
     * Longitud (coordenada GPS)
     */
    @DecimalMin(value = "-180.0", message = "La longitud debe estar entre -180 y 180")
    @DecimalMax(value = "180.0", message = "La longitud debe estar entre -180 y 180")
    private BigDecimal longIpress;

    /**
     * URL de Google Maps
     */
    @Size(max = 500, message = "La URL de Google Maps no puede exceder 500 caracteres")
    private String gmapsUrlIpress;

    /**
     * Estado de la IPRESS (A=Activo, I=Inactivo)
     */
    @NotBlank(message = "El estado es obligatorio")
    @Pattern(regexp = "^[AI]$", message = "El estado debe ser 'A' (Activo) o 'I' (Inactivo)")
    private String statIpress;
}

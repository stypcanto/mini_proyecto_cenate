// ============================================================================
// 📤 DashboardMedicoCardResponse.java – DTO de Response (CMS Dashboard Médico – CENATE 2025)
// ----------------------------------------------------------------------------
// DTO de respuesta para representar los datos de una card del Dashboard Médico.
// ============================================================================

package com.styp.cenate.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para una card del Dashboard Médico
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardMedicoCardResponse {

    /** Identificador único de la card */
    private Integer id;

    /** Título/nombre de la card */
    private String titulo;

    /** Descripción o subtítulo de la card */
    private String descripcion;

    /** URL o ruta de destino de la card */
    private String link;

    /** Nombre del icono de Lucide React */
    private String icono;

    /** Color hexadecimal para el icono y acentos */
    private String color;

    /** Orden de visualización (menor número = primero) */
    private Integer orden;

    /** Indica si la card está activa y visible */
    private Boolean activo;

    /** Si es true, abre el link en nueva pestaña */
    private Boolean targetBlank;

    /** Fecha de creación */
    private LocalDateTime createdAt;

    /** Fecha de última actualización */
    private LocalDateTime updatedAt;
}


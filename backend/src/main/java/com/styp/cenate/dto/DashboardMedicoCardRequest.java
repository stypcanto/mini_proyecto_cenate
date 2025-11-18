// ============================================================================
// 📥 DashboardMedicoCardRequest.java – DTO de Request (CMS Dashboard Médico – CENATE 2025)
// ----------------------------------------------------------------------------
// DTO para recibir datos en las operaciones de creación y actualización de cards.
// ============================================================================

package com.styp.cenate.dto;

import lombok.*;

/**
 * DTO para crear o actualizar una card del Dashboard Médico
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardMedicoCardRequest {

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
}


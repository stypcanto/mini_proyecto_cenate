package com.styp.cenate.dto;

import lombok.*;

/**
 * 🏥 EstadisticasIpress107DTO - Estadísticas por IPRESS
 * Propósito: Datos de atenciones agrupadas por IPRESS
 * Módulo: 107
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadisticasIpress107DTO {
    private Long idIpress;             // ID del IPRESS
    private String nombreIpress;       // desc_ipress
    private String codigoIpress;       // cod_ipress
    private String red;                // desc_red
    private String macroregion;        // desc_macro
    private Long totalAtenciones;      // COUNT(id_solicitud)
}
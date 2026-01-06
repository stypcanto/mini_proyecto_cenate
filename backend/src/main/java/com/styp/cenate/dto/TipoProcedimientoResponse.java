package com.styp.cenate.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * DTO para la tabla dim_tip_proced (Tipos de Procedimiento - CPMS).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TipoProcedimientoResponse {
    private Long idTipProced;
    private String codTipProced;
    private String descTipProced;
    private String statTipProced; // 'A' o 'I'
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
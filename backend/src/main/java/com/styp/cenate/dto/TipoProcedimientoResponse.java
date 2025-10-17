package com.styp.cenate.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * DTO para la tabla dim_tip_proced.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TipoProcedimientoResponse {
    private Long idTipProced;
    private String descTipProced;
    private String statProced;   // 'A' o 'I'
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
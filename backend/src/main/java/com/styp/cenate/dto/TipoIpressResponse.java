package com.styp.cenate.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * DTO para dim_tipo_ipress (categoría de IPRESS).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TipoIpressResponse {
    private Long idTipIpress;
    private String descTipIpress;
    private String statTipIpress;  // 'A' o 'I'
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
package com.styp.cenate.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * DTO para dim_nivel_atencion.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NivelAtencionResponse {
    private Long idNivAten;
    private String descNivAten;
    private String statNivAten;  // 'A' o 'I'
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
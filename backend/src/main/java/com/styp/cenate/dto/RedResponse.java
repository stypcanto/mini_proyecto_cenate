package com.styp.cenate.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * DTO para dim_red (Red de salud).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RedResponse {
    private Long idRed;
    private String codRed;
    private String descRed;
    private Long idMacro;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
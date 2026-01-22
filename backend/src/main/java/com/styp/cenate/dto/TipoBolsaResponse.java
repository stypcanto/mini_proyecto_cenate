package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 📋 DTO para respuestas de Tipos de Bolsas
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TipoBolsaResponse {
    private Long idTipoBolsa;
    private String codTipoBolsa;
    private String descTipoBolsa;
    private String statTipoBolsa;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

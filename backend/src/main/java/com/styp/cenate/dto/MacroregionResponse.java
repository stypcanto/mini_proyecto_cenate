package com.styp.cenate.dto;

import lombok.*;

/**
 * 🗺️ DTO de respuesta para Macroregión
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MacroregionResponse {
    private Long idMacro;
    private String descMacro;
    private String statMacro;

    public boolean isActiva() {
        return "A".equalsIgnoreCase(statMacro);
    }
}

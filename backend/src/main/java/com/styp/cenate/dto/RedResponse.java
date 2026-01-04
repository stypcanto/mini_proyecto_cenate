package com.styp.cenate.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * 🏥 DTO de respuesta para Red Asistencial
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RedResponse {
    private Long idRed;
    private String codRed;
    private String descRed;

    // Macroregión anidada (objeto completo)
    private MacroregionResponse macroregion;

    // Mantener idMacro para compatibilidad
    private Long idMacro;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Estado de la red
    private boolean activa;
}

package com.styp.cenate.dto.telemedicina;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de respuesta con token JWT para Jitsi
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenResponse {
    private String token;
    private String roomName;
    private String roomUrl;
    private Long expiraEn; // Tiempo de expiración en segundos
}

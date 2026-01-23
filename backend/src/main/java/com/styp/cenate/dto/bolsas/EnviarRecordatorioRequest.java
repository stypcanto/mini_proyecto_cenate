package com.styp.cenate.dto.bolsas;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * 📋 DTO para enviar recordatorio de cita
 * v1.0.0 - Envío de recordatorios por WhatsApp o Email
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class EnviarRecordatorioRequest {

    @NotBlank(message = "El tipo de recordatorio es obligatorio")
    @Pattern(regexp = "WHATSAPP|EMAIL", message = "El tipo debe ser WHATSAPP o EMAIL")
    private String tipo; // WHATSAPP | EMAIL

    private String mensaje; // Mensaje personalizado (opcional)
}

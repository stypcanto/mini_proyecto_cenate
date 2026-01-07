package com.styp.cenate.dto.telemedicina;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de respuesta con información de la sala creada
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaResponse {
    private String roomName;
    private String roomUrl;
    private String token;
    private LocalDateTime fechaCreacion;
    private String nombrePaciente;
    private String dniPaciente;
    private String nombreMedico;
}

package com.styp.cenate.dto.coordinador;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para request de reasignación de pacientes entre médicos
 *
 * @version v1.63.0
 * @since 2026-02-08
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReasignarPacienteRequest {

    private Long idSolicitud;
    private Long nuevoMedicoId;
}

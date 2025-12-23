package com.styp.cenate.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

/**
 * DTO de request para crear/actualizar una solicitud de turnos de IPRESS.
 * Nota: idPers, Red, IPRESS, email, nombre y telefono se obtienen automaticamente
 * del usuario autenticado.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudTurnoIpressRequest {

    @NotNull(message = "El id del periodo es obligatorio")
    private Long idPeriodo;

    @Valid
    private List<DetalleSolicitudTurnoRequest> detalles;
}

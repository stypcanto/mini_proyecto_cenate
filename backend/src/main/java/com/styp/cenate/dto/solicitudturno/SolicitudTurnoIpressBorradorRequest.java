package com.styp.cenate.dto.solicitudturno;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudTurnoIpressBorradorRequest {
    @NotNull(message = "El id del periodo es obligatorio")
    private Long idPeriodo;
    
    /** Id de la solicitud (puede ser null la primera vez) */
    private Long idSolicitud;

    private Integer totalTurnosSolicitados; // opcional (igual recalculas)
    private Integer totalEspecialidades;    // opcional

    private String observaciones;

    private List<DetalleSolicitudTurnoBorradorRequest> detalles;
    private List<Long> detallesEliminar;
}

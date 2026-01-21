package com.styp.cenate.dto.solicitudturno;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleSolicitudTurnoBorradorRequest {

    @NotNull(message = "El id de la especialidad es obligatorio")
    private Long idServicio;

    private Long idDetalle;

    private Boolean requiere;

    private Integer turnos;
    private Integer turnoTM;
    private Integer turnoManana;
    private Integer turnoTarde;

    private Boolean tc;
    private Boolean tl;

    private String observacion;
    private String estado;
}

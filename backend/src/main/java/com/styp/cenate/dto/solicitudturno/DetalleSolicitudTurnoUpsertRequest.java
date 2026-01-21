package com.styp.cenate.dto.solicitudturno;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleSolicitudTurnoUpsertRequest {

    private Long idDetalle; 

    @NotNull
    private Long idServicio;

    @NotNull
    private Boolean requiere;

    @NotNull
    private Integer turnos; // total

    @NotNull
    private Integer turnoTM;

    @NotNull
    private Integer turnoManana;

    @NotNull
    private Integer turnoTarde;

    @NotNull
    private Boolean tc;

    @NotNull
    private Boolean tl;

    private String observacion;

    @NotNull
    private String estado;

    private List<FechaDetalleRequest> fechasDetalle;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FechaDetalleRequest {
        @NotNull
        private String fecha;   // yyyy-MM-dd
        @NotNull
        private String bloque;  // MANANA|TARDE
    }
}

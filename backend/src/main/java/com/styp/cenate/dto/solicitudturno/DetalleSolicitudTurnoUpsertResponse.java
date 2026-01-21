package com.styp.cenate.dto.solicitudturno;

import java.util.List;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleSolicitudTurnoUpsertResponse {

    private Long idDetalle;
    private Long idSolicitud;
    private Long idServicio;

    private Integer turnoTM;
    private Integer turnoManana;
    private Integer turnoTarde;

    private Boolean tc;
    private Boolean tl;

    private String estado;

    private List<FechaDetalleResponse> fechasDetalle;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FechaDetalleResponse {
        private Long idDetalleFecha;
        private String fecha;
        private String bloque;
    }
}

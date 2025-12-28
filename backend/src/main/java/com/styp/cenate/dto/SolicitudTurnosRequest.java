package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudTurnosRequest {

    private String periodo; // YYYYMM
    private Long idIpress;
    private String observacionesGenerales;
    private List<DetalleEspecialidadRequest> detalles;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetalleEspecialidadRequest {
        private Integer idServicio;
        private Integer cantidadTurnos;
        private String observaciones;
        private String horarioPreferido; // MAÑANA, TARDE, NOCHE, CUALQUIERA
    }
}

package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudTurnosResponse {

    private Long idSolicitud;
    private String periodo;
    private Long idIpress;
    private String nombreIpress;
    private String codigoIpress;
    private String estado;
    private LocalDateTime fechaEnvio;
    private String observacionesGenerales;
    private Integer totalEspecialidades;
    private Integer totalTurnos;
    private List<DetalleEspecialidadResponse> detalles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetalleEspecialidadResponse {
        private Long idDetalle;
        private Integer idServicio;
        private String nombreEspecialidad;
        private Integer cantidadTurnos;
        private String observaciones;
        private String horarioPreferido;
    }
}

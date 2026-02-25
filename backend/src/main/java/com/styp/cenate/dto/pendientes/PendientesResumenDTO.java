package com.styp.cenate.dto.pendientes;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendientesResumenDTO {

    private Long totalMedicos;
    private Long totalPacientes;
    private Long totalAbandonos;
    private List<SubactividadResumenDTO> porSubactividad;
    private List<ServicioResumenDTO> topServiciosPorAbandonos;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubactividadResumenDTO {
        private String subactividad;
        private Long medicos;
        private Long abandonos;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServicioResumenDTO {
        private String servicio;
        private Long medicos;
        private Long abandonos;
    }
}

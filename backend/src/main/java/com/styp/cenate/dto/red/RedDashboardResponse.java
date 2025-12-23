package com.styp.cenate.dto.red;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de respuesta para el dashboard del modulo de Red
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RedDashboardResponse {

    private RedInfo red;
    private Estadisticas estadisticas;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RedInfo {
        private Long id;
        private String codigo;
        private String nombre;
        private String macroregion;

        @JsonProperty("id_macroregion")
        private Long idMacroregion;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Estadisticas {
        @JsonProperty("total_ipress")
        private Long totalIpress;

        @JsonProperty("total_personal_externo")
        private Long totalPersonalExterno;

        @JsonProperty("total_formularios")
        private Long totalFormularios;

        @JsonProperty("formularios_en_proceso")
        private Long formulariosEnProceso;

        @JsonProperty("formularios_enviados")
        private Long formulariosEnviados;

        @JsonProperty("formularios_aprobados")
        private Long formulariosAprobados;
    }
}

package com.styp.cenate.dto.bolsas;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BolsaXGestoraDTO {

    @JsonProperty("id_gestora")
    private Long idGestora;

    @JsonProperty("nombre_gestora")
    private String nombreGestora;

    @JsonProperty("total")
    private Long total;

    @JsonProperty("por_citar")
    private Long porCitar;

    @JsonProperty("citados")
    private Long citados;

    @JsonProperty("en_seguimiento")
    private Long enSeguimiento;

    @JsonProperty("observados")
    private Long observados;

    @JsonProperty("cerrados")
    private Long cerrados;

    @JsonProperty("atendidos")
    private Long atendidos;
}

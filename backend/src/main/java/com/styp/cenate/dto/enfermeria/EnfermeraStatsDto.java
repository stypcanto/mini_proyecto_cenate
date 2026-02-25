package com.styp.cenate.dto.enfermeria;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnfermeraStatsDto {

    @JsonProperty("id_enfermera")
    private Long idEnfermera;

    @JsonProperty("nombre_enfermera")
    private String nombreEnfermera;

    @JsonProperty("total")
    private Long total;

    @JsonProperty("pendientes")
    private Long pendientes;

    @JsonProperty("atendidos")
    private Long atendidos;

    @JsonProperty("desercion")
    private Long desercion;
}

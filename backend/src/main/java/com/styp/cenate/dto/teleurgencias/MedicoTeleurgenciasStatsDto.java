package com.styp.cenate.dto.teleurgencias;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicoTeleurgenciasStatsDto {

    @JsonProperty("id_medico")
    private Long idMedico;

    @JsonProperty("nombre_medico")
    private String nombreMedico;

    @JsonProperty("total")
    private Long total;

    @JsonProperty("pendientes")
    private Long pendientes;

    @JsonProperty("atendidos")
    private Long atendidos;

    @JsonProperty("desercion")
    private Long desercion;
}

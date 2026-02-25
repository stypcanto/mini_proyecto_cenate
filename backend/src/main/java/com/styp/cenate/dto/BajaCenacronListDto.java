package com.styp.cenate.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para listar bajas del programa CENACRON (estado INACTIVO o COMPLETADO).
 * Incluye datos de auditoría del usuario que generó la baja.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BajaCenacronListDto {

    @JsonProperty("idAsignacion")
    private Long idAsignacion;

    @JsonProperty("pkAsegurado")
    private String pkAsegurado;

    @JsonProperty("nombrePaciente")
    private String nombrePaciente;

    @JsonProperty("estado")
    private String estado;           // INACTIVO | COMPLETADO

    @JsonProperty("motivo")
    private String motivo;

    @JsonProperty("fechaAsignacion")
    private String fechaAsignacion;

    @JsonProperty("fechaDesvinculacion")
    private String fechaDesvinculacion;

    @JsonProperty("usuarioBajaLogin")
    private String usuarioBajaLogin;

    @JsonProperty("nombreQuienDioBaja")
    private String nombreQuienDioBaja;

    @JsonProperty("diasEnPrograma")
    private Long diasEnPrograma;
}

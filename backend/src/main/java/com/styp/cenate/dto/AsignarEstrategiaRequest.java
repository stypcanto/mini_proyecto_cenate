package com.styp.cenate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Solicitud para asignar una estrategia a un paciente
 *
 * Se utiliza en:
 *  - PacienteEstrategiaController.asignarEstrategia()
 *
 * Valida que el paciente y estrategia sean proporcionados
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AsignarEstrategiaRequest {

    /**
     * ID del paciente (asegurado) al que se asignará la estrategia
     * Ej: "44914706"
     */
    @NotBlank(message = "El ID del paciente (pkAsegurado) es requerido")
    private String pkAsegurado;

    /**
     * ID de la estrategia a asignar
     * Ej: 1 (CENACRON), 2 (TELECAM), etc.
     */
    @NotNull(message = "El ID de la estrategia es requerido")
    private Long idEstrategia;

    /**
     * ID opcional de la atención donde se asigna la estrategia
     */
    private Long idAtencionAsignacion;

    /**
     * Observación adicional sobre la asignación (opcional)
     */
    private String observacion;
}

package com.styp.cenate.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Solicitud para desasignar (desvincular) una estrategia de un paciente
 *
 * Se utiliza en:
 *  - PacienteEstrategiaController.desasignarEstrategia()
 *
 * Permite desvincular un paciente de una estrategia con una observación
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesasignarEstrategiaRequest {

    /**
     * Nuevo estado de la asignación (INACTIVO o COMPLETADO)
     * INACTIVO: Se pausa la asignación, puede reactivarse después
     * COMPLETADO: Se marca como completada, no se puede reactivar
     */
    @NotBlank(message = "El nuevo estado es requerido (INACTIVO o COMPLETADO)")
    private String nuevoEstado;

    /**
     * Observación sobre por qué se desvincló el paciente (opcional pero recomendado)
     */
    private String observacionDesvinculacion;
}

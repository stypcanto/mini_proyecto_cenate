package com.styp.cenate.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Solicitud para dar de baja a un paciente del programa CENACRON.
 *
 * Diferencia con DesasignarEstrategiaRequest:
 * - Opera sobre el paciente (pkAsegurado), no sobre el id_asignacion.
 * - Busca la asignacion activa por sigla 'CENACRON' internamente.
 * - Distingue entre baja total del programa (PROGRAMA_COMPLETO) y
 *   salida de una especialidad con posibilidad de reingreso (SOLO_ESPECIALIDAD).
 * - Registra el usuario autenticado como auditor del retiro.
 *
 * Usado en:
 *  - PUT /api/paciente-estrategia/baja-cenacron/{pkAsegurado}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Solicitud para dar de baja a un paciente del programa CENACRON")
public class BajaCenacronRequest {

    /**
     * Tipo de baja:
     *  - PROGRAMA_COMPLETO: el paciente sale definitivamente del programa (estado -> INACTIVO)
     *  - SOLO_ESPECIALIDAD: el paciente sale de la especialidad pero puede reingresar (estado -> COMPLETADO)
     */
    @NotBlank(message = "El tipo de baja es requerido")
    @Pattern(
        regexp = "PROGRAMA_COMPLETO|SOLO_ESPECIALIDAD",
        message = "El tipo de baja debe ser 'PROGRAMA_COMPLETO' o 'SOLO_ESPECIALIDAD'"
    )
    @Schema(
        description = "Tipo de baja del programa",
        allowableValues = {"PROGRAMA_COMPLETO", "SOLO_ESPECIALIDAD"},
        example = "PROGRAMA_COMPLETO"
    )
    private String tipoBaja;

    /**
     * Motivo clínico o administrativo de la baja.
     * Se almacena en observacion_desvinculacion para trazabilidad.
     */
    @NotBlank(message = "El motivo de baja es obligatorio")
    @Size(min = 5, max = 500, message = "El motivo de baja debe tener entre 5 y 500 caracteres")
    @Schema(
        description = "Motivo clínico o administrativo de la baja",
        example = "Paciente completó tratamiento indicado. Alta médica confirmada."
    )
    private String motivoBaja;
}

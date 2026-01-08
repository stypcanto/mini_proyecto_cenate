package com.styp.cenate.dto;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * 📝 DTO para actualizar Modalidad de Atención de una IPRESS
 * Usado por Personal Externo para actualizar su propia IPRESS
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-07
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActualizarModalidadIpressRequest {

    /**
     * ID de la Modalidad de Atención a asignar
     * Valores esperados: 1=TELECONSULTA, 2=TELECONSULTORIO, 3=MIXTA, 4=NO SE BRINDA SERVICIO
     */
    @NotNull(message = "La modalidad de atención es obligatoria")
    @Positive(message = "El ID de modalidad debe ser un número positivo")
    private Long idModAten;

    /**
     * Detalles de uso de TELECONSULTA (requerido si modalidad = MIXTA)
     * Incluye horarios, especialidades, y detalles adicionales
     */
    @Size(max = 1000, message = "Los detalles de teleconsulta no pueden exceder 1000 caracteres")
    private String detallesTeleconsulta;

    /**
     * Detalles de uso de TELECONSULTORIO (requerido si modalidad = MIXTA)
     * Incluye horarios, especialidades, y detalles adicionales
     */
    @Size(max = 1000, message = "Los detalles de teleconsultorio no pueden exceder 1000 caracteres")
    private String detallesTeleconsultorio;

    /**
     * Verifica si la modalidad seleccionada es MIXTA
     * @return true si idModAten es 3 (MIXTA)
     */
    public boolean esModalidadMixta() {
        return idModAten != null && idModAten.equals(3L);
    }

    /**
     * Valida que si la modalidad es MIXTA, ambos detalles tengan contenido
     * @return true si la validación es correcta
     * @throws IllegalArgumentException si es MIXTA pero falta contenido en detalles
     */
    public void validarDetallesMixta() {
        if (esModalidadMixta()) {
            boolean teleconsultaVacia = detallesTeleconsulta == null || detallesTeleconsulta.trim().isEmpty();
            boolean teleconsultorioVacia = detallesTeleconsultorio == null || detallesTeleconsultorio.trim().isEmpty();

            if (teleconsultaVacia || teleconsultorioVacia) {
                throw new IllegalArgumentException(
                    "Para modalidad MIXTA debe proporcionar detalles de TELECONSULTA y TELECONSULTORIO"
                );
            }
        }
    }
}

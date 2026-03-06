package com.styp.cenate.dto.bolsas;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO para reprogramación masiva de solicitudes de bolsa (v1.85.0).
 *
 * Permite actualizar la fecha de atención de múltiples solicitudes en una
 * sola operación, con la opción de reasignar la gestora responsable.
 *
 * Campos:
 * - ids       : IDs de dim_solicitud_bolsa a reprogramar (mínimo 1 elemento)
 * - fechaCita : Nueva fecha de atención (obligatoria)
 * - gestoraId : ID del usuario gestora a asignar (opcional — null conserva la gestora actual)
 *
 * @version v1.85.0
 * @since 2026-03-05
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReprogramarMasivoRequest {

    @NotEmpty(message = "La lista de IDs no puede estar vacía")
    private List<Long> ids;

    @NotNull(message = "La fecha de la cita es obligatoria")
    private LocalDate fechaCita;

    /** Opcional. Si se provee, se actualiza también el responsable_gestora_id. */
    private Long gestoraId;
}

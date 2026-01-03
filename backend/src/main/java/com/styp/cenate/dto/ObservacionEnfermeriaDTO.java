package com.styp.cenate.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para que enfermería agregue observaciones a una atención clínica
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ObservacionEnfermeriaDTO {

    @NotBlank(message = "La observación es obligatoria")
    @Size(min = 10, max = 5000, message = "La observación debe tener entre 10 y 5000 caracteres")
    private String observacion;

    @Size(max = 5000, message = "Los datos de seguimiento no pueden exceder 5000 caracteres")
    private String datosSeguimiento;
}

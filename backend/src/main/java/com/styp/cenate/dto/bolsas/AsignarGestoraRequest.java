package com.styp.cenate.dto.bolsas;

import lombok.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

/**
 * 📋 DTO para asignar una solicitud a una gestora
 * v1.0.0 - Asignación de solicitud a gestora de citas
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AsignarGestoraRequest {

    @NotNull(message = "El ID de la gestora es obligatorio")
    private Long gestoraId;

    @NotBlank(message = "El nombre de la gestora es obligatorio")
    private String gestoraNombre;
}

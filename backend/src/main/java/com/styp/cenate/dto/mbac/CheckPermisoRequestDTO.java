package com.styp.cenate.dto.mbac;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * DTO de entrada para verificar un permiso específico.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckPermisoRequestDTO {

    @NotNull(message = "El ID de usuario es obligatorio")
    private Long userId;

    @NotBlank(message = "La página es obligatoria")
    private String pagina;  // Ejemplo: "/roles/citas/agenda"

    @NotBlank(message = "La acción es obligatoria")
    private String accion;  // Ejemplo: "VER", "CREAR", "EDITAR"
}
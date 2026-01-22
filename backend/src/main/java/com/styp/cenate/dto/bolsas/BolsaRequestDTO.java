package com.styp.cenate.dto.bolsas;

import lombok.*;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 📊 DTO de Request para crear/actualizar Bolsas
 * v1.0.0 - Validación de entrada de datos
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class BolsaRequestDTO {

    @NotBlank(message = "El nombre de la bolsa es obligatorio")
    @Size(min = 3, max = 255, message = "El nombre debe tener entre 3 y 255 caracteres")
    private String nombreBolsa;

    @Size(max = 1000, message = "La descripción no puede exceder 1000 caracteres")
    private String descripcion;

    private Long especialidadId;

    private String especialidadNombre;

    private Long responsableId;

    private String responsableNombre;

    @NotNull(message = "El total de pacientes es obligatorio")
    private Integer totalPacientes;

    private String estado; // ACTIVA, INACTIVA, CERRADA

    private Boolean activo;
}

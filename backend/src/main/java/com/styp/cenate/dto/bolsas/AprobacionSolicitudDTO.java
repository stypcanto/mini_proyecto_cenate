package com.styp.cenate.dto.bolsas;

import lombok.*;

import jakarta.validation.constraints.NotNull;

/**
 * ✅ DTO para aprobar/rechazar Solicitudes de Bolsa
 * v1.0.0 - Datos necesarios para procesar solicitudes
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AprobacionSolicitudDTO {

    @NotNull(message = "El ID de la solicitud es obligatorio")
    private Long idSolicitud;

    @NotNull(message = "El tipo de acción es obligatorio (aprobar/rechazar)")
    private String accion; // "aprobar" o "rechazar"

    private String notas;

    private String razon;

    private Long responsableId;

    private String responsableNombre;
}

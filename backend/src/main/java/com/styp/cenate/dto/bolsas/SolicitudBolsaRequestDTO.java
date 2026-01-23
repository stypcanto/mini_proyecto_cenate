package com.styp.cenate.dto.bolsas;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para solicitudes de bolsa - Campos mínimos requeridos para importación
 * Utilizado para validar entrada del usuario en PASOS 1 y 2 del formulario
 *
 * @version v1.6.0
 * @since 2026-01-23
 */
public record SolicitudBolsaRequestDTO(
    @NotNull(message = "El ID del tipo de bolsa es obligatorio")
    Long idTipoBolsa,
    @NotNull(message = "El ID del servicio/especialidad es obligatorio")
    Long idServicio,
    @NotBlank(message = "El DNI del paciente es obligatorio")
    String pacienteDni,
    @NotBlank(message = "El código de adscripción (IPRESS) es obligatorio")
    String codigoAdscripcion
) {}

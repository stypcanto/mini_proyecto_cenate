package com.styp.cenate.exception;

import com.styp.cenate.dto.bolsas.SolicitudBolsaDTO;
import lombok.Getter;

/**
 * Excepción lanzada cuando se intenta importar un paciente que ya tiene
 * una asignación activa. Incluye los detalles de la asignación existente
 * para informar al usuario (profesional, fecha, hora).
 */
@Getter
public class PacienteDuplicadoException extends RuntimeException {

    private final SolicitudBolsaDTO asignacionExistente;

    public PacienteDuplicadoException(SolicitudBolsaDTO asignacionExistente) {
        super("El paciente ya tiene una asignación activa en el sistema.");
        this.asignacionExistente = asignacionExistente;
    }
}

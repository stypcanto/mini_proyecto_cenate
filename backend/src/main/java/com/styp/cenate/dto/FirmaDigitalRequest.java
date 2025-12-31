package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 📝 DTO para solicitudes de creación/actualización de firma digital.
 * Usado en formularios de creación y edición de usuarios.
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-30
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FirmaDigitalRequest {

    private Long idPersonal;

    private Boolean entregoToken;

    private String numeroSerieToken;

    private LocalDate fechaEntregaToken;

    private LocalDate fechaInicioCertificado;

    private LocalDate fechaVencimientoCertificado;

    /**
     * Motivo por el cual no entregó token
     * Valores permitidos: YA_TIENE, NO_REQUIERE, PENDIENTE
     */
    private String motivoSinToken;

    private String observaciones;

    // ==========================================================
    // 🔍 Métodos de validación
    // ==========================================================

    /**
     * Valida que los datos del request sean coherentes según reglas de negocio
     *
     * @return true si es válido, false si hay inconsistencias
     */
    public boolean esValido() {
        // Validación 1: Si entregó token, DEBE tener fechas Y número de serie
        if (Boolean.TRUE.equals(entregoToken)) {
            if (fechaInicioCertificado == null || fechaVencimientoCertificado == null) {
                return false;
            }
            if (numeroSerieToken == null || numeroSerieToken.isBlank()) {
                return false;
            }
            // No debe tener motivo si entregó token
            if (motivoSinToken != null) {
                return false;
            }
        }

        // Validación 2: Si NO entregó token, DEBE tener motivo
        if (Boolean.FALSE.equals(entregoToken)) {
            if (motivoSinToken == null || motivoSinToken.isBlank()) {
                return false;
            }
            // No debe tener número de serie si no entregó token
            if (numeroSerieToken != null && !numeroSerieToken.isBlank()) {
                return false;
            }
        }

        // Validación 3: Si motivo es YA_TIENE, DEBE tener fechas del certificado existente
        if ("YA_TIENE".equalsIgnoreCase(motivoSinToken)) {
            if (fechaInicioCertificado == null || fechaVencimientoCertificado == null) {
                return false;
            }
        }

        // Validación 4: Fecha vencimiento > fecha inicio
        if (fechaInicioCertificado != null && fechaVencimientoCertificado != null) {
            if (!fechaVencimientoCertificado.isAfter(fechaInicioCertificado)) {
                return false;
            }
        }

        // Validación 5: Motivo debe ser uno de los valores permitidos
        if (motivoSinToken != null && !motivoSinToken.isBlank()) {
            String motivoUpper = motivoSinToken.toUpperCase();
            if (!motivoUpper.equals("YA_TIENE") &&
                !motivoUpper.equals("NO_REQUIERE") &&
                !motivoUpper.equals("PENDIENTE")) {
                return false;
            }
        }

        return true;
    }

    /**
     * Obtiene mensaje de error de validación
     *
     * @return Mensaje descriptivo del error, o null si es válido
     */
    public String obtenerMensajeError() {
        if (Boolean.TRUE.equals(entregoToken)) {
            if (fechaInicioCertificado == null || fechaVencimientoCertificado == null) {
                return "Si entregó token, debe proporcionar fechas del certificado";
            }
            if (numeroSerieToken == null || numeroSerieToken.isBlank()) {
                return "Si entregó token, debe proporcionar el número de serie";
            }
            if (motivoSinToken != null) {
                return "Si entregó token, no debe tener motivo sin token";
            }
        }

        if (Boolean.FALSE.equals(entregoToken)) {
            if (motivoSinToken == null || motivoSinToken.isBlank()) {
                return "Si no entregó token, debe indicar el motivo";
            }
            if (numeroSerieToken != null && !numeroSerieToken.isBlank()) {
                return "Si no entregó token, no debe tener número de serie";
            }
        }

        if ("YA_TIENE".equalsIgnoreCase(motivoSinToken)) {
            if (fechaInicioCertificado == null || fechaVencimientoCertificado == null) {
                return "Si el motivo es YA_TIENE, debe proporcionar fechas del certificado existente";
            }
        }

        if (fechaInicioCertificado != null && fechaVencimientoCertificado != null) {
            if (!fechaVencimientoCertificado.isAfter(fechaInicioCertificado)) {
                return "La fecha de vencimiento debe ser posterior a la fecha de inicio";
            }
        }

        if (motivoSinToken != null && !motivoSinToken.isBlank()) {
            String motivoUpper = motivoSinToken.toUpperCase();
            if (!motivoUpper.equals("YA_TIENE") &&
                !motivoUpper.equals("NO_REQUIERE") &&
                !motivoUpper.equals("PENDIENTE")) {
                return "Motivo inválido. Debe ser: YA_TIENE, NO_REQUIERE o PENDIENTE";
            }
        }

        return null; // Válido
    }

    /**
     * Verifica si esta solicitud es para una entrega PENDIENTE
     */
    public boolean esPendiente() {
        return "PENDIENTE".equalsIgnoreCase(motivoSinToken);
    }
}

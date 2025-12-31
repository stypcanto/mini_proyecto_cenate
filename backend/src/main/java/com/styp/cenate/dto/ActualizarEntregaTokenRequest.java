package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 🔄 DTO para actualizar entrega de token de firma digital PENDIENTE.
 * Se usa cuando el personal finalmente entrega el token físicamente.
 *
 * Flujo:
 * 1. Se creó firma digital con motivo PENDIENTE
 * 2. Personal entrega el token
 * 3. Admin usa este DTO para registrar la entrega
 * 4. Estado cambia de PENDIENTE a entregado
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-30
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActualizarEntregaTokenRequest {

    /**
     * ID de la firma digital a actualizar
     */
    private Long idFirmaPersonal;

    /**
     * Número de serie del token entregado (OBLIGATORIO)
     */
    private String numeroSerieToken;

    /**
     * Fecha en que se entregó físicamente el token (OBLIGATORIO)
     */
    private LocalDate fechaEntregaToken;

    /**
     * Fecha de inicio del certificado digital (OBLIGATORIO)
     */
    private LocalDate fechaInicioCertificado;

    /**
     * Fecha de vencimiento del certificado digital (OBLIGATORIO)
     */
    private LocalDate fechaVencimientoCertificado;

    /**
     * Observaciones adicionales (OPCIONAL)
     */
    private String observaciones;

    // ==========================================================
    // 🔍 Métodos de validación
    // ==========================================================

    /**
     * Valida que todos los campos obligatorios estén presentes
     *
     * @return true si es válido, false si falta información
     */
    public boolean esValido() {
        // Validar campos obligatorios
        if (numeroSerieToken == null || numeroSerieToken.isBlank()) {
            return false;
        }

        if (fechaEntregaToken == null) {
            return false;
        }

        if (fechaInicioCertificado == null) {
            return false;
        }

        if (fechaVencimientoCertificado == null) {
            return false;
        }

        // Validar coherencia de fechas: vencimiento > inicio
        if (!fechaVencimientoCertificado.isAfter(fechaInicioCertificado)) {
            return false;
        }

        return true;
    }

    /**
     * Obtiene mensaje de error de validación
     *
     * @return Mensaje descriptivo del error, o null si es válido
     */
    public String obtenerMensajeError() {
        if (numeroSerieToken == null || numeroSerieToken.isBlank()) {
            return "El número de serie del token es obligatorio";
        }

        if (fechaEntregaToken == null) {
            return "La fecha de entrega del token es obligatoria";
        }

        if (fechaInicioCertificado == null) {
            return "La fecha de inicio del certificado es obligatoria";
        }

        if (fechaVencimientoCertificado == null) {
            return "La fecha de vencimiento del certificado es obligatoria";
        }

        if (!fechaVencimientoCertificado.isAfter(fechaInicioCertificado)) {
            return "La fecha de vencimiento debe ser posterior a la fecha de inicio";
        }

        return null; // Válido
    }

    /**
     * Normaliza el número de serie (trim y uppercase)
     */
    public void normalizarDatos() {
        if (numeroSerieToken != null) {
            numeroSerieToken = numeroSerieToken.trim().toUpperCase();
        }
        if (observaciones != null) {
            observaciones = observaciones.trim();
        }
    }
}

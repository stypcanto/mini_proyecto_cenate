package com.styp.cenate.dto.teleekgs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

/**
 * DTO para guardar nota clínica de una imagen ECG
 * v3.0.0 - Nuevo - Complemento a evaluación médica
 *
 * @author Styp Canto Rondón
 * @since 2026-01-21
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotaClinicaDTO {

    /**
     * Hallazgos clínicos detectados
     * Estructura: { "ritmo": true, "frecuencia": false, "intervaloPR": true, ... }
     * Campos posibles: ritmo, frecuencia, intervaloPR, duracionQRS, segmentoST, ondaT, eje
     */
    private Map<String, Boolean> hallazgos;

    /**
     * Observaciones clínicas libres
     * Máximo: 2000 caracteres
     * Opcional: Puede estar vacío o nulo
     */
    private String observacionesClinicas;

    /**
     * Plan de seguimiento del paciente
     * Estructura:
     * {
     *   "seguimientoMeses": true,
     *   "seguimientoDias": 6,
     *   "derivarCardiologo": false,
     *   "hospitalizar": true,
     *   "medicamentos": false,
     *   "otrosPlan": "Descripción adicional"
     * }
     */
    private Map<String, Object> planSeguimiento;
}

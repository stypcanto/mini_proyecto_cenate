package com.styp.cenate.dto.teleekgs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ✅ v11.0.0: DTO para crear bolsa de seguimiento (Recita o Interconsulta) desde TeleECG
 * Request body para: POST /api/teleekgs/{idImagen}/crear-bolsa-seguimiento
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-02-10
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrearBolsaSeguimientoRequest {

    /**
     * Tipo de bolsa a crear: "RECITA" o "INTERCONSULTA"
     */
    private String tipo;

    /**
     * Especialidad asociada a la bolsa
     * Ej: "Cardiología", "Neurología", etc.
     */
    private String especialidad;

    /**
     * Número de días para la cita preferida (solo para RECITA)
     * Ej: 90 (3 meses), 30 (1 mes)
     * Para INTERCONSULTA, puede ser null
     */
    private Integer dias;

}

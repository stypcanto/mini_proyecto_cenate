package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 📊 DTO con resultado de una sincronización disponibilidad → horario.
 *
 * Contiene estadísticas del proceso de sincronización:
 * - IDs de registros involucrados
 * - Tipo de operación (CREACION/ACTUALIZACION)
 * - Resultado (EXITOSO/FALLIDO/PARCIAL)
 * - Estadísticas de turnos procesados
 * - Mensajes de error si aplica
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SincronizacionResultadoDTO {

    /**
     * ID de la disponibilidad sincronizada
     */
    private Long idDisponibilidad;

    /**
     * ID del horario generado/actualizado
     */
    private Long idHorario;

    /**
     * Tipo de operación: CREACION o ACTUALIZACION
     */
    private String tipoOperacion;

    /**
     * Resultado: EXITOSO, FALLIDO, PARCIAL
     */
    private String resultado;

    /**
     * Periodo del horario (AAAAMM)
     */
    private String periodo;

    /**
     * Nombre del personal
     */
    private String nombrePersonal;

    /**
     * Área donde se sincronizó
     */
    private String nombreArea;

    /**
     * Total de detalles procesados
     */
    private Integer detallesProcesados;

    /**
     * Detalles creados exitosamente
     */
    private Integer detallesCreados;

    /**
     * Detalles con errores
     */
    private Integer detallesConError;

    /**
     * Total de horas sincronizadas
     */
    private BigDecimal horasSincronizadas;

    /**
     * Mensaje descriptivo del resultado
     */
    private String mensaje;

    /**
     * Errores encontrados (si resultado != EXITOSO)
     */
    private String errores;

    /**
     * ID del log generado
     */
    private Long idSincronizacionLog;
}

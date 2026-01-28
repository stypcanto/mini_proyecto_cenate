package com.styp.cenate.dto.bolsas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * DTO para reportar duplicados detectados y consolidados en importación Excel
 * Usado en modal de confirmación con datos de deduplicación
 *
 * @version v1.0.0 (2026-01-28)
 * @since Importación v2.2.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteDuplicadosDTO {

    /**
     * Total de filas en el Excel (incluyendo header)
     */
    private Integer totalFilas;

    /**
     * Filas con DNI únicos (serán importadas)
     */
    private Integer filasUnicas;

    /**
     * Filas con DNI duplicados (serán descartadas)
     */
    private Integer filasDuplicadas;

    /**
     * Tasa de duplicidad: (filasDuplicadas / totalFilas) * 100
     */
    private Double tasaDuplicidad;

    /**
     * Detalles de cada DNI duplicado encontrado
     * Estructura: { dni: "12345678", filas: [2, 15, 47], primerRegistroMantenido: 2 }
     */
    private List<Map<String, Object>> duplicadosDetalle;

    /**
     * Estrategia aplicada: KEEP_FIRST, REJECT, UPDATE
     */
    private String estrategia;

    /**
     * Mensaje resumen para el usuario
     * Ej: "Se descartaron 49 filas con DNI duplicados. Se mantuvieron 400 registros únicos."
     */
    private String mensajeResumen;

    /**
     * Flag: ¿Hay duplicados detectados?
     */
    private Boolean hayDuplicados;

    /**
     * Timestamp de detección
     */
    private String fechaDeteccion;

}

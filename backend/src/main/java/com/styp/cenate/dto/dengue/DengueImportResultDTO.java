package com.styp.cenate.dto.dengue;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO que contiene los resultados de una importación de Excel Dengue
 *
 * Respuesta que se envía al frontend con estadísticas de:
 * - Registros procesados
 * - Insertados
 * - Actualizados
 * - Errores con detalles
 * - Tiempo de ejecución
 *
 * @version 1.0.0
 * @since 2026-01-29
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DengueImportResultDTO {

    private Boolean exitoso;                    // true si no hay errores críticos
    private Integer totalProcesados;            // Total de filas en el Excel
    private Integer insertados;                 // Nuevos registros creados
    private Integer actualizados;               // Registros existentes actualizados
    private Integer errores;                    // Filas que generaron error

    @Builder.Default
    private List<String> mensajesError = new ArrayList<>();  // Detalles de errores

    private Long tiempoMs;                      // Tiempo de ejecución en milisegundos

    /**
     * Calcula el porcentaje de éxito
     * @return Porcentaje de registros procesados exitosamente (0-100)
     */
    public Double getPorcentajeExito() {
        if (totalProcesados == null || totalProcesados == 0) {
            return 0.0;
        }
        int exitosos = (insertados != null ? insertados : 0) + (actualizados != null ? actualizados : 0);
        return (exitosos * 100.0) / totalProcesados;
    }

    /**
     * Agrega mensaje de error a la lista
     * @param mensaje Mensaje a agregar
     */
    public void agregarError(String mensaje) {
        if (this.mensajesError == null) {
            this.mensajesError = new ArrayList<>();
        }
        this.mensajesError.add(mensaje);
    }

}

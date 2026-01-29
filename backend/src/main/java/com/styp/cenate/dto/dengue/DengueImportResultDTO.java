package com.styp.cenate.dto.dengue;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO para reportar resultados de importación de dengue
 *
 * @version 1.0.0
 * @since 2026-01-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DengueImportResultDTO {

    private Boolean exitoso;              // ¿Fue exitosa la carga?
    private Integer totalProcesados;      // Total de filas procesadas
    private Integer insertados;           // Registros insertados
    private Integer actualizados;         // Registros actualizados (deduplicados)
    private Integer errores;              // Total de errores
    private Long tiempoMs;                // Tiempo de procesamiento en ms
    
    @Builder.Default
    private List<String> mensajesError = new ArrayList<>();

    /**
     * Agrega un error a la lista
     */
    public void agregarError(String mensaje) {
        if (this.mensajesError == null) {
            this.mensajesError = new ArrayList<>();
        }
        this.mensajesError.add(mensaje);
    }

    /**
     * Obtiene tasa de éxito (0-100)
     */
    public Double getTasaExito() {
        if (totalProcesados == null || totalProcesados == 0) {
            return 0.0;
        }
        return ((double) (insertados + actualizados) / totalProcesados) * 100;
    }
}

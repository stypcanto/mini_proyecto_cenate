package com.styp.cenate.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO de request para sincronizar disponibilidad con sistema de horarios chatbot.
 * 
 * @author Ing. Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SincronizacionRequestDTO {

    /**
     * ID de la disponibilidad a sincronizar
     */
    @NotNull(message = "El ID de disponibilidad es obligatorio")
    private Long idDisponibilidad;

    /**
     * Tipo de operación de sincronización
     * CREACION: Crear nuevo ctr_horario
     * ACTUALIZACION: Actualizar ctr_horario existente
     */
    @NotNull(message = "El tipo de operación es obligatorio")
    private TipoOperacionSincronizacion tipoOperacion;

    /**
     * Si es true, sobrescribe los horarios existentes en caso de conflicto
     * Si es false, lanza error si detecta conflictos
     */
    @Builder.Default
    private Boolean forzarSobrescritura = false;

    /**
     * Filtros opcionales para sincronización parcial
     */
    private FiltroSincronizacionDTO filtros;

    /**
     * Enum para tipos de operación
     */
    public enum TipoOperacionSincronizacion {
        CREACION,
        ACTUALIZACION
    }

    /**
     * DTO para filtros de sincronización parcial
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FiltroSincronizacionDTO {
        
        /**
         * Lista de fechas específicas a sincronizar (opcional)
         * Si es null, sincroniza todos los días
         */
        private List<String> fechasEspecificas;  // Formato: "YYYY-MM-DD"

        /**
         * Lista de tipos de turno a sincronizar (opcional)
         * Valores: M, T, MT
         */
        private List<String> tiposTurno;
    }
}

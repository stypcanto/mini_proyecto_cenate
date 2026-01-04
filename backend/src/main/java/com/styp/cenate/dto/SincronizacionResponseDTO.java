package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO de respuesta de sincronización con sistema de horarios chatbot.
 * Incluye detalles de la operación y resultados.
 * 
 * @author Ing. Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SincronizacionResponseDTO {

    /**
     * ID de la disponibilidad sincronizada
     */
    private Long idDisponibilidad;

    /**
     * ID del registro de sincronización en la tabla log
     */
    private Long idSincronizacion;

    /**
     * ID del ctr_horario generado/actualizado
     */
    private Long idCtrHorario;

    /**
     * Tipo de operación realizada
     */
    private String tipoOperacion;  // CREACION, ACTUALIZACION

    /**
     * Resultado de la sincronización
     */
    private ResultadoSincronizacion resultado;

    /**
     * Mensaje descriptivo del resultado
     */
    private String mensaje;

    /**
     * Fecha en que se realizó la sincronización
     */
    private OffsetDateTime fechaSincronizacion;

    /**
     * Usuario que ejecutó la sincronización
     */
    private String usuarioSincronizacion;

    /**
     * Detalles de la operación
     */
    private DetallesOperacionDTO detalles;

    /**
     * Lista de errores (si resultado = FALLIDO o PARCIAL)
     */
    private List<String> errores;

    /**
     * Advertencias durante la sincronización
     */
    private List<String> advertencias;

    /**
     * Enum para resultado de sincronización
     */
    public enum ResultadoSincronizacion {
        EXITOSO,
        PARCIAL,
        FALLIDO
    }

    /**
     * DTO con detalles de la operación de sincronización
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetallesOperacionDTO {

        /**
         * Total de días a sincronizar
         */
        private Integer totalDias;

        /**
         * Días sincronizados exitosamente
         */
        private Integer diasSincronizados;

        /**
         * Días con errores
         */
        private Integer diasConErrores;

        /**
         * Total de slots generados en ctr_horario_det
         */
        private Integer slotsGenerados;

        /**
         * Mapeo de turnos
         * Ej: {"M": "158", "T": "131", "MT": "200A"}
         */
        private Map<String, String> mapeoTurnos;

        /**
         * Periodo sincronizado
         */
        private String periodo;

        /**
         * Información del médico
         */
        private String nombreMedico;

        /**
         * Información del servicio
         */
        private String nombreServicio;

        /**
         * Total de horas sincronizadas
         */
        private String totalHorasSincronizadas;
    }

    /**
     * Verifica si la sincronización fue exitosa
     */
    public boolean esExitosa() {
        return ResultadoSincronizacion.EXITOSO.equals(this.resultado);
    }

    /**
     * Verifica si la sincronización fue parcial
     */
    public boolean esParcial() {
        return ResultadoSincronizacion.PARCIAL.equals(this.resultado);
    }

    /**
     * Verifica si la sincronización falló completamente
     */
    public boolean esFallida() {
        return ResultadoSincronizacion.FALLIDO.equals(this.resultado);
    }
}

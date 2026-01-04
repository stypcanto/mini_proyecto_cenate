package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para el estado de adherencia al tratamiento
 * Incluye cálculo de porcentaje y clasificación por semáforo
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdherenciaEstadoDTO {

    // Datos generales
    private Long idAtencion;
    private String pkAsegurado;

    // Estadísticas
    private Long totalDosis; // Total de dosis programadas
    private Long dosisTomadas; // Dosis efectivamente tomadas
    private Double porcentajeAdherencia; // Porcentaje (0-100)

    // Clasificación por semáforo
    private NivelAdherencia nivelAdherencia;

    // Detalles adicionales
    private Integer diasMonitoreados;
    private String ultimaTomaRegistrada; // Fecha de la última toma

    /**
     * Enum para clasificar adherencia según porcentaje
     * - ALTA: >= 80% (Verde) ✅
     * - MEDIA: >= 50% y < 80% (Amarillo) ⚠️
     * - BAJA: < 50% (Rojo) ❌
     * - SIN_DATOS: No hay registros
     */
    public enum NivelAdherencia {
        ALTA("ALTA", "Adherencia alta", "bg-green-100", "text-green-800", "border-green-300", "✅"),
        MEDIA("MEDIA", "Adherencia media", "bg-yellow-100", "text-yellow-800", "border-yellow-300", "⚠️"),
        BAJA("BAJA", "Adherencia baja", "bg-red-100", "text-red-800", "border-red-300", "❌"),
        SIN_DATOS("SIN_DATOS", "Sin datos", "bg-gray-100", "text-gray-600", "border-gray-300", "—");

        private final String codigo;
        private final String descripcion;
        private final String bgColor;
        private final String textColor;
        private final String borderColor;
        private final String emoji;

        NivelAdherencia(String codigo, String descripcion, String bgColor, String textColor, String borderColor,
                String emoji) {
            this.codigo = codigo;
            this.descripcion = descripcion;
            this.bgColor = bgColor;
            this.textColor = textColor;
            this.borderColor = borderColor;
            this.emoji = emoji;
        }

        public String getCodigo() {
            return codigo;
        }

        public String getDescripcion() {
            return descripcion;
        }

        public String getBgColor() {
            return bgColor;
        }

        public String getTextColor() {
            return textColor;
        }

        public String getBorderColor() {
            return borderColor;
        }

        public String getEmoji() {
            return emoji;
        }

        /**
         * Determinar nivel de adherencia según porcentaje
         */
        public static NivelAdherencia fromPorcentaje(Double porcentaje) {
            if (porcentaje == null) {
                return SIN_DATOS;
            }
            if (porcentaje >= 80.0) {
                return ALTA;
            } else if (porcentaje >= 50.0) {
                return MEDIA;
            } else {
                return BAJA;
            }
        }
    }
}

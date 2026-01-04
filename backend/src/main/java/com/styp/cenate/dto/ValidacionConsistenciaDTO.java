package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * DTO para validar consistencia entre disponibilidad declarada y horarios en chatbot.
 * Usado para auditoría y detección de discrepancias.
 * 
 * @author Ing. Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidacionConsistenciaDTO {

    /**
     * ID de la disponibilidad validada
     */
    private Long idDisponibilidad;

    /**
     * Información del médico
     */
    private Long idPers;
    private String nombreMedico;

    /**
     * Información del servicio
     */
    private Long idServicio;
    private String nombreServicio;

    /**
     * Periodo
     */
    private String periodo;

    /**
     * Estado de la disponibilidad
     */
    private String estado;

    /**
     * Horas declaradas en disponibilidad_medica
     */
    private BigDecimal horasAsistencialesDeclaradas;
    private BigDecimal horasSanitariasDeclaradas;
    private BigDecimal horasTotalesDeclaradas;

    /**
     * Horas cargadas en ctr_horario (chatbot)
     */
    private BigDecimal horasCargadasChatbot;
    private Integer slotsCargadosChatbot;

    /**
     * Análisis de diferencias
     */
    private BigDecimal diferenciaHoras;
    private BigDecimal porcentajeDiferencia;
    private EstadoValidacion estadoValidacion;

    /**
     * Información de sincronización
     */
    private Long idCtrHorarioGenerado;
    private OffsetDateTime fechaSincronizacion;
    private OffsetDateTime ultimaSincronizacion;
    private String resultadoUltimaSincronizacion;

    /**
     * Discrepancias detectadas
     */
    private List<DiscrepanciaDTO> discrepancias;

    /**
     * Recomendaciones de acción
     */
    private List<String> recomendaciones;

    /**
     * Enum para estado de validación
     */
    public enum EstadoValidacion {
        CONSISTENTE,             // Diferencia < 10 horas
        DIFERENCIA_SIGNIFICATIVA, // Diferencia >= 10 horas
        SIN_HORARIO_CARGADO,     // No hay horarios en chatbot
        ERROR_VALIDACION          // Error durante validación
    }

    /**
     * DTO para discrepancias individuales
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DiscrepanciaDTO {
        private String tipo;  // DIFERENCIA_HORAS, TURNO_FALTANTE, SLOT_DUPLICADO, etc.
        private String descripcion;
        private String severidad;  // CRITICA, ALTA, MEDIA, BAJA
        private String fechaAfectada;
        private String accionSugerida;
    }

    /**
     * Calcula el porcentaje de diferencia
     */
    public void calcularPorcentajeDiferencia() {
        if (horasTotalesDeclaradas != null && horasTotalesDeclaradas.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal diff = horasTotalesDeclaradas.subtract(
                horasCargadasChatbot != null ? horasCargadasChatbot : BigDecimal.ZERO
            ).abs();
            
            this.porcentajeDiferencia = diff
                .multiply(BigDecimal.valueOf(100))
                .divide(horasTotalesDeclaradas, 2, java.math.RoundingMode.HALF_UP);
        } else {
            this.porcentajeDiferencia = BigDecimal.ZERO;
        }
    }

    /**
     * Determina el estado de validación basado en la diferencia
     */
    public void determinarEstadoValidacion() {
        if (idCtrHorarioGenerado == null) {
            this.estadoValidacion = EstadoValidacion.SIN_HORARIO_CARGADO;
        } else if (diferenciaHoras != null && diferenciaHoras.abs().compareTo(BigDecimal.TEN) > 0) {
            this.estadoValidacion = EstadoValidacion.DIFERENCIA_SIGNIFICATIVA;
        } else {
            this.estadoValidacion = EstadoValidacion.CONSISTENTE;
        }
    }

    /**
     * Verifica si requiere resincronización
     */
    public boolean requiereResincronizacion() {
        return EstadoValidacion.DIFERENCIA_SIGNIFICATIVA.equals(this.estadoValidacion)
            || EstadoValidacion.SIN_HORARIO_CARGADO.equals(this.estadoValidacion);
    }
}

package com.styp.cenate.dto.teleconsultorio;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la configuración completa de horarios de teleconsultorio
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeleconsultorioConfigDTO {

    /**
     * ID de la solicitud de turno
     */
    private Long idSolicitud;

    /**
     * Días de atención seleccionados (LUN, MAR, MIE, etc.)
     */
    private List<String> dias;

    /**
     * Tipo de horario (laborables, todos)
     */
    private String tipo;

    /**
     * Configuración de horarios de mañana
     */
    private TurnoConfigDTO horariosManana;

    /**
     * Configuración de horarios de tarde
     */
    private TurnoConfigDTO horariosTarde;

    /**
     * Total de horas configuradas
     */
    private Integer totalHoras;

    /**
     * Observaciones generales
     */
    private String observaciones;

    /**
     * DTO interno para configuración de turnos
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TurnoConfigDTO {
        /**
         * Tipo de turno (MANANA, TARDE)
         */
        private String tipo;

        /**
         * Lista de horas seleccionadas (formato "HH:00")
         */
        private List<String> horas;

        /**
         * Cantidad de horas
         */
        private Integer cantidad;

        /**
         * Activo o no
         */
        @Builder.Default
        private Boolean activo = false;

        /**
         * Observaciones específicas del turno
         */
        private String observaciones;
    }

    // ==========================================================
    // Métodos utilitarios
    // ==========================================================

    /**
     * Calcula el total de horas basado en la configuración
     */
    public Integer calcularTotalHoras() {
        int total = 0;
        
        if (horariosManana != null && horariosManana.getActivo() && horariosManana.getHoras() != null) {
            total += horariosManana.getHoras().size();
        }
        
        if (horariosTarde != null && horariosTarde.getActivo() && horariosTarde.getHoras() != null) {
            total += horariosTarde.getHoras().size();
        }
        
        this.totalHoras = total;
        return total;
    }

    /**
     * Verifica si hay configuración válida
     */
    public boolean isConfiguracionValida() {
        return dias != null && !dias.isEmpty() && 
               (isMananaActiva() || isTardeActiva()) &&
               calcularTotalHoras() > 0;
    }

    /**
     * Verifica si el turno de mañana está activo
     */
    public boolean isMananaActiva() {
        return horariosManana != null && horariosManana.getActivo() && 
               horariosManana.getHoras() != null && !horariosManana.getHoras().isEmpty();
    }

    /**
     * Verifica si el turno de tarde está activo
     */
    public boolean isTardeActiva() {
        return horariosTarde != null && horariosTarde.getActivo() && 
               horariosTarde.getHoras() != null && !horariosTarde.getHoras().isEmpty();
    }

    /**
     * Obtiene resumen de la configuración
     */
    public String getResumen() {
        if (!isConfiguracionValida()) {
            return "Sin configuración";
        }
        
        StringBuilder resumen = new StringBuilder();
        resumen.append(dias.size()).append(" días, ");
        
        if (isMananaActiva()) {
            resumen.append(horariosManana.getHoras().size()).append("h mañana");
            if (isTardeActiva()) {
                resumen.append(" + ");
            }
        }
        
        if (isTardeActiva()) {
            resumen.append(horariosTarde.getHoras().size()).append("h tarde");
        }
        
        resumen.append(" = ").append(totalHoras).append("h total");
        
        return resumen.toString();
    }
}
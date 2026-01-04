package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 📊 DTO de resumen de disponibilidad vs horario chatbot (para listado por periodo).
 *
 * Usado en el componente ComparativoDisponibilidadHorario.jsx para mostrar
 * un resumen de todas las disponibilidades de un periodo y su estado de
 * sincronización con el sistema chatbot.
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumenDisponibilidadPeriodoDTO {

    /**
     * ID de la disponibilidad
     */
    private Long idDisponibilidad;

    /**
     * Nombre completo del médico
     */
    private String nombreMedico;

    /**
     * CMP del médico
     */
    private String cmpMedico;

    /**
     * Nombre de la especialidad
     */
    private String especialidad;

    /**
     * Horas totales declaradas por el médico
     */
    private Double horasDeclaradas;

    /**
     * Horas sincronizadas en el chatbot (0 si no está sincronizado)
     */
    private Double horasChatbot;

    /**
     * Estado de la disponibilidad: BORRADOR, ENVIADO, REVISADO, SINCRONIZADO
     */
    private String estadoSincronizacion;

    /**
     * Indica si hay inconsistencia entre horas declaradas y chatbot
     * (diferencia mayor a 1 hora)
     */
    private Boolean tieneInconsistencia;

    /**
     * Cantidad de slots (días) generados en el chatbot
     */
    private Integer slotsGenerados;

    /**
     * ID del área donde se sincronizó (null si no está sincronizado)
     */
    private Long idArea;

    /**
     * Nombre del área donde se sincronizó
     */
    private String nombreArea;
}

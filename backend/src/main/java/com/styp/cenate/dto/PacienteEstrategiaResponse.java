package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO: Respuesta con información de asignación de estrategia a paciente
 *
 * Se utiliza en:
 *  - PacienteEstrategiaController.asignarEstrategia()
 *  - PacienteEstrategiaController.obtenerEstrategiasActivas()
 *  - PacienteEstrategiaController.obtenerHistorialEstrategias()
 *
 * Contiene todos los datos de la asignación formateados para el cliente
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PacienteEstrategiaResponse {

    /**
     * ID único de la asignación
     */
    private Long idAsignacion;

    /**
     * ID del paciente (asegurado)
     */
    private String pkAsegurado;

    /**
     * ID de la estrategia
     */
    private Long idEstrategia;

    /**
     * Sigla de la estrategia (ej: CENACRON, TELECAM, TELETARV)
     */
    private String estrategiaSigla;

    /**
     * Descripción de la estrategia
     */
    private String estrategiaDescripcion;

    /**
     * Estado actual (ACTIVO, INACTIVO, COMPLETADO)
     */
    private String estado;

    /**
     * Fecha de inicio de la asignación
     */
    private LocalDateTime fechaAsignacion;

    /**
     * Fecha de desvinculación (NULL si sigue activo)
     */
    private LocalDateTime fechaDesvinculacion;

    /**
     * Días que el paciente estuvo/está en la estrategia
     */
    private Long diasEnEstrategia;

    /**
     * Observación de por qué se desvincló (si aplica)
     */
    private String observacionDesvinculacion;

    /**
     * Usuario que realizó la asignación
     */
    private String usuarioAsignoNombre;

    /**
     * ID del usuario que asignó
     */
    private Long idUsuarioAsigno;
}

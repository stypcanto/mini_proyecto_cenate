package com.styp.cenate.dto.mesaayuda;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * DTO para responder/devolver datos de un ticket de Mesa de Ayuda
 * Utilizado en las respuestas de los endpoints GET y PUT
 * Incluye solo los campos necesarios para el frontend (sin datos sensibles)
 *
 * @author Styp Canto Rondón
 * @version v1.64.0 (2026-02-18)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketMesaAyudaResponseDTO {

    /**
     * ID único del ticket
     */
    private Long id;

    /**
     * Título del ticket
     */
    private String titulo;

    /**
     * Descripción del problema
     */
    private String descripcion;

    /**
     * Estado actual: ABIERTO, EN_PROCESO, RESUELTO, CERRADO
     */
    private String estado;

    /**
     * Prioridad: ALTA, MEDIA, BAJA
     */
    private String prioridad;

    /**
     * Nombre del médico que creó el ticket
     */
    private String nombreMedico;

    /**
     * DNI del paciente relacionado (si aplica)
     */
    private String dniPaciente;

    /**
     * Nombre del paciente relacionado (si aplica)
     */
    private String nombrePaciente;

    /**
     * Especialidad médica relacionada
     */
    private String especialidad;

    /**
     * IPRESS del paciente
     */
    private String ipress;

    /**
     * Respuesta del personal de Mesa de Ayuda
     */
    private String respuesta;

    /**
     * Nombre del personal que respondió
     */
    private String nombrePersonalMesa;

    /**
     * Timestamp de creación del ticket
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime fechaCreacion;

    /**
     * Timestamp de la respuesta
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime fechaRespuesta;

    /**
     * Timestamp de última actualización
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime fechaActualizacion;

    /**
     * Tiempo transcurrido desde creación (en horas, para UI)
     * Calculado en el backend
     */
    private Long horasDesdeCreacion;

    /**
     * ID del motivo predefinido (NUEVO v1.64.0)
     */
    private Long idMotivo;

    /**
     * Descripción del motivo (NUEVO v1.64.0)
     * Se utiliza como nombre legible del motivo
     */
    private String nombreMotivo;

    /**
     * Observaciones adicionales del médico (NUEVO v1.64.0)
     */
    private String observaciones;
}

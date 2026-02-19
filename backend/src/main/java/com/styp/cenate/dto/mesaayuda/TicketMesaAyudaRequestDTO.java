package com.styp.cenate.dto.mesaayuda;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para crear un nuevo ticket de Mesa de Ayuda
 * Utilizado por médicos cuando crean un ticket desde MisPacientes
 *
 * @author Styp Canto Rondón
 * @version v1.64.0 (2026-02-18)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketMesaAyudaRequestDTO {

    /**
     * Título del ticket (requerido)
     * Ejemplo: "Error al cargar paciente", "Consulta sobre funcionalidad"
     */
    @NotBlank(message = "El título del ticket es requerido")
    private String titulo;

    /**
     * Descripción detallada del problema (requerido)
     * Campo de texto libre para describir el problema o solicitud
     */
    @NotBlank(message = "La descripción del ticket es requerida")
    private String descripcion;

    /**
     * Prioridad del ticket: ALTA, MEDIA, BAJA
     * Por defecto MEDIA si no se especifica
     */
    @NotBlank(message = "La prioridad es requerida")
    private String prioridad; // ALTA, MEDIA, BAJA

    /**
     * ID del médico que crea el ticket
     * Se obtiene de la sesión actual
     */
    @NotNull(message = "El ID del médico es requerido")
    private Long idMedico;

    /**
     * Nombre del médico (se completa automáticamente)
     * Se puede enviar desde el frontend o completar en backend
     */
    private String nombreMedico;

    /**
     * ID de la solicitud de bolsa del paciente (opcional)
     * Vincula el ticket a un paciente específico
     */
    private Long idSolicitudBolsa;

    /**
     * Tipo de documento del paciente (DNI, CE, PASAPORTE, etc.)
     */
    private String tipoDocumento;

    /**
     * DNI del paciente (opcional)
     * Se pre-carga si el ticket se crea desde MisPacientes
     */
    private String dniPaciente;

    /**
     * Nombre del paciente (opcional, denormalizado)
     */
    private String nombrePaciente;

    /**
     * Especialidad médica (opcional, denormalizado)
     * Se obtiene del contexto del médico o de la solicitud de bolsa
     */
    private String especialidad;

    /**
     * IPRESS del paciente (opcional, denormalizado)
     * Se obtiene de la solicitud de bolsa si está disponible
     */
    private String ipress;

    /**
     * ID del motivo predefinido (NUEVO v1.64.0)
     * Si se especifica, el título se genera automáticamente desde el motivo
     */
    private Long idMotivo;

    /**
     * Observaciones adicionales (NUEVO v1.64.0)
     * Reemplaza a "descripcion" cuando se utiliza el sistema de motivos
     */
    private String observaciones;
}

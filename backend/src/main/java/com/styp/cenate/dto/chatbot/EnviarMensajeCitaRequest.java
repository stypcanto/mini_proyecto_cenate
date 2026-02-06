package com.styp.cenate.dto.chatbot;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO para solicitar envío de mensaje de cita a paciente
 * Contiene todos los datos necesarios para generar y enviar el mensaje
 *
 * @version v1.0.0 (2026-02-06)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnviarMensajeCitaRequest {

    /**
     * Identificador de la solicitud de bolsa
     */
    @NotNull(message = "idSolicitud no puede ser nulo")
    private Long idSolicitud;

    /**
     * Nombre completo del paciente (ej: "HUAMAN ROMERO EZEQUIEL")
     */
    @NotBlank(message = "nombrePaciente no puede estar vacío")
    private String nombrePaciente;

    /**
     * Teléfono del paciente para envío de WhatsApp/SMS
     * (ej: "987654321" o "51987654321")
     */
    @NotBlank(message = "telefonoPaciente no puede estar vacío")
    private String telefonoPaciente;

    /**
     * Nombre del médico asignado
     * (ej: "Dr. ALEGRIA EDMUNDO")
     */
    @NotBlank(message = "nombreMedico no puede estar vacío")
    private String nombreMedico;

    /**
     * Especialidad del médico
     * (ej: "MED.INTERNA", "CARDIOLOGIA", etc.)
     */
    @NotBlank(message = "especialidad no puede estar vacío")
    private String especialidad;

    /**
     * Fecha de la cita
     * (ej: 2026-02-07)
     */
    @NotNull(message = "fechaAtencion no puede ser nula")
    private LocalDate fechaAtencion;

    /**
     * Hora de inicio de la cita
     * (ej: 10:00)
     */
    @NotNull(message = "horaAtencion no puede ser nula")
    private LocalTime horaAtencion;

    /**
     * Hora de fin de la cita (opcional)
     * Si no se proporciona, se calcula como horaAtencion + 55 minutos
     * (ej: 11:55)
     */
    private LocalTime horaFin;

    /**
     * Canal de envío: "WHATSAPP", "SMS" o "EMAIL"
     * Por defecto: "WHATSAPP"
     */
    @Builder.Default
    private String canal = "WHATSAPP";

    /**
     * Email del paciente (solo requerido si canal es EMAIL)
     */
    private String emailPaciente;

    /**
     * Indicador si enviar también al coordinador
     * Por defecto: false
     */
    @Builder.Default
    private Boolean enviarAlCoordinador = false;

    /**
     * Email del coordinador (solo si enviarAlCoordinador es true)
     */
    private String emailCoordinador;

    /**
     * Notas adicionales o personalizaciones
     */
    private String notasAdicionales;
}

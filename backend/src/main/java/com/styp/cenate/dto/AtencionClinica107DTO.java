package com.styp.cenate.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 📦 AtencionClinica107DTO - Data Transfer Object
 * Propósito: Transferencia de datos de atenciones clínicas al frontend
 * Módulo: 107
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtencionClinica107DTO {
    // 🆔 Identificación
    private Long idSolicitud;
    private String numeroSolicitud;
    private Long idBolsa;
    private Boolean activo;

    // 👤 Datos del Paciente
    private String pacienteId;
    private String pacienteNombre;
    private String pacienteDni;
    private String tipoDocumento;
    private String pacienteSexo;
    private LocalDate fechaNacimiento;
    private Integer pacienteEdad;
    private String pacienteTelefono;
    private String pacienteEmail;
    private String pacienteTelefonoAlterno;

    // 🏥 IPRESS
    private String codigoAdscripcion;
    private Long idIpress;
    private String codigoIpress;
    private String ipressNombre; // 🆕 Nombre/descripción de la IPRESS

    // 🏷️ Derivación Interna
    private String derivacionInterna;

    // � Información adicional
    private String especialidad;
    private String tipoCita;
    private Long idServicio;

    // 📌 Estado y Trazabilidad
    private Long estadoGestionCitasId;
    private String estado;
    private String estadoDescripcion; // 🆕 Descripción del estado desde dim_estados_gestion_citas
    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaActualizacion;
    private Long responsableGestoraId;
    private LocalDateTime fechaAsignacion;

    // 🕐 Datos de Atención Programada
    private LocalDate fechaAtencion;
    private String horaAtencion;
    private Long idPersonal;
}

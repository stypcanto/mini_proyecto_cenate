package com.styp.cenate.dto.bolsas;

import lombok.*;

import java.time.OffsetDateTime;

/**
 * 📋 DTO para Solicitud de Bolsa
 * v1.0.0 - Data Transfer Object para solicitudes
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class SolicitudBolsaDTO {

    private Long idSolicitud;

    private String numeroSolicitud;

    private Long aseguradoId;

    private String pacienteNombre;

    private String pacienteDni;

    private String pacienteTelefono;

    private String pacienteEmail;

    private String especialidad;

    private Long idBolsa;

    private String nombreBolsa;

    private String estado; // PENDIENTE, APROBADA, RECHAZADA

    private String razonRechazo;

    private String notasAprobacion;

    private Long solicitanteId;

    private String solicitanteNombre;

    private Long responsableAprobacionId;

    private String responsableAprobacionNombre;

    private Long responsableGestoraId;

    private String responsableGestoraNombre;

    private OffsetDateTime fechaAsignacion;

    private Long estadoGestionCitasId;

    private Boolean recordatorioEnviado;

    private OffsetDateTime fechaSolicitud;

    private OffsetDateTime fechaAprobacion;

    private OffsetDateTime fechaActualizacion;

    private Boolean activo;

    private Integer diasDesdeCreacion;
}

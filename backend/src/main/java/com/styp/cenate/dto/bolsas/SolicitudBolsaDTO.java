package com.styp.cenate.dto.bolsas;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * DTO para respuestas de solicitudes de bolsa
 * Mapea todos los 43 campos de la tabla dim_solicitud_bolsa incluyendo:
 * - 10 campos de Excel v1.8.0 (tipo_documento, sexo, telefono, etc.)
 * - 2 campos v1.9.0 (fecha_cita, fecha_atencion)
 * - Campos enriquecidos desde otras tablas (IPRESS, Red, TipoBolsa)
 *
 * @version v1.8.0 (Completo con campos Excel v1.8.0 + v1.9.0)
 * @since 2026-01-26
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudBolsaDTO {
    // ============ CAMPOS DE BD ============

    // 🔑 IDENTIFICACIÓN
    @JsonProperty("id_solicitud")
    private Long idSolicitud;

    @JsonProperty("numero_solicitud")
    private String numeroSolicitud;

    // 👤 DATOS PACIENTE (de BD)
    @JsonProperty("paciente_id")
    private Long pacienteId;

    @JsonProperty("paciente_nombre")
    private String pacienteNombre;

    @JsonProperty("paciente_dni")
    private String pacienteDni;

    // 📋 ESPECIALIDAD (de BD)
    @JsonProperty("especialidad")
    private String especialidad;

    // ============ CAMPOS DE EXCEL v1.8.0 (NUEVO) ============

    @JsonProperty("fecha_preferida_no_atendida")
    private java.time.LocalDate fechaPreferidaNoAtendida;

    @JsonProperty("tipo_documento")
    private String tipoDocumento;

    @JsonProperty("fecha_nacimiento")
    private java.time.LocalDate fechaNacimiento;

    @JsonProperty("paciente_sexo")
    private String pacienteSexo;

    @JsonProperty("paciente_telefono")
    private String pacienteTelefono;

    @JsonProperty("paciente_email")
    private String pacienteEmail;

    @JsonProperty("paciente_edad")
    private Integer pacienteEdad;

    @JsonProperty("codigo_ipress_adscripcion")
    private String codigoIpressAdscripcion;

    @JsonProperty("tipo_cita")
    private String tipoCita;

    // ============ CAMPOS v1.9.0 (NUEVO) ============

    @JsonProperty("fecha_cita")
    private OffsetDateTime fechaCita;

    @JsonProperty("fecha_atencion")
    private OffsetDateTime fechaAtencion;

    // 📦 REFERENCIA A BOLSA
    @JsonProperty("id_bolsa")
    private Long idBolsa;

    @JsonProperty("cod_tipo_bolsa")
    private String codTipoBolsa;

    @JsonProperty("desc_tipo_bolsa")
    private String descTipoBolsa;

    // 📋 REFERENCIA A SERVICIO
    @JsonProperty("id_servicio")
    private Long idServicio;

    @JsonProperty("cod_servicio")
    private String codServicio;

    // 🏥 IPRESS Y RED
    @JsonProperty("codigo_adscripcion")
    private String codigoAdscripcion;

    @JsonProperty("id_ipress")
    private Long idIpress;

    @JsonProperty("nombre_ipress")
    private String nombreIpress;

    @JsonProperty("red_asistencial")
    private String redAsistencial;

    // 📊 ESTADO
    @JsonProperty("estado")
    private String estado;

    @JsonProperty("razon_rechazo")
    private String razonRechazo;

    @JsonProperty("notas_aprobacion")
    private String notasAprobacion;

    // 👤 SOLICITANTE
    @JsonProperty("solicitante_id")
    private Long solicitanteId;

    @JsonProperty("solicitante_nombre")
    private String solicitanteNombre;

    // ✅ RESPONSABLE DE APROBACIÓN
    @JsonProperty("responsable_aprobacion_id")
    private Long responsableAprobacionId;

    @JsonProperty("responsable_aprobacion_nombre")
    private String responsableAprobacionNombre;

    // ⏰ FECHAS
    @JsonProperty("fecha_solicitud")
    private OffsetDateTime fechaSolicitud;

    @JsonProperty("fecha_aprobacion")
    private OffsetDateTime fechaAprobacion;

    @JsonProperty("fecha_actualizacion")
    private OffsetDateTime fechaActualizacion;

    // 👤 GESTOR DE CITAS
    @JsonProperty("responsable_gestora_id")
    private Long responsableGestoraId;

    @JsonProperty("fecha_asignacion")
    private OffsetDateTime fechaAsignacion;

    // 📊 ESTADO DE GESTIÓN DE CITAS (v1.6.0)
    @JsonProperty("estado_gestion_citas_id")
    private Long estadoGestionCitasId;

    @JsonProperty("cod_estado_cita")
    private String codEstadoCita;

    @JsonProperty("desc_estado_cita")
    private String descEstadoCita;

    // 🔔 AUDITORÍA
    @JsonProperty("activo")
    private Boolean activo;

    @JsonProperty("recordatorio_enviado")
    private Boolean recordatorioEnviado;

    // ============ CAMPOS ENRIQUECIDOS (denormalizados) ============

    // Nombre de bolsa (denormalizado desde desc_tipo_bolsa)
    @JsonProperty("nombre_bolsa")
    private String nombreBolsa;
}

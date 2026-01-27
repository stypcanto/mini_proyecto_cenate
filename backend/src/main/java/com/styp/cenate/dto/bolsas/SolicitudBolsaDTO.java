package com.styp.cenate.dto.bolsas;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * DTO para respuestas de solicitudes de bolsa
 * Mapea 27 campos de la tabla dim_solicitud_bolsa (v2.1.0 LIMPIO):
 * - Core operativo (9 campos): identificación + paciente + referencias
 * - 10 campos de Excel v1.8.0 (tipo_documento, sexo, telefono, etc.)
 * - Auditoría (4 campos): timestamps + soft-delete
 * - FKs mínimas: solo a tablas críticas
 *
 * Los datos denormalizados (códigos, descripciones, names) se recuperan
 * vía JOINs en el backend para evitar redundancia en BD.
 *
 * @version v2.1.0 (Limpieza agresiva: 27 campos necesarios)
 * @since 2026-01-27
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

    @JsonProperty("codigo_ipress")
    private String codigoIpressAdscripcion;

    @JsonProperty("tipo_cita")
    private String tipoCita;

    // 📦 REFERENCIA A BOLSA
    @JsonProperty("id_bolsa")
    private Long idBolsa;

    @JsonProperty("desc_tipo_bolsa")
    private String descTipoBolsa;

    // 📋 REFERENCIA A SERVICIO
    @JsonProperty("id_servicio")
    private Long idServicio;

    // 🏥 IPRESS Y RED
    @JsonProperty("codigo_adscripcion")
    private String codigoAdscripcion;

    @JsonProperty("id_ipress")
    private Long idIpress;

    // 📊 ESTADO
    @JsonProperty("estado")
    private String estado;

    // ⏰ FECHAS
    @JsonProperty("fecha_solicitud")
    private OffsetDateTime fechaSolicitud;

    @JsonProperty("fecha_actualizacion")
    private OffsetDateTime fechaActualizacion;

    // 📊 ESTADO DE GESTIÓN DE CITAS
    @JsonProperty("estado_gestion_citas_id")
    private Long estadoGestionCitasId;

    @JsonProperty("cod_estado_cita")
    private String codEstadoCita;

    @JsonProperty("desc_estado_cita")
    private String descEstadoCita;

    // 🏥 DESCRIPCIÓN IPRESS Y RED (enriquecidas via JOIN)
    @JsonProperty("desc_ipress")
    private String descIpress;

    @JsonProperty("desc_red")
    private String descRed;

    // 🔔 AUDITORÍA
    @JsonProperty("activo")
    private Boolean activo;
}

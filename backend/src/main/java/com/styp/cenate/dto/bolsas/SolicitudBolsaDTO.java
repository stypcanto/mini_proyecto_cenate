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
    @JsonProperty("id_tipo_bolsa")
    private Long idTipoBolsa;

    @JsonProperty("cod_tipo_bolsa")
    private String codTipoBolsa;

    @JsonProperty("desc_tipo_bolsa")
    private String descTipoBolsa;

    // 📋 REFERENCIA A SERVICIO
    @JsonProperty("id_servicio")
    private Long idServicio;

    @JsonProperty("cod_servicio")
    private String codServicio;

    @JsonProperty("desc_servicio")
    private String descServicio;

    // 🏥 IPRESS Y RED
    @JsonProperty("codigo_adscripcion")
    private String codigoAdscripcion;

    @JsonProperty("id_ipress")
    private Long idIpress;

    @JsonProperty("cod_ipress")
    private String codIpress;

    @JsonProperty("desc_ipress")
    private String descIpress;

    @JsonProperty("nombre_ipress")
    private String nombreIpress;

    @JsonProperty("red_asistencial")
    private String redAsistencial;

    @JsonProperty("cod_red")
    private String codRed;

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

    // 🔔 AUDITORÍA
    @JsonProperty("activo")
    private Boolean activo;

    /**
     * Constructor para proyección JPQL con JOINs (v2.1.0)
     * Orden: debe coincidir exactamente con la query SELECT en SolicitudBolsaRepository.obtenerSolicitudesEnriquecidas()
     */
    public SolicitudBolsaDTO(
            Long idSolicitud,
            String numeroSolicitud,
            Long pacienteId,
            String pacienteNombre,
            String pacienteDni,
            String especialidad,
            java.time.LocalDate fechaPreferidaNoAtendida,
            String tipoDocumento,
            java.time.LocalDate fechaNacimiento,
            String pacienteSexo,
            String pacienteTelefono,
            String pacienteEmail,
            Integer pacienteEdad,
            String codigoIpressAdscripcion,
            String tipoCita,
            Long idTipoBolsa,
            String codTipoBolsa,
            String descTipoBolsa,
            Long idServicio,
            String codServicio,
            String descServicio,
            String codigoAdscripcion,
            Long idIpress,
            String codIpress,
            String descIpress,
            String nombreIpress,
            String redAsistencial,
            String codRed,
            String estado,
            OffsetDateTime fechaSolicitud,
            OffsetDateTime fechaActualizacion,
            Long estadoGestionCitasId,
            String codEstadoCita,
            String descEstadoCita,
            Boolean activo
    ) {
        this.idSolicitud = idSolicitud;
        this.numeroSolicitud = numeroSolicitud;
        this.pacienteId = pacienteId;
        this.pacienteNombre = pacienteNombre;
        this.pacienteDni = pacienteDni;
        this.especialidad = especialidad;
        this.fechaPreferidaNoAtendida = fechaPreferidaNoAtendida;
        this.tipoDocumento = tipoDocumento;
        this.fechaNacimiento = fechaNacimiento;
        this.pacienteSexo = pacienteSexo;
        this.pacienteTelefono = pacienteTelefono;
        this.pacienteEmail = pacienteEmail;
        this.pacienteEdad = pacienteEdad;
        this.codigoIpressAdscripcion = codigoIpressAdscripcion;
        this.tipoCita = tipoCita;
        this.idTipoBolsa = idTipoBolsa;
        this.codTipoBolsa = codTipoBolsa;
        this.descTipoBolsa = descTipoBolsa;
        this.idServicio = idServicio;
        this.codServicio = codServicio;
        this.descServicio = descServicio;
        this.codigoAdscripcion = codigoAdscripcion;
        this.idIpress = idIpress;
        this.codIpress = codIpress;
        this.descIpress = descIpress;
        this.nombreIpress = nombreIpress;
        this.redAsistencial = redAsistencial;
        this.codRed = codRed;
        this.estado = estado;
        this.fechaSolicitud = fechaSolicitud;
        this.fechaActualizacion = fechaActualizacion;
        this.estadoGestionCitasId = estadoGestionCitasId;
        this.codEstadoCita = codEstadoCita;
        this.descEstadoCita = descEstadoCita;
        this.activo = activo;
    }
}

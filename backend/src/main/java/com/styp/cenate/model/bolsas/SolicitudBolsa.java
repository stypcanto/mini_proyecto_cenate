package com.styp.cenate.model.bolsas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

/**
 * Entidad JPA para solicitudes de bolsas de pacientes
 * Tabla: dim_solicitud_bolsa (43 columnas - v1.9.0 completo)
 *
 * Datos denormalizados para escalabilidad y performance:
 * - Códigos y descripciones de tipos de bolsa, servicio, estado
 * - Información de IPRESS y Red (desde dim_ipress + dim_red)
 * - Auditoría y trazabilidad completa
 * - Fechas de cita y atención (v1.9.0 NEW)
 *
 * @version v1.9.0 (Nuevas columnas: fecha_cita, fecha_atencion)
 * @since 2026-01-26
 */
@Entity
@Table(
    name = "dim_solicitud_bolsa",
    schema = "public",
    uniqueConstraints = @UniqueConstraint(
        name = "solicitud_paciente_unique",
        columnNames = {"id_bolsa", "paciente_id"}
    )
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudBolsa {

    // 🔑 IDENTIFICACIÓN
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Long idSolicitud;

    @Column(name = "numero_solicitud", length = 50, unique = true, nullable = false)
    private String numeroSolicitud;

    // 👤 DATOS PACIENTE
    @Column(name = "paciente_id", nullable = false)
    private Long pacienteId;

    @Column(name = "paciente_nombre", length = 255, nullable = false)
    private String pacienteNombre;

    @Column(name = "paciente_dni", length = 20, nullable = false)
    private String pacienteDni;

    // 📋 ESPECIALIDAD
    @Column(name = "especialidad", length = 255)
    private String especialidad;

    // ============================================================================
    // 📋 LOS 10 CAMPOS DE EXCEL CARGADOS (v1.8.0) - NUEVO
    // ============================================================================

    @Column(name = "fecha_preferida_no_atendida")
    private java.time.LocalDate fechaPreferidaNoAtendida;

    @Column(name = "tipo_documento", length = 50)
    private String tipoDocumento;

    @Column(name = "fecha_nacimiento")
    private java.time.LocalDate fechaNacimiento;

    @Column(name = "paciente_sexo", length = 10)
    private String pacienteSexo;

    @Column(name = "paciente_telefono", length = 20)
    private String pacienteTelefono;

    @Column(name = "paciente_email", length = 255)
    private String pacienteEmail;

    @Column(name = "paciente_edad")
    private Integer pacienteEdad;

    @Column(name = "codigo_ipress", length = 20)
    private String codigoIpressAdscripcion;

    @Column(name = "tipo_cita", length = 50)
    private String tipoCita;

    // ============================================================================
    // 📦 REFERENCIA A TIPO DE BOLSA
    // ============================================================================

    @Column(name = "id_bolsa", nullable = false)
    private Long idBolsa;

    @Column(name = "cod_tipo_bolsa")
    private String codTipoBolsa;

    @Column(name = "desc_tipo_bolsa")
    private String descTipoBolsa;

    // 📋 REFERENCIA A SERVICIO
    @Column(name = "id_servicio")
    private Long idServicio;

    @Column(name = "cod_servicio", length = 10)
    private String codServicio;

    // 🏥 IPRESS Y RED
    @Column(name = "codigo_adscripcion", length = 20)
    private String codigoAdscripcion;

    @Column(name = "id_ipress")
    private Long idIpress;

    @Column(name = "nombre_ipress", length = 255)
    private String nombreIpress;

    @Column(name = "red_asistencial", length = 255)
    private String redAsistencial;

    // 📊 ESTADO (Aprobación)
    @Column(name = "estado", length = 20, nullable = false)
    private String estado;

    @Column(name = "razon_rechazo", columnDefinition = "TEXT")
    private String razonRechazo;

    @Column(name = "notas_aprobacion", columnDefinition = "TEXT")
    private String notasAprobacion;

    // 👤 SOLICITANTE
    @Column(name = "solicitante_id")
    private Long solicitanteId;

    @Column(name = "solicitante_nombre", length = 255)
    private String solicitanteNombre;

    // ✅ RESPONSABLE DE APROBACIÓN
    @Column(name = "responsable_aprobacion_id")
    private Long responsableAprobacionId;

    @Column(name = "responsable_aprobacion_nombre", length = 255)
    private String responsableAprobacionNombre;

    // ⏰ FECHAS
    @Column(name = "fecha_solicitud", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP")
    private OffsetDateTime fechaSolicitud;

    @Column(name = "fecha_aprobacion", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaAprobacion;

    @Column(name = "fecha_actualizacion", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP")
    private OffsetDateTime fechaActualizacion;

    // 👤 GESTOR DE CITAS
    @Column(name = "responsable_gestora_id")
    private Long responsableGestoraId;

    @Column(name = "fecha_asignacion", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaAsignacion;

    // 🗓️ FECHAS DE CITA Y ATENCIÓN (v1.9.0 NEW)
    @Column(name = "fecha_cita", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaCita;

    @Column(name = "fecha_atencion", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaAtencion;

    // 📊 ESTADO DE GESTIÓN DE CITAS
    @Column(name = "estado_gestion_citas_id")
    private Long estadoGestionCitasId;

    @Column(name = "cod_estado_cita")
    private String codEstadoCita;

    @Column(name = "desc_estado_cita", length = 255)
    private String descEstadoCita;

    // 🔔 AUDITORÍA
    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @Column(name = "recordatorio_enviado")
    private Boolean recordatorioEnviado;

    @PrePersist
    void prePersist() {
        if (fechaSolicitud == null) {
            fechaSolicitud = OffsetDateTime.now();
        }
        if (fechaActualizacion == null) {
            fechaActualizacion = OffsetDateTime.now();
        }
        if (activo == null) {
            activo = true;
        }
        if (recordatorioEnviado == null) {
            recordatorioEnviado = false;
        }
        if (estado == null) {
            estado = "PENDIENTE";
        }
    }

    @PreUpdate
    void preUpdate() {
        fechaActualizacion = OffsetDateTime.now();
    }
}

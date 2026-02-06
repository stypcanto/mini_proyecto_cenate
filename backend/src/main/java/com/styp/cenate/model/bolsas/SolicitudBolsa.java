package com.styp.cenate.model.bolsas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import com.styp.cenate.model.Usuario;

/**
 * Entidad JPA para solicitudes de bolsas de pacientes
 * Tabla: dim_solicitud_bolsa (29 columnas - v2.4.0)
 *
 * Estructura optimizada sin denormalizaciones innecesarias:
 * - Core operativo: identificación + paciente + referencias
 * - Datos Excel v1.8.0: 10 campos de importación
 * - Teléfonos: principal (paciente_telefono) + alterno (paciente_telefono_alterno)
 * - Auditoría: timestamps + soft-delete
 * - FKs: solo a tablas críticas (asegurados, bolsas, servicios, IPRESS, citas)
 *
 * IMPORTANTE: Completamente desacoplada de Formulario 107
 * - El formulario 107 tiene sus propias tablas (bolsa_107_carga, staging.bolsa_107_raw)
 * - NO hay vinculación con dim_solicitud_bolsa (módulo Solicitudes de Bolsa)
 * - Cada módulo maneja sus datos de forma independiente
 *
 * Los datos denormalizados se recuperan vía JOINs en queries del backend.
 *
 * @version v2.3.0 (Eliminar vinculación con Formulario 107 - v1.0.0)
 * @since 2026-01-28
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
    private String pacienteId;

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

    @Column(name = "paciente_telefono_alterno", length = 20)
    private String pacienteTelefonoAlterno;

    @Column(name = "paciente_email", length = 255)
    private String pacienteEmail;

    @Column(name = "codigo_ipress", length = 20)
    private String codigoIpressAdscripcion;

    @Column(name = "tipo_cita", length = 50)
    private String tipoCita;

    @Column(name = "tiempo_inicio_sintomas", length = 100)
    private String tiempoInicioSintomas;

    @Column(name = "consentimiento_informado")
    private Boolean consentimientoInformado;

    // ============================================================================
    // 🦟 CAMPOS ESPECÍFICOS DE DENGUE (v1.0.0 - 2026-01-29)
    // ============================================================================

    @Column(name = "cenasicod")
    private Integer cenasicod;

    @Column(name = "dx_main", length = 10)
    private String dxMain;

    @Column(name = "fecha_sintomas")
    private java.time.LocalDate fechaSintomas;

    @Column(name = "semana_epidem", length = 20)
    private String semanaEpidem;

    // ============================================================================
    // 📦 REFERENCIA A TIPO DE BOLSA
    // ============================================================================

    @Column(name = "id_bolsa", nullable = false)
    private Long idBolsa;

    // 📋 REFERENCIA A SERVICIO
    @Column(name = "id_servicio", nullable = false)
    private Long idServicio;

    // 🏥 IPRESS Y RED
    @Column(name = "codigo_adscripcion", length = 20, nullable = true) // ✅ v1.46.4: Permitir NULL si no hay IPRESS
    private String codigoAdscripcion;

    @Column(name = "id_ipress")
    private Long idIpress;

    // 📊 ESTADO (Aprobación)
    @Column(name = "estado", length = 20, nullable = false)
    private String estado;

    // ⏰ FECHAS
    @Column(name = "fecha_solicitud", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP")
    private OffsetDateTime fechaSolicitud;

    @Column(name = "fecha_actualizacion", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP")
    private OffsetDateTime fechaActualizacion;

    // 📊 ESTADO DE GESTIÓN DE CITAS
    @Column(name = "estado_gestion_citas_id", nullable = false)
    private Long estadoGestionCitasId;

    // 👤 ASIGNACIÓN A GESTORA DE CITAS (v2.4.0)
    @Column(name = "responsable_gestora_id")
    private Long responsableGestoraId;

    @Column(name = "fecha_asignacion", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaAsignacion;

    // ⏰ AUDITORÍA: CAMBIOS DE ESTADO (v3.3.1)
    @Column(name = "fecha_cambio_estado", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaCambioEstado;

    @Column(name = "usuario_cambio_estado_id")
    private Long usuarioCambioEstadoId;

    // 🔗 RELACIÓN CON USUARIO QUE CAMBIÓ ESTADO (LAZY loading para eficiencia)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_cambio_estado_id", insertable = false, updatable = false)
    private Usuario usuarioCambioEstado;

    // 🔗 RELACIÓN CON USUARIO GESTORA (LAZY loading para eficiencia)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsable_gestora_id", insertable = false, updatable = false)
    private Usuario gestora;

    // 🔗 RELACIÓN CON ESTADO DE GESTIÓN DE CITAS (v3.3.1 - para cargar descripción)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_gestion_citas_id", insertable = false, updatable = false)
    private DimEstadosGestionCitas estadoGestionCitas;

    // ============================================================================
    // 🏥 DETALLES DE CITA AGENDADA (v1.0.0 - 2026-02-03)
    // ============================================================================
    
    @Column(name = "fecha_atencion")
    private java.time.LocalDate fechaAtencion;

    @Column(name = "hora_atencion")
    private java.time.LocalTime horaAtencion;

    @Column(name = "id_personal")
    private Long idPersonal;

    // ============================================================================
    // 🏥 DATOS MÉDICOS (v1.46.0 - 2026-02-03)
    // ============================================================================

    @Column(name = "condicion_medica", length = 100)
    private String condicionMedica;

    @Column(name = "observaciones_medicas", columnDefinition = "TEXT")
    private String observacionesMedicas;

    @Column(name = "fecha_atencion_medica", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaAtencionMedica;

    // 🔔 AUDITORÍA
    @Column(name = "activo", nullable = false)
    private Boolean activo;

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
        if (estado == null) {
            estado = "PENDIENTE";
        }
    }

    @PreUpdate
    void preUpdate() {
        fechaActualizacion = OffsetDateTime.now();
    }
}

package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 📋 AtencionClinica107 - Mapeo directo de dim_solicitud_bolsa
 * Propósito: Solo lectura desde dim_solicitud_bolsa (módulo 107)
 * Módulo: 107 (Atenciones Clínicas)
 * Tabla base: dim_solicitud_bolsa (ya desnormalizada con todos los datos)
 * Estructura: Directa sin JOINs complejos (solo JOIN a dim_ipress si es necesario)
 * No se persiste directamente, solo se consulta
 * Limitaciones: Solo se usa para el modulo de bolsas. 
 */
@Entity
@Table(name = "dim_solicitud_bolsa")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtencionClinica107 {

    // 🆔 Identificación
    @Id
    @Column(name = "id_solicitud")
    private Long idSolicitud;

    @Column(name = "numero_solicitud")
    private String numeroSolicitud;

    @Column(name = "id_bolsa")
    private Long idBolsa;

    @Column(name = "activo")
    private Boolean activo;

    // 👤 Datos del Paciente (campos desnormalizados en dim_solicitud_bolsa)
    @Column(name = "paciente_id")
    private String pacienteId;

    @Column(name = "paciente_nombre")
    private String pacienteNombre;

    @Column(name = "paciente_dni")
    private String pacienteDni;

    @Column(name = "tipo_documento")
    private String tipoDocumento;

    @Column(name = "paciente_sexo")
    private String pacienteSexo;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "paciente_edad")
    private Integer pacienteEdad;

    @Column(name = "paciente_telefono")
    private String pacienteTelefono;

    @Column(name = "paciente_email")
    private String pacienteEmail;

    @Column(name = "paciente_telefono_alterno")
    private String pacienteTelefonoAlterno;

    // 🏥 IPRESS
    @Column(name = "codigo_adscripcion")
    private String codigoAdscripcion;

    @Column(name = "id_ipress")
    private Long idIpress;

    @Column(name = "codigo_ipress")
    private String codigoIpress;

    /**
     * 🔗 Relación ManyToOne con Ipress
     * Permite acceder al nombre/descripción de la IPRESS
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ipress", insertable = false, updatable = false)
    private Ipress ipress;

    // 🏷️ Derivación Interna (VARCHAR, no FK)
    @Column(name = "derivacion_interna")
    private String derivacionInterna;

    // 🎯 Clasificación y Especialidad
    @Column(name = "especialidad")
    private String especialidad;

    @Column(name = "tipo_cita")
    private String tipoCita;

    @Column(name = "id_servicio")
    private Long idServicio;

    // 📌 Estado y Trazabilidad
    @Column(name = "estado_gestion_citas_id")
    private Long estadoGestionCitasId;

    @Column(name = "estado")
    private String estado;

    /**
     * 🔗 Relación ManyToOne con EstadoGestionCita
     * Permite acceder a la descripción completa del estado
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_gestion_citas_id", insertable = false, updatable = false)
    private EstadoGestionCita estadoGestionCita;

    @Column(name = "fecha_solicitud")
    private LocalDateTime fechaSolicitud;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @Column(name = "responsable_gestora_id")
    private Long responsableGestoraId;

    @Column(name = "fecha_asignacion")
    private LocalDateTime fechaAsignacion;

    // 🕐 Datos de Atención Programada
    @Column(name = "fecha_atencion")
    private LocalDate fechaAtencion;

    @Column(name = "hora_atencion")
    private String horaAtencion;

    @Column(name = "id_personal")
    private Long idPersonal;
}

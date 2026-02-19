package com.styp.cenate.model.mesaayuda;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Entidad JPA para tickets de Mesa de Ayuda
 * Tabla: dim_ticket_mesa_ayuda
 *
 * Permite a los médicos crear tickets de soporte que son gestionados por
 * personal de Mesa de Ayuda. Sistema de tickets para soporte técnico y consultas.
 *
 * Flujo:
 * 1. Médico crea ticket desde MisPacientes → estado NUEVO
 * 2. Personal Mesa de Ayuda ve el ticket en lista
 * 3. Personal responde → estado EN_PROCESO o RESUELTO
 * 4. Médico puede ver respuesta
 * 5. Cierre manual → estado CERRADO
 *
 * @author Styp Canto Rondón
 * @version v1.64.0 (2026-02-18) - Módulo Mesa de Ayuda
 * @since 2026-02-18
 */
@Entity
@Table(
    name = "dim_ticket_mesa_ayuda",
    schema = "public"
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketMesaAyuda {

    // ========== IDENTIFICACIÓN ==========

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Título del ticket (máximo 255 caracteres)
     * Ejemplo: "Error en carga de paciente", "Consulta sobre funcionalidad"
     */
    @Column(nullable = false, length = 255)
    private String titulo;

    /**
     * Descripción detallada del problema o solicitud
     * Puede contener múltiples párrafos
     */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String descripcion;

    // ========== ESTADO Y PRIORIDAD ==========

    /**
     * Estado del ticket: NUEVO, EN_PROCESO, RESUELTO, CERRADO
     * Valores válidos controlados en BD con CHECK constraint
     */
    @Column(length = 50, nullable = false)
    private String estado; // Default: 'NUEVO'

    /**
     * Prioridad del ticket: ALTA, MEDIA, BAJA
     * Ayuda a priorizar la respuesta del personal
     */
    @Column(length = 20, nullable = false)
    private String prioridad; // Default: 'MEDIA'

    // ========== DATOS DEL MÉDICO CREADOR ==========

    /**
     * ID del médico que creó el ticket
     * Referencia a dim_personal_cnt.id_personal
     */
    @Column(name = "id_medico")
    private Long idMedico;

    /**
     * Nombre del médico (denormalizado para facilitar búsquedas)
     * Formato: "Dr. Juan Pérez" o solo "Juan Pérez"
     */
    @Column(length = 255)
    private String nombreMedico;

    // ========== DATOS DEL PACIENTE RELACIONADO ==========

    /**
     * ID opcional de la solicitud de bolsa del paciente
     * Referencia a dim_solicitud_bolsa.id
     * Puede ser NULL si el ticket no está vinculado a paciente específico
     */
    @Column(name = "id_solicitud_bolsa")
    private Long idSolicitudBolsa;

    /**
     * Tipo de documento del paciente (DNI, CE, PASAPORTE, etc.)
     */
    @Column(name = "tipo_documento", length = 20)
    private String tipoDocumento;

    /**
     * DNI del paciente (máximo 15 caracteres)
     * Puede ser NULL si el ticket es sobre funcionalidad general
     */
    @Column(length = 15)
    private String dniPaciente;

    /**
     * Nombre completo del paciente (denormalizado)
     */
    @Column(length = 255)
    private String nombrePaciente;

    /**
     * Especialidad médica relacionada al ticket
     * Denormalizado de dim_solicitud_bolsa o de sesión del médico
     */
    @Column(length = 255)
    private String especialidad;

    /**
     * IPRESS (Institución Prestadora) del paciente
     * Denormalizado para contexto
     */
    @Column(length = 255)
    private String ipress;

    // ========== RESPUESTA Y CIERRE ==========

    /**
     * Respuesta del personal de Mesa de Ayuda
     * Se ingresa cuando cambia a EN_PROCESO o RESUELTO
     */
    @Column(columnDefinition = "TEXT")
    private String respuesta;

    /**
     * ID del personal de Mesa de Ayuda que respondió
     * Referencia a dim_personal_cnt.id_personal
     */
    @Column(name = "id_personal_mesa")
    private Long idPersonalMesa;

    /**
     * Nombre del personal que respondió (denormalizado)
     */
    @Column(length = 255)
    private String nombrePersonalMesa;

    // ========== AUDITORÍA ==========

    /**
     * Timestamp de creación del ticket
     * Se establece automáticamente con NOW()
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    /**
     * Timestamp de última actualización
     * Se actualiza con cada cambio
     */
    @Column(nullable = false)
    private LocalDateTime fechaActualizacion;

    /**
     * Timestamp cuando se respondió el ticket por primera vez
     * Se establece cuando cambia estado a EN_PROCESO o RESUELTO
     */
    @Column(name = "fecha_respuesta")
    private LocalDateTime fechaRespuesta;

    /**
     * Soft-delete: fecha de eliminación lógica
     * NULL = activo, NOT NULL = eliminado
     */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // ========== MOTIVO Y OBSERVACIONES (v1.64.0) ==========

    /**
     * ID del motivo predefinido de la solicitud
     * Referencia a dim_motivos_mesadeayuda.id
     * Si se especifica, el título se genera automáticamente desde la descripción del motivo
     */
    @Column(name = "id_motivo")
    private Long idMotivo;

    /**
     * Observaciones adicionales del médico (campo de texto libre)
     * Reemplaza el campo "descripcion" cuando se utiliza el sistema de motivos
     */
    @Column(columnDefinition = "TEXT")
    private String observaciones;

    // ========== PERSONAL ASIGNADO (v1.65.1) ==========

    /**
     * ID del personal de Mesa de Ayuda asignado al ticket
     * Referencia a dim_personal_cnt.id_personal
     * NULL si no hay nadie asignado
     */
    @Column(name = "id_personal_asignado")
    private Long idPersonalAsignado;

    /**
     * Nombre del personal asignado (denormalizado)
     */
    @Column(name = "nombre_personal_asignado", length = 255)
    private String nombrePersonalAsignado;

    /**
     * Timestamp de cuando se asignó el personal
     */
    @Column(name = "fecha_asignacion")
    private LocalDateTime fechaAsignacion;

    // ========== NUMERACIÓN Y TRAZABILIDAD (v1.64.1) ==========

    /**
     * Número único del ticket para trazabilidad y búsqueda
     * Formato: XXX-YYYY (ej: 001-2026, 002-2026, etc)
     * XXX = contador de 3 dígitos
     * YYYY = año actual
     * Único a nivel global para permitir búsquedas rápidas
     */
    @Column(name = "numero_ticket", nullable = false, unique = true, length = 20)
    private String numeroTicket;

    // ========== LIFECYCLE CALLBACKS ==========

    private static final ZoneId ZONA_PERU = ZoneId.of("America/Lima");

    @PrePersist
    protected void onCreate() {
        LocalDateTime ahoraPeru = LocalDateTime.now(ZONA_PERU);
        if (fechaCreacion == null) {
            fechaCreacion = ahoraPeru;
        }
        if (fechaActualizacion == null) {
            fechaActualizacion = ahoraPeru;
        }
        if (estado == null) {
            estado = "NUEVO";
        }
        if (prioridad == null) {
            prioridad = "MEDIA";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now(ZONA_PERU);
    }
}

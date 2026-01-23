package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

/**
 * 📋 Entidad que representa las Solicitudes de Bolsas de Pacientes.
 * Tabla: dim_solicitud_bolsa
 * v1.0.0 - Gestión de solicitudes para asignación de bolsas
 */
@Entity
@Table(name = "dim_solicitud_bolsa", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
@ToString(exclude = {"bolsa"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class SolicitudBolsa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    @EqualsAndHashCode.Include
    private Long idSolicitud;

    @Column(name = "numero_solicitud", unique = true, nullable = false, length = 50)
    private String numeroSolicitud;

    // =========== Asegurado (reemplaza paciente_id) ===========
    @Column(name = "asegurado_id", nullable = false)
    private Long aseguradoId;

    @Column(name = "paciente_nombre", nullable = false, length = 255)
    private String pacienteNombre;

    @Column(name = "paciente_dni", nullable = false, length = 20)
    private String pacienteDni;

    @Column(name = "paciente_telefono", length = 20)
    private String pacienteTelefono;

    @Column(name = "paciente_email", length = 255)
    private String pacienteEmail;

    @Column(name = "especialidad", length = 255)
    private String especialidad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_bolsa", nullable = false)
    private DimBolsa bolsa;

    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private String estado = "PENDIENTE"; // PENDIENTE, APROBADA, RECHAZADA

    @Column(name = "razon_rechazo", columnDefinition = "TEXT")
    private String razonRechazo;

    @Column(name = "notas_aprobacion", columnDefinition = "TEXT")
    private String notasAprobacion;

    @Column(name = "solicitante_id")
    private Long solicitanteId;

    @Column(name = "solicitante_nombre", length = 255)
    private String solicitanteNombre;

    @Column(name = "responsable_aprobacion_id")
    private Long responsableAprobacionId;

    @Column(name = "responsable_aprobacion_nombre", length = 255)
    private String responsableAprobacionNombre;

    // =========== Asignación a Gestora ===========
    @Column(name = "responsable_gestora_id")
    private Long responsableGestoraId;

    @Column(name = "responsable_gestora_nombre", length = 255)
    private String responsableGestoraNombre;

    @Column(name = "fecha_asignacion", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaAsignacion;

    // =========== Estado de Gestión de Citas ===========
    @Column(name = "estado_gestion_citas_id")
    private Long estadoGestionCitasId;

    // =========== Recordatorio ===========
    @Column(name = "recordatorio_enviado")
    @Builder.Default
    private Boolean recordatorioEnviado = false;

    @CreationTimestamp
    @Column(name = "fecha_solicitud", nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaSolicitud;

    @Column(name = "fecha_aprobacion", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaAprobacion;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaActualizacion;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;

    // ==========================================================
    // 🧩 Métodos utilitarios
    // ==========================================================

    public boolean isPendiente() {
        return "PENDIENTE".equalsIgnoreCase(this.estado);
    }

    public boolean isAprobada() {
        return "APROBADA".equalsIgnoreCase(this.estado);
    }

    public boolean isRechazada() {
        return "RECHAZADA".equalsIgnoreCase(this.estado);
    }

    public void aprobar(Long responsableId, String responsableNombre, String notas) {
        this.estado = "APROBADA";
        this.responsableAprobacionId = responsableId;
        this.responsableAprobacionNombre = responsableNombre;
        this.notasAprobacion = notas;
        this.fechaAprobacion = OffsetDateTime.now();
        log.info("✅ Solicitud {} aprobada por {}", this.numeroSolicitud, responsableNombre);
    }

    public void rechazar(Long responsableId, String responsableNombre, String razon) {
        this.estado = "RECHAZADA";
        this.responsableAprobacionId = responsableId;
        this.responsableAprobacionNombre = responsableNombre;
        this.razonRechazo = razon;
        this.fechaAprobacion = OffsetDateTime.now();
        log.info("❌ Solicitud {} rechazada por {}", this.numeroSolicitud, responsableNombre);
    }

    public Integer getDiasDesdeCreacion() {
        if (fechaSolicitud == null) return 0;
        return (int) java.time.temporal.ChronoUnit.DAYS.between(fechaSolicitud, OffsetDateTime.now());
    }

    public void asignarAGestora(Long gestoraId, String gestoraNombre) {
        this.responsableGestoraId = gestoraId;
        this.responsableGestoraNombre = gestoraNombre;
        this.fechaAsignacion = OffsetDateTime.now();
        log.info("👤 Solicitud {} asignada a gestora {}", this.numeroSolicitud, gestoraNombre);
    }

    public void marcarRecordatorioEnviado() {
        this.recordatorioEnviado = true;
        log.info("📧 Recordatorio enviado para solicitud {}", this.numeroSolicitud);
    }

    public boolean tieneGestoraAsignada() {
        return this.responsableGestoraId != null;
    }
}

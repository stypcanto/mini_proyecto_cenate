package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * 📊 Entidad que representa las Bolsas de Pacientes en CENATE.
 * Tabla: dim_solicitud_bolsa
 * v1.8.0 - Gestión centralizada de bolsas de pacientes con 10 campos de Excel completos
 */
@Entity
@Table(name = "dim_solicitud_bolsa", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
@ToString(exclude = {"pacientes"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DimBolsa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    @EqualsAndHashCode.Include
    private Long idSolicitud;

    @Column(name = "numero_solicitud", length = 50)
    private String numeroSolicitud;

    // ============================================================================
    // 📋 LOS 10 CAMPOS DE EXCEL CARGADOS (v1.8.0)
    // ============================================================================

    @Column(name = "fecha_preferida_no_atendida")
    private LocalDate fechaPreferidaNoAtendida;

    @Column(name = "tipo_documento", length = 50)
    private String tipoDocumento;

    @Column(name = "paciente_dni", length = 20)
    private String pacienteDni;

    @Column(name = "paciente_nombre", length = 255)
    private String pacienteNombre;

    @Column(name = "paciente_sexo", length = 10)
    private String pacienteSexo;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "paciente_telefono", length = 20)
    private String pacienteTelefono;

    @Column(name = "paciente_email", length = 255)
    private String pacienteEmail;

    @Column(name = "codigo_ipress", length = 20)
    private String codigoIpress;

    @Column(name = "tipo_cita", length = 50)
    private String tipoCita;

    // ============================================================================
    // 📊 CAMPOS CALCULADOS Y DE CONTROL
    // ============================================================================

    @Column(name = "paciente_edad")
    private Integer pacienteEdad; // Calculado automáticamente desde fecha_nacimiento

    // ============================================================================
    // 📊 CAMPOS EXISTENTES (DE VERSIONES ANTERIORES)
    // ============================================================================

    @Column(name = "especialidad_id")
    private Long especialidadId;

    @Column(name = "especialidad_nombre", length = 255)
    private String especialidadNombre;

    @Column(name = "responsable_id")
    private Long responsableId;

    @Column(name = "responsable_nombre", length = 255)
    private String responsableNombre;

    @Column(name = "total_pacientes", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    @Builder.Default
    private Integer totalPacientes = 0;

    @Column(name = "pacientes_asignados", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    @Builder.Default
    private Integer pacientesAsignados = 0;

    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private String estado = "ACTIVA"; // ACTIVA, INACTIVA, CERRADA

    @Column(name = "estado_gestion_citas_id")
    private Long estadoGestionCitasId;

    @Column(name = "responsable_gestora_id")
    private Long responsableGestoraId;

    @Column(name = "responsable_gestora_nombre", length = 255)
    private String responsableGestoraNombre;

    @Column(name = "fecha_asignacion", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaAsignacion;

    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaCreacion;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaActualizacion;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;

    // ==========================================================
    // 🔗 Relaciones
    // ==========================================================

    @Transient
    private Set<Long> pacientes = new HashSet<>();

    // ==========================================================
    // 🧩 Métodos utilitarios
    // ==========================================================

    public boolean isActiva() {
        return "ACTIVA".equalsIgnoreCase(this.estado) && Boolean.TRUE.equals(this.activo);
    }

    public Double getPorcentajeAsignacion() {
        if (totalPacientes == null || totalPacientes == 0) return 0.0;
        return (pacientesAsignados.doubleValue() / totalPacientes.doubleValue()) * 100;
    }

    public void incrementarPacientes(int cantidad) {
        this.totalPacientes = (this.totalPacientes != null ? this.totalPacientes : 0) + cantidad;
        log.info("📊 Bolsa incrementada en {} pacientes. Total: {}", cantidad, this.totalPacientes);
    }

    public void asignarPacientes(int cantidad) {
        this.pacientesAsignados = (this.pacientesAsignados != null ? this.pacientesAsignados : 0) + cantidad;
        log.info("✅ Bolsa: {} pacientes asignados. Asignados: {}/{}",
                 cantidad, this.pacientesAsignados, this.totalPacientes);
    }
}

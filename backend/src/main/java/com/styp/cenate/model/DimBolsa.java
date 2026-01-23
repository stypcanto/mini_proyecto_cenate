package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * 📊 Entidad que representa las Bolsas de Pacientes en CENATE.
 * Tabla: dim_bolsa
 * v1.0.0 - Gestión centralizada de bolsas de pacientes por especialidad
 */
@Entity
@Table(name = "dim_bolsa", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
@ToString(exclude = {"solicitudes", "pacientes"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DimBolsa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_bolsa")
    @EqualsAndHashCode.Include
    private Long idBolsa;

    @Column(name = "nombre_bolsa", nullable = false, length = 255)
    private String nombreBolsa;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

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
        log.info("📊 Bolsa {} incrementada en {} pacientes. Total: {}", this.nombreBolsa, cantidad, this.totalPacientes);
    }

    public void asignarPacientes(int cantidad) {
        this.pacientesAsignados = (this.pacientesAsignados != null ? this.pacientesAsignados : 0) + cantidad;
        log.info("✅ Bolsa {} asignados {} pacientes. Asignados: {}/{}",
                 this.nombreBolsa, cantidad, this.pacientesAsignados, this.totalPacientes);
    }
}

package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entidad que representa un periodo de solicitud de turnos.
 * El Coordinador Medico crea periodos mensuales para que las IPRESS soliciten turnos.
 * Tabla: periodo_solicitud_turno
 */
@Entity
@Table(name = "periodo_solicitud_turno", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"solicitudes"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PeriodoSolicitudTurno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_periodo")
    private Long idPeriodo;

    @Column(name = "periodo", nullable = false, length = 6)
    private String periodo; // YYYYMM (ej: "202601")

    @Column(name = "descripcion", nullable = false, length = 100)
    private String descripcion; // "Enero 2026"

    @Column(name = "fecha_inicio", nullable = false)
    private OffsetDateTime fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private OffsetDateTime fechaFin;

    @Column(name = "estado", length = 20)
    @Builder.Default
    private String estado = "BORRADOR"; // BORRADOR, ACTIVO, CERRADO

    @Column(name = "instrucciones", columnDefinition = "TEXT")
    private String instrucciones;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;

    // ==========================================================
    // Relaciones
    // ==========================================================
    @Builder.Default
    @OneToMany(mappedBy = "periodo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<SolicitudTurnoIpress> solicitudes = new HashSet<>();

    // ==========================================================
    // Metodos utilitarios
    // ==========================================================
    public boolean isActivo() {
        return "ACTIVO".equalsIgnoreCase(estado);
    }

    public boolean isCerrado() {
        return "CERRADO".equalsIgnoreCase(estado);
    }

    public boolean isBorrador() {
        return "BORRADOR".equalsIgnoreCase(estado);
    }

    public boolean isVigente() {
        if (!isActivo()) return false;
        OffsetDateTime ahora = OffsetDateTime.now();
        return (ahora.isAfter(fechaInicio) || ahora.isEqual(fechaInicio))
               && (ahora.isBefore(fechaFin) || ahora.isEqual(fechaFin));
    }
}

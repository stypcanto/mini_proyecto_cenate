package com.styp.cenate.model.teleconsultorio;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.styp.cenate.model.SolicitudTurnoIpress;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Entidad que representa los turnos de teleconsultorio (MAÑANA/TARDE) para una solicitud.
 * Tabla: solicitud_turno_ipress_teleconsultorio_turno
 */
@Entity
@Table(name = "solicitud_turno_ipress_teleconsultorio_turno", schema = "public",
       uniqueConstraints = @UniqueConstraint(columnNames = {"id_solicitud", "turno"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"solicitud", "horas"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class SolicitudTurnoIpressTeleconsultorioTurno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_turno")
    private Long idTurno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_solicitud", nullable = false)
    private SolicitudTurnoIpress solicitud;

    @Column(name = "turno", nullable = false, length = 10)
    private String turno; // 'MANANA' | 'TARDE'

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Column(name = "observaciones", columnDefinition = "text")
    private String observaciones;

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
    @OneToMany(mappedBy = "turno", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SolicitudTurnoIpressTeleconsultorioTurnoHora> horas = new ArrayList<>();

    // ==========================================================
    // Métodos utilitarios
    // ==========================================================

    /**
     * Verifica si es turno de mañana
     */
    public boolean isTurnoManana() {
        return "MANANA".equalsIgnoreCase(turno);
    }

    /**
     * Verifica si es turno de tarde
     */
    public boolean isTurnoTarde() {
        return "TARDE".equalsIgnoreCase(turno);
    }

    /**
     * Obtiene la cantidad de horas activas
     */
    public Integer getCantidadHoras() {
        if (horas == null) return 0;
        return (int) horas.stream().filter(h -> h.getActivo()).count();
    }

    /**
     * Agrega una hora al turno
     */
    public void agregarHora(SolicitudTurnoIpressTeleconsultorioTurnoHora hora) {
        if (horas == null) {
            horas = new ArrayList<>();
        }
        hora.setTurno(this);
        horas.add(hora);
    }

    /**
     * Elimina todas las horas del turno
     */
    public void limpiarHoras() {
        if (horas != null) {
            horas.clear();
        }
    }
}
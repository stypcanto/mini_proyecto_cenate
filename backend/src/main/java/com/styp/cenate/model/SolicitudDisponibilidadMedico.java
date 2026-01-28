package com.styp.cenate.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Modelo de entidad para la solicitud de disponibilidad médica.
 * Representa la cabecera de una solicitud de disponibilidad.
 */
@Entity
@Table(name = "solicitud_disponibilidad_medico")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudDisponibilidadMedico {

    /**
     * ID único de la solicitud
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud_disp")
    private Long idSolicitud;

    /**
     * Relación con PersonalCnt (médico que realiza la solicitud)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_personal", nullable = false)
    private PersonalCnt personal;

    /**
     * Relación con PeriodoMedicoDisponibilidad
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_periodo_reg_disp", nullable = false)
    private PeriodoMedicoDisponibilidad periodo;

    /**
     * Estado de la solicitud: BORRADOR, ENVIADO, OBSERVADO, APROBADO, RECHAZADO, ANULADO
     */
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private String estado = "BORRADOR";

    /**
     * Observaciones del médico
     */
    @Column(name = "observacion_medico", columnDefinition = "TEXT")
    private String observacionMedico;

    /**
     * Observaciones del validador/aprobador
     */
    @Column(name = "observacion_validador", columnDefinition = "TEXT")
    private String observacionValidador;

    /**
     * Usuario que creó la solicitud
     */
    @Column(name = "created_by", length = 50)
    private String createdBy;

    /**
     * Fecha de creación
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Usuario que actualizó la solicitud
     */
    @Column(name = "updated_by", length = 50)
    private String updatedBy;

    /**
     * Fecha de última actualización
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Detalles de la solicitud (relación uno a muchos)
     */
    @OneToMany(mappedBy = "solicitud", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    @Builder.Default
    private List<SolicitudDisponibilidadMedicoDet> detalles = new ArrayList<>();

    /**
     * Método para agregar un detalle a la solicitud
     */
    public void agregarDetalle(SolicitudDisponibilidadMedicoDet detalle) {
        if (this.detalles == null) {
            this.detalles = new ArrayList<>();
        }
        this.detalles.add(detalle);
        detalle.setSolicitud(this);
    }

    /**
     * Método para remover un detalle de la solicitud
     */
    public void removerDetalle(SolicitudDisponibilidadMedicoDet detalle) {
        if (this.detalles != null) {
            this.detalles.remove(detalle);
            detalle.setSolicitud(null);
        }
    }

    /**
     * Callback antes de persistir
     */
    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = "BORRADOR";
        }
    }

    /**
     * Callback antes de actualizar
     */
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

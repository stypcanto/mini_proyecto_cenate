package com.styp.cenate.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

/**
 * Entidad que representa un periodo global de disponibilidad médica.
 * Pensado para que el coordinador defina ventanas de tiempo (ej. bimestre/trimestre)
 * sobre las cuales los médicos registrarán sus disponibilidades.
 *
 * Tabla: periodo_medico_disponibilidad
 */
@Entity
@Table(name = "periodo_medico_disponibilidad", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PeriodoMedicoDisponibilidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_periodo_reg_disp")
    private Long idPeriodoRegDisp;

    /**
     * Año del periodo (2025, 2026, etc.).
     */
    @Column(name = "anio", nullable = false)
    private Integer anio;

    /**
     * Código de periodo (opcional pero útil), ej. 202602.
     */
    @Column(name = "periodo", nullable = false, length = 6)
    private String periodo;

    /**
     * Descripción legible del periodo.
     */
    @Column(name = "descripcion", nullable = false)
    private String descripcion;

    /**
     * Fecha y hora de inicio del periodo.
     */
    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;

    /**
     * Fecha y hora de fin del periodo.
     */
    @Column(name = "fecha_fin", nullable = false)
    private LocalDateTime fechaFin;

    /**
     * Estado del periodo:
     * BORRADOR | ACTIVO | CERRADO | ANULADO
     */
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private String estado = "BORRADOR";

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @Column(name = "updated_by", length = 50)
    private String updatedBy;

    @UpdateTimestamp
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;

    // ==========================================================
    // Métodos utilitarios
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

    public boolean isAnulado() {
        return "ANULADO".equalsIgnoreCase(estado);
    }

    /**
     * Valida si el periodo es vigente respecto a la fecha/hora actual.
     */
    public boolean isVigente() {
        LocalDateTime ahora = LocalDateTime.now();
        return isActivo()
                && (ahora.isAfter(fechaInicio) || ahora.isEqual(fechaInicio))
                && (ahora.isBefore(fechaFin) || ahora.isEqual(fechaFin));
    }
}


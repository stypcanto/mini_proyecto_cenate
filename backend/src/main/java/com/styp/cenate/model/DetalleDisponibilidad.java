package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * 📋 Entidad que representa los turnos diarios declarados por el médico.
 * Tabla: detalle_disponibilidad
 *
 * @author Ing. Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Entity
@Table(
    name = "detalle_disponibilidad",
    schema = "public",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_detalle_fecha",
            columnNames = {"id_disponibilidad", "fecha"}
        )
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"disponibilidadMedica", "ajustadoPorPersonal"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DetalleDisponibilidad {

    // ==========================================================
    // 🆔 Identificador principal
    // ==========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_detalle")
    private Long idDetalle;

    // ==========================================================
    // 🔗 Relaciones con otras entidades
    // ==========================================================

    /**
     * Relación con la disponibilidad médica padre
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "id_disponibilidad",
        referencedColumnName = "id_disponibilidad",
        nullable = false,
        foreignKey = @ForeignKey(name = "detalle_disponibilidad_id_disponibilidad_fkey")
    )
    private DisponibilidadMedica disponibilidadMedica;

    /**
     * Relación con el personal que ajustó el turno (coordinador)
     * Opcional - solo se llena si hubo ajuste
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "ajustado_por",
        referencedColumnName = "id_pers",
        foreignKey = @ForeignKey(name = "detalle_disponibilidad_ajustado_por_fkey")
    )
    private PersonalCnt ajustadoPorPersonal;

    // ==========================================================
    // 📆 Información del turno
    // ==========================================================

    /**
     * Fecha del turno
     */
    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    /**
     * Tipo de turno
     * Valores: M (Mañana), T (Tarde), MT (Completo)
     */
    @Column(name = "turno", length = 2, nullable = false)
    private String turno;

    /**
     * Horas asistenciales de ese turno según régimen
     * M: 4h (728/CAS) o 6h (Locador)
     * T: 4h (728/CAS) o 6h (Locador)
     * MT: 8h (728/CAS) o 12h (Locador)
     */
    @Column(name = "horas", precision = 4, scale = 2, nullable = false)
    private BigDecimal horas;

    // ==========================================================
    // 📝 Auditoría de ajustes
    // ==========================================================

    /**
     * Observación del ajuste realizado por el coordinador
     */
    @Column(name = "observacion_ajuste", columnDefinition = "text")
    private String observacionAjuste;

    @Column(name = "created_at", columnDefinition = "timestamptz", updatable = false)
    private OffsetDateTime createdAt;

    // ==========================================================
    // 🔄 Lifecycle callbacks
    // ==========================================================

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
    }

    // ==========================================================
    // 🛠️ Métodos de utilidad
    // ==========================================================

    /**
     * Verifica si es turno de mañana
     */
    public boolean esTurnoManana() {
        return "M".equals(this.turno);
    }

    /**
     * Verifica si es turno de tarde
     */
    public boolean esTurnoTarde() {
        return "T".equals(this.turno);
    }

    /**
     * Verifica si es turno completo
     */
    public boolean esTurnoCompleto() {
        return "MT".equals(this.turno);
    }

    /**
     * Verifica si el turno fue ajustado por un coordinador
     */
    public boolean fueAjustado() {
        return this.ajustadoPorPersonal != null;
    }

    /**
     * Obtiene el nombre del tipo de turno
     */
    public String getNombreTurno() {
        return switch (this.turno) {
            case "M" -> "Mañana";
            case "T" -> "Tarde";
            case "MT" -> "Completo";
            default -> "Desconocido";
        };
    }

    /**
     * Verifica si las horas son válidas para el tipo de turno
     * Régimen 728/CAS: M=4h, T=4h, MT=8h
     * Régimen Locador: M=6h, T=6h, MT=12h
     */
    public boolean esHoraValida() {
        if (this.horas == null || this.turno == null) {
            return false;
        }

        BigDecimal cuatro = new BigDecimal("4");
        BigDecimal seis = new BigDecimal("6");
        BigDecimal ocho = new BigDecimal("8");
        BigDecimal doce = new BigDecimal("12");

        return switch (this.turno) {
            case "M", "T" -> this.horas.compareTo(cuatro) == 0 || this.horas.compareTo(seis) == 0;
            case "MT" -> this.horas.compareTo(ocho) == 0 || this.horas.compareTo(doce) == 0;
            default -> false;
        };
    }
}

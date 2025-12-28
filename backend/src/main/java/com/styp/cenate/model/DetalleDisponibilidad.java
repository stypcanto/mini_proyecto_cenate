package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * 📋 Entidad que representa un turno específico en una fecha de la disponibilidad.
 * Cada registro almacena:
 * - Fecha del turno
 * - Tipo de turno (M=Mañana, T=Tarde, MT=Completo)
 * - Horas calculadas según régimen laboral del médico
 * - Información de ajustes realizados por coordinador
 *
 * Horas por turno según régimen:
 * - Régimen 728/CAS: M=4h, T=4h, MT=8h
 * - Régimen Locador: M=6h, T=6h, MT=12h
 *
 * Tabla: detalle_disponibilidad
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-27
 */
@Entity
@Table(name = "detalle_disponibilidad", schema = "public",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_detalle_fecha",
           columnNames = {"id_disponibilidad", "fecha"}
       ))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"disponibilidad", "ajustadoPor"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DetalleDisponibilidad {

    // ==========================================================
    // 🆔 IDENTIFICADOR PRINCIPAL
    // ==========================================================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_detalle")
    private Long idDetalle;

    // ==========================================================
    // 🔗 RELACIONES
    // ==========================================================

    /**
     * Disponibilidad a la que pertenece este turno
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_disponibilidad", nullable = false)
    private DisponibilidadMedica disponibilidad;

    // ==========================================================
    // 📊 DATOS DEL TURNO
    // ==========================================================

    /**
     * Fecha del turno
     */
    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    /**
     * Tipo de turno:
     * - M: Mañana (4h o 6h según régimen)
     * - T: Tarde (4h o 6h según régimen)
     * - MT: Turno Completo (8h o 12h según régimen)
     */
    @Column(name = "turno", length = 2, nullable = false)
    private String turno;

    /**
     * Horas del turno (calculadas según régimen laboral)
     */
    @Column(name = "horas", precision = 4, scale = 2, nullable = false)
    private BigDecimal horas;

    // ==========================================================
    // ✏️ AJUSTES DEL COORDINADOR
    // ==========================================================

    /**
     * Coordinador que realizó el ajuste (NULL si no fue ajustado)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ajustado_por")
    private PersonalCnt ajustadoPor;

    /**
     * Observación del ajuste realizado por el coordinador
     */
    @Column(name = "observacion_ajuste", columnDefinition = "TEXT")
    private String observacionAjuste;

    // ==========================================================
    // 🕓 AUDITORÍA
    // ==========================================================

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    // ==========================================================
    // 🧩 MÉTODOS UTILITARIOS
    // ==========================================================

    /**
     * Verifica si este turno fue ajustado por un coordinador
     */
    public boolean fueAjustado() {
        return ajustadoPor != null;
    }

    /**
     * Obtiene el nombre del turno en formato legible
     *
     * @return "Mañana", "Tarde" o "Turno Completo"
     */
    public String getNombreTurno() {
        if ("M".equals(turno)) {
            return "Mañana";
        } else if ("T".equals(turno)) {
            return "Tarde";
        } else if ("MT".equals(turno)) {
            return "Turno Completo";
        }
        return turno;
    }

    /**
     * Obtiene el código de turno con descripción
     *
     * @return "M (Mañana)", "T (Tarde)" o "MT (Completo)"
     */
    public String getTurnoConDescripcion() {
        return turno + " (" + getNombreTurno() + ")";
    }

    /**
     * Obtiene el nombre completo del coordinador que ajustó (si aplica)
     */
    public String getNombreCoordinador() {
        return ajustadoPor != null ? ajustadoPor.getNombreCompleto() : null;
    }

    /**
     * Obtiene el número de documento del coordinador que ajustó (si aplica)
     */
    public String getNumDocCoordinador() {
        return ajustadoPor != null ? ajustadoPor.getNumDocPers() : null;
    }

    /**
     * Verifica si el turno es de Mañana
     */
    public boolean isTurnoManana() {
        return "M".equals(turno);
    }

    /**
     * Verifica si el turno es de Tarde
     */
    public boolean isTurnoTarde() {
        return "T".equals(turno);
    }

    /**
     * Verifica si el turno es Completo
     */
    public boolean isTurnoCompleto() {
        return "MT".equals(turno);
    }

    /**
     * Obtiene el día de la semana del turno
     *
     * @return Nombre del día (Lunes, Martes, etc.)
     */
    public String getDiaSemana() {
        if (fecha == null) {
            return null;
        }
        return switch (fecha.getDayOfWeek()) {
            case MONDAY -> "Lunes";
            case TUESDAY -> "Martes";
            case WEDNESDAY -> "Miércoles";
            case THURSDAY -> "Jueves";
            case FRIDAY -> "Viernes";
            case SATURDAY -> "Sábado";
            case SUNDAY -> "Domingo";
        };
    }

    /**
     * Obtiene información completa del turno
     *
     * @return String con formato "dd/MM/yyyy - Turno - Horas h"
     */
    public String getDescripcionCompleta() {
        if (fecha == null) {
            return "";
        }
        return String.format("%s %s - %s - %.2f h",
            getDiaSemana(),
            fecha,
            getNombreTurno(),
            horas
        );
    }

    // ==========================================================
    // 🔧 LIFECYCLE CALLBACKS
    // ==========================================================

    @PrePersist
    @PreUpdate
    protected void validate() {
        // Validar que el turno sea M, T o MT
        if (turno == null || (!turno.equals("M") && !turno.equals("T") && !turno.equals("MT"))) {
            throw new IllegalStateException("El turno debe ser M, T o MT");
        }

        // Validar que horas sea positivo
        if (horas == null || horas.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Las horas deben ser mayores a cero");
        }

        // Si hay observación de ajuste, debe haber coordinador
        if (observacionAjuste != null && !observacionAjuste.isBlank() && ajustadoPor == null) {
            throw new IllegalStateException("Si hay observación de ajuste, debe especificarse quién lo ajustó");
        }
    }
}

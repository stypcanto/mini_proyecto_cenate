package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * ⏰ Entidad que representa los horarios disponibles en el sistema.
 * Tabla: dim_horario
 *
 * Define los diferentes turnos de trabajo con sus códigos y horas.
 * Ejemplos:
 * - Código 158: Turno mañana (08:00-14:00) = 6h
 * - Código 131: Turno tarde (14:00-20:00) = 6h
 * - Código 200A: Dos turnos (08:00-20:00) = 12h
 *
 * IMPORTANTE: Cada código de horario tiene 3 variantes (una por régimen laboral):
 * - 728, CAS, LOCADOR
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Entity
@Table(name = "dim_horario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"horarioDetalles"})
public class DimHorario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_horario")
    private Long idHorario;

    /**
     * Código del horario (158, 131, 200A, etc.)
     * Usado para mapear turnos de disponibilidad a horarios chatbot
     */
    @Column(name = "cod_horario", nullable = false, length = 20)
    private String codHorario;

    /**
     * Descripción del horario
     */
    @Column(name = "desc_horario", nullable = false, columnDefinition = "TEXT")
    private String descHorario;

    /**
     * Horas del turno (6.00, 12.00, etc.)
     */
    @Column(name = "horas", nullable = false, precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal horas = BigDecimal.ZERO;

    /**
     * Régimen laboral asociado
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reg_lab", nullable = false)
    private RegimenLaboral regimenLaboral;

    /**
     * Estado: A=Activo, I=Inactivo
     */
    @Column(name = "stat_horario", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String statHorario = "A";

    /**
     * Código visual del horario (opcional)
     */
    @Column(name = "cod_horario_visual", length = 10)
    private String codHorarioVisual;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // ==========================================================
    // 🔗 Relaciones
    // ==========================================================

    /**
     * Detalles de horarios que usan este horario
     */
    @OneToMany(mappedBy = "horarioDia", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<CtrHorarioDet> horarioDetalles = new LinkedHashSet<>();

    // ==========================================================
    // 🛠️ Métodos de utilidad
    // ==========================================================

    /**
     * Verifica si el horario está activo
     */
    public boolean isActivo() {
        return "A".equals(this.statHorario);
    }

    /**
     * Activa el horario
     */
    public void activar() {
        this.statHorario = "A";
    }

    /**
     * Inactiva el horario
     */
    public void inactivar() {
        this.statHorario = "I";
    }

    /**
     * Obtiene clave única: código + régimen
     * Ejemplo: "158-728", "200A-CAS"
     */
    public String getClaveUnica() {
        String regimen = regimenLaboral != null ? regimenLaboral.getDescRegLab() : "SIN_REGIMEN";
        return codHorario + "-" + regimen;
    }
}

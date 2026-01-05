package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * 🔖 Entidad que representa los tipos de turno en el sistema.
 * Tabla: dim_tipo_turno
 *
 * Define diferentes tipos de turno para clasificar los horarios.
 * Ejemplos:
 * - TRN_CHATBOT: Turno generado desde disponibilidad médica
 * - TRN_MANUAL: Turno ingresado manualmente
 * - TRN_MODIFICADO: Turno ajustado por coordinador
 *
 * CRÍTICO: Para sincronización desde disponibilidad, se usa cod_tip_turno = 'TRN_CHATBOT'
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Entity
@Table(name = "dim_tipo_turno")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"horarioDetalles"})
public class DimTipoTurno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_tip_turno")
    private Long idTipTurno;

    /**
     * Código del tipo de turno
     * Ejemplo: TRN_CHATBOT, TRN_MANUAL, TRN_MODIFICADO
     */
    @Column(name = "cod_tip_turno", nullable = false, unique = true, columnDefinition = "TEXT")
    private String codTipTurno;

    /**
     * Descripción del tipo de turno
     */
    @Column(name = "desc_tip_turno", nullable = false, columnDefinition = "TEXT")
    private String descTipTurno;

    /**
     * Estado: A=Activo, I=Inactivo
     */
    @Column(name = "stat_tip_turno", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String statTipTurno = "A";

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
     * Detalles de horarios que usan este tipo de turno
     */
    @OneToMany(mappedBy = "tipoTurno", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<CtrHorarioDet> horarioDetalles = new LinkedHashSet<>();

    // ==========================================================
    // 🛠️ Métodos de utilidad
    // ==========================================================

    /**
     * Verifica si el tipo de turno está activo
     */
    public boolean isActivo() {
        return "A".equals(this.statTipTurno);
    }

    /**
     * Activa el tipo de turno
     */
    public void activar() {
        this.statTipTurno = "A";
    }

    /**
     * Inactiva el tipo de turno
     */
    public void inactivar() {
        this.statTipTurno = "I";
    }

    /**
     * Verifica si es turno generado desde chatbot
     */
    public boolean isTurnoChatbot() {
        return "TRN_CHATBOT".equals(this.codTipTurno);
    }
}

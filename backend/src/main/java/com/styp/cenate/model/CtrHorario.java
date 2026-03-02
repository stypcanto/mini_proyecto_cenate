package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 📋 Entidad principal de horarios del chatbot.
 * Tabla: ctr_horario
 *
 * Representa el horario mensual de un médico en un área específica.
 * Esta tabla es DESTINO de la sincronización desde disponibilidad_medica.
 *
 * Relación con Disponibilidad:
 * - Un ctr_horario se genera desde una disponibilidad_medica en estado REVISADO
 * - disponibilidad_medica.id_ctr_horario_generado apunta a este registro
 *
 * IMPORTANTE: Tiene constraint único (periodo, id_pers, id_area)
 * - Solo puede haber un horario por médico/área/periodo
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Entity
@Table(name = "ctr_horario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"detalles"})
public class CtrHorario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_ctr_horario")
    private Long idCtrHorario;

    /**
     * Periodo del horario (AAAAMM)
     * Ejemplo: "202601", "202602"
     */
    @Column(name = "periodo", nullable = false, length = 6)
    private String periodo;

    /**
     * Personal asociado al horario
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pers", nullable = false)
    private PersonalCnt personal;

    /**
     * Área de atención
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_area", nullable = false)
    private Area area;

    /**
     * Grupo Programático
     */
    @Column(name = "id_grupo_prog", nullable = false)
    private Long idGrupoProg;

    /**
     * Régimen laboral
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reg_lab", nullable = false)
    private RegimenLaboral regimenLaboral;

    /**
     * Servicio médico (opcional)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_servicio")
    private DimServicioEssi servicio;

    /**
     * Relación con periodo (objeto completo).
     * Usa ambas columnas de la PK compuesta de CtrPeriodo.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
        @JoinColumn(name = "periodo", referencedColumnName = "periodo", insertable = false, updatable = false),
        @JoinColumn(name = "id_area", referencedColumnName = "id_area", insertable = false, updatable = false)
    })
    private CtrPeriodo periodoObj;

    /**
     * Total de turnos en el mes
     */
    @Column(name = "turnos_totales", nullable = false)
    @Builder.Default
    private Integer turnosTotales = 0;

    /**
     * Total de horas en el mes
     */
    @Column(name = "horas_totales", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal horasTotales = BigDecimal.ZERO;

    /**
     * Turnos válidos (turnos con horario asignado)
     */
    @Column(name = "turnos_validos", nullable = false)
    @Builder.Default
    private Integer turnosValidos = 0;

    /**
     * Estado del horario (FK a dim_horario_estado)
     * 1=INICIADO, 2=EN PROCESO, 3=ANULADO, 4=TERMINADO
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estado", nullable = false)
    @Builder.Default
    private DimHorarioEstado estado = null;

    /**
     * ID del estado (para acceso directo sin cargar la relación)
     */
    @Column(name = "id_estado", insertable = false, updatable = false)
    @Builder.Default
    private Short idEstado = 1;

    /**
     * Observaciones del horario
     */
    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

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
     * Detalles diarios del horario
     * CRÍTICO: Inicializar con new ArrayList<>() para evitar Bug #001
     */
    @OneToMany(
        mappedBy = "horario",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<CtrHorarioDet> detalles = new ArrayList<>();

    // ==========================================================
    // 🛠️ Métodos de utilidad
    // ==========================================================

    /**
     * Agrega un detalle de horario
     */
    public void addDetalle(CtrHorarioDet detalle) {
        if (detalles == null) {
            detalles = new ArrayList<>();
        }
        detalles.add(detalle);
        detalle.setHorario(this);
    }

    /**
     * Elimina un detalle de horario
     */
    public void removeDetalle(CtrHorarioDet detalle) {
        if (detalles != null) {
            detalles.remove(detalle);
            detalle.setHorario(null);
        }
    }

    /**
     * Recalcula totales basándose en los detalles
     */
    public void recalcularTotales() {
        if (detalles == null || detalles.isEmpty()) {
            this.turnosTotales = 0;
            this.horasTotales = BigDecimal.ZERO;
            this.turnosValidos = 0;
            return;
        }

        this.turnosTotales = detalles.size();
        this.turnosValidos = (int) detalles.stream()
            .filter(d -> d.getHorarioDia() != null && d.getHorarioDia().getIdHorario() != null)
            .count();

        this.horasTotales = detalles.stream()
            .filter(d -> d.getHorarioDia() != null && d.getHorarioDia().getHoras() != null)
            .map(d -> d.getHorarioDia().getHoras())
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Obtiene clave única para el horario
     * Formato: "{periodo}-{id_pers}-{id_area}"
     */
    public String getClaveUnica() {
        Long idPers = personal != null ? personal.getIdPers() : null;
        Long idArea = area != null ? area.getIdArea() : null;
        return periodo + "-" + idPers + "-" + idArea;
    }

    /**
     * Callback antes de persistir: inicializar lista de detalles
     */
    @PrePersist
    private void prePersist() {
        if (this.detalles == null) {
            this.detalles = new ArrayList<>();
        }
    }
}

package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalTime;
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
     * Área a la que pertenece el horario
     */
    @Column(name = "id_area", nullable = false)
    private Long idArea;

    /**
     * Grupo de programación al que pertenece el horario
     */
    @Column(name = "id_grupo_prog", nullable = false)
    private Long idGrupoProg;

    /**
     * Servicio asociado (opcional)
     */
    @Column(name = "id_servicio")
    private Long idServicio;

    /**
     * Código del horario (158, 131, 200A, etc.)
     * Usado para mapear turnos de disponibilidad a horarios chatbot
     */
    @Column(name = "cod_horario", nullable = false, length = 20)
    private String codHorario;

    /**
     * Código visual del horario (opcional)
     */
    @Column(name = "cod_horario_visual", length = 10)
    private String codHorarioVisual;

    /**
     * Descripción del horario
     */
    @Column(name = "desc_horario", nullable = false, columnDefinition = "TEXT")
    private String descHorario;

    /**
     * Hora de inicio del turno
     */
    @Column(name = "hora_inicio")
    private LocalTime horaInicio;

    /**
     * Hora de fin del turno
     */
    @Column(name = "hora_fin")
    private LocalTime horaFin;

    /**
     * Si el turno cruza al día siguiente
     */
    @Column(name = "cruza_dia", nullable = false)
    @Builder.Default
    private Boolean cruzaDia = false;

    /**
     * Horas del turno (6.00, 12.00, etc.)
     */
    @Column(name = "horas", nullable = false, precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal horas = BigDecimal.ZERO;

    /**
     * Si requiere asistencia
     */
    @Column(name = "requiere_asistencia", nullable = false)
    @Builder.Default
    private Boolean requiereAsistencia = true;

    /**
     * Si cuenta para carga laboral
     */
    @Column(name = "cuenta_carga", nullable = false)
    @Builder.Default
    private Boolean cuentaCarga = true;

    /**
     * Categoría: TURNO, LIBRE, JUSTIF, ESTADO
     */
    @Column(name = "categoria", nullable = false, length = 20)
    @Builder.Default
    private String categoria = "TURNO";

    /**
     * Régimen laboral asociado (opcional)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reg_lab")
    private RegimenLaboral regimenLaboral;

    /**
     * Estado: A=Activo, I=Inactivo
     */
    @Column(name = "stat_horario", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String statHorario = "A";

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

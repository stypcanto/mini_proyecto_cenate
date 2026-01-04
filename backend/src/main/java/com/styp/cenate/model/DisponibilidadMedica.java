package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 📅 Entidad que representa la disponibilidad mensual declarada por médicos.
 * Incluye cálculo de horas asistenciales, sanitarias e integración con chatbot.
 * Tabla: disponibilidad_medica
 *
 * @author Ing. Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Entity
@Table(
    name = "disponibilidad_medica",
    schema = "public",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_disponibilidad_periodo_pers_servicio",
            columnNames = {"id_pers", "periodo", "id_servicio"}
        )
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"personal", "servicio", "detalles"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DisponibilidadMedica {

    // ==========================================================
    // 🆔 Identificador principal
    // ==========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_disponibilidad")
    private Long idDisponibilidad;

    // ==========================================================
    // 🔗 Relaciones con otras entidades
    // ==========================================================

    /**
     * Relación con el personal médico que declara disponibilidad
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "id_pers",
        referencedColumnName = "id_pers",
        nullable = false,
        foreignKey = @ForeignKey(name = "disponibilidad_medica_id_pers_fkey")
    )
    private PersonalCnt personal;

    /**
     * Relación con el servicio/especialidad en la que declara disponibilidad
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "id_servicio",
        referencedColumnName = "id_servicio",
        nullable = false,
        foreignKey = @ForeignKey(name = "disponibilidad_medica_id_servicio_fkey")
    )
    private DimServicioEssi servicio;

    /**
     * Relación OneToMany con los detalles de disponibilidad diaria
     */
    @OneToMany(
        mappedBy = "disponibilidadMedica",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<DetalleDisponibilidad> detalles = new ArrayList<>();

    // ==========================================================
    // 📆 Información del periodo
    // ==========================================================

    /**
     * Periodo en formato YYYYMM (ej: 202601)
     */
    @Column(name = "periodo", length = 6, nullable = false)
    private String periodo;

    /**
     * Estado del flujo de disponibilidad
     * Valores: BORRADOR, ENVIADO, REVISADO, SINCRONIZADO
     */
    @Column(name = "estado", length = 20, nullable = false)
    @Builder.Default
    private String estado = "BORRADOR";

    // ==========================================================
    // ⏱️ Cálculo de horas (v2.0.0)
    // ==========================================================

    /**
     * Horas de atención directa según turnos M/T/MT y régimen laboral
     * Régimen 728/CAS: M=4h, T=4h, MT=8h
     * Régimen Locador: M=6h, T=6h, MT=12h
     */
    @Column(name = "horas_asistenciales", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal horasAsistenciales = BigDecimal.ZERO;

    /**
     * Horas administrativas: 2h × días trabajados (solo régimen 728/CAS)
     * Incluye 1h telemonitoreo + 1h trabajo administrativo
     * NO aplica para Régimen Locador
     */
    @Column(name = "horas_sanitarias", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal horasSanitarias = BigDecimal.ZERO;

    /**
     * Total de horas = horas_asistenciales + horas_sanitarias
     */
    @Column(name = "total_horas", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal totalHoras = BigDecimal.ZERO;

    /**
     * Meta mensual de horas requeridas
     */
    @Column(name = "horas_requeridas", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal horasRequeridas = new BigDecimal("150.00");

    // ==========================================================
    // 📝 Observaciones y notas
    // ==========================================================

    @Column(name = "observaciones", columnDefinition = "text")
    private String observaciones;

    // ==========================================================
    // 📅 Fechas de workflow
    // ==========================================================

    /**
     * Fecha de creación del registro
     */
    @Column(name = "fecha_creacion", columnDefinition = "timestamptz")
    private OffsetDateTime fechaCreacion;

    /**
     * Fecha en que el médico envió su disponibilidad
     */
    @Column(name = "fecha_envio", columnDefinition = "timestamptz")
    private OffsetDateTime fechaEnvio;

    /**
     * Fecha en que el coordinador revisó la disponibilidad
     */
    @Column(name = "fecha_revision", columnDefinition = "timestamptz")
    private OffsetDateTime fechaRevision;

    // ==========================================================
    // 🔗 Integración con horarios chatbot (v2.0.0)
    // ==========================================================

    /**
     * Fecha de sincronización con el sistema de horarios del chatbot
     */
    @Column(name = "fecha_sincronizacion", columnDefinition = "timestamptz")
    private OffsetDateTime fechaSincronizacion;

    /**
     * ID del registro en ctr_horario generado tras sincronización
     * No es FK para evitar dependencia circular
     */
    @Column(name = "id_ctr_horario_generado")
    private Long idCtrHorarioGenerado;

    // ==========================================================
    // 📋 Auditoría
    // ==========================================================

    @Column(name = "created_at", columnDefinition = "timestamptz", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "timestamptz")
    private OffsetDateTime updatedAt;

    // ==========================================================
    // 🔄 Lifecycle callbacks
    // ==========================================================

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.fechaCreacion == null) {
            this.fechaCreacion = now;
        }

        if (this.estado == null) {
            this.estado = "BORRADOR";
        }

        if (this.horasAsistenciales == null) {
            this.horasAsistenciales = BigDecimal.ZERO;
        }

        if (this.horasSanitarias == null) {
            this.horasSanitarias = BigDecimal.ZERO;
        }

        if (this.totalHoras == null) {
            this.totalHoras = BigDecimal.ZERO;
        }

        if (this.horasRequeridas == null) {
            this.horasRequeridas = new BigDecimal("150.00");
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // ==========================================================
    // 🛠️ Métodos de utilidad
    // ==========================================================

    /**
     * Agrega un detalle de disponibilidad a la lista
     * Establece la relación bidireccional
     */
    public void addDetalle(DetalleDisponibilidad detalle) {
        if (detalles == null) {
            detalles = new ArrayList<>();
        }
        detalles.add(detalle);
        detalle.setDisponibilidadMedica(this);
    }

    /**
     * Remueve un detalle de disponibilidad de la lista
     * Rompe la relación bidireccional
     */
    public void removeDetalle(DetalleDisponibilidad detalle) {
        if (detalles != null) {
            detalles.remove(detalle);
            detalle.setDisponibilidadMedica(null);
        }
    }

    /**
     * Verifica si la disponibilidad está en estado BORRADOR
     */
    public boolean esBorrador() {
        return "BORRADOR".equals(this.estado);
    }

    /**
     * Verifica si la disponibilidad ha sido enviada
     */
    public boolean esEnviado() {
        return "ENVIADO".equals(this.estado);
    }

    /**
     * Verifica si la disponibilidad ha sido revisada
     */
    public boolean esRevisado() {
        return "REVISADO".equals(this.estado);
    }

    /**
     * Verifica si la disponibilidad ha sido sincronizada con el chatbot
     */
    public boolean esSincronizado() {
        return "SINCRONIZADO".equals(this.estado);
    }

    /**
     * Verifica si cumple con las horas requeridas
     */
    public boolean cumpleHorasRequeridas() {
        return this.totalHoras != null
            && this.horasRequeridas != null
            && this.totalHoras.compareTo(this.horasRequeridas) >= 0;
    }

    /**
     * Calcula el total de horas sumando asistenciales + sanitarias
     */
    public void calcularTotalHoras() {
        BigDecimal asistenciales = this.horasAsistenciales != null ? this.horasAsistenciales : BigDecimal.ZERO;
        BigDecimal sanitarias = this.horasSanitarias != null ? this.horasSanitarias : BigDecimal.ZERO;
        this.totalHoras = asistenciales.add(sanitarias);
    }
}

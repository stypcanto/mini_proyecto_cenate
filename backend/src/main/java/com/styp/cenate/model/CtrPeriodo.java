package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * 📅 Entidad que representa los periodos de carga de horarios.
 * Tabla: ctr_periodo
 *
 * Define periodos mensuales para la gestión de horarios (AAAAMM).
 * Ejemplos: "202601", "202602", "202603"
 *
 * Estados:
 * - ABIERTO: Permite modificaciones
 * - EN_VALIDACION: En revisión por coordinador
 * - CERRADO: No permite cambios
 * - REABIERTO: Cerrado pero reabierto para correcciones
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Entity
@Table(name = "ctr_periodo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"horarios"})
public class CtrPeriodo {

    @Id
    @EqualsAndHashCode.Include
    @Column(name = "periodo", length = 6)
    private String periodo; // Formato: AAAAMM (ejemplo: "202601")

    /**
     * Fecha de inicio del periodo
     */
    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    /**
     * Fecha de fin del periodo
     */
    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    /**
     * Estado del periodo
     */
    @Column(name = "estado", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String estado = "ABIERTO"; // ABIERTO, EN_VALIDACION, CERRADO, REABIERTO

    /**
     * Coordinador responsable del periodo
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_coordinador", nullable = false)
    private Usuario coordinador;

    /**
     * Fecha en que se abrió el periodo
     */
    @Column(name = "fecha_apertura")
    private OffsetDateTime fechaApertura;

    /**
     * Fecha en que se cerró el periodo
     */
    @Column(name = "fecha_cierre")
    private OffsetDateTime fechaCierre;

    /**
     * Usuario que realizó la última acción
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_ultima_accion")
    private Usuario usuarioUltimaAccion;

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
     * Horarios del periodo
     */
    @OneToMany(mappedBy = "periodoObj", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<CtrHorario> horarios = new LinkedHashSet<>();

    // ==========================================================
    // 🛠️ Métodos de utilidad
    // ==========================================================

    /**
     * Verifica si el periodo está abierto para modificaciones
     */
    public boolean isAbierto() {
        return "ABIERTO".equals(this.estado) || "REABIERTO".equals(this.estado);
    }

    /**
     * Verifica si el periodo está cerrado
     */
    public boolean isCerrado() {
        return "CERRADO".equals(this.estado);
    }

    /**
     * Verifica si el periodo está en validación
     */
    public boolean isEnValidacion() {
        return "EN_VALIDACION".equals(this.estado);
    }

    /**
     * Abre el periodo
     */
    public void abrir(Usuario coordinador) {
        this.estado = "ABIERTO";
        this.fechaApertura = OffsetDateTime.now();
        this.coordinador = coordinador;
        this.usuarioUltimaAccion = coordinador;
    }

    /**
     * Cierra el periodo
     */
    public void cerrar(Usuario usuario) {
        this.estado = "CERRADO";
        this.fechaCierre = OffsetDateTime.now();
        this.usuarioUltimaAccion = usuario;
    }

    /**
     * Reabre el periodo
     */
    public void reabrir(Usuario usuario) {
        this.estado = "REABIERTO";
        this.usuarioUltimaAccion = usuario;
    }

    /**
     * Marca el periodo como en validación
     */
    public void marcarEnValidacion(Usuario usuario) {
        this.estado = "EN_VALIDACION";
        this.usuarioUltimaAccion = usuario;
    }

    /**
     * Obtiene año del periodo
     * Ejemplo: "202601" → 2026
     */
    public int getAnio() {
        return Integer.parseInt(periodo.substring(0, 4));
    }

    /**
     * Obtiene mes del periodo
     * Ejemplo: "202601" → 1
     */
    public int getMes() {
        return Integer.parseInt(periodo.substring(4, 6));
    }
}

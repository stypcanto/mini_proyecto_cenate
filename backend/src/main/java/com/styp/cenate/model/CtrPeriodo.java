package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * 📅 Entidad que representa los periodos de control por área.
 * Tabla: ctr_periodo
 *
 * PK Compuesta: (periodo, id_area)
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
 * @version 2.0.0
 * @since 2026-02-19
 */
@Entity
@Table(name = "ctr_periodo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"area", "coordinador", "usuarioUltimaAccion"})
public class CtrPeriodo {

    /**
     * Clave primaria compuesta (periodo, id_area)
     */
    @EmbeddedId
    @EqualsAndHashCode.Include
    private CtrPeriodoId id;

    /**
     * Relación con el área.
     * Usa insertable=false, updatable=false porque id_area ya está en el @EmbeddedId
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_area", insertable = false, updatable = false)
    private Area area;

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
     * ID del coordinador responsable del periodo
     */
    @Column(name = "id_coordinador", nullable = false)
    private Long idCoordinador;

    /**
     * Coordinador responsable del periodo
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_coordinador", insertable = false, updatable = false)
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
     * ID del usuario que realizó la última acción
     */
    @Column(name = "id_usuario_ultima_accion")
    private Long idUsuarioUltimaAccion;

    /**
     * Usuario que realizó la última acción
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_ultima_accion", insertable = false, updatable = false)
    private Usuario usuarioUltimaAccion;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // ==========================================================
    // 🛠️ Métodos de utilidad
    // ==========================================================

    /**
     * Obtiene el código de periodo.
     */
    public String getPeriodo() {
        return id != null ? id.getPeriodo() : null;
    }

    /**
     * Obtiene el ID del área.
     */
    public Long getIdArea() {
        return id != null ? id.getIdArea() : null;
    }

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
     * Verifica si el periodo está reabierto
     */
    public boolean isReabierto() {
        return "REABIERTO".equals(this.estado);
    }

    /**
     * Abre el periodo
     */
    public void abrir(Usuario coordinadorUsuario) {
        this.estado = "ABIERTO";
        this.fechaApertura = OffsetDateTime.now();
        this.idCoordinador = coordinadorUsuario.getIdUser();
        this.idUsuarioUltimaAccion = coordinadorUsuario.getIdUser();
    }

    /**
     * Cierra el periodo
     */
    public void cerrar(Usuario usuario) {
        this.estado = "CERRADO";
        this.fechaCierre = OffsetDateTime.now();
        this.idUsuarioUltimaAccion = usuario.getIdUser();
    }

    /**
     * Reabre el periodo
     */
    public void reabrir(Usuario usuario) {
        this.estado = "REABIERTO";
        this.idUsuarioUltimaAccion = usuario.getIdUser();
    }

    /**
     * Marca el periodo como en validación
     */
    public void marcarEnValidacion(Usuario usuario) {
        this.estado = "EN_VALIDACION";
        this.idUsuarioUltimaAccion = usuario.getIdUser();
    }

    /**
     * Obtiene año del periodo
     * Ejemplo: "202601" → 2026
     */
    public Integer getAnio() {
        String periodo = getPeriodo();
        if (periodo != null && periodo.length() >= 4) {
            try {
                return Integer.parseInt(periodo.substring(0, 4));
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Obtiene mes del periodo
     * Ejemplo: "202601" → 1
     */
    public Integer getMes() {
        String periodo = getPeriodo();
        if (periodo != null && periodo.length() == 6) {
            try {
                return Integer.parseInt(periodo.substring(4, 6));
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}

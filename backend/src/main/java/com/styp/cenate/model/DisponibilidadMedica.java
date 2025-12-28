package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * 📅 Entidad que representa la disponibilidad mensual de un médico.
 * Permite al médico declarar su disponibilidad por turnos (Mañana, Tarde, Completo)
 * con validación de 150 horas mínimas.
 *
 * Estados:
 * - BORRADOR: Médico puede editar libremente
 * - ENVIADO: Médico puede editar hasta que coordinador marque REVISADO (requiere >= 150 horas)
 * - REVISADO: Solo coordinador puede ajustar turnos
 *
 * Tabla: disponibilidad_medica
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-27
 */
@Entity
@Table(name = "disponibilidad_medica", schema = "public",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_disponibilidad_periodo_pers_servicio",
           columnNames = {"id_pers", "periodo", "id_servicio"}
       ))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"personal", "especialidad", "detalles"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DisponibilidadMedica {

    // ==========================================================
    // 🆔 IDENTIFICADOR PRINCIPAL
    // ==========================================================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_disponibilidad")
    private Long idDisponibilidad;

    // ==========================================================
    // 🔗 RELACIONES
    // ==========================================================

    /**
     * Médico que declaró la disponibilidad
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pers", nullable = false)
    private PersonalCnt personal;

    /**
     * Especialidad médica para la cual se declara disponibilidad
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_servicio", nullable = false)
    private DimServicioEssi especialidad;

    // ==========================================================
    // 📊 DATOS PRINCIPALES
    // ==========================================================

    /**
     * Periodo en formato YYYYMM (ejemplo: 202601 = Enero 2026)
     */
    @Column(name = "periodo", length = 6, nullable = false)
    private String periodo;

    /**
     * Estado de la disponibilidad:
     * - BORRADOR: En proceso de creación
     * - ENVIADO: Enviada para revisión
     * - REVISADO: Revisada y aprobada por coordinador
     */
    @Column(name = "estado", length = 20, nullable = false)
    @Builder.Default
    private String estado = "BORRADOR";

    // ==========================================================
    // ✅ VALIDACIÓN DE HORAS
    // ==========================================================

    /**
     * Total de horas calculadas según los turnos registrados
     */
    @Column(name = "total_horas", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal totalHoras = BigDecimal.ZERO;

    /**
     * Horas mínimas requeridas (default: 150 horas/mes)
     */
    @Column(name = "horas_requeridas", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal horasRequeridas = new BigDecimal("150.00");

    // ==========================================================
    // 📝 INFORMACIÓN ADICIONAL
    // ==========================================================

    /**
     * Observaciones generales del médico sobre su disponibilidad
     */
    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    // ==========================================================
    // 📅 CONTROL DE FECHAS
    // ==========================================================

    /**
     * Fecha de creación del registro
     */
    @Column(name = "fecha_creacion", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaCreacion;

    /**
     * Fecha en que el médico envió la disponibilidad
     */
    @Column(name = "fecha_envio", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaEnvio;

    /**
     * Fecha en que el coordinador marcó como revisado
     */
    @Column(name = "fecha_revision", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime fechaRevision;

    // ==========================================================
    // 🕓 AUDITORÍA
    // ==========================================================

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;

    // ==========================================================
    // 🔗 RELACIONES INVERSAS
    // ==========================================================

    /**
     * Detalles de turnos por día
     */
    @Builder.Default
    @OneToMany(mappedBy = "disponibilidad", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<DetalleDisponibilidad> detalles = new HashSet<>();

    // ==========================================================
    // 🧩 MÉTODOS UTILITARIOS
    // ==========================================================

    /**
     * Verifica si la disponibilidad está en estado BORRADOR
     */
    public boolean isBorrador() {
        return "BORRADOR".equalsIgnoreCase(estado);
    }

    /**
     * Verifica si la disponibilidad está en estado ENVIADO
     */
    public boolean isEnviado() {
        return "ENVIADO".equalsIgnoreCase(estado);
    }

    /**
     * Verifica si la disponibilidad está en estado REVISADO
     */
    public boolean isRevisado() {
        return "REVISADO".equalsIgnoreCase(estado);
    }

    /**
     * Cambia el estado a ENVIADO y registra la fecha de envío
     *
     * @throws IllegalStateException si no cumple con las horas mínimas
     */
    public void enviar() {
        if (totalHoras.compareTo(horasRequeridas) < 0) {
            throw new IllegalStateException(
                String.format("No se puede enviar. Se requieren al menos %.2f horas, pero solo tiene %.2f horas",
                    horasRequeridas, totalHoras)
            );
        }
        this.estado = "ENVIADO";
        this.fechaEnvio = OffsetDateTime.now();
    }

    /**
     * Cambia el estado a REVISADO y registra la fecha de revisión
     */
    public void marcarRevisado() {
        this.estado = "REVISADO";
        this.fechaRevision = OffsetDateTime.now();
    }

    /**
     * Obtiene el nombre completo del médico
     */
    public String getNombreCompleto() {
        return personal != null ? personal.getNombreCompleto() : null;
    }

    /**
     * Obtiene el nombre de la especialidad
     */
    public String getNombreEspecialidad() {
        return especialidad != null ? especialidad.getDescServicio() : null;
    }

    /**
     * Obtiene el código de la especialidad
     */
    public String getCodigoEspecialidad() {
        return especialidad != null ? especialidad.getCodServicio() : null;
    }

    /**
     * Obtiene el número de documento del médico
     */
    public String getNumeroDocumento() {
        return personal != null ? personal.getNumDocPers() : null;
    }

    /**
     * Obtiene el email del médico (corporativo o personal)
     */
    public String getEmailMedico() {
        if (personal != null) {
            return personal.getEmailCorpPers() != null ?
                   personal.getEmailCorpPers() :
                   personal.getEmailPers();
        }
        return null;
    }

    /**
     * Verifica si cumple con el mínimo de horas requeridas
     */
    public boolean cumpleMinimo() {
        return totalHoras.compareTo(horasRequeridas) >= 0;
    }

    /**
     * Calcula el porcentaje de cumplimiento de horas
     */
    public BigDecimal getPorcentajeCumplimiento() {
        if (horasRequeridas.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return totalHoras.divide(horasRequeridas, 4, java.math.RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));
    }

    /**
     * Obtiene el régimen laboral del médico
     */
    public String getRegimenLaboral() {
        if (personal != null && personal.getRegimenLaboral() != null) {
            return personal.getRegimenLaboral().getDescRegLab();
        }
        return null;
    }

    /**
     * Verifica si el médico puede editar la disponibilidad
     */
    public boolean puedeEditar() {
        return isBorrador() || isEnviado();
    }

    // ==========================================================
    // 🔧 LIFECYCLE CALLBACKS
    // ==========================================================

    @PrePersist
    protected void onCreate() {
        if (fechaCreacion == null) {
            fechaCreacion = OffsetDateTime.now();
        }
        if (totalHoras == null) {
            totalHoras = BigDecimal.ZERO;
        }
        if (horasRequeridas == null) {
            horasRequeridas = new BigDecimal("150.00");
        }
        if (estado == null || estado.isBlank()) {
            estado = "BORRADOR";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        // Si se está cambiando a ENVIADO, validar horas
        if ("ENVIADO".equalsIgnoreCase(estado) && fechaEnvio == null) {
            fechaEnvio = OffsetDateTime.now();
        }
        // Si se está cambiando a REVISADO, registrar fecha
        if ("REVISADO".equalsIgnoreCase(estado) && fechaRevision == null) {
            fechaRevision = OffsetDateTime.now();
        }
    }
}

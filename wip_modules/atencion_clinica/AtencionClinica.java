package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Entidad que representa una atención clínica de telemedicina
 * Tabla: atencion_clinica
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Entity
@Table(name = "atencion_clinica")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtencionClinica {

    // ========== CLAVE PRIMARIA ==========

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_atencion")
    private Long idAtencion;

    // ========== DATOS DE ATENCIÓN ==========

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pk_asegurado", nullable = false)
    private Asegurado asegurado;

    @Column(name = "fecha_atencion", nullable = false)
    private OffsetDateTime fechaAtencion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ipress", nullable = false)
    private Ipress ipress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_especialidad")
    private DimServicioEssi especialidad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_servicio")
    private DimServicioEssi servicio;

    // ========== DATOS CLÍNICOS ==========

    @Column(name = "motivo_consulta", columnDefinition = "TEXT")
    private String motivoConsulta;

    @Column(name = "antecedentes", columnDefinition = "TEXT")
    private String antecedentes;

    @Column(name = "diagnostico", columnDefinition = "TEXT")
    private String diagnostico;

    @Column(name = "resultados_clinicos", columnDefinition = "TEXT")
    private String resultadosClinicos;

    @Column(name = "observaciones_generales", columnDefinition = "TEXT")
    private String observacionesGenerales;

    @Column(name = "datos_seguimiento", columnDefinition = "TEXT")
    private String datosSeguimiento;

    // ========== SIGNOS VITALES ==========

    @Column(name = "presion_arterial", length = 20)
    private String presionArterial;

    @Column(name = "temperatura", precision = 4, scale = 1)
    private BigDecimal temperatura;

    @Column(name = "peso_kg", precision = 5, scale = 2)
    private BigDecimal pesoKg;

    @Column(name = "talla_cm", precision = 5, scale = 2)
    private BigDecimal tallaCm;

    @Column(name = "imc", precision = 5, scale = 2)
    private BigDecimal imc;

    @Column(name = "saturacion_o2")
    private Integer saturacionO2;

    @Column(name = "frecuencia_cardiaca")
    private Integer frecuenciaCardiaca;

    @Column(name = "frecuencia_respiratoria")
    private Integer frecuenciaRespiratoria;

    // ========== ETIQUETAS DE TRAZABILIDAD ==========

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estrategia")
    private EstrategiaInstitucional estrategia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_atencion", nullable = false)
    private TipoAtencionTelemedicina tipoAtencion;

    // ========== INTERCONSULTA ==========

    @Column(name = "tiene_orden_interconsulta", nullable = false)
    @Builder.Default
    private Boolean tieneOrdenInterconsulta = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_especialidad_interconsulta")
    private DimServicioEssi especialidadInterconsulta;

    @Column(name = "modalidad_interconsulta", length = 20)
    private String modalidadInterconsulta;

    // ========== TELEMONITOREO ==========

    @Column(name = "requiere_telemonitoreo", nullable = false)
    @Builder.Default
    private Boolean requiereTelemonitoreo = false;

    // ========== AUDITORÍA ==========

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_personal_creador", nullable = false)
    private PersonalCnt personalCreador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_personal_modificador")
    private PersonalCnt personalModificador;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // ========== MÉTODOS DE CICLO DE VIDA ==========

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.fechaAtencion == null) {
            this.fechaAtencion = now;
        }
        if (this.tieneOrdenInterconsulta == null) {
            this.tieneOrdenInterconsulta = false;
        }
        if (this.requiereTelemonitoreo == null) {
            this.requiereTelemonitoreo = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // ========== MÉTODOS DE UTILIDAD ==========

    /**
     * Verifica si la atención tiene signos vitales registrados
     *
     * @return true si tiene al menos un signo vital
     */
    public boolean tieneSignosVitales() {
        return presionArterial != null ||
               temperatura != null ||
               pesoKg != null ||
               tallaCm != null ||
               saturacionO2 != null ||
               frecuenciaCardiaca != null ||
               frecuenciaRespiratoria != null;
    }

    /**
     * Verifica si la interconsulta está completa
     *
     * @return true si tiene orden de interconsulta con todos los datos
     */
    public boolean tieneInterconsultaCompleta() {
        return Boolean.TRUE.equals(tieneOrdenInterconsulta) &&
               especialidadInterconsulta != null &&
               modalidadInterconsulta != null;
    }

    /**
     * Obtiene el nombre del asegurado de forma segura
     *
     * @return Nombre del asegurado o null si no está cargado
     */
    public String getNombreAsegurado() {
        return asegurado != null ? asegurado.getPaciente() : null;
    }

    /**
     * Obtiene el DNI del asegurado de forma segura
     *
     * @return DNI del asegurado o null si no está cargado
     */
    public String getDniAsegurado() {
        return asegurado != null ? asegurado.getDocPaciente() : null;
    }
}

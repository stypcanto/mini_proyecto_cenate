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
 * para un asegurado en el sistema CENATE.
 *
 * Incluye datos de la atención, signos vitales, interconsulta y telemonitoreo.
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Entity
@Table(name = "atencion_clinica")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtencionClinica {

    // =====================================================================
    // CLAVE PRIMARIA
    // =====================================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_atencion")
    private Long idAtencion;

    // =====================================================================
    // DATOS DE ATENCIÓN
    // =====================================================================

    @Column(name = "pk_asegurado", nullable = false, length = 50)
    private String pkAsegurado;

    @Column(name = "fecha_atencion", nullable = false)
    private OffsetDateTime fechaAtencion;

    @Column(name = "id_ipress", nullable = false)
    private Long idIpress;

    @Column(name = "id_especialidad")
    private Long idEspecialidad;

    @Column(name = "id_servicio")
    private Long idServicio;

    // =====================================================================
    // DATOS CLÍNICOS
    // =====================================================================

    @Column(name = "motivo_consulta", columnDefinition = "TEXT")
    private String motivoConsulta;

    @Column(name = "antecedentes", columnDefinition = "TEXT")
    private String antecedentes;

    @Column(name = "diagnostico", columnDefinition = "TEXT")
    private String diagnostico;

    @Column(name = "cie10_codigo", length = 20)
    private String cie10Codigo;

    @Column(name = "recomendacion_especialista", columnDefinition = "TEXT")
    private String recomendacionEspecialista;

    @Column(name = "tratamiento", columnDefinition = "TEXT")
    private String tratamiento;

    @Column(name = "resultados_clinicos", columnDefinition = "TEXT")
    private String resultadosClinicos;

    @Column(name = "observaciones_generales", columnDefinition = "TEXT")
    private String observacionesGenerales;

    @Column(name = "datos_seguimiento", columnDefinition = "TEXT")
    private String datosSeguimiento;

    // =====================================================================
    // SIGNOS VITALES
    // =====================================================================

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

    // =====================================================================
    // ETIQUETAS DE TRAZABILIDAD
    // =====================================================================

    @Column(name = "id_estrategia")
    private Long idEstrategia;

    @Column(name = "id_tipo_atencion", nullable = false)
    private Long idTipoAtencion;

    // =====================================================================
    // INTERCONSULTA
    // =====================================================================

    @Column(name = "tiene_orden_interconsulta", nullable = false)
    @Builder.Default
    private Boolean tieneOrdenInterconsulta = false;

    @Column(name = "id_especialidad_interconsulta")
    private Long idEspecialidadInterconsulta;

    @Column(name = "modalidad_interconsulta", length = 20)
    private String modalidadInterconsulta; // 'PRESENCIAL' o 'VIRTUAL'

    // =====================================================================
    // TELEMONITOREO
    // =====================================================================

    @Column(name = "requiere_telemonitoreo", nullable = false)
    @Builder.Default
    private Boolean requiereTelemonitoreo = false;

    // =====================================================================
    // AUDITORÍA
    // =====================================================================

    @Column(name = "id_personal_creador", nullable = false)
    private Long idPersonalCreador;

    @Column(name = "id_personal_modificador")
    private Long idPersonalModificador;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // =====================================================================
    // LIFECYCLE CALLBACKS
    // =====================================================================

    /**
     * Método ejecutado antes de persistir la entidad
     */
    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.tieneOrdenInterconsulta == null) {
            this.tieneOrdenInterconsulta = false;
        }
        if (this.requiereTelemonitoreo == null) {
            this.requiereTelemonitoreo = false;
        }
    }

    /**
     * Método ejecutado antes de actualizar la entidad
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // =====================================================================
    // MÉTODOS DE UTILIDAD
    // =====================================================================

    /**
     * Verifica si la atención tiene signos vitales registrados
     *
     * @return true si tiene al menos un signo vital, false en caso contrario
     */
    public boolean tieneSignosVitales() {
        return presionArterial != null ||
               temperatura != null ||
               pesoKg != null ||
               tallaCm != null ||
               imc != null ||
               saturacionO2 != null ||
               frecuenciaCardiaca != null ||
               frecuenciaRespiratoria != null;
    }

    /**
     * Verifica si la atención está completa (tiene datos clínicos esenciales)
     *
     * @return true si tiene motivo y diagnóstico, false en caso contrario
     */
    public boolean isCompleta() {
        return motivoConsulta != null && !motivoConsulta.trim().isEmpty() &&
               diagnostico != null && !diagnostico.trim().isEmpty();
    }

    /**
     * Obtiene una descripción resumida de la atención
     *
     * @return String con resumen de la atención
     */
    public String getResumen() {
        StringBuilder sb = new StringBuilder();
        sb.append("Atención #").append(idAtencion);
        sb.append(" - Fecha: ").append(fechaAtencion != null ? fechaAtencion.toLocalDate() : "N/A");
        if (motivoConsulta != null && motivoConsulta.length() > 50) {
            sb.append(" - Motivo: ").append(motivoConsulta.substring(0, 47)).append("...");
        } else if (motivoConsulta != null) {
            sb.append(" - Motivo: ").append(motivoConsulta);
        }
        return sb.toString();
    }
}

package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * DTO de respuesta para una atención clínica
 * Incluye datos enriquecidos (nombres, no solo IDs)
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtencionClinicaResponseDTO {

    // Identificador
    private Long idAtencion;

    // Datos de Atención
    private String pkAsegurado;
    private String nombreAsegurado;
    private OffsetDateTime fechaAtencion;

    // IPRESS y Especialidad
    private Long idIpress;
    private String nombreIpress;
    private Long idEspecialidad;
    private String nombreEspecialidad;
    private Long idServicio;

    // Datos Clínicos
    private String motivoConsulta;
    private String antecedentes;
    private String diagnostico;

    // CIE-10: Campos legacy (compatibilidad)
    private String cie10Codigo;
    private String cie10Descripcion;

    // CIE-10: Lista completa de diagnósticos (NUEVO - Soporte múltiple)
    private List<DiagnosticoCie10DTO> diagnosticosCie10;

    private String recomendacionEspecialista;
    private String tratamiento;
    private String resultadosClinicos;
    private String observacionesGenerales;
    private String datosSeguimiento;

    // Signos Vitales (agrupados)
    private SignosVitalesDTO signosVitales;

    // Etiquetas de Trazabilidad
    private Long idEstrategia;
    private String nombreEstrategia;
    private String siglaEstrategia;
    private Long idTipoAtencion;
    private String nombreTipoAtencion;
    private String siglaTipoAtencion;

    // Interconsulta
    private Boolean tieneOrdenInterconsulta;
    private Long idEspecialidadInterconsulta;
    private String nombreEspecialidadInterconsulta;
    private String modalidadInterconsulta;

    // Telemonitoreo
    private Boolean requiereTelemonitoreo;

    // Profesional que creó la atención
    private Long idPersonalCreador;
    private String nombreProfesional;

    // Profesional que modificó la atención
    private Long idPersonalModificador;
    private String nombreModificador;

    // Auditoría
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // Campos calculados
    private Boolean tieneSignosVitales;
    private Boolean isCompleta;

    /**
     * DTO para agrupar signos vitales
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SignosVitalesDTO {
        private String presionArterial;
        private BigDecimal temperatura;
        private BigDecimal pesoKg;
        private BigDecimal tallaCm;
        private BigDecimal imc;
        private Integer saturacionO2;
        private Integer frecuenciaCardiaca;
        private Integer frecuenciaRespiratoria;
    }
}

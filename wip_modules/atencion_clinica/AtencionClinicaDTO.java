package com.styp.cenate.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * DTO para transferir datos completos de una atención clínica (lectura)
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AtencionClinicaDTO {

    // ========== IDENTIFICACIÓN ==========
    private Long idAtencion;
    private OffsetDateTime fechaAtencion;

    // ========== DATOS DEL ASEGURADO ==========
    private String pkAsegurado;
    private String dniPaciente;
    private String nombrePaciente;
    private Integer edadPaciente;

    // ========== DATOS DE ATENCIÓN ==========
    private Long idIpress;
    private String nombreIpress;
    private Long idEspecialidad;
    private String nombreEspecialidad;
    private Long idServicio;
    private String nombreServicio;

    // ========== DATOS CLÍNICOS ==========
    private String motivoConsulta;
    private String antecedentes;
    private String diagnostico;
    private String resultadosClinicos;
    private String observacionesGenerales;
    private String datosSeguimiento;

    // ========== SIGNOS VITALES ==========
    private String presionArterial;
    private BigDecimal temperatura;
    private BigDecimal pesoKg;
    private BigDecimal tallaCm;
    private BigDecimal imc;
    private Integer saturacionO2;
    private Integer frecuenciaCardiaca;
    private Integer frecuenciaRespiratoria;

    // ========== ETIQUETAS DE TRAZABILIDAD ==========
    private Long idEstrategia;
    private String nombreEstrategia;
    private String siglaEstrategia;

    private Long idTipoAtencion;
    private String nombreTipoAtencion;
    private String siglaTipoAtencion;

    // ========== INTERCONSULTA ==========
    private Boolean tieneOrdenInterconsulta;
    private Long idEspecialidadInterconsulta;
    private String nombreEspecialidadInterconsulta;
    private String modalidadInterconsulta;

    // ========== TELEMONITOREO ==========
    private Boolean requiereTelemonitoreo;

    // ========== AUDITORÍA ==========
    private Long idPersonalCreador;
    private String nombrePersonalCreador;
    private String dniPersonalCreador;

    private Long idPersonalModificador;
    private String nombrePersonalModificador;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // ========== CAMPOS CALCULADOS ==========
    private Boolean tieneSignosVitales;
    private Boolean tieneInterconsultaCompleta;
}

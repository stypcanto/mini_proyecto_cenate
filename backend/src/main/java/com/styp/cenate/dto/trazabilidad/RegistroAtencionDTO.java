package com.styp.cenate.dto.trazabilidad;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * ✅ v1.81.0: DTO para registro centralizado de atenciones en el historial
 *
 * Este DTO es utilizado por TODOS los módulos para registrar atenciones
 * en la tabla maestra atencion_clinica de forma transparente.
 *
 * Soporta:
 * - Atenciones desde MisPacientes
 * - Atenciones desde TeleECG IPRESS
 * - Atenciones desde Gestión de Citas
 * - Extensible a futuros módulos
 *
 * @author Claude Code
 * @version 1.81.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroAtencionDTO {

    // =====================================================================
    // IDENTIFICACIÓN DEL ASEGURADO
    // =====================================================================

    private String pkAsegurado;
    private String dniAsegurado;

    // =====================================================================
    // ORIGEN DEL REGISTRO
    // =====================================================================

    /**
     * Módulo de origen:
     * - "MIS_PACIENTES": Atención desde módulo de Mis Pacientes
     * - "TELEECG_IPRESS": Evaluación de ECG desde IPRESS Workspace
     * - "GESTION_CITAS": Atención desde Gestión de Citas
     */
    private String origenModulo;

    /** ID de referencia en tabla de origen (id_solicitud, id_imagen, id_cita) */
    private Long idReferenciaOrigen;

    // =====================================================================
    // DATOS DE LA ATENCIÓN
    // =====================================================================

    private OffsetDateTime fechaAtencion;
    private Long idIpress;
    private Long idEspecialidad;
    private Long idServicio;
    private Long idMedico;

    // =====================================================================
    // INFORMACIÓN CLÍNICA
    // =====================================================================

    private String motivoConsulta;
    private String diagnostico;
    private String tratamiento;
    private String observacionesGenerales;

    // =====================================================================
    // DIAGNÓSTICOS CIE-10 (OPCIONAL)
    // =====================================================================

    private String cie10Codigo;
    private List<DiagnosticoCie10DTO> diagnosticosCie10;

    // =====================================================================
    // SIGNOS VITALES (OPCIONAL)
    // =====================================================================

    private SignosVitalesDTO signosVitales;

    // =====================================================================
    // ESTRATEGIA DE ATENCIÓN
    // =====================================================================

    private Long idEstrategia;
}

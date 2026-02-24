package com.styp.cenate.dto.bolsas;

import lombok.Data;
import java.util.List;

/**
 * Request DTO para carga masiva de pacientes desde Excel (v1.65.0)
 * Reemplaza el proceso manual de SQL+Python por un endpoint REST
 *
 * Campos por defecto:
 * - especialidad: ENFERMERIA
 * - idServicio: 56 (ENFERMERÍA cod F11 en dim_servicio_essi)
 * - responsableGestoraId: 688 (Gestora Claudia Lizbeth Valencia)
 */
@Data
public class CargaMasivaRequest {

    /** id_pers del profesional de salud (dim_personal_cnt) */
    private Long idPersonal;

    /** Especialidad asignada a los registros */
    private String especialidad = "ENFERMERIA";

    /** ID del servicio (dim_servicio_essi) */
    private Long idServicio = 56L;

    /** ID del usuario gestora responsable */
    private Long responsableGestoraId = 688L;

    /** Lista de pacientes leídos desde el Excel */
    private List<PacienteExcelRow> pacientes;

    @Data
    public static class PacienteExcelRow {

        /** DNI del paciente (columna DOC_PACIENTE) */
        private String docPaciente;

        /** Nombre completo del paciente (columna PACIENTE) */
        private String paciente;

        /** Sexo: F / M (columna SEXO) */
        private String sexo;

        /** Edad en años (columna EDAD) */
        private Integer edad;

        /** Teléfono celular (columna TEL_MOVIL) */
        private String telMovil;

        /** Código de adscripción CAS (columna CAS_ADSCRIPCION) */
        private String casAdscripcion;

        /** Código IPRESS de atención (columna IPRESS_ATENCION) */
        private String ipressAtencion;

        /** Hora de la cita en formato HH:MM:SS (columna HORA_CITA) */
        private String horaCita;

        /** Tipo de cita: RECITA / TELECONSULTA / INTERCONSULTA (columna TIPO_CITA) */
        private String tipoCita;
    }
}

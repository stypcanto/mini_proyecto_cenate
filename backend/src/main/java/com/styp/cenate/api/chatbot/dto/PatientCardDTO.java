package com.styp.cenate.api.chatbot.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * DTO de respuesta para la tarjeta de paciente del chatbot de trazabilidad.
 *
 * Consolida datos del asegurado, registros de bolsa y métricas de deserción
 * en un único payload estructurado para consumo del chatbot Spring AI.
 *
 * Diseño:
 * - encontrado=false  cuando el DNI no tiene registros en dim_solicitud_bolsa
 * - encontrado=true   con la lista completa de registros (activos + archivados)
 * - alertaSeveridad   derivada de totalDeserciones para orientar la respuesta del LLM
 *
 * @version v1.75.1
 * @since 2026-02-26
 */
@Data
@Builder
public class PatientCardDTO {

    /** Indica si se encontraron registros para el DNI solicitado. */
    private boolean encontrado;

    /** Datos de identificación y contacto del paciente. */
    private PacienteInfo paciente;

    /** Lista de todos los registros de bolsa (activos e inactivos) del paciente. */
    private List<RegistroInfo> registros;

    /**
     * Cantidad de registros que representan una deserción.
     * Criterio: condicionMedica contiene "Deserci" (insensible a mayúsculas)
     *           O estado contiene "DESERTOR".
     */
    private int totalDeserciones;

    /**
     * Nivel de alerta basado en totalDeserciones:
     * - "VERDE"   → 0 deserciones
     * - "AMARILLA" → 1 o 2 deserciones
     * - "ROJA"    → 3 o más deserciones
     */
    private String alertaSeveridad;

    // =========================================================================
    // Clases internas
    // =========================================================================

    /** Datos de identificación y contacto del paciente. */
    @Data
    @Builder
    public static class PacienteInfo {

        /** Nombre completo tal como aparece en la tabla asegurados (campo paciente). */
        private String nombre;

        /** Documento de identidad (DNI). */
        private String dni;

        /**
         * Teléfono de contacto.
         * Prioridad: Asegurado.telCelular → Asegurado.telFijo → null
         */
        private String telefono;

        /**
         * Correo electrónico.
         * Fuente: Asegurado.correoElectronico; null si no existe o no se encuentra el asegurado.
         */
        private String email;
    }

    /** Datos de un registro individual de dim_solicitud_bolsa. */
    @Data
    @Builder
    public static class RegistroInfo {

        /** PK de dim_solicitud_bolsa (id_solicitud). */
        private Long id;

        /** Especialidad médica asignada al registro. */
        private String especialidad;

        /**
         * Estado de gestión de citas (cod_estado_cita o campo estado).
         * Ejemplos: PENDIENTE, CITADO, ATENDIDO, DESERTOR.
         */
        private String estado;

        /** true si el registro está activo (activo = true en BD). */
        private boolean activo;

        /**
         * Condición médica registrada por el médico.
         * Puede contener valores como "Deserción voluntaria".
         */
        private String condicionMedica;

        /**
         * Fecha de atención programada (ISO-8601: yyyy-MM-dd).
         * Null si no hay fecha asignada.
         */
        private String fechaAtencion;

        /**
         * Nombre completo del médico asignado (apePaterPers apeMaterPers, nomPers).
         * Null si no hay médico asignado o no se encuentra en dim_personal_cnt.
         */
        private String nombreMedico;
    }
}

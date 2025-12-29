package com.styp.cenate.security.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Anotación para marcar métodos que acceden a datos sensibles y requieren auditoría automática
 *
 * Uso:
 * @AuditarAccesoSensible(
 *     accion = "VIEW_PATIENT_DETAILS",
 *     descripcion = "Acceso a datos de paciente",
 *     modulo = "PACIENTES"
 * )
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2025-12-29
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AuditarAccesoSensible {

    /**
     * Código de la acción a registrar
     * Ejemplos: VIEW_PATIENT_DETAILS, EXPORT_PATIENT_DATA, SEARCH_PATIENTS
     */
    String accion();

    /**
     * Descripción breve de la acción
     * Ejemplo: "Acceso a datos de paciente"
     */
    String descripcion() default "";

    /**
     * Módulo del sistema
     * Ejemplo: PACIENTES, HISTORIA_CLINICA, REPORTES
     */
    String modulo();

    /**
     * Nivel de severidad
     * Valores: INFO, WARNING, ERROR, CRITICAL
     */
    String nivel() default "INFO";

    /**
     * Indica si se debe incluir el ID del registro accedido
     * Por defecto es true
     */
    boolean incluirIdAfectado() default true;
}

package com.styp.cenate.ai.domain.port.out;

import java.util.Map;

/**
 * Puerto de salida para Function Calling del LLM.
 *
 * Permite al LLM invocar funciones del sistema CENATE para obtener
 * datos reales (disponibilidad médica, información de paciente, etc.)
 * o ejecutar acciones (registrar cita, enviar notificación).
 *
 * Implementaciones: SpringAIFunctionCallingAdapter
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.35.0
 * @since 2026-01-26
 */
public interface FunctionCallingPort {

    /**
     * Ejecuta una función invocada por el LLM.
     *
     * @param functionName Nombre de la función (ej: "buscarDisponibilidadMedica")
     * @param arguments Argumentos de la función en formato JSON
     * @return Resultado de la ejecución (será enviado de vuelta al LLM)
     * @throws com.styp.cenate.ai.domain.exception.FunctionCallException Si la función no existe o falla
     */
    String executeFunction(String functionName, Map<String, Object> arguments);

    /**
     * Registra una nueva función disponible para el LLM.
     *
     * @param functionName Nombre único de la función
     * @param description Descripción para que el LLM entienda cuándo usarla
     * @param parametersSchema JSON Schema de los parámetros esperados
     * @param executor Lambda que ejecuta la función
     */
    void registerFunction(
        String functionName,
        String description,
        Map<String, Object> parametersSchema,
        FunctionExecutor executor
    );

    /**
     * Lista todas las funciones disponibles.
     *
     * @return Mapa de nombre → descripción
     */
    Map<String, String> listAvailableFunctions();

    /**
     * Interfaz funcional para ejecutores de funciones.
     */
    @FunctionalInterface
    interface FunctionExecutor {
        String execute(Map<String, Object> arguments);
    }
}

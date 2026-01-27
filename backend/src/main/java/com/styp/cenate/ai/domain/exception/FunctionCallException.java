package com.styp.cenate.ai.domain.exception;

/**
 * Excepción lanzada cuando hay error en la ejecución de Function Calling.
 *
 * Puede ocurrir por:
 * - Función no registrada
 * - Argumentos inválidos
 * - Error en la ejecución de la función
 * - Permisos insuficientes
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.35.0
 * @since 2026-01-26
 */
public class FunctionCallException extends RuntimeException {

    private final String functionName;

    public FunctionCallException(String mensaje) {
        super(mensaje);
        this.functionName = null;
    }

    public FunctionCallException(String mensaje, Throwable causa) {
        super(mensaje, causa);
        this.functionName = null;
    }

    public FunctionCallException(String mensaje, String functionName) {
        super(mensaje);
        this.functionName = functionName;
    }

    public FunctionCallException(String mensaje, Throwable causa, String functionName) {
        super(mensaje, causa);
        this.functionName = functionName;
    }

    public String getFunctionName() {
        return functionName;
    }
}

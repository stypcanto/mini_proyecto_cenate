package com.styp.cenate.ai.domain.exception;

/**
 * Excepción lanzada cuando hay error en la comunicación con el servicio LLM.
 *
 * Puede ocurrir por:
 * - Error de red o timeout
 * - Cuota API excedida
 * - Modelo no disponible
 * - Respuesta inválida del LLM
 * - Error de autenticación
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.35.0
 * @since 2026-01-26
 */
public class LLMServiceException extends RuntimeException {

    private final String proveedorLLM;
    private final Integer httpStatusCode;

    public LLMServiceException(String mensaje) {
        super(mensaje);
        this.proveedorLLM = null;
        this.httpStatusCode = null;
    }

    public LLMServiceException(String mensaje, Throwable causa) {
        super(mensaje, causa);
        this.proveedorLLM = null;
        this.httpStatusCode = null;
    }

    public LLMServiceException(String mensaje, String proveedorLLM, Integer httpStatusCode) {
        super(mensaje);
        this.proveedorLLM = proveedorLLM;
        this.httpStatusCode = httpStatusCode;
    }

    public LLMServiceException(String mensaje, Throwable causa, String proveedorLLM, Integer httpStatusCode) {
        super(mensaje, causa);
        this.proveedorLLM = proveedorLLM;
        this.httpStatusCode = httpStatusCode;
    }

    public String getProveedorLLM() {
        return proveedorLLM;
    }

    public Integer getHttpStatusCode() {
        return httpStatusCode;
    }
}

package com.styp.cenate.exception;

/**
 * Excepción lanzada cuando falla la sincronización entre sistemas de citas
 *
 * Se utiliza en el módulo de sincronización de estados ATENDIDO entre
 * solicitud_cita (chatbot) y dim_solicitud_bolsa (módulo bolsas).
 *
 * @version v1.43.0
 * @since 2026-02-05
 */
public class SincronizacionException extends RuntimeException {

    public SincronizacionException(String message) {
        super(message);
    }

    public SincronizacionException(String message, Throwable cause) {
        super(message, cause);
    }
}

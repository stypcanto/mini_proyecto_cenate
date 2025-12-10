package com.styp.cenate.service.formdiag;

import com.styp.cenate.dto.formdiag.FirmaDigitalRequest;
import com.styp.cenate.dto.formdiag.FirmaDigitalResponse;

/**
 * Servicio para gestionar la firma digital de formularios de diagnóstico
 */
public interface FirmaDigitalService {

    /**
     * Firma un formulario de diagnóstico y almacena el PDF firmado en base de datos
     *
     * @param request Datos de la firma digital
     * @param username Usuario que realiza la operación
     * @return Respuesta con el resultado de la firma
     */
    FirmaDigitalResponse firmarFormulario(FirmaDigitalRequest request, String username);

    /**
     * Verifica la firma digital de un formulario
     *
     * @param idFormulario ID del formulario a verificar
     * @return Respuesta con el resultado de la verificación
     */
    FirmaDigitalResponse verificarFirma(Integer idFormulario);

    /**
     * Obtiene el PDF firmado de un formulario
     *
     * @param idFormulario ID del formulario
     * @return Bytes del PDF o null si no existe
     */
    byte[] obtenerPdfFirmado(Integer idFormulario);

    /**
     * Verifica si un formulario ya está firmado
     *
     * @param idFormulario ID del formulario
     * @return true si está firmado, false si no
     */
    boolean estaFirmado(Integer idFormulario);
}

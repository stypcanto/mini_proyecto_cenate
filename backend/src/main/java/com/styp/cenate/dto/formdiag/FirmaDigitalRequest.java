package com.styp.cenate.dto.formdiag;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para recibir los datos de firma digital desde el frontend
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FirmaDigitalRequest {

    /** ID del formulario a firmar */
    private Integer idFormulario;

    /** PDF en formato Base64 */
    private String pdfBase64;

    /** Firma digital en formato Base64 */
    private String firmaDigital;

    /** Certificado X.509 del firmante en formato Base64 (DER o PEM) */
    private String certificado;

    /** Hash SHA-256 del documento original */
    private String hashDocumento;

    /** DNI del firmante (extraído del certificado en frontend) */
    private String dniFirmante;

    /** Nombre del firmante (extraído del certificado en frontend) */
    private String nombreFirmante;

    /** Algoritmo usado para la firma (ej: SHA256withRSA) */
    private String algoritmoFirma;
}

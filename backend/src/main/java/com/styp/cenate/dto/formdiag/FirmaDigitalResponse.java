package com.styp.cenate.dto.formdiag;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de respuesta con información de la firma digital
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FirmaDigitalResponse {

    /** Indica si la operación fue exitosa */
    private boolean exitoso;

    /** Mensaje descriptivo del resultado */
    private String mensaje;

    /** ID del formulario firmado */
    private Integer idFormulario;

    /** Hash SHA-256 del documento firmado */
    private String hashDocumento;

    /** Fecha y hora de la firma */
    private LocalDateTime fechaFirma;

    /** DNI del firmante */
    private String dniFirmante;

    /** Nombre del firmante */
    private String nombreFirmante;

    /** Entidad certificadora */
    private String entidadCertificadora;

    /** Número de serie del certificado */
    private String numeroSerieCertificado;

    /** Tamaño del PDF en bytes */
    private Long pdfTamanio;

    /** Estado del formulario después de firmar */
    private String estado;

    /** Información adicional de validación del certificado */
    private CertificadoInfo certificadoInfo;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CertificadoInfo {
        private String titular;
        private String emisor;
        private LocalDateTime validoDesde;
        private LocalDateTime validoHasta;
        private boolean esValido;
        private String tipoDispositivo; // DNIe, Token USB, etc.
    }
}

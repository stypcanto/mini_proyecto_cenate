package com.styp.cenate.dto.formdiag;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para listar formularios de diagnóstico (vista resumida)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormDiagListResponse {

    private Integer idFormulario;
    private Long idIpress;
    private String nombreIpress;
    private String codigoIpress;
    private Long idRed;
    private String nombreRed;
    private String nombreMacroregion;
    private Integer anio;
    private String estado;
    private String usuarioRegistro;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaEnvio;

    // Campos de firma digital
    private Boolean tieneFirma;
    private String firmaDigital;
    private String dniFirmante;
    private String nombreFirmante;
    private LocalDateTime fechaFirma;
    private String entidadCertificadora;
    private String hashDocumento;
    private Long pdfTamanio;
    private String pdfNombre;

    // Datos generales resumidos
    private DatosGeneralesResumen datosGenerales;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DatosGeneralesResumen {
        private String directorNombre;
        private String responsableNombre;
    }
}

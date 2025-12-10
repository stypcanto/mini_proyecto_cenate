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
    private String nombreRed;
    private String nombreMacroregion;
    private Integer anio;
    private String estado;
    private String usuarioRegistro;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaEnvio;
}

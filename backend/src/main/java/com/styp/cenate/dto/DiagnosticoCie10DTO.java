// ========================================================================
// DiagnosticoCie10DTO.java - DTO para diagnóstico CIE-10
// ------------------------------------------------------------------------
// CENATE 2026 | DTO para diagnósticos CIE-10 individuales
// ========================================================================

package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosticoCie10DTO {

    private String cie10Codigo;
    private String cie10Descripcion;
    private Boolean esPrincipal;
    private Short orden;
    private String observaciones;
}

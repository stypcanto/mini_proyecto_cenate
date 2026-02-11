package com.styp.cenate.dto.trazabilidad;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para diagnósticos CIE-10
 *
 * @author Claude Code
 * @version 1.81.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosticoCie10DTO {

    private String codigo;
    private String descripcion;
    private boolean esPrincipal;
}

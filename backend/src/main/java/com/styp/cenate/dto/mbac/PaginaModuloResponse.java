package com.styp.cenate.dto.mbac;

import lombok.*;

/**
 * DTO que representa una página accesible dentro de un módulo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaginaModuloResponse {
    private Integer idPagina;
    private String nombrePagina;
    private String rutaPagina;
}
package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * DTO para respuesta de CIE10
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cie10Response {
    private Long idCie10;
    private String codigo;
    private String codigoPadre0;
    private String codigoPadre1;
    private String codigoPadre2;
    private String codigoPadre3;
    private String codigoPadre4;
    private String descripcion;
    private Integer nivel;
    private String fuente;
    private Boolean activo;
    private OffsetDateTime createdAt;
}

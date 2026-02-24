package com.styp.cenate.dto.enfermeria;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO simplificado para listar enfermeras activas en el selector de rescate.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnfermeraSimpleDto {

    private Long idPersonal;
    private String nombreCompleto;
    private String numDoc;
}

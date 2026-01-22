package com.styp.cenate.dto.filtros;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RedOptionDTO {
    private Long id;
    private String codigo;
    private String descripcion;
    private Long macroId;
}

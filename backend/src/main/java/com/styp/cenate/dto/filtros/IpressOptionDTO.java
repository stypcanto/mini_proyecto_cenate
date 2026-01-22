package com.styp.cenate.dto.filtros;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class IpressOptionDTO {
    private Long id;
    private String codigo;
    private String descripcion;
    private Long redId;
}

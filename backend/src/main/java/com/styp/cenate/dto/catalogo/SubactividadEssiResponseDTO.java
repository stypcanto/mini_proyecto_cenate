package com.styp.cenate.dto.catalogo;

import java.time.OffsetDateTime;
import lombok.Data;

@Data
public class SubactividadEssiResponseDTO {

    private Long idSubactividad;
    private String codSubactividad;
    private String descSubactividad;
    private String estado;
    private boolean esCenate;
    private OffsetDateTime createdAt;

}

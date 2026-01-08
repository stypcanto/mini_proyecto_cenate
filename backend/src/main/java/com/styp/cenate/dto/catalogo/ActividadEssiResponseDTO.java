package com.styp.cenate.dto.catalogo;

import java.time.OffsetDateTime;
import lombok.Data;

@Data
public class ActividadEssiResponseDTO {

    private Long idActividad;
    private String codActividad;
    private String descActividad;
    private String estado;
    private boolean esCenate;
    private OffsetDateTime createdAt;
}

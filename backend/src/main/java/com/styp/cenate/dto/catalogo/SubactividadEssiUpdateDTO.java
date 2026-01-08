package com.styp.cenate.dto.catalogo;

import lombok.Data;

@Data
public class SubactividadEssiUpdateDTO {

    
    private String codSubactividad;
    private String descSubactividad;
    private Boolean esCenate;

    
    private String estado; // "A" / "I"
}

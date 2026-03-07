package com.styp.cenate.dto.sgdt;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicoSimpleDto {
    private Long idPersonal;
    private String nombreCompleto;
    private String numDoc;
}

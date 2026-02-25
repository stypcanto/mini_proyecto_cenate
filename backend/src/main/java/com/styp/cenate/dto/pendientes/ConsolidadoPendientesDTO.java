package com.styp.cenate.dto.pendientes;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsolidadoPendientesDTO {

    private Long idConsPend;
    private String dniMedico;
    private String profesional;
    private LocalDate fechaCita;
    private String subactividad;
    private String servicio;
    private Integer abandono;
}

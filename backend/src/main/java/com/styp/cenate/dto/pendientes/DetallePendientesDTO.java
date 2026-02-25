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
public class DetallePendientesDTO {

    private Long idDetPend;
    private String dniMedico;
    private String profesional;
    private LocalDate fechaCita;
    private String subactividad;
    private String servicio;
    private String docPaciente;
    private String paciente;
    private String abandono;
}

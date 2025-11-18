package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AseguradoDTO {
    private String pkAsegurado;
    private String docPaciente;
    private String paciente;  // Nombre completo del paciente
    private LocalDate fecnacimpaciente;
    private Integer edad;  // Edad calculada a partir de la fecha de nacimiento
    private String sexo;
    private String tipoPaciente;
    private String telFijo;
    private String tipoSeguro;
    private String casAdscripcion;
    private String nombreIpress;  // Nombre de la IPRESS desde dim_ipress
    private String nombreRed;  // Nombre de la Red desde dim_red
    private String periodo;
}

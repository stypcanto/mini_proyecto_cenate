package com.styp.cenate.dto.control_horarios;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para códigos de horario (dim_horario).
 * Usado en el modal de turnos del calendario.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DimHorarioDTO {

    private Long idHorario;
    private String codHorario;
    private String codHorarioVisual;
    private String descHorario;
    private String horaInicio;
    private String horaFin;
    private BigDecimal horas;
    private Boolean cruzaDia;
    private String categoria;
    private String color;
    private Short ordenVisualizacion;
    private Boolean visibleMedico;
}

package com.styp.cenate.dto.control_horarios;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * Request para crear nueva solicitud de horario
 * v1.79.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCtrHorarioRequest {
    private String periodo;              // Código del período
    private Long idArea;                 // ID del área
    private Long idGrupoProg;            // ID del grupo programático
    private Long idPers;                 // ID del personal/médico
    private Long idRegLab;               // ID del régimen laboral
    private Long idServicio;             // ID del servicio (nullable)
    private Integer turnosTotales;       // Total de turnos a registrar
    private BigDecimal horasTotales;     // Total de horas
    private String observaciones;        // Observaciones opcionales
}

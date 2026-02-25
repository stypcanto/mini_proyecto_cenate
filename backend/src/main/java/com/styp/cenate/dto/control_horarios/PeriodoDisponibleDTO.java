package com.styp.cenate.dto.control_horarios;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para listar períodos disponibles
 * v1.79.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeriodoDisponibleDTO {
    private String periodo;              // Código del período (ej: "202502")
    private Long idArea;                 // ID del área
    private String descArea;             // Descripción del área
    private String estado;               // ABIERTO, REABIERTO, CERRADO, etc
    private int totalHorarios;           // Total de horarios registrados para este período
}

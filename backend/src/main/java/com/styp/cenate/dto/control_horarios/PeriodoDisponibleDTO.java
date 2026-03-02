package com.styp.cenate.dto.control_horarios;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

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
    private String estadoPeriodo;        // Estado del periodo: ABIERTO, REABIERTO, CERRADO, etc
    private int totalHorarios;           // Total de horarios registrados para este período
    private LocalDate fechaInicio;       // Fecha de inicio del período
    private LocalDate fechaFin;          // Fecha de fin del período
    private Long idCtrHorario;           // ID de la solicitud del médico (puede ser null)
    private Boolean tieneSolicitud;      // Indica si el médico ya registró solicitud
    private Short idEstadoSolicitud;     // Estado de la solicitud del médico (1=INICIADO, 2=EN PROCESO, etc)
    private String nombreEstadoSolicitud; // Nombre del estado de la solicitud
}

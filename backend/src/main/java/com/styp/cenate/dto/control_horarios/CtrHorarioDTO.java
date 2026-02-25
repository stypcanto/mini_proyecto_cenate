package com.styp.cenate.dto.control_horarios;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO para control de horarios (ctr_horario)
 * v1.79.0 - Gestión de horarios disponibles por período
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CtrHorarioDTO {
    private Long idCtrHorario;           // ID del registro
    private String periodo;              // Código del período (ej: "202502")
    private Long idArea;                 // ID del área
    private String descArea;             // Descripción del área (JOIN)
    private Long idGrupoProg;            // ID del grupo programático
    private Long idPers;                 // ID del personal/médico
    private String nomPers;              // Nombre del personal (JOIN)
    private Long idRegLab;               // ID del régimen laboral
    private String descRegLab;           // Descripción régimen laboral (JOIN)
    private Long idServicio;             // ID del servicio
    private String descServicio;         // Descripción del servicio (JOIN)
    private Integer turnosTotales;       // Total de turnos
    private Integer turnosValidos;       // Turnos válidos registrados
    private BigDecimal horasTotales;     // Horas totales
    private String observaciones;        // Observaciones
    private LocalDateTime createdAt;     // Fecha creación
    private LocalDateTime updatedAt;     // Fecha actualización
}

package com.styp.cenate.dto;

import lombok.*;

/**
 * ✅ v1.47.0: DTO para selector de especialidades en modal Atender Paciente
 * Versión simplificada con solo id y nombre
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EspecialidadSelectDTO {
    private Long id;
    private String descServicio; // Nombre de especialidad (Cardiología, Neurología, etc.)
}

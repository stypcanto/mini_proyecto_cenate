package com.styp.cenate.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.util.List;

/**
 * ✅ v1.47.0: DTO para registrar atención médica (Recita + Interconsulta + Crónico)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AtenderPacienteRequest {

    // Recita (Opcional)
    private Boolean tieneRecita;
    private Integer recitaDias; // 3, 7, 15, 30, 60, 90

    // Interconsulta (Opcional)
    private Boolean tieneInterconsulta;
    private String interconsultaEspecialidad; // desc_servicio de dim_servicio_essi (validado condicionalmente)

    // Enfermedades crónicas (Opcional)
    private Boolean esCronico;
    private List<String> enfermedades; // ["Hipertensión", "Diabetes", "Otro"]
    private String otroDetalle; // Descripción si selecciona "Otro"
}

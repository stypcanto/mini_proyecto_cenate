package com.styp.cenate.dto;

import lombok.*;

/**
 * 📥 DTO para recibir datos en las operaciones de creación y actualización de áreas.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AreaRequest {

    /** Descripción del área (ejemplo: "Radiología", "Oncología", etc.) */
    private String descArea;

    /** Estado del área ('A' = Activo, 'I' = Inactivo) */
    private String statArea;
}
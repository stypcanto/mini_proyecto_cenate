package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime; // ✅ <--- IMPORT NECESARIO

/**
 * 🎓 DTO para respuestas de Profesión (CENATE MBAC 2025)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfesionResponse {

    private Long idProf;
    private String descProf;
    private String statProf;
    private OffsetDateTime createdAt;   // ✅ Tipo coherente con la entidad
    private OffsetDateTime updatedAt;   // ✅ Tipo coherente con la entidad
}
package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para Medicamentos (Petitorio Nacional)
 * Representa medicamentos codificados a nivel nacional
 * Tabla: dim_medicamento
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicamentoResponse {
    private Long idMedicamento;
    private String codMedicamento;
    private String descMedicamento;
    private String statMedicamento;  // 'A' = Activo, 'I' = Inactivo
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

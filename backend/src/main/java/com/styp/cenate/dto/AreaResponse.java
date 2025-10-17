package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

/**
 * 📤 DTO de respuesta para representar los datos de un área.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AreaResponse {

    private Long idArea;
    private String descArea;
    private String statArea;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
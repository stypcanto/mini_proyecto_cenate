package com.styp.cenate.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfesionResponse {
    private Long idProf;
    private String descProf;
    private String statProf;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

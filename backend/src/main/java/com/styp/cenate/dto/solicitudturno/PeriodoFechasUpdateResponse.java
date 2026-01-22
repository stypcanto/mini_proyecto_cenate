package com.styp.cenate.dto.solicitudturno;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeriodoFechasUpdateResponse {
    private Long idPeriodo;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private OffsetDateTime updatedAt;
}

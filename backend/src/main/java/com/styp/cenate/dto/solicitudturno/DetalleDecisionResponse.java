package com.styp.cenate.dto.solicitudturno;

import java.time.OffsetDateTime;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleDecisionResponse {
    private Long idDetalle;
    private String estado;
    private String observacion;
    private OffsetDateTime fechaActualizacion;
}

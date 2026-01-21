package com.styp.cenate.dto.solicitudturno;

import java.time.OffsetDateTime;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleObservacionUpdateResponse {

    private Long idDetalle;
    private String observacion;
    private OffsetDateTime fechaActualizacion;
}

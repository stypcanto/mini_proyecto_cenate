package com.styp.cenate.dto.solicitudturno;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleDecisionRequest {
    private String observacion; // opcional en aprobar, requerido en rechazar (validamos en service)
}

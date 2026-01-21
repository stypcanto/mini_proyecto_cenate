package com.styp.cenate.dto.solicitudturno;

import java.util.List;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleFechasResponse {

    private Long idDetalle;
    private Long idServicio;
    private String nombreServicio;

    private List<FechaDetalle> fechas;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FechaDetalle {
        private Long idDetalleFecha;
        private String fecha;   // yyyy-MM-dd
        private String bloque;  // MANANA|TARDE
    }
}

package com.styp.cenate.dto.solicitudturno;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleObservacionUpdateRequest {

    @NotBlank(message = "La observación es obligatoria")
    private String observacion;
}

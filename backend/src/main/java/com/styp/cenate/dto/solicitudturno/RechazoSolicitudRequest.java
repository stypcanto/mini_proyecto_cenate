package com.styp.cenate.dto.solicitudturno;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "RechazoSolicitudRequest", description = "Request para rechazar una solicitud")
public record RechazoSolicitudRequest(
        @Schema(description = "Motivo del rechazo", example = "Faltan datos de días preferentes", requiredMode = Schema.RequiredMode.REQUIRED)
        String motivo
) {}

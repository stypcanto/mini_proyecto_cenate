package com.styp.cenate.dto.ipress;

import java.util.List;

public record ConfigurarServiciosRequest(
        List<ServicioCfgRequest> servicios
) {}

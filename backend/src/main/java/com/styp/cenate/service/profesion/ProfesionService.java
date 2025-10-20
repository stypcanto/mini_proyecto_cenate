package com.styp.cenate.service.usuario;

import com.styp.cenate.dto.ProfesionResponse;
import java.util.List;

public interface ProfesionService {
    List<ProfesionResponse> obtenerTodas();
    List<ProfesionResponse> obtenerActivas();
}

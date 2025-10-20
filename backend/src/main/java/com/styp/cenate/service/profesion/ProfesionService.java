package com.styp.cenate.service.profesion;

import com.styp.cenate.dto.ProfesionResponse;
import com.styp.cenate.model.Profesion;
import java.util.List;

public interface ProfesionService {
    List<ProfesionResponse> obtenerTodas();
    List<ProfesionResponse> obtenerActivas();
    ProfesionResponse crear(Profesion profesion);
    ProfesionResponse actualizar(Long id, Profesion profesion);
    void eliminar(Long id);
}

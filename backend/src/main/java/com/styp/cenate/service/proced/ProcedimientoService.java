package com.styp.cenate.service.proced;

import com.styp.cenate.dto.ProcedimientoResponse;
import java.util.List;

public interface ProcedimientoService {
    List<ProcedimientoResponse> listar();

    ProcedimientoResponse obtenerPorId(Long id);

    ProcedimientoResponse crear(ProcedimientoResponse dto);

    ProcedimientoResponse actualizar(Long id, ProcedimientoResponse dto);

    void eliminar(Long id);
}
package com.styp.cenate.service.proced;

import com.styp.cenate.dto.ProcedimientoResponse;
import org.springframework.data.domain.Page;
import java.util.List;

public interface ProcedimientoService {
    List<ProcedimientoResponse> listar();
    
    Page<ProcedimientoResponse> listarPaginado(int page, int size, String sortBy, String direction);
    
    Page<ProcedimientoResponse> buscar(int page, int size, String sortBy, String direction, String codProced, String descProced);

    ProcedimientoResponse obtenerPorId(Long id);

    ProcedimientoResponse crear(ProcedimientoResponse dto);

    ProcedimientoResponse actualizar(Long id, ProcedimientoResponse dto);

    void eliminar(Long id);
}
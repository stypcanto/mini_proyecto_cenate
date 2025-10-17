package com.styp.cenate.service.tipoproced;

import com.styp.cenate.model.TipoProcedimiento;
import java.util.List;

public interface TipoProcedimientoService {
    List<TipoProcedimiento> listar();
    TipoProcedimiento obtenerPorId(Long id);
    TipoProcedimiento crear(TipoProcedimiento tipoProcedimiento);
    TipoProcedimiento actualizar(Long id, TipoProcedimiento tipoProcedimiento);
    void eliminar(Long id);
}
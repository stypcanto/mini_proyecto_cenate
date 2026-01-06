package com.styp.cenate.service.cie10;

import com.styp.cenate.dto.Cie10Response;
import org.springframework.data.domain.Page;
import java.util.List;

public interface Cie10Service {
    List<Cie10Response> listar();
    
    Page<Cie10Response> listarPaginado(int page, int size, String sortBy, String direction);
    
    Page<Cie10Response> buscar(int page, int size, String sortBy, String direction, String codigo, String descripcion);

    Cie10Response obtenerPorId(Long id);

    Cie10Response crear(Cie10Response dto);

    Cie10Response actualizar(Long id, Cie10Response dto);

    void eliminar(Long id);
}

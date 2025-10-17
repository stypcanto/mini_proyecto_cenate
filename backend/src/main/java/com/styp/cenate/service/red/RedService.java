package com.styp.cenate.service.red;

import com.styp.cenate.model.Red;
import java.util.List;

public interface RedService {
    List<Red> listar();
    Red obtenerPorId(Long id);
    Red crear(Red red);
    Red actualizar(Long id, Red red);
    void eliminar(Long id);
}
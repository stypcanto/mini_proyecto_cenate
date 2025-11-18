package com.styp.cenate.service.nivel;

import com.styp.cenate.model.NivelAtencion;
import java.util.List;

public interface NivelAtencionService {
    List<NivelAtencion> listar();
    NivelAtencion obtenerPorId(Long id);
    NivelAtencion crear(NivelAtencion nivel);
    NivelAtencion actualizar(Long id, NivelAtencion nivel);
    void eliminar(Long id);
}
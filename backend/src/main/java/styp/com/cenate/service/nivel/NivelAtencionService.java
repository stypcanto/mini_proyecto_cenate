package styp.com.cenate.service.nivel;

import styp.com.cenate.model.NivelAtencion;
import java.util.List;

public interface NivelAtencionService {
    List<NivelAtencion> listar();
    NivelAtencion obtenerPorId(Long id);
    NivelAtencion crear(NivelAtencion nivel);
    NivelAtencion actualizar(Long id, NivelAtencion nivel);
    void eliminar(Long id);
}
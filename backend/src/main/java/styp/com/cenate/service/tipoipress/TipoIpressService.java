package styp.com.cenate.service.tipoipress;

import styp.com.cenate.model.TipoIpress;
import java.util.List;

public interface TipoIpressService {
    List<TipoIpress> listar();
    TipoIpress obtenerPorId(Long id);
    TipoIpress crear(TipoIpress tipoIpress);
    TipoIpress actualizar(Long id, TipoIpress tipoIpress);
    void eliminar(Long id);
}
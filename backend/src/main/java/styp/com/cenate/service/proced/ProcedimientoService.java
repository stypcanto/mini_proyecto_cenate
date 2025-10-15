package styp.com.cenate.service.proced;

import styp.com.cenate.model.Procedimiento;
import java.util.List;

public interface ProcedimientoService {
    List<Procedimiento> listar();
    Procedimiento obtenerPorId(Long id);
    Procedimiento crear(Procedimiento procedimiento);
    Procedimiento actualizar(Long id, Procedimiento procedimiento);
    void eliminar(Long id);
}
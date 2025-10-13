package styp.com.cenate.service.permiso;

import styp.com.cenate.model.Permiso;
import java.util.List;

public interface PermisoService {
    List<Permiso> getPermisosByRol(Integer idRol);
    Permiso updatePermiso(Long id, Permiso permisoActualizado);
    Permiso createPermiso(Permiso permiso);
    void deletePermiso(Long id);
}
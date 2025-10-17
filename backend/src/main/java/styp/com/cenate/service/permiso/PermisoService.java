package styp.com.cenate.service.permiso;

import styp.com.cenate.model.Permiso;
import java.util.List;
import java.util.Map;

public interface PermisoService {
    List<Permiso> getAllPermisos();
    List<Permiso> getPermisosByRol(Integer idRol);
    Permiso updatePermiso(Long id, Permiso permisoActualizado);
    Permiso updateCamposPermiso(Long id, Map<String, Object> cambios);
}
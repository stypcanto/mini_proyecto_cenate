package com.styp.cenate.service.view;

import com.styp.cenate.model.view.PermisoActivoView;
import java.util.List;

public interface PermisoActivoViewService {
    List<PermisoActivoView> obtenerPermisosPorUsuario(String usuario);
}
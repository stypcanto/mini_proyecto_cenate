package com.styp.cenate.service.rol;

import com.styp.cenate.model.Rol;
import java.util.List;

public interface RolService {
    List<Rol> getAll();
    Rol getById(Integer id);
    Rol createRol(Rol rol);
    Rol updateRol(Integer id, Rol rol);
    void deleteRol(Integer id);
}
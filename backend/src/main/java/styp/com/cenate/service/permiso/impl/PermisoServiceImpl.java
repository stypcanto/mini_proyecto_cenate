package styp.com.cenate.service.permiso.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import styp.com.cenate.model.Permiso;
import styp.com.cenate.model.Rol;
import styp.com.cenate.repository.PermisoRepository;
import styp.com.cenate.repository.RolRepository;
import styp.com.cenate.service.permiso.PermisoService;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PermisoServiceImpl implements PermisoService {

    private final PermisoRepository permisoRepository;
    private final RolRepository rolRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Permiso> getPermisosByRol(Integer idRol) {
        return permisoRepository.findByRol_IdRol(idRol);
    }

    @Override
    @Transactional
    public Permiso updatePermiso(Long id, Permiso permisoActualizado) {
        return permisoRepository.findById(id)
                .map(p -> {
                    p.setDescPermiso(permisoActualizado.getDescPermiso());
                    p.setPuedeVer(permisoActualizado.isPuedeVer());
                    p.setPuedeCrear(permisoActualizado.isPuedeCrear());
                    p.setPuedeActualizar(permisoActualizado.isPuedeActualizar());
                    p.setPuedeEliminar(permisoActualizado.isPuedeEliminar());
                    return permisoRepository.save(p);
                })
                .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));
    }

    @Override
    @Transactional
    public Permiso createPermiso(Permiso permiso) {
        Rol rol = rolRepository.findById(permiso.getRol().getIdRol())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        // Evita duplicados
        if (permisoRepository.existsByRol_IdRolAndDescPermiso(rol.getIdRol(), permiso.getDescPermiso())) {
            throw new RuntimeException("Este rol ya tiene un permiso con ese nombre.");
        }

        permiso.setRol(rol);
        return permisoRepository.save(permiso);
    }

    @Override
    @Transactional
    public void deletePermiso(Long id) {
        if (!permisoRepository.existsById(id)) {
            throw new RuntimeException("El permiso no existe.");
        }
        permisoRepository.deleteById(id);
    }
}
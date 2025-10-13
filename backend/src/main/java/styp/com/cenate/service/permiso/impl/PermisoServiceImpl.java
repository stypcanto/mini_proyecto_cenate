package styp.com.cenate.service.permiso.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import styp.com.cenate.model.Permiso;
import styp.com.cenate.repository.PermisoRepository;
import styp.com.cenate.service.permiso.PermisoService;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PermisoServiceImpl implements PermisoService {

    private final PermisoRepository permisoRepository;

    @Override
    public List<Permiso> getPermisosByRol(Integer idRol) {
        return permisoRepository.findByRol_IdRol(idRol);
    }

    @Override
    public Permiso updatePermiso(Long id, Permiso permisoActualizado) {
        return permisoRepository.findById(id)
                .map(p -> {
                    p.setPuedeVer(permisoActualizado.isPuedeVer());
                    p.setPuedeCrear(permisoActualizado.isPuedeCrear());
                    p.setPuedeActualizar(permisoActualizado.isPuedeActualizar());
                    p.setPuedeEliminar(permisoActualizado.isPuedeEliminar());
                    return permisoRepository.save(p);
                })
                .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));
    }

    @Override
    public Permiso updateCamposPermiso(Long id, Map<String, Object> cambios) {
        return permisoRepository.findById(id).map(p -> {
            cambios.forEach((campo, valor) -> {
                switch (campo) {
                    case "puedeVer" -> p.setPuedeVer((Boolean) valor);
                    case "puedeCrear" -> p.setPuedeCrear((Boolean) valor);
                    case "puedeActualizar" -> p.setPuedeActualizar((Boolean) valor);
                    case "puedeEliminar" -> p.setPuedeEliminar((Boolean) valor);
                }
            });
            return permisoRepository.save(p);
        }).orElseThrow(() -> new RuntimeException("Permiso no encontrado"));
    }
}
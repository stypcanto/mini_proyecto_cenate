package styp.com.cenate.repository;

import styp.com.cenate.model.Permiso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface PermisoRepository extends JpaRepository<Permiso, Integer> {
    Optional<Permiso> findByDescPermiso(String descPermiso);
    List<Permiso> findByDescPermisoIn(List<String> permisos);
}

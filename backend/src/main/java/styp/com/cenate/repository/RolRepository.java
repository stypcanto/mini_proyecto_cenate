package styp.com.cenate.repository;

import styp.com.cenate.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Integer> {
    Optional<Rol> findByDescRol(String descRol);
    boolean existsByDescRol(String descRol);
}

package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.Rol;

@Repository
public interface RolRepository extends JpaRepository<Rol, Integer> {
    boolean existsByDescRol(String descRol);
}
package styp.com.cenate.repository;

import styp.com.cenate.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByNameUser(String nameUser);
    boolean existsByNameUser(String nameUser);
    List<Usuario> findByStatUser(String statUser);
    
    @Query("SELECT u FROM Usuario u JOIN u.roles r WHERE r.descRol = :rolName")
    List<Usuario> findUsuariosByRol(String rolName);
}

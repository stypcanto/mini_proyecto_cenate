package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import styp.com.cenate.model.Usuario;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByNameUser(String nameUser);

    boolean existsByNameUser(String nameUser);

    // 🔥 Método seguro para cargar roles y permisos en un solo query (evita ConcurrentModificationException)
    @Query("""
        SELECT DISTINCT u FROM Usuario u
        LEFT JOIN FETCH u.roles r
        LEFT JOIN FETCH r.permisos
        WHERE u.nameUser = :username
    """)
    Optional<Usuario> findByNameUserWithRoles(@Param("username") String username);
}

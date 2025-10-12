package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import styp.com.cenate.model.Usuario;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // 🔹 Buscar usuario por nombre de usuario (login)
    Optional<Usuario> findByNameUser(String nameUser);

    // 🔹 Verificar existencia de usuario
    boolean existsByNameUser(String nameUser);

    // 🔥 Cargar usuario con roles y permisos (para login o auth)
    @Query("""
        SELECT DISTINCT u FROM Usuario u
        LEFT JOIN FETCH u.roles r
        LEFT JOIN FETCH r.permisos
        WHERE u.nameUser = :nameUser
    """)
    Optional<Usuario> findByNameUserWithRoles(@Param("nameUser") String nameUser);

    // 🔥 Listar todos los usuarios con roles y permisos
    @Query("""
        SELECT DISTINCT u FROM Usuario u
        LEFT JOIN FETCH u.roles r
        LEFT JOIN FETCH r.permisos
    """)
    List<Usuario> findAllWithRoles();

    // 🔹 Listar usuarios filtrando por estado
    List<Usuario> findByStatUser(String statUser);

    // 🔹 Contar usuarios por estado
    long countByStatUser(String statUser);
}

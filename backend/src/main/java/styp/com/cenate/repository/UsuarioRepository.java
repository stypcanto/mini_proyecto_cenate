package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import styp.com.cenate.model.Usuario;
import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {  // ✅ Long para ID principal

    // 🔹 Buscar usuario por nombre
    Optional<Usuario> findByNameUser(String nameUser);

    // 🔹 Verificar si existe un usuario
    boolean existsByNameUser(String nameUser);

    // 🔥 Cargar usuario con roles y permisos (para login)
    @Query("""
        SELECT DISTINCT u FROM Usuario u
        LEFT JOIN FETCH u.roles r
        LEFT JOIN FETCH r.permisos
        WHERE u.nameUser = :username
    """)
    Optional<Usuario> findByNameUserWithRoles(@Param("username") String username);

    // 🔥 Listar todos los usuarios con roles y permisos
    @Query("""
        SELECT DISTINCT u FROM Usuario u
        LEFT JOIN FETCH u.roles r
        LEFT JOIN FETCH r.permisos
    """)
    List<Usuario> findAllWithRoles();

    // Nota: La relación con PersonalExterno es inversa (PersonalExterno tiene FK a Usuario)
    // Si necesitas obtener usuarios con su personal externo, usa PersonalExternoRepository

    // 🔹 Contar usuarios por estado (por ejemplo: 'A', 'I', etc.)
    long countByStatUser(String statUser);
}

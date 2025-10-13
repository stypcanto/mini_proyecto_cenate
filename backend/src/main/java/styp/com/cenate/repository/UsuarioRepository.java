package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import styp.com.cenate.model.Usuario;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByNameUser(String nameUser);

    boolean existsByNameUser(String nameUser);

    @Query("""
        SELECT DISTINCT u FROM Usuario u
        LEFT JOIN FETCH u.roles r
        LEFT JOIN FETCH r.permisos
        WHERE u.nameUser = :nameUser
    """)
    Optional<Usuario> findByNameUserWithRoles(@Param("nameUser") String nameUser);

    @Query("""
        SELECT DISTINCT u FROM Usuario u
        LEFT JOIN FETCH u.roles r
        LEFT JOIN FETCH r.permisos
    """)
    List<Usuario> findAllWithRoles();

    List<Usuario> findByStatUser(String statUser);

    long countByStatUser(String statUser);

    // 🔍 (opcional) Dashboard: listar usuarios con roles
    @Query(value = """
        SELECT u.name_user AS username, 
               STRING_AGG(r.desc_rol, ', ') AS roles
        FROM public.dim_usuarios u
        LEFT JOIN public.usuarios_roles ur ON u.id_user = ur.id_user
        LEFT JOIN public.dim_roles r ON ur.id_rol = r.id_rol
        GROUP BY u.name_user
    """, nativeQuery = true)
    List<Object[]> listarUsuariosConRoles();
}
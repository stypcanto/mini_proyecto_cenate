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

    /** Usuarios activos con roles específicos */
    @Query("""
        SELECT DISTINCT u FROM Usuario u
        JOIN u.roles r
        WHERE r.descRol IN :roles AND u.statUser = 'A'
    """)
    List<Usuario> findByRolesActivos(@Param("roles") List<String> roles);

    /** Usuarios activos excluyendo ciertos roles */
    @Query("""
        SELECT DISTINCT u FROM Usuario u
        JOIN u.roles r
        WHERE r.descRol NOT IN :roles AND u.statUser = 'A'
    """)
    List<Usuario> findByRolesActivosExcluyendo(@Param("roles") List<String> roles);

    // ✅ Busca si existe un correo en cualquiera de las tablas de personal (interno o externo)
    @Query(value = """
        SELECT CASE 
            WHEN COUNT(*) > 0 THEN TRUE 
            ELSE FALSE 
        END
        FROM dim_usuarios u
        LEFT JOIN dim_personal_cnt pc ON pc.id_usuario = u.id_user
        LEFT JOIN dim_personal_externo pe ON pe.id_user = u.id_user
        WHERE 
            LOWER(pc.email_pers) = LOWER(:email)
            OR LOWER(pc.email_corp_pers) = LOWER(:email)
            OR LOWER(pe.email_pers_ext) = LOWER(:email)
            OR LOWER(pe.email_corp_ext) = LOWER(:email)
            OR LOWER(pe.email_ext) = LOWER(:email)
        """, nativeQuery = true)
    boolean existsByAnyEmail(@Param("email") String email);
}
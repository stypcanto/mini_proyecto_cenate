// ============================================================================
// 🧩 UsuarioRepository.java – Repositorio JPA (CENATE 2025)
// ----------------------------------------------------------------------------
// Gestiona las operaciones de acceso a datos para la entidad Usuario.
// Incluye consultas personalizadas para roles, permisos y estado.
// ============================================================================

package com.styp.cenate.repository;

import com.styp.cenate.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // =========================================================================
    // 🔹 CONSULTAS CRUD BÁSICAS
    // =========================================================================

    /** 🔍 Busca un usuario por su nombre de usuario. */
    Optional<Usuario> findByNameUser(String nameUser);

    /** 🔍 Verifica si existe un usuario con ese nombre. */
    boolean existsByNameUser(String nameUser);

    /** 🔍 Lista los usuarios por estado (A, I, etc.). */
    List<Usuario> findByStatUser(String statUser);

    /** 📊 Cuenta los usuarios por estado. */
    long countByStatUser(String statUser);

    // =========================================================================
    // 🔹 CONSULTAS CON ROLES Y PERMISOS
    // =========================================================================

    /**
     * 🚀 Carga un usuario junto con sus roles asociados (para autenticación MBAC).
     * ⚡ No carga permisos para optimizar la validación de login.
     */
    @Query("""
        SELECT DISTINCT u
        FROM Usuario u
        LEFT JOIN FETCH u.roles r
        WHERE u.nameUser = :nameUser
    """)
    Optional<Usuario> findByNameUserWithRoles(@Param("nameUser") String nameUser);

    /**
     * 🚀 Carga un usuario con todos sus datos personales (interno y externo).
     * Incluye IPRESS para mostrar la institución del usuario.
     */
    @Query("""
        SELECT DISTINCT u
        FROM Usuario u
        LEFT JOIN FETCH u.roles r
        LEFT JOIN FETCH u.personalCnt pc
        LEFT JOIN FETCH pc.tipoDocumento
        LEFT JOIN FETCH pc.ipress
        LEFT JOIN FETCH pc.regimenLaboral
        LEFT JOIN FETCH pc.area
        LEFT JOIN FETCH u.personalExterno pe
        LEFT JOIN FETCH pe.tipoDocumento
        LEFT JOIN FETCH pe.ipress
        WHERE u.nameUser = :nameUser
    """)
    Optional<Usuario> findByNameUserWithFullDetails(@Param("nameUser") String nameUser);

    /**
     * 🚀 Carga un usuario por ID junto con sus roles asociados.
     */
    @Query("""
        SELECT DISTINCT u
        FROM Usuario u
        LEFT JOIN FETCH u.roles r
        WHERE u.idUser = :idUser
    """)
    Optional<Usuario> findByIdWithRoles(@Param("idUser") Long idUser);

    /**
     * 🚀 Carga todos los usuarios con sus roles y permisos (para gestión MBAC).
     */
    @Query("""
        SELECT DISTINCT u
        FROM Usuario u
        LEFT JOIN FETCH u.roles r
        LEFT JOIN FETCH r.permisos p
    """)
    List<Usuario> findAllWithRoles();

    /**
     * 🚀 Carga todos los usuarios con sus datos personales completos
     * Incluye PersonalCnt y PersonalExterno
     */
    @Query("""
        SELECT DISTINCT u
        FROM Usuario u
        LEFT JOIN FETCH u.roles r
        LEFT JOIN FETCH u.personalCnt pc
        LEFT JOIN FETCH pc.tipoDocumento
        LEFT JOIN FETCH pc.ipress
        LEFT JOIN FETCH pc.regimenLaboral
        LEFT JOIN FETCH pc.area
        LEFT JOIN FETCH u.personalExterno pe
        LEFT JOIN FETCH pe.tipoDocumento
        LEFT JOIN FETCH pe.ipress
    """)
    List<Usuario> findAllWithPersonalData();

    /**
     * 🎯 Usuarios activos con roles específicos.
     */
    @Query("""
        SELECT DISTINCT u
        FROM Usuario u
        JOIN u.roles r
        WHERE r.descRol IN :roles AND u.statUser = 'A'
    """)
    List<Usuario> findByRolesActivos(@Param("roles") List<String> roles);

    /**
     * 🚫 Usuarios activos excluyendo ciertos roles.
     */
    @Query("""
        SELECT DISTINCT u
        FROM Usuario u
        JOIN u.roles r
        WHERE r.descRol NOT IN :roles AND u.statUser = 'A'
    """)
    List<Usuario> findByRolesActivosExcluyendo(@Param("roles") List<String> roles);

    /**
     * 🎯 Usuarios por rol específico con datos personales cargados.
     * ✅ OPTIMIZADO: Carga PersonalCnt con FETCH JOIN explícito
     */
    @Query("""
        SELECT DISTINCT u
        FROM Usuario u
        LEFT JOIN FETCH u.roles r
        LEFT JOIN FETCH u.personalCnt pc
        LEFT JOIN FETCH u.personalExterno pe
        WHERE r.descRol = :rol
        AND (u.statUser = 'A' OR u.statUser = 'ACTIVO')
    """)
    List<Usuario> findByRolWithPersonalData(@Param("rol") String rol);

    // =========================================================================
    // 🔹 CONSULTA NATIVA DE VERIFICACIÓN DE EMAIL
    // =========================================================================

    /**
     * ✅ Verifica si un correo existe en cualquiera de las tablas relacionadas
     * (dim_personal_cnt o dim_personal_externo) asociadas al usuario.
     */
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

    // =========================================================================
    // 🔹 CONSULTAS DE ESTADÍSTICAS DE PERSONAL
    // =========================================================================

    /**
     * 📊 Cuenta usuarios con personal interno (CENATE)
     * Solo cuenta usuarios activos que tienen datos en dim_personal_cnt
     */
    @Query("""
        SELECT COUNT(DISTINCT u)
        FROM Usuario u
        WHERE u.personalCnt IS NOT NULL
        AND u.statUser IN ('A', 'ACTIVO')
    """)
    long countByPersonalCntIsNotNull();

    /**
     * 📊 Cuenta usuarios con personal externo (Otras IPRESS)
     * Solo cuenta usuarios activos que tienen datos en dim_personal_externo
     */
    @Query("""
        SELECT COUNT(DISTINCT u)
        FROM Usuario u
        WHERE u.personalExterno IS NOT NULL
        AND u.statUser IN ('A', 'ACTIVO')
    """)
    long countByPersonalExternoIsNotNull();
}
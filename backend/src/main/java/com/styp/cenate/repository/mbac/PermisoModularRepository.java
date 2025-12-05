// ============================================================================
// 🧩 PermisoModularRepository.java – Repositorio MBAC (CENATE 2025)
// ----------------------------------------------------------------------------
// Gestiona las asociaciones entre roles, módulos, páginas y permisos.
// Proporciona operaciones CRUD, consultas avanzadas y soporte para inserción
// directa (PostgreSQL). Compatible con la entidad PermisoModular.java actual.
// ============================================================================
package com.styp.cenate.repository.mbac;

import com.styp.cenate.dto.mbac.PermisoUsuarioResponseDTO;
import com.styp.cenate.model.PermisoModular;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermisoModularRepository extends JpaRepository<PermisoModular, Integer> {

    // =========================================================================
    // 🔹 CONSULTAS CRUD BÁSICAS
    // =========================================================================

    /**
     * Obtiene todos los permisos activos de un rol.
     */
    @Query("SELECT p FROM PermisoModular p WHERE p.idRol = :idRol AND p.activo = true")
    List<PermisoModular> findByIdRolAndActivoTrue(@Param("idRol") Integer idRol);

    /**
     * Obtiene todos los permisos activos de una página.
     */
    @Query("SELECT p FROM PermisoModular p WHERE p.idPagina = :idPagina AND p.activo = true")
    List<PermisoModular> findByIdPaginaAndActivoTrue(@Param("idPagina") Integer idPagina);

    /**
     * Obtiene un permiso específico por rol y página.
     */
    @Query("SELECT p FROM PermisoModular p WHERE p.idRol = :idRol AND p.idPagina = :idPagina")
    Optional<PermisoModular> findByRolAndPagina(@Param("idRol") Integer idRol,
                                                @Param("idPagina") Integer idPagina);

    /**
     * Verifica si ya existe un permiso registrado para una combinación rol/página.
     */
    boolean existsByIdRolAndIdPagina(Integer idRol, Integer idPagina);

    /**
     * Busca un permiso existente por usuario y página (sin filtrar por activo para UPSERT).
     */
    @Query("SELECT p FROM PermisoModular p WHERE p.idUser = :idUser AND p.idPagina = :idPagina")
    Optional<PermisoModular> findByIdUserAndIdPagina(@Param("idUser") Long idUser, @Param("idPagina") Integer idPagina);

    /**
     * Busca todos los permisos de un usuario.
     */
    @Query("SELECT p FROM PermisoModular p WHERE p.idUser = :idUser AND p.activo = true")
    List<PermisoModular> findByIdUserAndActivoTrue(@Param("idUser") Long idUser);

    // =========================================================================
    // 🔹 CONSULTAS AVANZADAS (VISTA SQL)
    // =========================================================================

    /**
     * Obtiene los permisos activos de un usuario desde la vista vw_permisos_usuario_activos.
     * La vista debe existir en PostgreSQL.
     */
    @Query(value = """
        SELECT 
            CAST(id_permiso AS bigint)       AS idPermiso,
            ruta_pagina                     AS rutaPagina,
            pagina                          AS nombrePagina,
            modulo                          AS nombreModulo,
            puede_ver                       AS ver,
            puede_crear                     AS crear,
            puede_editar                    AS editar,
            puede_eliminar                  AS eliminar,
            puede_exportar                  AS exportar,
            puede_aprobar                   AS aprobar
        FROM vw_permisos_usuario_activos
        WHERE CAST(id_user AS text) = CAST(:idUser AS text)
          AND activo = true
        ORDER BY id_modulo, id_pagina
        """, nativeQuery = true)
    List<PermisoUsuarioResponseDTO> findPermisosPorUsuarioId(@Param("idUser") Long idUser);

    // =========================================================================
    // 🔹 INSERCIÓN DIRECTA (PostgreSQL: INSERT INTO)
    // =========================================================================
    /**
     * Inserta un nuevo permiso modular directamente en la tabla.
     * Se usa en el servicio MBAC para creación desde el panel administrativo.
     */
    @Modifying
    @Transactional
    @Query(value = """
        INSERT INTO permisos_modulares (
            id_user,
            id_rol,
            id_modulo,
            id_pagina,
            accion,
            puede_ver,
            puede_crear,
            puede_editar,
            puede_eliminar,
            puede_exportar,
            puede_aprobar,
            activo,
            created_at,
            updated_at
        ) VALUES (
            :idUser,
            :idRol,
            :idModulo,
            :idPagina,
            :accion,
            false, false, false, false, false, false,
            true,
            NOW(),
            NOW()
        )
        """, nativeQuery = true)
    void insertarPermiso(@Param("idUser") Long idUser,
                         @Param("idRol") Integer idRol,
                         @Param("idModulo") Integer idModulo,
                         @Param("idPagina") Integer idPagina,
                         @Param("accion") String accion);

    // =========================================================================
    // 🔹 UTILITARIOS / CONSULTAS DE ADMINISTRACIÓN
    // =========================================================================

    /**
     * Lista todos los permisos activos con orden lógico (por módulo/página).
     */
    @Query("SELECT p FROM PermisoModular p WHERE p.activo = true ORDER BY p.idModulo, p.idPagina")
    List<PermisoModular> findAllActivos();

    /**
     * Lista todos los permisos (activos e inactivos) con orden lógico.
     */
    @Query("SELECT p FROM PermisoModular p ORDER BY p.idModulo, p.idPagina")
    List<PermisoModular> findAllOrdenado();

    /**
     * Elimina todos los permisos asociados a una página (para eliminación en cascada).
     */
    void deleteByIdPagina(Integer idPagina);

    /**
     * Elimina todos los permisos de un usuario (para resetear permisos al cambiar rol).
     */
    void deleteByIdUser(Long idUser);
}
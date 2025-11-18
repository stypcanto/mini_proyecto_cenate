// ============================================================================
// 🧩 PaginaModuloRepository.java – Repositorio MBAC (CENATE 2025)
// ----------------------------------------------------------------------------
// Gestiona las páginas modulares del sistema MBAC, sus rutas, módulos y
// permisos asociados. Compatible con la entidad PaginaModulo y PermisoModular.
// ============================================================================

package com.styp.cenate.repository.mbac;

import com.styp.cenate.model.PaginaModulo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaginaModuloRepository extends JpaRepository<PaginaModulo, Integer> {

    // =========================================================================
    // 🔹 CONSULTAS BÁSICAS
    // =========================================================================

    /**
     * Obtiene todas las páginas pertenecientes a un módulo específico.
     */
    @Query("SELECT p FROM PaginaModulo p WHERE p.modulo.idModulo = :idModulo")
    List<PaginaModulo> findByModuloId(@Param("idModulo") Integer idModulo);

    /**
     * Busca una página por su ruta exacta.
     */
    @Query("SELECT p FROM PaginaModulo p WHERE p.rutaPagina = :rutaPagina")
    Optional<PaginaModulo> findByRutaPagina(@Param("rutaPagina") String rutaPagina);

    /**
     * Lista todas las páginas activas ordenadas alfabéticamente.
     */
    @Query("SELECT p FROM PaginaModulo p WHERE p.activo = true ORDER BY p.nombrePagina ASC")
    List<PaginaModulo> findAllActive();

    // =========================================================================
    // 🔹 CONSULTAS EXTENDIDAS (JOINS FETCH)
    // =========================================================================

    /**
     * Obtiene las páginas de un módulo con sus permisos asociados (LEFT JOIN).
     */
    @Query("""
        SELECT DISTINCT p 
        FROM PaginaModulo p
        LEFT JOIN FETCH p.permisos pm
        WHERE p.modulo.idModulo = :idModulo
        ORDER BY p.nombrePagina
        """)
    List<PaginaModulo> findByModuloIdWithPermisos(@Param("idModulo") Integer idModulo);

    /**
     * Busca una página por su ruta, incluyendo datos de su módulo y permisos.
     */
    @Query("""
        SELECT DISTINCT p 
        FROM PaginaModulo p
        LEFT JOIN FETCH p.modulo m
        LEFT JOIN FETCH p.permisos pm
        WHERE p.rutaPagina = :rutaPagina
        """)
    Optional<PaginaModulo> findByRutaPaginaWithModuloAndPermisos(@Param("rutaPagina") String rutaPagina);
}
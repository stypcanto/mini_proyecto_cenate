package com.styp.cenate.repository.mbac;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.PaginaModulo;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la gestión de páginas de módulos.
 * 
 * @author CENATE Development Team
 * @version 1.1
 */
@Repository
public interface PaginaModuloRepository extends JpaRepository<PaginaModulo, Integer> {

    /**
     * Busca una página por su ruta.
     */
    Optional<PaginaModulo> findByRutaPagina(String rutaPagina);

    /**
     * Busca todas las páginas activas de un módulo.
     */
    @Query("SELECT p FROM PaginaModulo p WHERE p.modulo.idModulo = :idModulo AND p.activo = true")
    List<PaginaModulo> findByModuloIdAndActivoTrue(@Param("idModulo") Integer idModulo);

    /**
     * Busca todas las páginas activas.
     */
    List<PaginaModulo> findByActivoTrue();

    /**
     * Verifica si existe una página con una ruta específica.
     */
    boolean existsByRutaPagina(String rutaPagina);

    /**
     * Busca páginas por nombre.
     */
    List<PaginaModulo> findByNombrePaginaContainingIgnoreCase(String nombrePagina);

    /**
     * Obtiene una página con su módulo asociado.
     */
    @Query("SELECT p FROM PaginaModulo p JOIN FETCH p.modulo WHERE p.idPagina = :idPagina")
    Optional<PaginaModulo> findByIdWithModulo(@Param("idPagina") Integer idPagina);

    /**
     * Obtiene una página por ruta con su módulo asociado.
     */
    @Query("SELECT p FROM PaginaModulo p JOIN FETCH p.modulo WHERE p.rutaPagina = :rutaPagina")
    Optional<PaginaModulo> findByRutaPaginaWithModulo(@Param("rutaPagina") String rutaPagina);

    /**
     * Obtiene las páginas activas de un módulo con sus permisos cargados.
     * Incluye JOIN FETCH para evitar LazyInitializationException.
     * 
     * @param idModulo ID del módulo
     * @return Lista de páginas con permisos cargados
     */
    @Query("SELECT DISTINCT p FROM PaginaModulo p " +
           "LEFT JOIN FETCH p.permisos pm " +
           "LEFT JOIN FETCH pm.rol " +
           "WHERE p.modulo.idModulo = :idModulo " +
           "AND p.activo = true " +
           "AND (pm.activo = true OR pm IS NULL)")
    List<PaginaModulo> findByModuloIdWithPermisos(@Param("idModulo") Integer idModulo);

    /**
     * Obtiene una página por ruta con su módulo y permisos cargados.
     * 
     * @param rutaPagina Ruta de la página
     * @return Página con módulo y permisos cargados
     */
    @Query("SELECT DISTINCT p FROM PaginaModulo p " +
           "LEFT JOIN FETCH p.modulo " +
           "LEFT JOIN FETCH p.permisos pm " +
           "LEFT JOIN FETCH pm.rol " +
           "WHERE p.rutaPagina = :rutaPagina " +
           "AND (pm.activo = true OR pm IS NULL)")
    Optional<PaginaModulo> findByRutaPaginaWithModuloAndPermisos(@Param("rutaPagina") String rutaPagina);
}

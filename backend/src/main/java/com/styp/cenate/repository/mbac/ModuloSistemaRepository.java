package com.styp.cenate.repository.mbac;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.ModuloSistema;

import java.util.List;

/**
 * Repositorio para la gestión de módulos del sistema.
 * 
 * @author CENATE Development Team
 * @version 1.1
 */
@Repository
public interface ModuloSistemaRepository extends JpaRepository<ModuloSistema, Integer> {

    /**
     * Obtiene todos los módulos activos con sus páginas cargadas (JOIN FETCH).
     * Evita el error LazyInitializationException.
     */
    @Query("SELECT DISTINCT m FROM ModuloSistema m " +
           "LEFT JOIN FETCH m.paginas p " +
           "WHERE m.activo = true AND (p.activo = true OR p IS NULL)")
    List<ModuloSistema> findAllWithPaginas();

    /**
     * Obtiene todos los módulos activos con sus páginas y permisos cargados.
     * Utiliza JOIN FETCH anidado para cargar todas las relaciones necesarias.
     * 
     * @return Lista de módulos con páginas y permisos completamente cargados
     */
    @Query("SELECT DISTINCT m FROM ModuloSistema m " +
           "LEFT JOIN FETCH m.paginas p " +
           "LEFT JOIN FETCH p.permisos pm " +
           "LEFT JOIN FETCH pm.rol " +
           "WHERE m.activo = true AND (p.activo = true OR p IS NULL) AND (pm.activo = true OR pm IS NULL)")
    List<ModuloSistema> findAllWithPaginasAndPermisos();
}

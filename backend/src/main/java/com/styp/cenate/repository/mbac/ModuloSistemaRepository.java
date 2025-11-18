// ============================================================================
// 🧩 ModuloSistemaRepository.java – Repositorio MBAC (CENATE 2025)
// ----------------------------------------------------------------------------
// Gestiona los módulos principales del sistema MBAC, junto con sus páginas
// y permisos asociados. Compatible con la versión actual de PermisoModular
// (sin relación directa con Rol).
// ============================================================================

package com.styp.cenate.repository.mbac;

import com.styp.cenate.model.ModuloSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ModuloSistemaRepository extends JpaRepository<ModuloSistema, Integer> {

    /**
     * 🔹 Carga todos los módulos con sus páginas y permisos asociados.
     * Corrige la relación de PermisoModular (usa ids en lugar de rol).
     */
    @Query("""
        SELECT DISTINCT m 
        FROM ModuloSistema m
        LEFT JOIN FETCH m.paginas p
        LEFT JOIN FETCH p.permisos pm
        WHERE m.activo = true 
          AND (p.activo = true OR p IS NULL)
          AND (pm.activo = true OR pm IS NULL)
        ORDER BY m.idModulo
    """)
    List<ModuloSistema> findAllWithPaginasAndPermisos();

    /**
     * 🔹 Carga todos los módulos activos con sus páginas activas.
     */
    @Query("""
        SELECT DISTINCT m 
        FROM ModuloSistema m
        LEFT JOIN FETCH m.paginas p
        WHERE m.activo = true 
          AND (p.activo = true OR p IS NULL)
        ORDER BY m.idModulo
    """)
    List<ModuloSistema> findAllWithPaginasActivas();
}







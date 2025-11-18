// ============================================================================
// 🧩 PermisoRepository.java – Repositorio JPA (CENATE 2025)
// ----------------------------------------------------------------------------
// Gestiona la entidad Permiso del sistema MBAC/RBAC.
// Incluye búsquedas por rol, usuario y detección de permisos activos.
// Compatible con Hibernate 6+ y PostgreSQL 15+.
// ============================================================================

package com.styp.cenate.repository;

import com.styp.cenate.model.Permiso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PermisoRepository extends JpaRepository<Permiso, Long> {

    // =========================================================================
    // 🔹 CONSULTAS POR ROL
    // =========================================================================

    /**
     * 🔍 Obtiene todos los permisos asociados a un rol específico.
     * Usa la relación "p.rol.idRol" (correcta para entidades con @ManyToOne).
     */
    @Query("""
        SELECT p
        FROM Permiso p
        WHERE p.rol.idRol = :idRol
    """)
    List<Permiso> findByRol_IdRol(@Param("idRol") Integer idRol);

    // =========================================================================
    // 🔹 CONSULTAS DE PERMISOS ACTIVOS
    // =========================================================================

    /**
     * 🧩 Lista todos los permisos activos.
     * Un permiso se considera activo si alguno de sus flags booleanos está en TRUE.
     */
    @Query("""
        SELECT p
        FROM Permiso p
        WHERE p.puedeVer = true
           OR p.puedeCrear = true
           OR p.puedeActualizar = true
           OR p.puedeEditar = true
           OR p.puedeEliminar = true
           OR p.puedeExportar = true
           OR p.puedeAprobar = true
    """)
    List<Permiso> findAllActive();
}
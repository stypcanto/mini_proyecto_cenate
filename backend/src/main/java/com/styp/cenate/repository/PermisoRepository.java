package com.styp.cenate.repository;

import com.styp.cenate.model.Permiso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 🧩 Repositorio principal para la gestión de permisos MBAC/RBAC.
 * Incluye búsquedas por rol, usuario y detección de permisos activos.
 */
@Repository
public interface PermisoRepository extends JpaRepository<Permiso, Long> {

    // ============================================================
    // 🔹 Buscar permisos por ID de rol
    // ============================================================
    @Query("SELECT p FROM Permiso p WHERE p.rol.idRol = :idRol")
    List<Permiso> findByRolIdRol(@Param("idRol") Integer idRol);

    // ============================================================
    // 🧩 Listar permisos activos (al menos un flag booleano TRUE)
    // ============================================================
    @Query("""
           SELECT p FROM Permiso p
           WHERE p.puedeVer = true
              OR p.puedeCrear = true
              OR p.puedeActualizar = true
              OR p.puedeEliminar = true
              OR p.puedeEditar = true
              OR p.puedeExportar = true
              OR p.puedeAprobar = true
           """)
    List<Permiso> findAllActive();
}
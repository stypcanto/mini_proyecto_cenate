package com.styp.cenate.repository.mbac;

import com.styp.cenate.model.PaginaModulo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 🧩 Repositorio de Páginas Modulares MBAC
 * Gestiona las rutas, nombres y módulos disponibles en el sistema.
 * Incluye consultas extendidas para permisos y módulos relacionados.
 *
 * Basado en la tabla: dim_paginas_modulo
 * Campo de estado: "activo" (boolean)
 */
@Repository
public interface PaginaModuloRepository extends JpaRepository<PaginaModulo, Integer> {

    // ===========================================================
    // 🔹 Buscar páginas por módulo (básico)
    // ===========================================================
    @Query("SELECT p FROM PaginaModulo p WHERE p.modulo.idModulo = :idModulo")
    List<PaginaModulo> findByModuloId(@Param("idModulo") Integer idModulo);

    // ===========================================================
    // 🔹 Buscar por ruta exacta (básico)
    // ===========================================================
    @Query("SELECT p FROM PaginaModulo p WHERE p.rutaPagina = :rutaPagina")
    Optional<PaginaModulo> findByRutaPagina(@Param("rutaPagina") String rutaPagina);

    // ===========================================================
    // 🔹 Listar páginas activas
    // ===========================================================
    @Query("SELECT p FROM PaginaModulo p WHERE p.activo = true ORDER BY p.nombrePagina ASC")
    List<PaginaModulo> findAllActive();

    // ===========================================================
    // 🔹 Buscar páginas por módulo incluyendo sus permisos (extendido)
    // ===========================================================
    @Query("""
        SELECT DISTINCT p FROM PaginaModulo p
        LEFT JOIN FETCH p.permisos pm
        WHERE p.modulo.idModulo = :idModulo
    """)
    List<PaginaModulo> findByModuloIdWithPermisos(@Param("idModulo") Integer idModulo);

    // ===========================================================
    // 🔹 Buscar página por ruta incluyendo módulo y permisos (extendido)
    // ===========================================================
    @Query("""
        SELECT p FROM PaginaModulo p
        LEFT JOIN FETCH p.modulo
        LEFT JOIN FETCH p.permisos
        WHERE p.rutaPagina = :ruta
    """)
    Optional<PaginaModulo> findByRutaPaginaWithModuloAndPermisos(@Param("ruta") String ruta);
}
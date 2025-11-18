package com.styp.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.Rol;
import java.util.List;
import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Integer> {
    boolean existsByDescRol(String descRol);
    
    @Query("SELECT r FROM Rol r WHERE r.statRol = :status ORDER BY r.descRol ASC")
    List<Rol> findByStatRolOrderByDescRolAsc(@Param("status") String status);
    
    // 🆕 Métodos adicionales para asignación de roles
    
    /**
     * Buscar un rol por su nombre (descRol)
     * @param descRol Nombre del rol (ej: "SUPERADMIN", "ADMIN", "MEDICO")
     * @return Optional con el Rol encontrado
     */
    Optional<Rol> findByDescRol(String descRol);
    
    /**
     * Buscar múltiples roles por sus nombres
     * @param roles Lista de nombres de roles
     * @return Lista de roles encontrados
     */
    @Query("SELECT r FROM Rol r WHERE r.descRol IN :roles AND r.statRol = 'A'")
    List<Rol> findByDescRolInAndActive(@Param("roles") List<String> roles);
    
    /**
     * Buscar múltiples roles por sus nombres (método alternativo)
     * @param roles Lista de nombres de roles
     * @return Lista de roles encontrados
     */
    List<Rol> findByDescRolInAndStatRol(List<String> descRol, String statRol);
}
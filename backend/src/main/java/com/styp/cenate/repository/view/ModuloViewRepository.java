// ============================================================================
// 🧩 ModuloViewRepository.java – Repositorio de vista de módulos MBAC
// ----------------------------------------------------------------------------
// Gestiona consultas a la vista SQL "vw_modulos_accesibles" o similar.
// Permite obtener los módulos accesibles para un usuario según sus permisos.
// ============================================================================
package com.styp.cenate.repository.view;

import com.styp.cenate.model.view.ModuloView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuloViewRepository extends JpaRepository<ModuloView, Long> {

    /** 🔹 Obtiene los módulos accesibles por un usuario (usado en MBAC frontend) */
    List<ModuloView> findByIdUser(Long idUser);
}
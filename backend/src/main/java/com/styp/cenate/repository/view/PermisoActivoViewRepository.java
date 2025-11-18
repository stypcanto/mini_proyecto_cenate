// ============================================================================
// 🧩 PermisoActivoViewRepository.java – Repositorio de vista MBAC
// ----------------------------------------------------------------------------
// Gestiona consultas a la vista SQL "vw_permisos_usuario_activos".
// Permite obtener permisos por usuario y por módulo, usados por MBAC Frontend.
// ============================================================================
package com.styp.cenate.repository.view;

import com.styp.cenate.model.view.PermisoActivoView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PermisoActivoViewRepository extends JpaRepository<PermisoActivoView, Long> {

    /** 🔹 Obtiene todos los permisos activos de un usuario */
    List<PermisoActivoView> findByIdUser(Long idUser);

    /** 🔹 Obtiene los permisos activos de un usuario filtrados por módulo */
    List<PermisoActivoView> findByIdUserAndIdModulo(Long idUser, Long idModulo);

    /** 🚀 OPTIMIZACIÓN: Obtiene permisos de múltiples usuarios en una sola query */
    @Query("SELECT p FROM PermisoActivoView p WHERE p.idUser IN :userIds")
    List<PermisoActivoView> findByIdUserIn(@Param("userIds") List<Long> userIds);
}
package com.styp.cenate.repository.view;

import com.styp.cenate.model.view.PermisoActivoView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PermisoActivoViewRepository extends JpaRepository<PermisoActivoView, Long> {
    List<PermisoActivoView> findByIdUser(Long idUser);
}
package com.styp.cenate.repository.view;

import com.styp.cenate.model.view.ModuloView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ModuloViewRepository extends JpaRepository<ModuloView, Long> {
}
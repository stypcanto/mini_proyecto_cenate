package com.styp.cenate.repository.segu;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.styp.cenate.model.PaginaModulo;

@Repository
public interface PaginaRepository extends JpaRepository<PaginaModulo, Integer> {
    List<PaginaModulo> findByActivoTrueOrderByOrdenAsc();
    List<PaginaModulo> findByModulo_IdModuloOrderByOrdenAsc(Integer idModulo);
}
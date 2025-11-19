package com.styp.cenate.repository.segu;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.styp.cenate.model.ModuloSistema;



@Repository
public interface ModuloRepository extends JpaRepository<ModuloSistema, Integer> {
    List<ModuloSistema> findByActivoTrueOrderByOrdenAsc();
}
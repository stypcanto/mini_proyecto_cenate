package com.styp.cenate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.styp.cenate.model.DimPersonalTipo;
import com.styp.cenate.model.DimPersonalTipoId;

public interface DimPersonalTipoRepository extends JpaRepository<DimPersonalTipo, DimPersonalTipoId> {

    List<DimPersonalTipo> findByIdIdPers(Long idPers);

    List<DimPersonalTipo> findByIdIdTipoPers(Long idTipoPers);
}

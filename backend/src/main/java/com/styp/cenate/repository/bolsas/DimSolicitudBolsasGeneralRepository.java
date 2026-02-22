package com.styp.cenate.repository.bolsas;

import com.styp.cenate.model.bolsas.DimSolicitudBolsasGeneral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository para guardar solicitudes de bolsas general
 * Solo inserta datos del Excel, sin búsquedas ni validaciones
 */
@Repository
public interface DimSolicitudBolsasGeneralRepository extends JpaRepository<DimSolicitudBolsasGeneral, Long> {
    // save() y saveAll() heredados de JpaRepository son suficientes
}

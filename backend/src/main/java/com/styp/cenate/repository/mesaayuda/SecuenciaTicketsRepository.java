package com.styp.cenate.repository.mesaayuda;

import com.styp.cenate.model.mesaayuda.DimSecuenciaTickets;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Repositorio para gestionar secuencia de numeración de tickets
 *
 * @author Styp Canto Rondón
 * @version v1.64.1 (2026-02-18)
 */
@Repository
public interface SecuenciaTicketsRepository extends JpaRepository<DimSecuenciaTickets, Long> {

    /**
     * Obtener secuencia por año
     */
    Optional<DimSecuenciaTickets> findByAnio(Integer anio);

    /**
     * Incrementar el contador para un año específico
     * Utiliza SQL nativo para evitar race conditions
     */
    @Modifying
    @Transactional
    @Query(value = "UPDATE dim_secuencia_tickets SET contador = contador + 1, fecha_actualizacion = NOW() WHERE anio = ?1", nativeQuery = true)
    int incrementarContador(Integer anio);

}

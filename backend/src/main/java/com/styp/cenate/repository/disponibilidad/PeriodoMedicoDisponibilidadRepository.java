package com.styp.cenate.repository.disponibilidad;

import com.styp.cenate.model.PeriodoMedicoDisponibilidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PeriodoMedicoDisponibilidadRepository extends JpaRepository<PeriodoMedicoDisponibilidad, Long> {

    /**
     * Lista todos los periodos ordenados por fecha_inicio descendente.
     */
    List<PeriodoMedicoDisponibilidad> findAllByOrderByFechaInicioDesc();

    /**
     * Lista periodos por estado.
     */
    List<PeriodoMedicoDisponibilidad> findByEstadoOrderByFechaInicioDesc(String estado);

    /**
     * Verifica si ya existe un periodo para el mismo año y código de periodo.
     */
    boolean existsByAnioAndPeriodo(Integer anio, String periodo);

    /**
     * Obtiene periodos vigentes (ACTIVO y dentro del rango de fechas).
     */
    @Query("""
            SELECT p FROM PeriodoMedicoDisponibilidad p
            WHERE p.estado = 'ACTIVO'
              AND p.fechaInicio <= :ahora
              AND p.fechaFin >= :ahora
            ORDER BY p.fechaInicio DESC
            """)
    List<PeriodoMedicoDisponibilidad> findVigentes(@Param("ahora") LocalDateTime ahora);

    default List<PeriodoMedicoDisponibilidad> findVigentes() {
        return findVigentes(LocalDateTime.now());
    }

    /**
     * Lista los años disponibles registrados en la tabla.
     */
    @Query("""
            SELECT DISTINCT p.anio
            FROM PeriodoMedicoDisponibilidad p
            ORDER BY p.anio DESC
            """)
    List<Integer> listarAniosDisponibles();
}


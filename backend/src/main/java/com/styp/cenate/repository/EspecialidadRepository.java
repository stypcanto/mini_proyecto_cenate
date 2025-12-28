package com.styp.cenate.repository;

import com.styp.cenate.model.Especialidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EspecialidadRepository extends JpaRepository<Especialidad, Long> {

    List<Especialidad> findByEstado(String estado);

    List<Especialidad> findByEsCenate(Boolean esCenate);

    @Query("SELECT e FROM Especialidad e WHERE e.estado = :estado ORDER BY e.descServicio ASC")
    List<Especialidad> findByEstadoOrderByDescServicioAsc(@Param("estado") String estado);

    @Query(value = "SELECT DISTINCT e.* FROM dim_servicio_essi e " +
            "INNER JOIN dim_personal_prof p ON e.id_servicio = p.id_servicio " +
            "WHERE p.stat_pers_prof = 'A' AND e.estado = 'A' " +
            "ORDER BY e.desc_servicio ASC", nativeQuery = true)
    List<Especialidad> findEspecialidadesConMedicosActivos();
}

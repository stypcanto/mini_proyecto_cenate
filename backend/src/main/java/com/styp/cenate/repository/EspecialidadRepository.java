package com.styp.cenate.repository;

import com.styp.cenate.model.Especialidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

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

    // 🏥 v1.46.8: Buscar especialidad por nombre (sin case)
    Optional<Especialidad> findByDescServicioIgnoreCase(String descServicio);

    // 🏥 v1.46.9: Buscar especialidad por nombre que contenga el texto (LIKE)
    List<Especialidad> findByDescServicioContainingIgnoreCase(String descServicio);

    // 🏥 v1.46.9: Buscar usando unaccent para ignorar tildes (Enfermería = ENFERMERIA)
    @Query(value = """
        SELECT * FROM dim_servicio_essi
        WHERE unaccent(lower(desc_servicio)) LIKE unaccent(lower(CONCAT('%', :texto, '%')))
        ORDER BY desc_servicio ASC
        LIMIT 5
        """, nativeQuery = true)
    List<Especialidad> buscarPorNombreSinAcentos(@Param("texto") String texto);
}

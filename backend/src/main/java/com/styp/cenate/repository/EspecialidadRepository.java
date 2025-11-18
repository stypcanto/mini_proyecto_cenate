package com.styp.cenate.repository;

import com.styp.cenate.model.Especialidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface EspecialidadRepository extends JpaRepository<Especialidad, Long> {
    
    /** Buscar especialidad por id_pers usando query personalizada */
    @Query("SELECT e FROM Especialidad e WHERE e.idPers = :idPers")
    Optional<Especialidad> findByIdPers(@Param("idPers") Long idPers);
    
    /** Buscar todas las especialidades de un personal usando query personalizada */
    @Query("SELECT e FROM Especialidad e WHERE e.idPers = :idPers")
    List<Especialidad> findAllByIdPers(@Param("idPers") Long idPers);
    
    /** Limpiar id_pers de todas las especialidades de un personal */
    @Modifying
    @Transactional
    @Query("UPDATE Especialidad e SET e.idPers = NULL WHERE e.idPers = :idPers")
    void clearIdPersByPersonal(@Param("idPers") Long idPers);
}

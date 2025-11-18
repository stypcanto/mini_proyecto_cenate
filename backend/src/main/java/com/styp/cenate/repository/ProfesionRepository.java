package com.styp.cenate.repository;

import com.styp.cenate.model.Profesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProfesionRepository extends JpaRepository<Profesion, Long> {
    List<Profesion> findByStatProf(String statProf);
    
    @Query("SELECT p FROM Profesion p WHERE p.statProf = :statProf ORDER BY p.descProf ASC")
    List<Profesion> findByStatProfOrderByDescProfAsc(@Param("statProf") String statProf);
}

package com.styp.cenate.repository;

import com.styp.cenate.model.Profesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProfesionRepository extends JpaRepository<Profesion, Long> {
    List<Profesion> findByStatProf(String statProf);
}

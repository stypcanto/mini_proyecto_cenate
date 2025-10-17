package com.styp.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.RegimenLaboral;

import java.util.List;

@Repository
public interface RegimenLaboralRepository extends JpaRepository<RegimenLaboral, Long> {
    List<RegimenLaboral> findByStatRegLab(String status);
}

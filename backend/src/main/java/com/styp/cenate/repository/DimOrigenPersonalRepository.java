package com.styp.cenate.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.styp.cenate.model.DimOrigenPersonal;

public interface DimOrigenPersonalRepository extends JpaRepository<DimOrigenPersonal, Long> {
	
    List<DimOrigenPersonal> findByEstado(String estado);


}

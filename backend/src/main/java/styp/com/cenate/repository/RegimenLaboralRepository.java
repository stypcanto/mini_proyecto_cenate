package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.RegimenLaboral;

import java.util.List;

@Repository
public interface RegimenLaboralRepository extends JpaRepository<RegimenLaboral, Long> {
    List<RegimenLaboral> findByStatRegLab(String status);
}

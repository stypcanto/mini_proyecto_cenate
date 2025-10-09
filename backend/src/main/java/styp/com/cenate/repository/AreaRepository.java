package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.Area;

import java.util.List;

@Repository
public interface AreaRepository extends JpaRepository<Area, Long> {
    List<Area> findByStatArea(String status);
}

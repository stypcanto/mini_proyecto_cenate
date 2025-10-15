package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.NivelAtencion;

import java.util.List;

@Repository
public interface NivelAtencionRepository extends JpaRepository<NivelAtencion, Long> {

    /**
     * Filtra niveles por estado ('A' o 'I').
     */
    List<NivelAtencion> findByStatNivAtenIgnoreCase(String statNivAten);

    /**
     * Verifica si ya existe un nivel con la misma descripción (UNIQUE desc_niv_aten).
     */
    boolean existsByDescNivAtenIgnoreCase(String descNivAten);
}
package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.AreaHospitalaria;

import java.util.List;
import java.util.Optional;

@Repository
public interface AreaHospitalariaRepository extends JpaRepository<AreaHospitalaria, Long> {

    /**
     * Filtra por estado ('A' o 'I')
     */
    List<AreaHospitalaria> findByEstadoIgnoreCase(String estado);

    /**
     * Busca por código único
     */
    Optional<AreaHospitalaria> findByCodigoIgnoreCase(String codigo);

    /**
     * Verifica si ya existe una descripción similar
     */
    boolean existsByDescripcionIgnoreCase(String descripcion);
}
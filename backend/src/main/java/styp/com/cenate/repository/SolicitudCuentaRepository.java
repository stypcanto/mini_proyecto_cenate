package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import styp.com.cenate.model.SolicitudCuenta;

public interface SolicitudCuentaRepository extends JpaRepository<SolicitudCuenta, Long> {
    long countByEstado(String estado);
}
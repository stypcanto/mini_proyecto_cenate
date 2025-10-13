package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import styp.com.cenate.model.RecuperacionCuenta;
import java.util.List;

public interface RecuperacionCuentaRepository extends JpaRepository<RecuperacionCuenta, Long> {
    long countByEstado(String estado);
    List<RecuperacionCuenta> findByEstado(String estado);
}
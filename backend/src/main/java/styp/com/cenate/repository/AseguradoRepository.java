package styp.com.cenate.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import styp.com.cenate.model.Asegurado;

import java.util.Optional;

public interface AseguradoRepository extends JpaRepository<Asegurado, String> {
    Page<Asegurado> findAll(Pageable pageable);

    Optional<Asegurado> findByDocPaciente(String docPaciente);
}

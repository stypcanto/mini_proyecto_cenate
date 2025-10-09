package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.TipoDocumento;

import java.util.List;

@Repository
public interface TipoDocumentoRepository extends JpaRepository<TipoDocumento, Long> {
    List<TipoDocumento> findByStatTipDoc(String status);
}

package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.TipoIpress;

import java.util.List;

@Repository
public interface TipoIpressRepository extends JpaRepository<TipoIpress, Long> {

    /**
     * Lista tipos de IPRESS activos ('A')
     */
    List<TipoIpress> findByStatTipIpressIgnoreCase(String statTipIpress);

    /**
     * Verifica duplicado por descripción (UNIQUE desc_tip_ipress)
     */
    boolean existsByDescTipIpressIgnoreCase(String descTipIpress);
}
package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.TipoProcedimiento;

import java.util.List;
import java.util.Optional;

@Repository
public interface TipoProcedimientoRepository extends JpaRepository<TipoProcedimiento, Long> {

    /**
     * Filtra por estado ('A' o 'I')
     */
    List<TipoProcedimiento> findByStatProcedIgnoreCase(String stat);

    /**
     * Busca por código único
     */
    Optional<TipoProcedimiento> findByCodTipProcedIgnoreCase(String codTipProced);

    /**
     * Verifica existencia por descripción
     */
    boolean existsByDescTipProcedIgnoreCase(String descTipProced);
}
package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.Procedimiento;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProcedimientoRepository extends JpaRepository<Procedimiento, Long> {

    /**
     * Busca procedimientos activos (stat_proced = 'A')
     */
    List<Procedimiento> findByStatProcedIgnoreCase(String statProced);

    /**
     * Busca por código único
     */
    Optional<Procedimiento> findByCodProcedIgnoreCase(String codProced);

    /**
     * Verifica existencia por descripción
     */
    boolean existsByDescProcedIgnoreCase(String descProced);
}
package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.TipoProcedimiento;

import java.util.List;
import java.util.Optional;

@Repository
public interface TipoProcedimientoRepository extends JpaRepository<TipoProcedimiento, Long> {

    /**
     * 🔹 Filtra por estado ('A' o 'I')
     */
    List<TipoProcedimiento> findByEstadoIgnoreCase(String estado);

    /**
     * 🔹 Busca por código único (campo: codigo)
     */
    Optional<TipoProcedimiento> findByCodigoIgnoreCase(String codigo);

    /**
     * 🔹 Verifica existencia por descripción (campo: descripcion)
     */
    boolean existsByDescripcionIgnoreCase(String descripcion);
}
package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.Procedimiento;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProcedimientoRepository extends JpaRepository<Procedimiento, Long> {

    /**
     * 🔹 Busca procedimientos por estado (ej: "A" para activos)
     */
    List<Procedimiento> findByEstadoIgnoreCase(String estado);

    /**
     * 🔹 Busca por código único (campo: codigo)
     */
    Optional<Procedimiento> findByCodigoIgnoreCase(String codigo);

    /**
     * 🔹 Verifica existencia por descripción (campo: descripcion)
     */
    boolean existsByDescripcionIgnoreCase(String descripcion);
}
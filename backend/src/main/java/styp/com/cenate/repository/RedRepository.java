package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.Red;

import java.util.List;

@Repository
public interface RedRepository extends JpaRepository<Red, Long> {

    /**
     * 🔹 Busca todas las redes que pertenecen a una macroregión específica.
     */
    List<Red> findByIdMacro(Long idMacro);

    /**
     * 🔹 Verifica si ya existe una red con la misma descripción (ignora mayúsculas/minúsculas).
     */
    boolean existsByDescripcionIgnoreCase(String descripcion);
}
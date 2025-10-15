package styp.com.cenate.repository.mbac;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.ModuloSistema;

import java.util.List;

@Repository
public interface ModuloSistemaRepository extends JpaRepository<ModuloSistema, Integer> {

    /**
     * Obtiene todos los módulos activos con sus páginas cargadas (JOIN FETCH).
     * Evita el error LazyInitializationException.
     */
    @Query("SELECT DISTINCT m FROM ModuloSistema m LEFT JOIN FETCH m.paginas p WHERE m.activo = true AND (p.activo = true OR p IS NULL)")
    List<ModuloSistema> findAllWithPaginas();
}
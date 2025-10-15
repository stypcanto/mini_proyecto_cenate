package styp.com.cenate.repository.mbac;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.ModuloSistema;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la gestión de módulos del sistema.
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Repository
public interface ModuloSistemaRepository extends JpaRepository<ModuloSistema, Integer> {

    /**
     * Busca un módulo por su nombre.
     */
    Optional<ModuloSistema> findByNombreModulo(String nombreModulo);

    /**
     * Busca módulos activos.
     */
    List<ModuloSistema> findByActivoTrue();

    /**
     * Busca un módulo por su ruta base.
     */
    Optional<ModuloSistema> findByRutaBase(String rutaBase);

    /**
     * Verifica si existe un módulo con un nombre específico.
     */
    boolean existsByNombreModulo(String nombreModulo);

    /**
     * Obtiene todos los módulos con sus páginas asociadas.
     */
    @Query("SELECT DISTINCT m FROM ModuloSistema m LEFT JOIN FETCH m.paginas WHERE m.activo = true")
    List<ModuloSistema> findAllModulosConPaginas();

    /**
     * Obtiene un módulo específico con sus páginas.
     */
    @Query("SELECT m FROM ModuloSistema m LEFT JOIN FETCH m.paginas WHERE m.idModulo = :idModulo")
    Optional<ModuloSistema> findByIdWithPaginas(@Param("idModulo") Integer idModulo);
}

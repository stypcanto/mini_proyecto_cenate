package styp.com.cenate.service.mbac;

import styp.com.cenate.dto.mbac.ModuloSistemaResponse;
import styp.com.cenate.dto.mbac.PaginaModuloResponse;

import java.util.List;
import java.util.Optional;

/**
 * Interfaz de servicio para la gestión de módulos del sistema MBAC.
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
public interface ModuloSistemaService {

    /**
     * Obtiene todos los módulos activos con sus páginas.
     * 
     * @return Lista de módulos con sus páginas
     */
    List<ModuloSistemaResponse> obtenerTodosLosModulos();

    /**
     * Obtiene las páginas activas de un módulo específico.
     * 
     * @param idModulo ID del módulo
     * @return Lista de páginas del módulo
     */
    List<PaginaModuloResponse> obtenerPaginasPorModulo(Integer idModulo);

    /**
     * Busca una página por su ruta.
     * 
     * @param ruta Ruta de la página
     * @return Página encontrada o vacío
     */
    Optional<PaginaModuloResponse> buscarPaginaPorRuta(String ruta);
}

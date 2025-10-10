package styp.com.cenate.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import styp.com.cenate.dto.PersonalUnificadoResponse;
import styp.com.cenate.service.PersonalUnificadoService;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestión unificada de personal (CENATE + Externos)
 * 
 * Este controlador proporciona endpoints para consultar y filtrar todo el personal
 * del sistema, diferenciando claramente entre personal interno (CENATE) y externo
 * (otras instituciones)
 * 
 * Base URL: /api/personal-unificado
 */
@RestController
@RequestMapping("/api/personal-unificado")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://10.0.89.13:3000", "http://10.0.89.13:5173"})
public class PersonalUnificadoController {
    
    private final PersonalUnificadoService personalUnificadoService;
    
    /**
     * Obtener TODO el personal del sistema (CENATE + Externos)
     * 
     * GET /api/personal-unificado
     * 
     * Retorna una lista completa de todo el personal registrado en el sistema,
     * identificando claramente a qué institución pertenece cada uno.
     * 
     * @return Lista de PersonalUnificadoResponse con todos los registros
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<List<PersonalUnificadoResponse>> getAllPersonal() {
        log.info("Consultando TODO el personal (CENATE + Externos)");
        List<PersonalUnificadoResponse> personal = personalUnificadoService.getAllPersonal();
        log.info("Total personal retornado: {}", personal.size());
        return ResponseEntity.ok(personal);
    }
    
    /**
     * Filtrar personal con múltiples criterios
     * 
     * GET /api/personal-unificado/filtrar
     * 
     * Permite buscar personal aplicando diferentes filtros simultáneamente:
     * 
     * @param tipoPersonal Filtro por tipo de institución
     *                     - "CENATE": Solo personal interno
     *                     - "EXTERNO": Solo personal de otras instituciones
     *                     - null o no especificado: Todos
     *                     
     * @param mesCumpleanos Filtro por mes de cumpleaños (1-12)
     *                      - 1 = Enero, 2 = Febrero, etc.
     *                      - null: No filtrar por mes
     *                      
     * @param estado Filtro por estado
     *              - Para personal CENATE: "A" (Activo) o "I" (Inactivo)
     *              - Para todos: "ACTIVO" o "INACTIVO"
     *              - null: No filtrar por estado
     *              
     * @param idArea Filtro por área (solo aplica para personal CENATE)
     *               - ID del área específica
     *               - null: No filtrar por área
     *               
     * @param searchTerm Término de búsqueda libre
     *                   - Busca en: nombres, apellidos, número de documento
     *                   - Búsqueda insensible a mayúsculas/minúsculas
     *                   - null o vacío: No filtrar por término
     * 
     * @return Lista filtrada de PersonalUnificadoResponse
     * 
     * Ejemplos de uso:
     * - /api/personal-unificado/filtrar?tipoPersonal=CENATE
     * - /api/personal-unificado/filtrar?mesCumpleanos=6
     * - /api/personal-unificado/filtrar?estado=ACTIVO&idArea=5
     * - /api/personal-unificado/filtrar?searchTerm=garcia&tipoPersonal=EXTERNO
     */
    @GetMapping("/filtrar")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<List<PersonalUnificadoResponse>> filtrarPersonal(
            @RequestParam(required = false) String tipoPersonal,
            @RequestParam(required = false) Integer mesCumpleanos,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Integer idArea,
            @RequestParam(required = false) String searchTerm) {
        
        log.info("Filtrando personal - Tipo: {}, Mes: {}, Estado: {}, Área: {}, Búsqueda: {}", 
                tipoPersonal, mesCumpleanos, estado, idArea, searchTerm);
        
        List<PersonalUnificadoResponse> resultado = personalUnificadoService.getPersonalConFiltros(
                tipoPersonal, mesCumpleanos, estado, idArea, searchTerm);
        
        log.info("Personal filtrado encontrado: {}", resultado.size());
        return ResponseEntity.ok(resultado);
    }
    
    /**
     * Obtener solo personal de CENATE (interno)
     * 
     * GET /api/personal-unificado/cenate
     * 
     * Atajo para obtener únicamente el personal interno de CENATE.
     * Equivalente a: /api/personal-unificado/filtrar?tipoPersonal=CENATE
     * 
     * @return Lista de personal interno
     */
    @GetMapping("/cenate")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<List<PersonalUnificadoResponse>> getPersonalCenate() {
        log.info("Consultando solo personal CENATE");
        List<PersonalUnificadoResponse> personal = personalUnificadoService.getPersonalConFiltros(
                "CENATE", null, null, null, null);
        return ResponseEntity.ok(personal);
    }
    
    /**
     * Obtener solo personal externo (otras instituciones)
     * 
     * GET /api/personal-unificado/externos
     * 
     * Atajo para obtener únicamente el personal de instituciones externas.
     * Equivalente a: /api/personal-unificado/filtrar?tipoPersonal=EXTERNO
     * 
     * @return Lista de personal externo
     */
    @GetMapping("/externos")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<List<PersonalUnificadoResponse>> getPersonalExterno() {
        log.info("Consultando solo personal externo");
        List<PersonalUnificadoResponse> personal = personalUnificadoService.getPersonalConFiltros(
                "EXTERNO", null, null, null, null);
        return ResponseEntity.ok(personal);
    }
    
    /**
     * Obtener personal que cumple años en un mes específico
     * 
     * GET /api/personal-unificado/cumpleanos/{mes}
     * 
     * @param mes Mes del año (1-12)
     * @return Lista de personal que cumple años en ese mes
     * 
     * Ejemplos:
     * - /api/personal-unificado/cumpleanos/6  (junio)
     * - /api/personal-unificado/cumpleanos/12 (diciembre)
     */
    @GetMapping("/cumpleanos/{mes}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<List<PersonalUnificadoResponse>> getPersonalPorCumpleanos(@PathVariable Integer mes) {
        log.info("Consultando personal que cumple años en mes: {}", mes);
        
        if (mes < 1 || mes > 12) {
            return ResponseEntity.badRequest().build();
        }
        
        List<PersonalUnificadoResponse> personal = personalUnificadoService.getPersonalPorMesCumpleanos(mes);
        return ResponseEntity.ok(personal);
    }
    
    /**
     * Obtener estadísticas generales del personal
     * 
     * GET /api/personal-unificado/estadisticas
     * 
     * Retorna métricas agregadas sobre el personal del sistema:
     * - Total de personal CENATE
     * - Total de personal externo
     * - Total general
     * - Personal activo/inactivo
     * 
     * @return Map con las estadísticas
     */
    @GetMapping("/estadisticas")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<Map<String, Object>> getEstadisticas() {
        log.info("Consultando estadísticas de personal");
        Map<String, Object> stats = personalUnificadoService.getEstadisticasPersonal();
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Buscar personal por término libre
     * 
     * GET /api/personal-unificado/buscar?q={termino}
     * 
     * Busca en nombres, apellidos y número de documento.
     * 
     * @param q Término de búsqueda
     * @return Lista de personal que coincide con el término
     */
    @GetMapping("/buscar")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<List<PersonalUnificadoResponse>> buscarPersonal(@RequestParam String q) {
        log.info("Buscando personal con término: {}", q);
        List<PersonalUnificadoResponse> resultado = personalUnificadoService.getPersonalConFiltros(
                null, null, null, null, q);
        return ResponseEntity.ok(resultado);
    }
}

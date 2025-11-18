package com.styp.cenate.api.ubicacion;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * ============================================================
 * 📍 CONTROLADOR: UBICACIONES GEOGRÁFICAS DEL PERÚ
 * ============================================================
 * Endpoint público para consultar departamentos, provincias y distritos
 * Sin necesidad de autenticación
 * ============================================================
 */
@RestController
@RequestMapping("/api/ubicacion")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://10.0.89.13:5173",
        "http://10.0.89.239:5173"
})
public class UbicacionController {

    private final JdbcTemplate jdbcTemplate;

    /**
     * 🗺️ Obtener todos los departamentos del Perú
     */
    @GetMapping("/departamentos")
    public ResponseEntity<List<Map<String, Object>>> getDepartamentos() {
        log.info("📍 Consultando departamentos del Perú");
        
        String sql = """
            SELECT 
                id_dep as idDepartamento,
                desc_dep as nombreDepartamento,
                stat_dep as estado
            FROM dim_departamento
            WHERE stat_dep = 'A'
            ORDER BY desc_dep ASC
        """;
        
        List<Map<String, Object>> departamentos = jdbcTemplate.queryForList(sql);
        return ResponseEntity.ok(departamentos);
    }

    /**
     * 🗺️ Obtener provincias por departamento
     */
    @GetMapping("/provincias/{idDepartamento}")
    public ResponseEntity<List<Map<String, Object>>> getProvinciasByDepartamento(
            @PathVariable Long idDepartamento) {
        log.info("📍 Consultando provincias del departamento: {}", idDepartamento);
        
        String sql = """
            SELECT 
                id_prov as idProvincia,
                desc_prov as nombreProvincia,
                id_dep as idDepartamento,
                stat_prov as estado
            FROM dim_provincia
            WHERE id_dep = ? AND stat_prov = 'A'
            ORDER BY desc_prov ASC
        """;
        
        List<Map<String, Object>> provincias = jdbcTemplate.queryForList(sql, idDepartamento);
        return ResponseEntity.ok(provincias);
    }

    /**
     * 🗺️ Obtener distritos por provincia
     */
    @GetMapping("/distritos/{idProvincia}")
    public ResponseEntity<List<Map<String, Object>>> getDistritosByProvincia(
            @PathVariable Long idProvincia) {
        log.info("📍 Consultando distritos de la provincia: {}", idProvincia);
        
        String sql = """
            SELECT 
                id_dist as idDistrito,
                desc_dist as nombreDistrito,
                id_prov as idProvincia,
                stat_dist as estado
            FROM dim_distrito
            WHERE id_prov = ? AND stat_dist = 'A'
            ORDER BY desc_dist ASC
        """;
        
        List<Map<String, Object>> distritos = jdbcTemplate.queryForList(sql, idProvincia);
        return ResponseEntity.ok(distritos);
    }

    /**
     * 🗺️ Obtener distrito por ID
     */
    @GetMapping("/distrito/{id}")
    public ResponseEntity<Map<String, Object>> getDistritoById(@PathVariable Long id) {
        log.info("📍 Consultando distrito por ID: {}", id);
        
        String sql = """
            SELECT 
                d.id_dist as idDistrito,
                d.desc_dist as nombreDistrito,
                d.id_prov as idProvincia,
                p.desc_prov as nombreProvincia,
                p.id_dep as idDepartamento,
                dep.desc_dep as nombreDepartamento,
                d.stat_dist as estado
            FROM dim_distrito d
            INNER JOIN dim_provincia p ON d.id_prov = p.id_prov
            INNER JOIN dim_departamento dep ON p.id_dep = dep.id_dep
            WHERE d.id_dist = ?
        """;
        
        Map<String, Object> distrito = jdbcTemplate.queryForMap(sql, id);
        return ResponseEntity.ok(distrito);
    }
}

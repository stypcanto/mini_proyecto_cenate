package com.styp.cenate.api.pacientes;

import com.styp.cenate.dto.AseguradoDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/asegurados")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class AseguradoController {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Calcula la edad a partir de una fecha de nacimiento
     * @param fechaNacimiento Fecha de nacimiento (puede ser java.sql.Date o LocalDate)
     * @return Edad en años, o null si la fecha es nula
     */
    private Integer calcularEdad(Object fechaNacimiento) {
        if (fechaNacimiento == null) {
            return null;
        }
        
        LocalDate fechaNac;
        if (fechaNacimiento instanceof java.sql.Date) {
            fechaNac = ((java.sql.Date) fechaNacimiento).toLocalDate();
        } else if (fechaNacimiento instanceof LocalDate) {
            fechaNac = (LocalDate) fechaNacimiento;
        } else {
            return null;
        }
        
        return Period.between(fechaNac, LocalDate.now()).getYears();
    }

    /**
     * Listar asegurados con paginación usando SQL directo
     * Ejemplo: GET /api/asegurados?page=0&size=25
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAsegurados(
            @RequestParam(name="page", defaultValue = "0") int page,
            @RequestParam(name="size", defaultValue = "25") int size) {
        
        try {
            log.info("📊 Listando asegurados - Página: {}, Tamaño: {}", page, size);
            
            // Consulta para obtener el total de registros
            String countSql = "SELECT COUNT(*) FROM asegurados";
            Integer totalElements = jdbcTemplate.queryForObject(countSql, Integer.class);
            
            if (totalElements == null) {
                totalElements = 0;
            }
            
            // Calcular offset
            int offset = page * size;
            
            // Consulta paginada con JOIN a dim_ipress y dim_red
            String sql = """
                SELECT 
                    a.pk_asegurado,
                    a.doc_paciente,
                    a.paciente,
                    a.fecnacimpaciente,
                    a.sexo,
                    a.tipo_paciente,
                    a.tel_fijo,
                    a.tel_celular,
                    a.tipo_seguro,
                    a.cas_adscripcion,
                    di.desc_ipress as nombre_ipress,
                    dr.desc_red as nombre_red,
                    a.periodo
                FROM asegurados a
                LEFT JOIN dim_ipress di ON a.cas_adscripcion = di.cod_ipress
                LEFT JOIN dim_red dr ON di.id_red = dr.id_red
                ORDER BY a.doc_paciente
                LIMIT ? OFFSET ?
            """;
            
            List<Map<String, Object>> asegurados = jdbcTemplate.queryForList(sql, size, offset);
            
            // Formatear los datos para camelCase que espera el frontend
            asegurados.forEach(asegurado -> {
                asegurado.put("pkAsegurado", asegurado.get("pk_asegurado"));
                asegurado.put("docPaciente", asegurado.get("doc_paciente"));
                asegurado.put("paciente", asegurado.get("paciente"));
                asegurado.put("fecnacimpaciente", asegurado.get("fecnacimpaciente"));
                
                // ✅ Calcular y agregar la edad
                asegurado.put("edad", calcularEdad(asegurado.get("fecnacimpaciente")));
                
                asegurado.put("sexo", asegurado.get("sexo"));
                asegurado.put("tipoPaciente", asegurado.get("tipo_paciente"));
                asegurado.put("telFijo", asegurado.get("tel_fijo"));
                asegurado.put("telCelular", asegurado.get("tel_celular"));
                asegurado.put("tipoSeguro", asegurado.get("tipo_seguro"));
                asegurado.put("casAdscripcion", asegurado.get("cas_adscripcion"));
                asegurado.put("nombreIpress", asegurado.get("nombre_ipress"));
                asegurado.put("nombreRed", asegurado.get("nombre_red"));
                asegurado.put("periodo", asegurado.get("periodo"));
                
                // Eliminar keys con snake_case
                asegurado.remove("pk_asegurado");
                asegurado.remove("doc_paciente");
                asegurado.remove("tipo_paciente");
                asegurado.remove("tel_fijo");
                asegurado.remove("tel_celular");
                asegurado.remove("tipo_seguro");
                asegurado.remove("cas_adscripcion");
                asegurado.remove("nombre_ipress");
                asegurado.remove("nombre_red");
            });
            
            // Calcular el número total de páginas
            int totalPages = (int) Math.ceil((double) totalElements / size);
            
            // Construir respuesta en formato Page de Spring
            Map<String, Object> response = new HashMap<>();
            response.put("content", asegurados);
            response.put("totalElements", totalElements);
            response.put("totalPages", totalPages);
            response.put("size", size);
            response.put("number", page);
            response.put("numberOfElements", asegurados.size());
            response.put("first", page == 0);
            response.put("last", page >= totalPages - 1);
            response.put("empty", asegurados.isEmpty());
            
            log.info("✅ Devolviendo {} asegurados de un total de {}", asegurados.size(), totalElements);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Error al listar asegurados", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("content", List.of());
            errorResponse.put("totalElements", 0);
            errorResponse.put("totalPages", 0);
            errorResponse.put("size", size);
            errorResponse.put("number", page);
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * Buscar asegurado por documento.
     * Ejemplo: GET /api/asegurados/doc/06760870
     */
    @GetMapping("/doc/{docPaciente}")
    public ResponseEntity<?> getByDocPaciente(@PathVariable String docPaciente) {
        try {
            log.info("🔍 Buscando asegurado por DNI: {}", docPaciente);
            
            String sql = """
                SELECT 
                    a.pk_asegurado,
                    a.doc_paciente,
                    a.paciente,
                    a.fecnacimpaciente,
                    a.sexo,
                    a.tipo_paciente,
                    a.tel_fijo,
                    a.tipo_seguro,
                    a.cas_adscripcion,
                    di.desc_ipress as nombre_ipress,
                    a.periodo
                FROM asegurados a
                LEFT JOIN dim_ipress di ON a.cas_adscripcion = di.cod_ipress
                WHERE a.doc_paciente = ?
            """;
            
            List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, docPaciente);
            
            if (result.isEmpty()) {
                log.warn("⚠️ No se encontró asegurado con DNI: {}", docPaciente);
                return ResponseEntity.notFound().build();
            }
            
            Map<String, Object> asegurado = result.get(0);
            
            // Formatear para camelCase
            Map<String, Object> response = new HashMap<>();
            response.put("pkAsegurado", asegurado.get("pk_asegurado"));
            response.put("docPaciente", asegurado.get("doc_paciente"));
            response.put("paciente", asegurado.get("paciente"));
            response.put("fecnacimpaciente", asegurado.get("fecnacimpaciente"));
            response.put("sexo", asegurado.get("sexo"));
            response.put("tipoPaciente", asegurado.get("tipo_paciente"));
            response.put("telFijo", asegurado.get("tel_fijo"));
            response.put("telCelular", asegurado.get("tel_celular"));
            response.put("tipoSeguro", asegurado.get("tipo_seguro"));
            response.put("casAdscripcion", asegurado.get("cas_adscripcion"));
            response.put("nombreIpress", asegurado.get("nombre_ipress"));
            response.put("periodo", asegurado.get("periodo"));
            
            log.info("✅ Asegurado encontrado: {} (DNI: {})", asegurado.get("paciente"), docPaciente);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Error al buscar asegurado por DNI: {}", docPaciente, e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Error al buscar asegurado: " + e.getMessage()));
        }
    }
    
    /**
     * Buscar asegurados por nombre, con filtros opcionales de Red e IPRESS
     * Ejemplo: GET /api/asegurados/buscar?q=MOLINA&idRed=1&codIpress=045
     */
    @GetMapping("/buscar")
    public ResponseEntity<Map<String, Object>> buscarAsegurados(
            @RequestParam String q,
            @RequestParam(required = false) Integer idRed,
            @RequestParam(required = false) String codIpress,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {
        
        try {
            log.info("🔍 Buscando asegurado por documento: '{}'", q);
            
            // Búsqueda exacta por número de documento (8 dígitos)
            StringBuilder whereClause = new StringBuilder("WHERE a.doc_paciente = ?");
            List<Object> params = new ArrayList<>();
            params.add(q.trim());
            
            // Filtro por Red
            if (idRed != null) {
                whereClause.append(" AND di.id_red = ?");
                params.add(idRed);
            }
            
            // Filtro por IPRESS
            if (codIpress != null && !codIpress.trim().isEmpty()) {
                whereClause.append(" AND a.cas_adscripcion = ?");
                params.add(codIpress);
            }
            
            // Consulta para obtener el total de registros
            String countSql = "SELECT COUNT(*) FROM asegurados a LEFT JOIN dim_ipress di ON a.cas_adscripcion = di.cod_ipress " + whereClause;
            Integer totalElements = jdbcTemplate.queryForObject(countSql, Integer.class, params.toArray());
            
            if (totalElements == null) {
                totalElements = 0;
            }
            
            // Calcular offset
            int offset = page * size;
            
            // Consulta paginada con JOIN a dim_ipress
            String sql = """
                SELECT 
                    a.pk_asegurado,
                    a.doc_paciente,
                    a.paciente,
                    a.fecnacimpaciente,
                    a.sexo,
                    a.tipo_paciente,
                    a.tel_fijo,
                    a.tel_celular,
                    a.tipo_seguro,
                    a.cas_adscripcion,
                    di.desc_ipress as nombre_ipress,
                    dr.desc_red as nombre_red,
                    a.periodo
                FROM asegurados a
                LEFT JOIN dim_ipress di ON a.cas_adscripcion = di.cod_ipress
                LEFT JOIN dim_red dr ON di.id_red = dr.id_red
                """ + whereClause + """
                ORDER BY a.doc_paciente
                LIMIT ? OFFSET ?
            """;
            
            // Agregar parámetros de paginación
            List<Object> allParams = new ArrayList<>(params);
            allParams.add(size);
            allParams.add(offset);
            
            List<Map<String, Object>> asegurados = jdbcTemplate.queryForList(sql, allParams.toArray());
            
            // Formatear los datos para camelCase
            asegurados.forEach(asegurado -> {
                asegurado.put("pkAsegurado", asegurado.get("pk_asegurado"));
                asegurado.put("docPaciente", asegurado.get("doc_paciente"));
                asegurado.put("paciente", asegurado.get("paciente"));
                asegurado.put("fecnacimpaciente", asegurado.get("fecnacimpaciente"));
                
                // ✅ Calcular y agregar la edad
                asegurado.put("edad", calcularEdad(asegurado.get("fecnacimpaciente")));
                
                asegurado.put("sexo", asegurado.get("sexo"));
                asegurado.put("tipoPaciente", asegurado.get("tipo_paciente"));
                asegurado.put("telFijo", asegurado.get("tel_fijo"));
                asegurado.put("telCelular", asegurado.get("tel_celular"));
                asegurado.put("tipoSeguro", asegurado.get("tipo_seguro"));
                asegurado.put("casAdscripcion", asegurado.get("cas_adscripcion"));
                asegurado.put("nombreIpress", asegurado.get("nombre_ipress"));
                asegurado.put("nombreRed", asegurado.get("nombre_red"));
                asegurado.put("periodo", asegurado.get("periodo"));
                
                // Eliminar keys con snake_case
                asegurado.remove("pk_asegurado");
                asegurado.remove("doc_paciente");
                asegurado.remove("tipo_paciente");
                asegurado.remove("tel_fijo");
                asegurado.remove("tel_celular");
                asegurado.remove("tipo_seguro");
                asegurado.remove("cas_adscripcion");
                asegurado.remove("nombre_ipress");
            });
            
            // Calcular el número total de páginas
            int totalPages = (int) Math.ceil((double) totalElements / size);
            
            // Construir respuesta
            Map<String, Object> response = new HashMap<>();
            response.put("content", asegurados);
            response.put("totalElements", totalElements);
            response.put("totalPages", totalPages);
            response.put("size", size);
            response.put("number", page);
            response.put("numberOfElements", asegurados.size());
            response.put("first", page == 0);
            response.put("last", page >= totalPages - 1);
            response.put("empty", asegurados.isEmpty());
            
            log.info("✅ Encontrados {} asegurados que coinciden con '{}'", asegurados.size(), q);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Error al buscar asegurados", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("content", List.of());
            errorResponse.put("totalElements", 0);
            errorResponse.put("totalPages", 0);
            errorResponse.put("size", size);
            errorResponse.put("number", page);
            return ResponseEntity.ok(errorResponse);
        }
    }
    
    /**
     * Obtener detalles completos de un asegurado incluyendo información de IPRESS
     * Ejemplo: GET /api/asegurados/detalle/{pkAsegurado}
     */
    @GetMapping("/detalle/{pkAsegurado}")
    public ResponseEntity<?> getDetalleAsegurado(@PathVariable String pkAsegurado) {
        try {
            log.info("🔍 Obteniendo detalles completos del asegurado: {}", pkAsegurado);
            
            String sql = """
                SELECT
                    a.pk_asegurado,
                    a.doc_paciente,
                    a.paciente,
                    a.fecnacimpaciente,
                    a.sexo,
                    a.tipo_paciente,
                    a.tel_fijo,
                    a.tel_celular,
                    a.correo_electronico,
                    a.tipo_seguro,
                    a.cas_adscripcion,
                    di.desc_ipress as nombre_ipress,
                    di.direc_ipress as direccion_ipress,
                    dt.desc_tip_ipress as tipo_ipress,
                    dn.desc_niv_aten as nivel_atencion,
                    dr.desc_red as nombre_red,
                    a.periodo
                FROM asegurados a
                LEFT JOIN dim_ipress di ON a.cas_adscripcion = di.cod_ipress
                LEFT JOIN dim_tipo_ipress dt ON di.id_tip_ipress = dt.id_tip_ipress
                LEFT JOIN dim_nivel_atencion dn ON di.id_niv_aten = dn.id_niv_aten
                LEFT JOIN dim_red dr ON di.id_red = dr.id_red
                WHERE a.pk_asegurado = ?
            """;
            
            List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, pkAsegurado);
            
            if (result.isEmpty()) {
                log.warn("⚠️ No se encontró asegurado con PK: {}", pkAsegurado);
                return ResponseEntity.notFound().build();
            }
            
            Map<String, Object> asegurado = result.get(0);
            
            // Construir respuesta con información completa
            Map<String, Object> response = new HashMap<>();
            
            // Información del asegurado
            Map<String, Object> infoAsegurado = new HashMap<>();
            infoAsegurado.put("pkAsegurado", asegurado.get("pk_asegurado"));
            infoAsegurado.put("docPaciente", asegurado.get("doc_paciente"));
            infoAsegurado.put("paciente", asegurado.get("paciente"));
            infoAsegurado.put("fecnacimpaciente", asegurado.get("fecnacimpaciente"));
            
            // ✅ Calcular y agregar la edad
            infoAsegurado.put("edad", calcularEdad(asegurado.get("fecnacimpaciente")));
            
            infoAsegurado.put("sexo", asegurado.get("sexo"));
            infoAsegurado.put("tipoPaciente", asegurado.get("tipo_paciente"));
            infoAsegurado.put("telFijo", asegurado.get("tel_fijo"));
            infoAsegurado.put("telCelular", asegurado.get("tel_celular"));
            infoAsegurado.put("tipoSeguro", asegurado.get("tipo_seguro"));
            infoAsegurado.put("correoElectronico", asegurado.get("correo_electronico"));
            infoAsegurado.put("casAdscripcion", asegurado.get("cas_adscripcion"));
            infoAsegurado.put("periodo", asegurado.get("periodo"));
            response.put("asegurado", infoAsegurado);
            
            // Información de la IPRESS
            Map<String, Object> infoIpress = new HashMap<>();
            infoIpress.put("codAdscripcion", asegurado.get("cas_adscripcion"));
            infoIpress.put("nombreIpress", asegurado.get("nombre_ipress"));
            infoIpress.put("direccionIpress", asegurado.get("direccion_ipress"));
            infoIpress.put("tipoIpress", asegurado.get("tipo_ipress"));
            infoIpress.put("nivelAtencion", asegurado.get("nivel_atencion"));
            infoIpress.put("nombreRed", asegurado.get("nombre_red"));
            response.put("ipress", infoIpress);
            
            log.info("✅ Detalles obtenidos para asegurado: {} (DNI: {})", 
                    asegurado.get("paciente"), asegurado.get("doc_paciente"));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Error al obtener detalles del asegurado: {}", pkAsegurado, e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Error al obtener detalles: " + e.getMessage()));
        }
    }
    
    /**
     * Obtener lista de todas las Redes
     * Ejemplo: GET /api/asegurados/filtros/redes
     */
    @GetMapping("/filtros/redes")
    public ResponseEntity<?> getRedes() {
        try {
            log.info("🏭 Obteniendo lista de Redes");
            
            String sql = """
                SELECT DISTINCT
                    dr.id_red,
                    dr.desc_red
                FROM dim_red dr
                INNER JOIN dim_ipress di ON dr.id_red = di.id_red
                INNER JOIN asegurados a ON di.cod_ipress = a.cas_adscripcion
                WHERE dr.desc_red IS NOT NULL
                ORDER BY dr.desc_red
            """;
            
            List<Map<String, Object>> redes = jdbcTemplate.queryForList(sql);
            
            // Formatear para camelCase
            redes.forEach(red -> {
                red.put("idRed", red.get("id_red"));
                red.put("descRed", red.get("desc_red"));
                red.remove("id_red");
                red.remove("desc_red");
            });
            
            log.info("✅ Encontradas {} redes", redes.size());
            
            return ResponseEntity.ok(redes);
            
        } catch (Exception e) {
            log.error("❌ Error al obtener redes", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Error al obtener redes: " + e.getMessage()));
        }
    }
    
    /**
     * Obtener lista de IPRESS, opcionalmente filtradas por Red
     * Ejemplo: GET /api/asegurados/filtros/ipress?idRed=1
     */
    @GetMapping("/filtros/ipress")
    public ResponseEntity<?> getIpress(@RequestParam(name = "idRed",required = false) Integer idRed) {
        try {
            log.info("🏥 Obteniendo lista de IPRESS" + (idRed != null ? " para Red ID: " + idRed : ""));
            
            StringBuilder sql = new StringBuilder("""
                SELECT DISTINCT
                    di.id_ipress,
                    di.cod_ipress,
                    di.desc_ipress,
                    di.id_red,
                    dr.desc_red as nombre_red
                FROM dim_ipress di
                LEFT JOIN dim_red dr ON di.id_red = dr.id_red
                WHERE di.desc_ipress IS NOT NULL
                  AND di.stat_ipress = 'A'
            """);
            
            List<Object> params = new ArrayList<>();
            
            if (idRed != null) {
                sql.append(" AND di.id_red = ?");
                params.add(idRed);
            }
            
            sql.append(" ORDER BY di.desc_ipress");
            
            List<Map<String, Object>> ipress = jdbcTemplate.queryForList(sql.toString(), params.toArray());
            
            // Formatear para camelCase
            ipress.forEach(i -> {
                i.put("idIpress", i.get("id_ipress"));
                i.put("codIpress", i.get("cod_ipress"));
                i.put("descIpress", i.get("desc_ipress"));
                i.put("idRed", i.get("id_red"));
                i.put("nombreRed", i.get("nombre_red"));
                i.remove("id_ipress");
                i.remove("cod_ipress");
                i.remove("desc_ipress");
                i.remove("id_red");
                i.remove("nombre_red");
            });
            
            log.info("✅ Encontradas {} IPRESS", ipress.size());
            
            return ResponseEntity.ok(ipress);
            
        } catch (Exception e) {
            log.error("❌ Error al obtener IPRESS", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Error al obtener IPRESS: " + e.getMessage()));
        }
    }

    /**
     * Crear un nuevo asegurado
     * Ejemplo: POST /api/asegurados
     */
    @PostMapping
    public ResponseEntity<?> crearAsegurado(@RequestBody AseguradoDTO aseguradoDTO) {
        try {
            log.info("✍️ Creando nuevo asegurado: DNI={}, Nombre={}",
                    aseguradoDTO.getDocPaciente(), aseguradoDTO.getPaciente());

            // 🔒 Validar 1: Que no exista DNI ACTIVO (vigencia = true)
            String checkActivoSql = "SELECT COUNT(*) FROM asegurados WHERE doc_paciente = ? AND vigencia = true";
            Integer countActivo = jdbcTemplate.queryForObject(checkActivoSql, Integer.class,
                    aseguradoDTO.getDocPaciente());

            if (countActivo != null && countActivo > 0) {
                log.warn("🚫 BLOQUEADO: Ya existe asegurado ACTIVO con DNI {}", aseguradoDTO.getDocPaciente());
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "❌ Este DNI ya está registrado en el sistema como asegurado ACTIVO. " +
                            "Contacte con administración si necesita reactivarlo."));
            }

            // 🔒 Validar 2: Que no exista en el mismo período (permitir reactivación en otros períodos)
            String checkPeriodoSql = "SELECT COUNT(*) FROM asegurados WHERE doc_paciente = ? AND periodo = ?";
            Integer countPeriodo = jdbcTemplate.queryForObject(checkPeriodoSql, Integer.class,
                    aseguradoDTO.getDocPaciente(), aseguradoDTO.getPeriodo());

            if (countPeriodo != null && countPeriodo > 0) {
                log.warn("⚠️ Ya existe asegurado con DNI {} en período {}",
                        aseguradoDTO.getDocPaciente(), aseguradoDTO.getPeriodo());
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Ya existe registro con este DNI en el período " + aseguradoDTO.getPeriodo()));
            }
            
            // Generar PK: doc_paciente-periodo
            String pkAsegurado = aseguradoDTO.getDocPaciente() + "-" + aseguradoDTO.getPeriodo();
            
            // Insertar el nuevo asegurado
            String insertSql = """
                INSERT INTO asegurados (
                    pk_asegurado, doc_paciente, paciente, fecnacimpaciente, sexo,
                    tipo_paciente, tel_fijo, tel_celular, correo_electronico, tipo_seguro, cas_adscripcion, periodo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;

            jdbcTemplate.update(insertSql,
                    pkAsegurado,
                    aseguradoDTO.getDocPaciente(),
                    aseguradoDTO.getPaciente(),
                    aseguradoDTO.getFecnacimpaciente(),
                    aseguradoDTO.getSexo(),
                    aseguradoDTO.getTipoPaciente(),
                    aseguradoDTO.getTelFijo(),
                    aseguradoDTO.getTelCelular(),
                    aseguradoDTO.getCorreoElectronico(),
                    aseguradoDTO.getTipoSeguro(),
                    aseguradoDTO.getCasAdscripcion(),
                    aseguradoDTO.getPeriodo()
            );
            
            log.info("✅ Asegurado creado exitosamente: PK={}", pkAsegurado);
            
            // Devolver el asegurado creado con información completa
            String selectSql = """
                SELECT 
                    a.pk_asegurado,
                    a.doc_paciente,
                    a.paciente,
                    a.fecnacimpaciente,
                    a.sexo,
                    a.tipo_paciente,
                    a.tel_fijo,
                    a.tel_celular,
                    a.tipo_seguro,
                    a.cas_adscripcion,
                    di.desc_ipress as nombre_ipress,
                    dr.desc_red as nombre_red,
                    a.periodo
                FROM asegurados a
                LEFT JOIN dim_ipress di ON a.cas_adscripcion = di.cod_ipress
                LEFT JOIN dim_red dr ON di.id_red = dr.id_red
                WHERE a.pk_asegurado = ?
            """;
            
            Map<String, Object> asegurado = jdbcTemplate.queryForMap(selectSql, pkAsegurado);
            
            // Formatear respuesta
            Map<String, Object> response = new HashMap<>();
            response.put("pkAsegurado", asegurado.get("pk_asegurado"));
            response.put("docPaciente", asegurado.get("doc_paciente"));
            response.put("paciente", asegurado.get("paciente"));
            response.put("fecnacimpaciente", asegurado.get("fecnacimpaciente"));
            response.put("edad", calcularEdad(asegurado.get("fecnacimpaciente")));
            response.put("sexo", asegurado.get("sexo"));
            response.put("tipoPaciente", asegurado.get("tipo_paciente"));
            response.put("telFijo", asegurado.get("tel_fijo"));
            response.put("telCelular", asegurado.get("tel_celular"));
            response.put("tipoSeguro", asegurado.get("tipo_seguro"));
            response.put("casAdscripcion", asegurado.get("cas_adscripcion"));
            response.put("nombreIpress", asegurado.get("nombre_ipress"));
            response.put("nombreRed", asegurado.get("nombre_red"));
            response.put("periodo", asegurado.get("periodo"));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Error al crear asegurado", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Error al crear asegurado: " + e.getMessage()));
        }
    }

    /**
     * Actualizar un asegurado existente
     * Ejemplo: PUT /api/asegurados/{pkAsegurado}
     */
    @PutMapping("/{pkAsegurado}")
    public ResponseEntity<?> actualizarAsegurado(
            @PathVariable String pkAsegurado,
            @RequestBody AseguradoDTO aseguradoDTO) {
        try {
            log.info("✏️ Actualizando asegurado: PK={}", pkAsegurado);
            
            // Verificar que el asegurado existe
            String checkSql = "SELECT COUNT(*) FROM asegurados WHERE pk_asegurado = ?";
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, pkAsegurado);
            
            if (count == null || count == 0) {
                log.warn("⚠️ No se encontró asegurado con PK: {}", pkAsegurado);
                return ResponseEntity.notFound().build();
            }
            
            // Actualizar el asegurado
            String updateSql = """
                UPDATE asegurados SET
                    paciente = ?,
                    fecnacimpaciente = ?,
                    sexo = ?,
                    tipo_paciente = ?,
                    tel_fijo = ?,
                    tel_celular = ?,
                    tipo_seguro = ?,
                    cas_adscripcion = ?,
                    correo_electronico = ?
                WHERE pk_asegurado = ?
            """;

            int rowsAffected = jdbcTemplate.update(updateSql,
                    aseguradoDTO.getPaciente(),
                    aseguradoDTO.getFecnacimpaciente(),
                    aseguradoDTO.getSexo(),
                    aseguradoDTO.getTipoPaciente(),
                    aseguradoDTO.getTelFijo(),
                    aseguradoDTO.getTelCelular(),
                    aseguradoDTO.getTipoSeguro(),
                    aseguradoDTO.getCasAdscripcion(),
                    aseguradoDTO.getCorreoElectronico(),
                    pkAsegurado
            );
            
            if (rowsAffected == 0) {
                log.error("❌ No se pudo actualizar el asegurado: {}", pkAsegurado);
                return ResponseEntity.internalServerError()
                    .body(Map.of("error", "No se pudo actualizar el asegurado"));
            }
            
            log.info("✅ Asegurado actualizado exitosamente: PK={}", pkAsegurado);
            
            // Devolver el asegurado actualizado con información completa
            String selectSql = """
                SELECT 
                    a.pk_asegurado,
                    a.doc_paciente,
                    a.paciente,
                    a.fecnacimpaciente,
                    a.sexo,
                    a.tipo_paciente,
                    a.tel_fijo,
                    a.tel_celular,
                    a.tipo_seguro,
                    a.cas_adscripcion,
                    di.desc_ipress as nombre_ipress,
                    dr.desc_red as nombre_red,
                    a.periodo
                FROM asegurados a
                LEFT JOIN dim_ipress di ON a.cas_adscripcion = di.cod_ipress
                LEFT JOIN dim_red dr ON di.id_red = dr.id_red
                WHERE a.pk_asegurado = ?
            """;
            
            Map<String, Object> asegurado = jdbcTemplate.queryForMap(selectSql, pkAsegurado);
            
            // Formatear respuesta
            Map<String, Object> response = new HashMap<>();
            response.put("pkAsegurado", asegurado.get("pk_asegurado"));
            response.put("docPaciente", asegurado.get("doc_paciente"));
            response.put("paciente", asegurado.get("paciente"));
            response.put("fecnacimpaciente", asegurado.get("fecnacimpaciente"));
            response.put("edad", calcularEdad(asegurado.get("fecnacimpaciente")));
            response.put("sexo", asegurado.get("sexo"));
            response.put("tipoPaciente", asegurado.get("tipo_paciente"));
            response.put("telFijo", asegurado.get("tel_fijo"));
            response.put("telCelular", asegurado.get("tel_celular"));
            response.put("tipoSeguro", asegurado.get("tipo_seguro"));
            response.put("casAdscripcion", asegurado.get("cas_adscripcion"));
            response.put("nombreIpress", asegurado.get("nombre_ipress"));
            response.put("nombreRed", asegurado.get("nombre_red"));
            response.put("periodo", asegurado.get("periodo"));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Error al actualizar asegurado: {}", pkAsegurado, e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Error al actualizar asegurado: " + e.getMessage()));
        }
    }

    /**
     * Obtener estadísticas del dashboard con filtros opcionales
     * Ejemplo: GET /api/asegurados/dashboard/estadisticas?idRed=1&codIpress=045
     */
    @GetMapping("/dashboard/estadisticas")
    public ResponseEntity<?> getEstadisticasDashboard(
            @RequestParam(name="idRed", required = false) Integer idRed,
            @RequestParam(name="codIpress", required = false) String codIpress) {
        try {
            log.info("📊 Obteniendo estadísticas del dashboard" + 
                    (idRed != null ? " para Red ID: " + idRed : "") +
                    (codIpress != null ? " e IPRESS: " + codIpress : ""));
            
            StringBuilder whereClause = new StringBuilder("WHERE 1=1");
            List<Object> params = new ArrayList<>();
            
            // Filtro por Red
            if (idRed != null) {
                whereClause.append(" AND di.id_red = ?");
                params.add(idRed);
            }
            
            // Filtro por IPRESS
            if (codIpress != null && !codIpress.trim().isEmpty()) {
                whereClause.append(" AND a.cas_adscripcion = ?");
                params.add(codIpress);
            }
            
            Map<String, Object> estadisticas = new HashMap<>();
            
            // Total de asegurados
            String totalSql = "SELECT COUNT(*) FROM asegurados a " +
                    "LEFT JOIN dim_ipress di ON a.cas_adscripcion = di.cod_ipress " + 
                    whereClause;
            Integer totalAsegurados = jdbcTemplate.queryForObject(totalSql, Integer.class, params.toArray());
            estadisticas.put("totalAsegurados", totalAsegurados != null ? totalAsegurados : 0);
            
            // Total de IPRESS únicas
            String ipressSql = "SELECT COUNT(DISTINCT a.cas_adscripcion) FROM asegurados a " +
                    "LEFT JOIN dim_ipress di ON a.cas_adscripcion = di.cod_ipress " + 
                    whereClause;
            Integer totalIPRESS = jdbcTemplate.queryForObject(ipressSql, Integer.class, params.toArray());
            estadisticas.put("totalIPRESS", totalIPRESS != null ? totalIPRESS : 0);
            
            // Total de Redes únicas
            String redesSql = "SELECT COUNT(DISTINCT di.id_red) FROM asegurados a " +
                    "LEFT JOIN dim_ipress di ON a.cas_adscripcion = di.cod_ipress " + 
                    whereClause;
            Integer totalRedes = jdbcTemplate.queryForObject(redesSql, Integer.class, params.toArray());
            estadisticas.put("totalRedes", totalRedes != null ? totalRedes : 0);
            
            // Asegurados titulares
            String titularesSql = "SELECT COUNT(*) FROM asegurados a " +
                    "LEFT JOIN dim_ipress di ON a.cas_adscripcion = di.cod_ipress " + 
                    whereClause + " AND a.tipo_paciente = 'TITULAR'";
            Integer totalTitulares = jdbcTemplate.queryForObject(titularesSql, Integer.class, params.toArray());
            estadisticas.put("aseguradosTitulares", totalTitulares != null ? totalTitulares : 0);
            
            // Distribución por género
            String generoSql = "SELECT a.sexo, COUNT(*) as cantidad FROM asegurados a " +
                    "LEFT JOIN dim_ipress di ON a.cas_adscripcion = di.cod_ipress " + 
                    whereClause + " GROUP BY a.sexo";
            List<Map<String, Object>> porGenero = jdbcTemplate.queryForList(generoSql, params.toArray());
            int total = totalAsegurados != null ? totalAsegurados : 0;
            porGenero.forEach(g -> {
                Long cantidad = ((Number) g.get("cantidad")).longValue();
                double porcentaje = total > 0 ? (cantidad * 100.0 / total) : 0;
                g.put("genero", g.get("sexo"));
                g.put("cantidad", cantidad);
                g.put("porcentaje", Math.round(porcentaje * 100.0) / 100.0);
                g.remove("sexo");
            });
            estadisticas.put("porGenero", porGenero);
            
            // Distribución por tipo de paciente
            String tipoPacienteSql = "SELECT a.tipo_paciente as tipo, COUNT(*) as cantidad FROM asegurados a " +
                    "LEFT JOIN dim_ipress di ON a.cas_adscripcion = di.cod_ipress " + 
                    whereClause + " GROUP BY a.tipo_paciente ORDER BY cantidad DESC";
            List<Map<String, Object>> porTipoPaciente = jdbcTemplate.queryForList(tipoPacienteSql, params.toArray());
            porTipoPaciente.forEach(t -> {
                t.put("cantidad", ((Number) t.get("cantidad")).longValue());
            });
            estadisticas.put("porTipoPaciente", porTipoPaciente);
            
            // Top 10 IPRESS con más asegurados
            String topIpressSql = "SELECT di.desc_ipress as nombreIpress, COUNT(*) as cantidad " +
                    "FROM asegurados a " +
                    "LEFT JOIN dim_ipress di ON a.cas_adscripcion = di.cod_ipress " + 
                    whereClause + " GROUP BY di.desc_ipress ORDER BY cantidad DESC LIMIT 10";
            List<Map<String, Object>> topIPRESS = jdbcTemplate.queryForList(topIpressSql, params.toArray());
            topIPRESS.forEach(i -> {
                i.put("cantidad", ((Number) i.get("cantidad")).longValue());
            });
            estadisticas.put("topIPRESS", topIPRESS);
            
            // Distribución por Red
            String redSql = "SELECT dr.desc_red as nombreRed, COUNT(*) as cantidad " +
                    "FROM asegurados a " +
                    "LEFT JOIN dim_ipress di ON a.cas_adscripcion = di.cod_ipress " +
                    "LEFT JOIN dim_red dr ON di.id_red = dr.id_red " +
                    whereClause + " GROUP BY dr.desc_red ORDER BY cantidad DESC";
            List<Map<String, Object>> distribucionPorRed = jdbcTemplate.queryForList(redSql, params.toArray());
            distribucionPorRed.forEach(r -> {
                Long cantidad = ((Number) r.get("cantidad")).longValue();
                double porcentaje = total > 0 ? (cantidad * 100.0 / total) : 0;
                r.put("cantidad", cantidad);
                r.put("porcentaje", Math.round(porcentaje * 100.0) / 100.0);
            });
            estadisticas.put("distribucionPorRed", distribucionPorRed);
            
            // Distribución por tipo de seguro
            String tipoSeguroSql = "SELECT a.tipo_seguro as tipo, COUNT(*) as cantidad FROM asegurados a " +
                    "LEFT JOIN dim_ipress di ON a.cas_adscripcion = di.cod_ipress " + 
                    whereClause + " GROUP BY a.tipo_seguro";
            List<Map<String, Object>> porTipoSeguro = jdbcTemplate.queryForList(tipoSeguroSql, params.toArray());
            porTipoSeguro.forEach(t -> {
                t.put("cantidad", ((Number) t.get("cantidad")).longValue());
            });
            estadisticas.put("porTipoSeguro", porTipoSeguro);
            
            log.info("✅ Estadísticas calculadas: {} asegurados", totalAsegurados);
            
            return ResponseEntity.ok(estadisticas);
            
        } catch (Exception e) {
            log.error("❌ Error al obtener estadísticas del dashboard", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Error al obtener estadísticas: " + e.getMessage()));
        }
    }

    /**
     * Eliminar un asegurado
     * Ejemplo: DELETE /api/asegurados/{pkAsegurado}
     */
    @DeleteMapping("/{pkAsegurado}")
    public ResponseEntity<?> eliminarAsegurado(@PathVariable String pkAsegurado) {
        try {
            log.info("🗑️ Eliminando asegurado: PK={}", pkAsegurado);
            
            // Verificar que el asegurado existe antes de eliminar
            String checkSql = "SELECT COUNT(*) FROM asegurados WHERE pk_asegurado = ?";
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, pkAsegurado);
            
            if (count == null || count == 0) {
                log.warn("⚠️ No se encontró asegurado con PK: {}", pkAsegurado);
                return ResponseEntity.notFound().build();
            }
            
            // Obtener información del asegurado antes de eliminarlo (para el log)
            String selectSql = "SELECT doc_paciente, paciente FROM asegurados WHERE pk_asegurado = ?";
            Map<String, Object> aseguradoInfo = jdbcTemplate.queryForMap(selectSql, pkAsegurado);
            String docPaciente = (String) aseguradoInfo.get("doc_paciente");
            String nombrePaciente = (String) aseguradoInfo.get("paciente");
            
            // Eliminar el asegurado
            String deleteSql = "DELETE FROM asegurados WHERE pk_asegurado = ?";
            int rowsAffected = jdbcTemplate.update(deleteSql, pkAsegurado);
            
            if (rowsAffected == 0) {
                log.error("❌ No se pudo eliminar el asegurado: {}", pkAsegurado);
                return ResponseEntity.internalServerError()
                    .body(Map.of("error", "No se pudo eliminar el asegurado"));
            }
            
            log.info("✅ Asegurado eliminado exitosamente: PK={}, DNI={}, Nombre={}", 
                    pkAsegurado, docPaciente, nombrePaciente);
            
            // Retornar mensaje de éxito
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Asegurado eliminado exitosamente");
            response.put("pkAsegurado", pkAsegurado);
            response.put("docPaciente", docPaciente);
            response.put("paciente", nombrePaciente);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Error al eliminar asegurado: {}", pkAsegurado, e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Error al eliminar asegurado: " + e.getMessage()));
        }
    }

    /**
     * Obtener asegurados marcados como duplicados potenciales
     * Ejemplo: GET /api/asegurados/duplicados/potenciales?page=0&size=25&ordenar=nombre
     */
    @GetMapping("/duplicados/potenciales")
    public ResponseEntity<?> obtenerDuplicadosPotenciales(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(defaultValue = "doc_paciente") String ordenar) {

        try {
            log.info("🔍 Obteniendo asegurados duplicados potenciales (página: {}, tamaño: {}, orden: {})", page, size, ordenar);

            // Validar campo de ordenamiento
            String orderField = switch(ordenar) {
                case "nombre" -> "a.paciente";
                case "dni" -> "a.doc_paciente";
                case "fecha" -> "a.fecnacimpaciente";
                default -> "a.doc_paciente";
            };

            // Contar total de duplicados
            String countSql = "SELECT COUNT(*) FROM asegurados WHERE duplicado_potencial = true";
            Integer totalElements = jdbcTemplate.queryForObject(countSql, Integer.class);
            if (totalElements == null) {
                totalElements = 0;
            }

            // Calcular offset
            int offset = page * size;

            // Consulta paginada de duplicados
            String sql = """
                SELECT
                    a.pk_asegurado,
                    a.doc_paciente,
                    a.paciente,
                    a.fecnacimpaciente,
                    a.sexo,
                    a.tel_celular,
                    a.tipo_seguro,
                    a.vigencia,
                    a.duplicado_potencial,
                    di.desc_ipress as nombre_ipress,
                    a.periodo
                FROM asegurados a
                LEFT JOIN dim_ipress di ON a.cas_adscripcion = di.cod_ipress
                WHERE a.duplicado_potencial = true
                ORDER BY %s DESC
                LIMIT ? OFFSET ?
            """.formatted(orderField);

            List<Map<String, Object>> duplicados = jdbcTemplate.queryForList(sql, size, offset);

            // Procesar resultados
            duplicados.forEach(dup -> {
                dup.put("pkAsegurado", dup.remove("pk_asegurado"));
                dup.put("docPaciente", dup.remove("doc_paciente"));
                dup.put("telCelular", dup.remove("tel_celular"));
                dup.put("tipoSeguro", dup.remove("tipo_seguro"));
                dup.put("nombreIpress", dup.remove("nombre_ipress"));
                dup.put("duplicadoPotencial", dup.remove("duplicado_potencial"));
                dup.put("edad", calcularEdad(dup.get("fecnacimpaciente")));
            });

            // Calcular el número total de páginas
            int totalPages = (int) Math.ceil((double) totalElements / size);

            // Construir respuesta
            Map<String, Object> response = new HashMap<>();
            response.put("content", duplicados);
            response.put("totalElements", totalElements);
            response.put("totalPages", totalPages);
            response.put("size", size);
            response.put("number", page);
            response.put("numberOfElements", duplicados.size());
            response.put("first", page == 0);
            response.put("last", page >= totalPages - 1);
            response.put("empty", duplicados.isEmpty());

            log.info("✅ Devolviendo {} duplicados potenciales de un total de {}", duplicados.size(), totalElements);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al obtener duplicados potenciales", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("content", List.of());
            errorResponse.put("totalElements", 0);
            errorResponse.put("totalPages", 0);
            errorResponse.put("size", size);
            errorResponse.put("number", page);
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * Obtener información de duplicado específico (compara 7 vs 8 caracteres)
     * Ejemplo: GET /api/asegurados/duplicado/01234567
     */
    @GetMapping("/duplicado/{docPaciente}")
    public ResponseEntity<?> obtenerInfoDuplicado(@PathVariable String docPaciente) {
        try {
            log.info("🔍 Obteniendo información de duplicado para DNI: {}", docPaciente);

            String sql = """
                SELECT
                    pk_asegurado_7,
                    doc_paciente,
                    paciente_7,
                    pk_asegurado_8,
                    paciente_8,
                    estado,
                    marcado_at
                FROM audit_duplicados_asegurados
                WHERE doc_paciente = ?
            """;

            List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, docPaciente);

            if (result.isEmpty()) {
                log.warn("⚠️ No se encontró información de duplicado para DNI: {}", docPaciente);
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> duplicado = result.get(0);

            // Formatear respuesta
            Map<String, Object> response = new HashMap<>();
            response.put("docPaciente", duplicado.get("doc_paciente"));
            response.put("pkAsegurado7", duplicado.get("pk_asegurado_7"));
            response.put("paciente7", duplicado.get("paciente_7"));
            response.put("pkAsegurado8", duplicado.get("pk_asegurado_8"));
            response.put("paciente8", duplicado.get("paciente_8"));
            response.put("estado", duplicado.get("estado"));
            response.put("marcadoAt", duplicado.get("marcado_at"));

            log.info("✅ Información de duplicado obtenida para DNI: {}", docPaciente);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al obtener información de duplicado: {}", docPaciente, e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Error al obtener información de duplicado: " + e.getMessage()));
        }
    }

    /**
     * ✅ VALIDAR si un DNI ya existe y está ACTIVO
     * Ejemplo: GET /api/asegurados/validar-dni/12345678
     * Respuesta: { "disponible": false, "mensaje": "Este DNI ya está registrado" }
     */
    @GetMapping("/validar-dni/{docPaciente}")
    public ResponseEntity<?> validarDni(@PathVariable String docPaciente) {
        try {
            // Validar formato: 8 dígitos o carné extranjería
            if (docPaciente == null || docPaciente.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of(
                        "disponible", false,
                        "mensaje", "DNI/Carné no puede estar vacío"
                    ));
            }

            // Verificar que tenga al menos 8 caracteres
            if (docPaciente.length() < 8) {
                return ResponseEntity.badRequest()
                    .body(Map.of(
                        "disponible", false,
                        "mensaje", "DNI/Carné debe tener al menos 8 caracteres"
                    ));
            }

            // Buscar si existe un registro ACTIVO con este DNI
            String checkSql = "SELECT COUNT(*) FROM asegurados WHERE doc_paciente = ? AND vigencia = true";
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, docPaciente);

            boolean disponible = (count == null || count == 0);

            log.info("🔍 Validación DNI: {} - Disponible: {}", docPaciente, disponible);

            Map<String, Object> response = new HashMap<>();
            response.put("disponible", disponible);
            response.put("docPaciente", docPaciente);

            if (disponible) {
                response.put("mensaje", "✅ Este DNI/Carné está disponible");
            } else {
                response.put("mensaje", "❌ Este DNI/Carné ya está registrado en el sistema");
                response.put("accion", "Contacte con administración");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al validar DNI: {}", docPaciente, e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Error al validar DNI: " + e.getMessage()));
        }
    }

    /**
     * 📋 Obtener tipos de documentos disponibles
     * Ejemplo: GET /api/asegurados/tipos-documento
     * Respuesta: [{ "id_tip_doc": 1, "desc_tip_doc": "DNI" }, ...]
     */
    @GetMapping("/tipos-documento")
    public ResponseEntity<?> obtenerTiposDocumento() {
        try {
            String sql = "SELECT id_tip_doc, desc_tip_doc FROM dim_tipo_documento WHERE stat_tip_doc = 'A' ORDER BY id_tip_doc";
            List<Map<String, Object>> tiposDoc = jdbcTemplate.queryForList(sql);

            log.info("📋 Tipos de documento obtenidos: {}", tiposDoc.size());
            return ResponseEntity.ok(tiposDoc);

        } catch (Exception e) {
            log.error("❌ Error al obtener tipos de documento: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Error al obtener tipos de documento: " + e.getMessage()));
        }
    }

    /**
     * Resolver un duplicado potencial - desactivar el registro incorrecto
     * Ejemplo: POST /api/asegurados/duplicados/resolver
     * Body: { "pkAseguradoDesactivar": "xxx", "docPaciente": "12345678", "decision": "desactivar_7_digitos" }
     */
    @PostMapping("/duplicados/resolver")
    public ResponseEntity<?> resolverDuplicado(@RequestBody Map<String, String> request) {
        try {
            String pkAseguradoDesactivar = request.get("pkAseguradoDesactivar");
            String docPaciente = request.get("docPaciente");
            String decision = request.get("decision"); // "desactivar_7_digitos" o "desactivar_8_digitos"

            log.info("🔧 Resolviendo duplicado - PK a desactivar: {}, Decisión: {}", pkAseguradoDesactivar, decision);

            // 1. Desactivar el registro (marcar vigencia como false)
            String updateAseguradoSql = "UPDATE asegurados SET vigencia = false WHERE pk_asegurado = ?";
            int rowsAffected = jdbcTemplate.update(updateAseguradoSql, pkAseguradoDesactivar);

            if (rowsAffected == 0) {
                log.error("❌ No se encontró asegurado para desactivar: {}", pkAseguradoDesactivar);
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "No se encontró el registro a desactivar"));
            }

            // 2. Marcar todos los asegurados con este DNI como no duplicados
            String resolveDuplicadoSql = "UPDATE asegurados SET duplicado_potencial = false WHERE doc_paciente = ?";
            int updateCount = jdbcTemplate.update(resolveDuplicadoSql, docPaciente);
            log.info("✅ Marcados {} registros como NO duplicados", updateCount);

            // 3. Actualizar tabla de auditoría para marcar como resuelto
            String updateAuditSql = "UPDATE audit_duplicados_asegurados SET estado = 'RESUELTO' WHERE doc_paciente = ?";
            int auditCount = jdbcTemplate.update(updateAuditSql, docPaciente);
            log.info("✅ Auditoría actualizada para {} registros", auditCount);

            log.info("✅ Duplicado resuelto correctamente - Desactivado: {}", pkAseguradoDesactivar);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Duplicado resuelto correctamente - Registro desactivado",
                "registroDesactivado", pkAseguradoDesactivar,
                "decision", decision,
                "registrosActualizados", updateCount
            ));

        } catch (Exception e) {
            log.error("❌ Error al resolver duplicado", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Error al resolver duplicado: " + e.getMessage()));
        }
    }
}

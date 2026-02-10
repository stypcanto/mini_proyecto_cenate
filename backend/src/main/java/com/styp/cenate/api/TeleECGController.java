package com.styp.cenate.api;

import com.styp.cenate.dto.ApiResponse;
import com.styp.cenate.dto.teleekgs.*;
import com.styp.cenate.dto.IpressResponse;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.exception.ValidationException;
import com.styp.cenate.model.Asegurado;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import com.styp.cenate.security.mbac.CheckMBACPermission;
import com.styp.cenate.service.teleekgs.TeleECGService;
import com.styp.cenate.service.teleekgs.TeleECGEstadoTransformer;
import com.styp.cenate.service.ipress.IpressService;
import com.styp.cenate.service.gestionpaciente.AtenderPacienteService;
import com.styp.cenate.model.Usuario;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import jakarta.annotation.PostConstruct;

/**
 * REST Controller para gestión de TeleEKG
 *
 * Versión 1.0.0 - Endpoints simplificados para compilación
 * TODO: Completar implementación según especificaciones
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-13
 */
@RestController
@RequestMapping("/api/teleekgs")
@Tag(name = "TeleEKG", description = "Gestión de Electrocardiogramas")
@Slf4j
public class TeleECGController {

    @Autowired
    private TeleECGService teleECGService;

    @Autowired
    private TeleECGEstadoTransformer estadoTransformer;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private IpressService ipressService;

    @Autowired
    private com.styp.cenate.service.storage.FileStorageService fileStorageService;

    @Autowired
    private SolicitudBolsaRepository solicitudBolsaRepository;

    @Autowired
    private AseguradoRepository aseguradoRepository;

    @Autowired
    private AtenderPacienteService atenderPacienteService;

    @PostConstruct
    public void init() {
        log.info("✅ TeleECGController inicializado exitosamente");
        if (teleECGService != null) {
            log.info("✅ TeleECGService inyectado correctamente");
        } else {
            log.error("❌ ERROR: TeleECGService no fue inyectado");
        }
    }

    /**
     * ✅ WORKAROUND GET para upload-multiple - Temporal mientras se resuelve issue con POST
     * En producción esto debería ser un POST
     */
    @GetMapping("/upload-multiple-temp")
    public ResponseEntity<?> subirMultiplesImagenesTemp(
            @RequestParam("numDocPaciente") String numDocPaciente,
            @RequestParam("nombresPaciente") String nombresPaciente,
            @RequestParam("apellidosPaciente") String apellidosPaciente,
            HttpServletRequest request) {

        log.info("⚠️ WORKAROUND: GET para upload (debería ser POST)");
        return ResponseEntity.ok(new ApiResponse<>(
            true,
            "WORKAROUND: Endpoint GET funcionó, pero debería usarse POST",
            "200",
            "Problema: POST endpoints no se registran en TeleECGController. Issue bajo investigación."
        ));
    }

    /**
     * ✅ TEST ENDPOINT AL INICIO - Verificar si POST funciona
     * Este endpoint simple sin multipart verifica si los @PostMapping se registran
     */
    @PostMapping(value = "/test-inicio", produces = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> testInicio() {
        log.info("✅ TEST POST AL INICIO FUNCIONA");
        return ResponseEntity.ok(new ApiResponse<>(
            true,
            "Test POST al inicio funcionó",
            "200",
            "OK"
        ));
    }

    /**
     * ✅ TEST ENDPOINT - POST sin multipart
     * Usado para verificar si el problema es específico de endpoints multipart
     */
    @PostMapping(value = "/test-post-json", produces = org.springframework.http.MediaType.APPLICATION_JSON_VALUE, consumes = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> testPostJson() {
        log.info("✅ TEST POST JSON FUNCIONA");
        return ResponseEntity.ok(new ApiResponse<>(
            true,
            "Test POST JSON funcionó - Si ves esto, los POST SIN multipart funcionan",
            "200",
            "OK"
        ));
    }

    /**
     * Subir nueva imagen ECG
     *
     * IMPORTANTE: El parámetro consumes="multipart/form-data" es CRÍTICO para que Spring
     * registre correctamente este endpoint como POST handler en el RequestMappingHandlerMapping.
     * Sin esto, Spring no mapeará las solicitudes POST a este método.
     */
    @PostMapping(value = "/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE, produces = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Subir imagen ECG")
    public ResponseEntity<ApiResponse<TeleECGImagenDTO>> subirImagenECG(
            @RequestParam("numDocPaciente") String numDocPaciente,
            @RequestParam("nombresPaciente") String nombresPaciente,
            @RequestParam("apellidosPaciente") String apellidosPaciente,
            @RequestParam(value = "pkAsegurado", required = false) String pkAsegurado,
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam(value = "esUrgente", required = false, defaultValue = "false") Boolean esUrgente,
            HttpServletRequest request) {

        log.info("📤 Upload ECG - DNI: {}, Urgente: {}", numDocPaciente, esUrgente);

        try {
            SubirImagenECGDTO dto = new SubirImagenECGDTO();
            dto.setNumDocPaciente(numDocPaciente);
            dto.setNombresPaciente(nombresPaciente);
            dto.setApellidosPaciente(apellidosPaciente);
            // ✅ Pasar el PK del asegurado si se proporciona
            if (pkAsegurado != null && !pkAsegurado.trim().isEmpty()) {
                dto.setPkAsegurado(pkAsegurado);
            }
            dto.setArchivo(archivo);
            dto.setEsUrgente(esUrgente != null ? esUrgente : false);

            Long idUsuario = getUsuarioActual();
            String ipCliente = request.getRemoteAddr();
            String navegador = request.getHeader("User-Agent");

            // Obtener IPRESS del usuario actual
            IpressResponse ipressActual = ipressService.obtenerIpressPorUsuarioActual();
            Long idIpressActual = ipressActual.getIdIpress();

            TeleECGImagenDTO resultado = teleECGService.subirImagenECG(
                dto, idIpressActual, idUsuario, ipCliente, navegador
            );

            // v3.0.0: Aplicar transformación de estado según rol
            Usuario usuarioActual = obtenerUsuarioActualObjeto();
            resultado = aplicarTransformacionEstado(resultado, usuarioActual);

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Imagen subida exitosamente",
                "200",
                resultado
            ));
        } catch (ValidationException e) {
            // ❌ Asegurado no existe - Error específico
            log.warn("⚠️ Validación fallida: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, e.getMessage(), "404", null));
        } catch (Exception e) {
            log.error("❌ Error en upload", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, e.getMessage(), "400", null));
        }
    }

    /**
     * ✅ v3.0.0: Subir múltiples imágenes ECG (PADOMI requirement - 4-10 imágenes)
     * Endpoint para cargar batch de imágenes asociadas al mismo paciente
     *
     * IMPORTANTE: El parámetro consumes="multipart/form-data" es CRÍTICO para que Spring
     * registre correctamente este endpoint como POST handler en el RequestMappingHandlerMapping.
     * Sin esto, Spring no mapeará las solicitudes POST a este método.
     */
    @PostMapping(value = "/upload-multiple", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE, produces = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Subir múltiples imágenes ECG (PADOMI)")
    public ResponseEntity<?> subirMultiplesImagenes(
            @RequestParam("numDocPaciente") String numDocPaciente,
            @RequestParam("nombresPaciente") String nombresPaciente,
            @RequestParam("apellidosPaciente") String apellidosPaciente,
            @RequestParam(value = "pkAsegurado", required = false) String pkAsegurado,
            @RequestParam("archivos") MultipartFile[] archivos,
            HttpServletRequest request) {

        log.info("📤 Upload MÚLTIPLES ECGs - DNI: {} - Cantidad: {}", numDocPaciente, archivos.length);

        if (archivos == null || archivos.length == 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, "No se proporcionaron archivos", "400", null));
        }

        if (archivos.length < 4) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, "Mínimo 4 imágenes requeridas (PADOMI)", "400", null));
        }

        if (archivos.length > 10) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, "Máximo 10 imágenes permitidas (PADOMI)", "400", null));
        }

        try {
            // 🔍 PASO 1: Validar duplicados DENTRO del batch antes de procesar
            log.info("🔍 Validando duplicados dentro del batch...");
            java.util.Map<String, java.util.List<Integer>> sha256Map = new java.util.HashMap<>();

            for (int i = 0; i < archivos.length; i++) {
                try {
                    String sha256 = fileStorageService.calcularSHA256(archivos[i]);
                    if (sha256Map.containsKey(sha256)) {
                        // Ya existe este SHA256 en el batch
                        java.util.List<Integer> indices = sha256Map.get(sha256);
                        indices.add(i);
                    } else {
                        java.util.List<Integer> indices = new java.util.ArrayList<>();
                        indices.add(i);
                        sha256Map.put(sha256, indices);
                    }
                } catch (Exception e) {
                    log.error("❌ Error calculando SHA256 para archivo {}: {}", archivos[i].getOriginalFilename(), e.getMessage());
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(false,
                            "Error al procesar archivo " + archivos[i].getOriginalFilename() + ": " + e.getMessage(),
                            "400", null));
                }
            }

            // Verificar si hay duplicados dentro del batch
            for (java.util.Map.Entry<String, java.util.List<Integer>> entry : sha256Map.entrySet()) {
                if (entry.getValue().size() > 1) {
                    // Hay duplicadas
                    StringBuilder mensaje = new StringBuilder();
                    mensaje.append("⚠️ Imágenes duplicadas dentro del lote detectadas. ");

                    java.util.List<Integer> indices = entry.getValue();
                    for (int i = 0; i < indices.size(); i++) {
                        int idx = indices.get(i);
                        mensaje.append("Imagen ").append(idx + 1);
                        if (i < indices.size() - 1) {
                            mensaje.append(" y ");
                        }
                    }
                    mensaje.append(" tienen contenido idéntico. Por favor selecciona imágenes diferentes.");

                    log.warn("{}", mensaje.toString());
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(false, mensaje.toString(), "400", null));
                }
            }

            Long idUsuario = getUsuarioActual();
            String ipCliente = request.getRemoteAddr();
            String navegador = request.getHeader("User-Agent");
            IpressResponse ipressActual = ipressService.obtenerIpressPorUsuarioActual();
            Long idIpressActual = ipressActual.getIdIpress();
            Usuario usuarioActual = obtenerUsuarioActualObjeto();

            // ✅ PASO 2: Procesar cada archivo (ya validado como único dentro del batch)
            java.util.List<TeleECGImagenDTO> resultados = new java.util.ArrayList<>();
            java.util.List<Long> idImagenes = new java.util.ArrayList<>();
            java.util.List<String> errores = new java.util.ArrayList<>();

            for (MultipartFile archivo : archivos) {
                try {
                    SubirImagenECGDTO dto = new SubirImagenECGDTO();
                    dto.setNumDocPaciente(numDocPaciente);
                    dto.setNombresPaciente(nombresPaciente);
                    dto.setApellidosPaciente(apellidosPaciente);
                    // ✅ Pasar el PK del asegurado si se proporciona
                    if (pkAsegurado != null && !pkAsegurado.trim().isEmpty()) {
                        dto.setPkAsegurado(pkAsegurado);
                    }
                    dto.setArchivo(archivo);

                    TeleECGImagenDTO resultado = teleECGService.subirImagenECG(
                        dto, idIpressActual, idUsuario, ipCliente, navegador
                    );

                    // Aplicar transformación de estado según rol
                    resultado = aplicarTransformacionEstado(resultado, usuarioActual);
                    resultados.add(resultado);
                    idImagenes.add(resultado.getIdImagen());

                } catch (Exception e) {
                    log.error("❌ Error procesando archivo: {} - {}", archivo.getOriginalFilename(), e.getMessage());
                    errores.add(archivo.getOriginalFilename() + ": " + e.getMessage());
                }
            }

            if (resultados.isEmpty()) {
                String detalleErrores = String.join("; ", errores);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "No se pudieron procesar los archivos: " + detalleErrores, "400", null));
            }

            // Respuesta con todas las imágenes subidas
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("total", resultados.size());
            response.put("totalIntentados", archivos.length);
            response.put("numDocPaciente", numDocPaciente);
            response.put("idImagenes", idImagenes);
            response.put("imagenes", resultados);
            if (!errores.isEmpty()) {
                response.put("errores", errores);
                response.put("mensaje", resultados.size() + " imágenes subidas exitosamente, pero hubo errores en " + errores.size());
            }

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                resultados.size() + " imagen(es) de " + archivos.length + " subidas exitosamente",
                "200",
                response
            ));

        } catch (Exception e) {
            log.error("❌ Error en upload múltiple", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, "Error al procesar múltiples imágenes: " + e.getMessage(), "400", null));
        }
    }

    /**
     * ✅ v11.5.0: GET consolidado para listar ECGs AGRUPADAS por asegurado
     * Endpoint: GET /api/teleekgs?estado=...
     * Retorna una fila por asegurado/paciente con conteo consolidado de ECGs
     * Ideal para dashboard "TeleEKG Recibidas"
     *
     * ✅ v1.52.4: Removido @CheckMBACPermission - lectura permitida para usuarios autenticados
     */
    @GetMapping("")
    @Operation(summary = "Listar ECGs agrupadas por asegurado (consolidado, paginado)")
    public ResponseEntity<?> listarECGsConsolidadas(
            @Parameter(description = "Estado (TODOS, ENVIADA, OBSERVADA, ATENDIDA)") @RequestParam(required = false, defaultValue = "TODOS") String estado,
            @Parameter(description = "Página (0-indexed)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Tamaño de página") @RequestParam(required = false, defaultValue = "15") int size) {

        log.info("🚀 Listando ECGs CONSOLIDADAS por asegurado - Estado: {}, Página: {}, Tamaño: {}", estado, page, size);

        try {
            String estadoFinal = "TODOS".equals(estado) ? null : estado;

            // ✅ v1.70.0: Usar Pageable para controlar paginación
            Pageable pageable = PageRequest.of(page, size, Sort.by("fechaEnvio").descending());

            // Usar listarAgrupaPorAsegurado que devuelve datos consolidados paginados
            Page<AseguradoConECGsDTO> resultado = teleECGService.listarAgrupaPorAsegurado(
                null, estadoFinal, null, null, null, pageable
            );

            log.info("✅ Se encontraron {} asegurados con ECGs consolidadas (página {}/{})",
                resultado.getContent().size(), page, resultado.getTotalPages());

            // ✅ FIX: Retornar Map envuelto para mejor serialización
            return ResponseEntity.ok(Map.of(
                "content", resultado.getContent(),
                "totalPages", resultado.getTotalPages(),
                "totalElements", resultado.getTotalElements(),
                "size", resultado.getSize(),
                "number", resultado.getNumber()
            ));
        } catch (Exception e) {
            log.error("❌ Error listando ECGs consolidadas:", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * ❌ DEPRECATED v1.52.3: Endpoint /listar eliminado
     * Usar IPRESSWorkspace en lugar (http://localhost:3000/teleekgs/ipress-workspace)
     *
     * Este endpoint ha sido reemplazado por una interfaz más moderna
     * en el frontend con mejor UX y control de acceso bidireccional.
     */

    /**
     * Listar ECGs agrupadas por asegurado (v1.21.5)
     *
     * Retorna una lista de asegurados con todas sus ECGs agrupadas
     * Ideal para dashboard que muestra 1 fila por asegurado en lugar de 1 fila por imagen
     *
     * ✅ v1.52.4: Removido @CheckMBACPermission - lectura permitida para usuarios autenticados
     */
    @GetMapping("/agrupar-por-asegurado")
    @Operation(summary = "Listar ECGs agrupadas por asegurado")
    public ResponseEntity<ApiResponse<List<AseguradoConECGsDTO>>> listarAgrupoPorAsegurado(
            @Parameter(description = "Número de documento") @RequestParam(required = false) String numDoc,
            @Parameter(description = "Estado") @RequestParam(required = false) String estado) {

        log.info("📋 Listando ECGs agrupadas por asegurado - DNI: {}, Estado: {}", numDoc, estado);

        try {
            // ⚠️ DEPRECATED: Este endpoint no tiene paginación
            // Usar GET /api/teleekgs?page=0&size=15 para versión paginada
            // Limitando a 1000 registros para no sobrecargar
            List<AseguradoConECGsDTO> resultado = teleECGService.listarAgrupaPorAseguradoLimitado(
                numDoc, estado, null, null, null
            );

            // v3.0.0: Aplicar transformación de estado según rol
            Usuario usuarioActual = obtenerUsuarioActualObjeto();
            resultado = resultado.stream()
                .peek(asegurado -> {
                    // Transformar estado del grupo
                    if (asegurado.getEstadoPrincipal() != null) {
                        // Determinar si es usuario externo
                        boolean esExterno = usuarioActual != null && usuarioActual.getRoles() != null &&
                            usuarioActual.getRoles().stream()
                                .anyMatch(r -> r.getDescRol() != null &&
                                    (r.getDescRol().contains("EXTERNO") || r.getDescRol().contains("INSTITUCION")));

                        String estadoTransformado = estadoTransformer.transformarEstado(
                            asegurado.getEstadoPrincipal(),
                            esExterno
                        );
                        asegurado.setEstadoTransformado(estadoTransformado);
                    }
                })
                .collect(Collectors.toList());

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "ECGs agrupadas por asegurado",
                "200",
                resultado
            ));
        } catch (Exception e) {
            log.error("❌ Error en listado agrupado", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, e.getMessage(), "400", null));
        }
    }

    /**
     * Obtener detalles de imagen
     * ✅ v1.52.4: Removido @CheckMBACPermission - lectura permitida para usuarios autenticados
     */
    @GetMapping("/{idImagen}/detalles")
    @Operation(summary = "Obtener detalles de imagen")
    public ResponseEntity<ApiResponse<TeleECGImagenDTO>> obtenerDetalles(
            @PathVariable Long idImagen,
            HttpServletRequest request) {

        log.info("🔍 Obteniendo detalles - ID: {}", idImagen);

        try {
            Long idUsuario = getUsuarioActual();
            TeleECGImagenDTO resultado = teleECGService.obtenerDetallesImagen(
                idImagen, idUsuario, request.getRemoteAddr()
            );

            // v3.0.0: Aplicar transformación de estado según rol
            Usuario usuarioActual = obtenerUsuarioActualObjeto();
            resultado = aplicarTransformacionEstado(resultado, usuarioActual);

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Detalles obtenidos",
                "200",
                resultado
            ));
        } catch (Exception e) {
            log.error("❌ Error obteniendo detalles", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "No encontrada", "404", null));
        }
    }

    /**
     * Descargar imagen
     * ✅ v1.52.4: Removido @CheckMBACPermission - lectura permitida para usuarios autenticados
     */
    @GetMapping("/{idImagen}/descargar")
    @Operation(summary = "Descargar imagen ECG")
    public ResponseEntity<byte[]> descargarImagen(
            @PathVariable Long idImagen,
            HttpServletRequest request) {

        log.info("⬇️ Descargando - ID: {}", idImagen);

        try {
            Long idUsuario = getUsuarioActual();
            byte[] contenido = teleECGService.descargarImagen(
                idImagen, idUsuario, request.getRemoteAddr()
            );

            // Obtener metadata para headers correctos
            TeleECGImagenDTO imagen = teleECGService.obtenerDetallesImagen(
                idImagen, idUsuario, request.getRemoteAddr()
            );

            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(imagen.getMimeType() != null ? imagen.getMimeType() : "image/jpeg"))
                .header("Content-Disposition",
                    "attachment; filename=\"" + imagen.getNombreArchivo() + "\"")
                .header("Content-Length", String.valueOf(imagen.getSizeBytes()))
                .body(contenido);
        } catch (Exception e) {
            log.error("❌ Error descargando", e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Ver preview de imagen (mostrar inline en navegador)
     * ✅ v1.52.4: Removido @CheckMBACPermission - lectura permitida para usuarios autenticados
     */
    @GetMapping("/preview/{imagenId}")
    @Operation(summary = "Ver preview de imagen ECG")
    public ResponseEntity<byte[]> verPreview(
            @PathVariable Long imagenId,
            HttpServletRequest request) {

        log.info("👁️ Preview - ID: {}", imagenId);

        try {
            Long idUsuario = getUsuarioActual();
            byte[] contenido = teleECGService.descargarImagen(
                imagenId, idUsuario, request.getRemoteAddr()
            );

            // Obtener metadata para headers correctos
            TeleECGImagenDTO imagen = teleECGService.obtenerDetallesImagen(
                imagenId, idUsuario, request.getRemoteAddr()
            );

            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(imagen.getMimeType() != null ? imagen.getMimeType() : "image/jpeg"))
                // Sin Content-Disposition: attachment, se muestra inline
                .header("Content-Length", String.valueOf(imagen.getSizeBytes()))
                .header("Cache-Control", "public, max-age=3600")
                .body(contenido);
        } catch (Exception e) {
            log.error("❌ Error en preview", e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Procesar imagen
     */
    @PutMapping("/{idImagen}/procesar")
    @CheckMBACPermission(pagina = "/teleekgs/ipress-workspace", accion = "editar")
    @Operation(summary = "Procesar imagen ECG")
    public ResponseEntity<ApiResponse<TeleECGImagenDTO>> procesarImagen(
            @PathVariable Long idImagen,
            @Valid @RequestBody ProcesarImagenECGDTO dto,
            HttpServletRequest request) {

        log.info("⚙️ Procesando - ID: {} Acción: {}", idImagen, dto.getAccion());

        try {
            Long idUsuario = getUsuarioActual();
            TeleECGImagenDTO resultado = teleECGService.procesarImagen(
                idImagen, dto, idUsuario, request.getRemoteAddr()
            );

            // v3.0.0: Aplicar transformación de estado según rol
            Usuario usuarioActual = obtenerUsuarioActualObjeto();
            resultado = aplicarTransformacionEstado(resultado, usuarioActual);

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Imagen procesada",
                "200",
                resultado
            ));
        } catch (Exception e) {
            log.error("❌ Error procesando", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, e.getMessage(), "400", null));
        }
    }

    /**
     * Obtener auditoría
     */
    @GetMapping("/{idImagen}/auditoria")
    @CheckMBACPermission(pagina = "/teleekgs/auditoria", accion = "ver")
    @Operation(summary = "Obtener auditoría de imagen")
    public ResponseEntity<ApiResponse<Page<TeleECGAuditoriaDTO>>> obtenerAuditoria(
            @PathVariable Long idImagen,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("📜 Auditoría - ID: {}", idImagen);

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<TeleECGAuditoriaDTO> resultado = teleECGService.obtenerAuditoria(idImagen, pageable);

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Auditoría obtenida",
                "200",
                resultado
            ));
        } catch (Exception e) {
            log.error("❌ Error obteniendo auditoría", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, e.getMessage(), "400", null));
        }
    }

    /**
     * Obtener estadísticas
     * ✅ FIX v1.21.5: Remover @CheckMBACPermission - estadísticas públicas
     */
    @GetMapping("/estadisticas")
    @Operation(summary = "Obtener estadísticas de TeleECG")
    public ResponseEntity<ApiResponse<TeleECGEstadisticasDTO>> obtenerEstadisticas() {

        log.info("📊 Generando estadísticas");

        try {
            TeleECGEstadisticasDTO resultado = teleECGService.obtenerEstadisticas();

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Estadísticas generadas",
                "200",
                resultado
            ));
        } catch (Exception e) {
            log.error("❌ Error generando estadísticas", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, e.getMessage(), "400", null));
        }
    }

    /**
     * Obtener imágenes próximas a vencer
     * ✅ v1.52.4: Removido @CheckMBACPermission - lectura permitida para usuarios autenticados
     */
    @GetMapping("/proximas-vencer")
    @Operation(summary = "Imágenes próximas a vencer")
    public ResponseEntity<ApiResponse<?>> obtenerProximasVencer() {

        log.info("⚠️ Próximas a vencer");

        try {
            var resultado = teleECGService.obtenerProximasVencer();

            // v3.0.0: Aplicar transformación de estado según rol
            Usuario usuarioActual = obtenerUsuarioActualObjeto();
            if (resultado != null && !resultado.isEmpty()) {
                resultado = resultado.stream()
                    .map(dto -> aplicarTransformacionEstado(dto, usuarioActual))
                    .toList();
            }

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Próximas a vencer",
                "200",
                resultado
            ));
        } catch (Exception e) {
            log.error("❌ Error", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, e.getMessage(), "400", null));
        }
    }

    /**
     * 🔍 ENDPOINT DE DIAGNÓSTICO - Ver permisos del usuario actual
     */
    @GetMapping("/debug/permisos")
    @Operation(summary = "Diagnóstico - Ver permisos del usuario")
    public ResponseEntity<ApiResponse<Map<String, Object>>> debugPermisos() {
        try {
            Long idUsuario = getUsuarioActual();
            Usuario usuario = obtenerUsuarioActualObjeto();

            Map<String, Object> info = Map.of(
                "idUsuario", idUsuario,
                "nombreUsuario", usuario != null ? usuario.getNameUser() : "No encontrado",
                "mensaje", "Endpoint de diagnóstico - Si ves este mensaje, la autenticación funciona correctamente"
            );

            log.info("🔍 DIAGNÓSTICO: Usuario ID: {}, Name: {}", idUsuario, usuario != null ? usuario.getNameUser() : "N/A");

            return ResponseEntity.ok(new ApiResponse<>(true, "Diagnóstico exitoso", "200", info));
        } catch (Exception e) {
            log.error("❌ Error en diagnóstico", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error: " + e.getMessage(), "500", null));
        }
    }

    /**
     * Eliminar una imagen ECG de la base de datos
     */
    @DeleteMapping("/{idImagen}")
    @CheckMBACPermission(pagina = "/teleekgs/ipress-workspace", accion = "eliminar")
    @Operation(summary = "Eliminar imagen ECG")
    public ResponseEntity<ApiResponse<Void>> eliminarImagen(
            @PathVariable Long idImagen,
            HttpServletRequest request) {

        log.info("🗑️ Eliminando imagen: {}", idImagen);

        try {
            Long idUsuario = getUsuarioActual();
            teleECGService.eliminarImagen(idImagen, idUsuario, request.getRemoteAddr());

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Imagen eliminada exitosamente",
                "200",
                null
            ));
        } catch (Exception e) {
            log.error("❌ Error eliminando imagen", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, e.getMessage(), "400", null));
        }
    }

    /**
     * Evaluar una imagen ECG (v3.0.0 - Nuevo)
     * Médico de CENATE marca como NORMAL o ANORMAL + explicación
     * Este endpoint recopila datos para entrenar modelos de ML posteriormente
     */
    @PutMapping("/{idImagen}/evaluar")
    @CheckMBACPermission(pagina = "/teleekgs/ipress-workspace", accion = "editar")
    @Operation(summary = "Evaluar imagen ECG (NORMAL/ANORMAL)")
    public ResponseEntity<ApiResponse<TeleECGImagenDTO>> evaluarImagen(
            @PathVariable Long idImagen,
            @Valid @RequestBody EvaluacionECGDTO evaluacion,
            HttpServletRequest request) {

        log.info("📋 Evaluando ECG ID: {} - Evaluación: {}", idImagen, evaluacion.getEvaluacion());

        try {
            Long idUsuarioEvaluador = getUsuarioActual();
            String ipCliente = request.getRemoteAddr();

            TeleECGImagenDTO resultado = teleECGService.evaluarImagen(
                idImagen,
                evaluacion.getEvaluacion(),
                evaluacion.getDescripcion(),
                idUsuarioEvaluador,
                ipCliente
            );

            // Aplicar transformación de estado según rol
            Usuario usuarioActual = obtenerUsuarioActualObjeto();
            resultado = aplicarTransformacionEstado(resultado, usuarioActual);

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Evaluación guardada exitosamente",
                "200",
                resultado
            ));
        } catch (ValidationException e) {
            log.warn("⚠️ Validación en evaluación: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, e.getMessage(), "400", null));
        } catch (ResourceNotFoundException e) {
            log.warn("❌ Recurso no encontrado: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, e.getMessage(), "404", null));
        } catch (Exception e) {
            log.error("❌ Error en evaluación", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, e.getMessage(), "500", null));
        }
    }

    /**
     * 📋 Guardar Nota Clínica para imagen ECG (v3.0.0)
     * Endpoint para registrar hallazgos clínicos y plan de seguimiento
     */
    @PutMapping("/{idImagen}/nota-clinica")
    @CheckMBACPermission(pagina = "/teleekgs/ipress-workspace", accion = "editar")
    @Operation(summary = "Guardar nota clínica del ECG (hallazgos y plan de seguimiento)")
    public ResponseEntity<ApiResponse<TeleECGImagenDTO>> guardarNotaClinica(
            @PathVariable Long idImagen,
            @Valid @RequestBody NotaClinicaDTO notaClinica,
            HttpServletRequest request) {

        log.info("📋 Guardando Nota Clínica para ECG ID: {}", idImagen);

        try {
            Long idUsuarioMedico = getUsuarioActual();
            String ipCliente = request.getRemoteAddr();

            TeleECGImagenDTO resultado = teleECGService.guardarNotaClinica(
                idImagen,
                notaClinica,
                idUsuarioMedico,
                ipCliente
            );

            // Aplicar transformación de estado según rol
            Usuario usuarioActual = obtenerUsuarioActualObjeto();
            resultado = aplicarTransformacionEstado(resultado, usuarioActual);

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Nota clínica guardada exitosamente",
                "200",
                resultado
            ));
        } catch (ValidationException e) {
            log.warn("⚠️ Validación en nota clínica: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, e.getMessage(), "400", null));
        } catch (ResourceNotFoundException e) {
            log.warn("❌ Recurso no encontrado: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, e.getMessage(), "404", null));
        } catch (Exception e) {
            log.error("❌ Error en nota clínica", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, e.getMessage(), "500", null));
        }
    }

    /**
     * ✅ v11.0.0: Crear bolsa de seguimiento (Recita o Interconsulta) desde TeleECG
     * Endpoint: POST /api/teleekgs/{idImagen}/crear-bolsa-seguimiento
     * Reutiliza lógica probada de AtenderPacienteService
     */
    @PostMapping("/{idImagen}/crear-bolsa-seguimiento")
    @CheckMBACPermission(pagina = "/teleekgs/ipress-workspace", accion = "editar")
    @Operation(summary = "Crear bolsa de Recita o Interconsulta desde TeleECG")
    public ResponseEntity<ApiResponse<String>> crearBolsaSeguimiento(
            @PathVariable Long idImagen,
            @Valid @RequestBody CrearBolsaSeguimientoRequest request,
            HttpServletRequest httpRequest) {

        log.info("🚀 Creando bolsa de seguimiento - TeleECG ID: {}, Tipo: {}, Especialidad: {}",
                idImagen, request.getTipo(), request.getEspecialidad());

        try {
            // 1. Obtener imagen ECG
            TeleECGImagenDTO imagen = teleECGService.obtenerDetallesImagen(
                idImagen, getUsuarioActual(), httpRequest.getRemoteAddr()
            );

            if (imagen == null || imagen.getNumDocPaciente() == null) {
                throw new ResourceNotFoundException("Imagen ECG no encontrada");
            }

            // 2. Obtener solicitud de bolsa original (si existe)
            Optional<SolicitudBolsa> solicitudOpt = solicitudBolsaRepository
                .findByPacienteDniAndActivoTrue(imagen.getNumDocPaciente())
                .stream()
                .findFirst();

            // 3. Si no existe solicitud original, crear una mínima temporal
            SolicitudBolsa solicitudBase;
            if (solicitudOpt.isPresent()) {
                solicitudBase = solicitudOpt.get();
                log.info("✅ Solicitud base encontrada: {}", solicitudBase.getIdSolicitud());
            } else {
                // Crear registro base con datos del asegurado
                solicitudBase = crearSolicitudBase(imagen);
                log.info("✅ Solicitud base creada temporalmente");
            }

            // 4. Crear bolsa(s) según tipo
            if ("RECITA".equals(request.getTipo())) {
                atenderPacienteService.crearBolsaRecita(
                    solicitudBase,
                    request.getEspecialidad(),
                    request.getDias() != null ? request.getDias() : 90  // Default 3 meses = 90 días
                );
                log.info("✅ Bolsa RECITA creada para especialidad: {}", request.getEspecialidad());
            } else if ("INTERCONSULTA".equals(request.getTipo())) {
                atenderPacienteService.crearBolsaInterconsulta(
                    solicitudBase,
                    request.getEspecialidad()
                );
                log.info("✅ Bolsa INTERCONSULTA creada para especialidad: {}", request.getEspecialidad());
            } else {
                throw new ValidationException("Tipo de bolsa inválido: " + request.getTipo() +
                    ". Debe ser 'RECITA' o 'INTERCONSULTA'");
            }

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Bolsa de " + request.getTipo() + " creada exitosamente",
                "200",
                "ID Imagen: " + idImagen
            ));

        } catch (ValidationException e) {
            log.warn("⚠️ Validación en crear bolsa: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, e.getMessage(), "400", null));
        } catch (ResourceNotFoundException e) {
            log.warn("❌ Recurso no encontrado: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, e.getMessage(), "404", null));
        } catch (Exception e) {
            log.error("❌ Error creando bolsa de seguimiento", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error: " + e.getMessage(), "500", null));
        }
    }

    /**
     * ✅ v1.76.0: Actualizar fecha de toma del EKG
     * GET /api/teleekgs/{id}/actualizar-fecha-toma?fechaToma=2026-02-04
     */
    @GetMapping("/{id}/actualizar-fecha-toma")
    public ResponseEntity<ApiResponse<TeleECGImagenDTO>> actualizarFechaToma(
            @PathVariable Long id,
            @RequestParam String fechaToma,
            HttpServletRequest httpRequest) {

        log.info("🗓️ Actualizando fecha de toma - ID: {}, Fecha: {}", id, fechaToma);

        try {
            TeleECGImagenDTO imagen = teleECGService.actualizarFechaToma(id, fechaToma);
            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Fecha de toma actualizada exitosamente",
                "200",
                imagen
            ));
        } catch (ResourceNotFoundException e) {
            log.warn("❌ Imagen no encontrada: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, e.getMessage(), "404", null));
        } catch (ValidationException e) {
            log.warn("⚠️ Error de validación: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, e.getMessage(), "400", null));
        } catch (Exception e) {
            log.error("❌ Error actualizando fecha de toma", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error: " + e.getMessage(), "500", null));
        }
    }

    /**
     * Test endpoint para verificar que POST mappings funcionan
     */
    @PostMapping("/test-endpoint")
    public ResponseEntity<?> testEndpoint() {
        return ResponseEntity.ok(Map.of("message", "✅ POST endpoint works"));
    }

    /**
     * Método auxiliar: Crear solicitud base temporal si no existe
     */
    private SolicitudBolsa crearSolicitudBase(TeleECGImagenDTO imagen) {
        try {
            // Obtener asegurado de BD
            Optional<Asegurado> aseguradoOpt = aseguradoRepository
                .findByDocPaciente(imagen.getNumDocPaciente());

            if (!aseguradoOpt.isPresent()) {
                throw new ResourceNotFoundException("Asegurado no encontrado: " + imagen.getNumDocPaciente());
            }

            Asegurado asegurado = aseguradoOpt.get();

            return SolicitudBolsa.builder()
                .numeroSolicitud(generarNumeroSolicitud("TELEEKG"))
                .pacienteDni(imagen.getNumDocPaciente())
                .pacienteNombre(imagen.getNombresPaciente() + " " + imagen.getApellidosPaciente())
                .pacienteId(asegurado.getPkAsegurado())
                .pacienteSexo(asegurado.getSexo())
                .pacienteTelefono(asegurado.getTelCelular() != null ? asegurado.getTelCelular() : asegurado.getTelFijo())
                .codigoIpressAdscripcion(imagen.getCodigoIpress())
                .estado("ATENDIDO")
                .activo(true)
                .build();
        } catch (Exception e) {
            log.error("❌ Error creando solicitud base: {}", e.getMessage());
            throw new RuntimeException("No se pudo crear solicitud base: " + e.getMessage());
        }
    }

    /**
     * Generar número de solicitud único con prefijo
     */
    private String generarNumeroSolicitud(String prefijo) {
        return prefijo + "-" + System.currentTimeMillis();
    }

    // ============================================================
    // MÉTODOS AUXILIARES - Transformación de Estados (v3.0.0)
    // ============================================================

    /**
     * Obtiene el usuario actual de la sesión
     */
    private Usuario obtenerUsuarioActualObjeto() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null) {
                log.warn("⚠️ No hay autenticación en el contexto");
                return null;
            }

            Object principal = auth.getPrincipal();
            if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                org.springframework.security.core.userdetails.UserDetails userDetails =
                    (org.springframework.security.core.userdetails.UserDetails) principal;
                String username = userDetails.getUsername();

                var usuario = usuarioRepository.findByNameUserWithRoles(username);
                if (usuario.isPresent()) {
                    return usuario.get();
                }
            }
        } catch (Exception e) {
            log.error("❌ Error extrayendo usuario actual", e);
        }
        return null;
    }

    /**
     * Aplica transformación de estado a un DTO individual
     * Transforma el estado según el rol del usuario
     */
    private TeleECGImagenDTO aplicarTransformacionEstado(TeleECGImagenDTO dto, Usuario usuario) {
        if (dto != null) {
            String estadoTransformado = estadoTransformer.transformarEstado(dto, usuario);
            dto.setEstadoTransformado(estadoTransformado);
            dto.setEstadoFormato(TeleECGImagenDTO.formatoEstado(estadoTransformado));
        }
        return dto;
    }

    /**
     * Aplica transformación a un Page de DTOs
     */
    private Page<TeleECGImagenDTO> aplicarTransformacionEstadoPage(Page<TeleECGImagenDTO> page, Usuario usuario) {
        if (page != null && page.hasContent()) {
            return page.map(dto -> aplicarTransformacionEstado(dto, usuario));
        }
        return page;
    }

    /**
     * Obtener ID de usuario actual del token JWT
     * Extrae el username (num_doc) y busca el id_user en la BD
     */
    private Long getUsuarioActual() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null) {
                log.warn("⚠️ No hay autenticación en el contexto");
                return 1L;
            }

            Object principal = auth.getPrincipal();
            if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                org.springframework.security.core.userdetails.UserDetails userDetails =
                    (org.springframework.security.core.userdetails.UserDetails) principal;
                String username = userDetails.getUsername();

                // El username es el num_doc del usuario
                log.debug("🔍 Buscando usuario con username: {}", username);

                var usuario = usuarioRepository.findByNameUserWithRoles(username);
                if (usuario.isPresent()) {
                    Long idUsuario = usuario.get().getIdUser();
                    log.debug("✅ Usuario encontrado: {} con ID: {}", username, idUsuario);
                    return idUsuario;
                } else {
                    log.warn("❌ Usuario no encontrado en BD: {}", username);
                }
            }
        } catch (Exception e) {
            log.error("❌ Error extrayendo usuario actual", e);
        }

        log.warn("⚠️ Retornando 1L como fallback");
        return 1L;
    }

    /**
     * ✅ TEST ENDPOINT - Verificar si POST funciona en general
     */
    @PostMapping("/test-post")
    public ResponseEntity<?> testPost(@RequestParam String mensaje) {
        log.info("✅ TEST POST FUNCIONA: {}", mensaje);
        return ResponseEntity.ok(new ApiResponse<>(
            true,
            "Test POST funcionó correctamente",
            "200",
            mensaje
        ));
    }
}

package com.styp.cenate.api.bolsas;

import com.styp.cenate.dto.bolsas.SolicitudBolsaDTO;
import com.styp.cenate.dto.bolsas.ActualizarEstadoCitaDTO;
import com.styp.cenate.dto.bolsas.CrearSolicitudAdicionalRequest;
import com.styp.cenate.model.bolsas.HistorialCargaBolsas;
import com.styp.cenate.repository.bolsas.HistorialCargaBolsasRepository;
import com.styp.cenate.service.bolsas.SolicitudBolsaService;
import com.styp.cenate.security.mbac.CheckMBACPermission;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import com.styp.cenate.repository.bolsas.DimEstadosGestionCitasRepository;
import com.styp.cenate.model.bolsas.DimEstadosGestionCitas;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.model.Especialidad;
import com.styp.cenate.repository.EspecialidadRepository;
import com.styp.cenate.dto.DetalleMedicoDTO;
import com.styp.cenate.service.atenciones_clinicas.DetalleMedicoService;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.UsuarioRepository;

/**
 * Controller REST para gestión de solicitudes de bolsa
 * Endpoints para importación Excel (v1.15.0: dual phone mapping), listado, búsqueda y actualización
 *
 * @version v1.7.0 - Implementa dual phone mapping (teléfono principal + alterno)
 * @since 2026-01-23
 * @updated 2026-01-28 - Switcheo a SolicitudBolsaService con 5 critical fixes
 */
@Slf4j
@RestController
@RequestMapping("/api/bolsas/solicitudes")
@RequiredArgsConstructor
public class SolicitudBolsaController {

    private final SolicitudBolsaService solicitudBolsaService;
    private final HistorialCargaBolsasRepository historialRepository;
    private final SolicitudBolsaRepository solicitudRepository;
    private final DimEstadosGestionCitasRepository estadosRepository;
    private final EspecialidadRepository especialidadRepository; // v1.46.8: Para obtener médicos
    private final DetalleMedicoService detalleMedicoService; // v1.46.8: Para obtener médicos
    private final UsuarioRepository usuarioRepository; // ✅ v1.47.0: Para sincronizar gestora

    /**
     * Importa solicitudes desde archivo Excel
     * POST /api/bolsas/solicitudes/importar
     *
     * @param file archivo Excel con columnas: DNI, Código Adscripción
     * @param idBolsa ID del tipo de bolsa seleccionado (PASO 1)
     * @param idServicio ID del servicio/especialidad (PASO 2)
     * @param usuarioCarga Usuario que realiza la carga (desde frontend)
     * @return estadísticas de importación
     */
    @PostMapping(value = "/importar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> importarDesdeExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam("idBolsa") Long idBolsa,
            @RequestParam("idServicio") Long idServicio,
            @RequestParam(value = "usuarioCarga", defaultValue = "admin") String usuarioCarga) {

        HistorialCargaBolsas historial = null;
        try {
            log.info("📤 Iniciando importación de Excel - Bolsa: {}, Servicio: {}, Usuario: {}",
                idBolsa, idServicio, usuarioCarga);

            // ============================================================================
            // 📝 CREAR HISTORIAL ANTES DE PROCESAR (v1.20.0)
            // Permite vincular errores de auditoría al batch de carga
            // ============================================================================
            String hashArchivo = calcularHashArchivo(file);

            // ============================================================================
            // ✅ v1.40.0: VALIDACIÓN DE ARCHIVO DUPLICADO (hash único)
            // Verificar si el archivo ya fue cargado previamente
            // ============================================================================
            var archivoExistente = historialRepository.findByHashArchivo(hashArchivo);
            if (archivoExistente.isPresent()) {
                log.warn("⚠️ Intento de carga de archivo duplicado: {} | Hash: {}",
                    file.getOriginalFilename(), hashArchivo);

                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Archivo ya cargado",
                    "mensaje", "Este archivo ya fue cargado previamente el " +
                               archivoExistente.get().getFechaCreacion() +
                               ". No se permiten cargar el mismo archivo dos veces.",
                    "instrucciones", "Si deseas cargar nuevos pacientes, por favor selecciona un archivo diferente o actualiza los datos en el Excel.",
                    "archivo_anterior", archivoExistente.get().getNombreArchivo(),
                    "filas_cargadas_anteriormente", archivoExistente.get().getFilasOk()
                ));
            }

            historial = HistorialCargaBolsas.builder()
                .nombreArchivo(file.getOriginalFilename())
                .hashArchivo(hashArchivo)
                .usuarioCarga(usuarioCarga)
                .estadoCarga("PROCESANDO")
                .fechaReporte(LocalDate.now())
                .totalFilas(0)
                .filasOk(0)
                .filasError(0)
                .build();

            historial = historialRepository.save(historial);
            Long idHistorial = historial.getIdCarga();
            log.info("✅ Historial creado - ID: {}, Archivo: {}", idHistorial, file.getOriginalFilename());

            // Usar SolicitudBolsaService v1.20.0 con auditoría de errores
            Map<String, Object> resultado = solicitudBolsaService.importarDesdeExcel(
                file,
                idBolsa,
                idServicio,
                usuarioCarga,
                idHistorial  // Pasar ID de historial para auditoría
            );

            log.info("✅ Importación completada - Total: {}, OK: {}, Errores: {}",
                resultado.get("filas_total"),
                resultado.get("filas_ok"),
                resultado.get("filas_error"));

            // ============================================================================
            // 📝 ACTUALIZAR HISTORIAL CON RESULTADOS FINALES
            // ============================================================================
            historial.setEstadoCarga("PROCESADO");
            historial.setTotalFilas((Integer) resultado.getOrDefault("filas_total", 0));
            historial.setFilasOk((Integer) resultado.getOrDefault("filas_ok", 0));
            historial.setFilasError((Integer) resultado.getOrDefault("filas_error", 0));
            historialRepository.save(historial);

            log.info("✅ Historial actualizado - OK: {}, Errores: {}",
                historial.getFilasOk(), historial.getFilasError());

            return ResponseEntity.ok(resultado);

        } catch (Exception e) {
            log.error("❌ Error en importación de Excel: ", e);

            // Si el historial se creó pero hubo error, marcarlo como fallido
            if (historial != null) {
                try {
                    historial.setEstadoCarga("ERROR");
                    historialRepository.save(historial);
                } catch (Exception ex) {
                    log.warn("⚠️ No se pudo actualizar estado del historial a ERROR: {}", ex.getMessage());
                }
            }

            return ResponseEntity.badRequest().body(
                Map.of("error", "Error en importación: " + e.getMessage())
            );
        }
    }

    /**
     * Calcula el hash SHA-256 del archivo de forma eficiente (stream)
     * No lee TODO el archivo en memoria, lo procesa en chunks
     */
    private String calcularHashArchivo(MultipartFile file) throws Exception {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[8192];
            int bytesRead;

            try (var inputStream = file.getInputStream()) {
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    digest.update(buffer, 0, bytesRead);
                }
            }

            byte[] hash = digest.digest();
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (IOException e) {
            log.warn("⚠️ No se pudo calcular hash del archivo: {}", e.getMessage());
            // Fallback: usar nombre del archivo + timestamp como alternativa
            return file.getOriginalFilename() + "-" + System.currentTimeMillis();
        }
    }

    /**
     * Obtiene lista de gestoras disponibles (usuarios con rol GESTOR_DE_CITAS)
     * GET /api/bolsas/solicitudes/gestoras-disponibles
     *
     * IMPORTANTE: Este endpoint DEBE estar antes de /{id} para evitar routing ambiguo
     * Retorna lista de usuarios activos con rol GESTOR_DE_CITAS para asignación
     * Usado en modal de asignación del frontend
     */
    @GetMapping("/gestoras-disponibles")
    public ResponseEntity<?> obtenerGestorasDisponibles() {
        try {
            log.info("👤 Obteniendo gestoras disponibles (rol GESTOR_DE_CITAS)...");

            // Obtener gestoras del servicio
            List<Map<String, Object>> gestoras = solicitudBolsaService.obtenerGestorasDisponibles();

            log.info("✅ Se encontraron {} gestora(s) disponible(s)", gestoras.size());

            return ResponseEntity.ok(Map.of(
                "total", gestoras.size(),
                "gestoras", gestoras,
                "mensaje", gestoras.isEmpty() ?
                    "No hay gestoras disponibles en este momento" :
                    "Se encontraron " + gestoras.size() + " gestora(s) disponible(s)"
            ));

        } catch (Exception e) {
            log.error("❌ Error al obtener gestoras: ", e);
            return ResponseEntity.status(500).body(
                Map.of("error", "Error al obtener gestoras: " + e.getMessage())
            );
        }
    }

    /**
     * Obtiene asegurados nuevos detectados (que no existen en BD)
     * GET /api/bolsas/solicitudes/asegurados-nuevos
     *
     * IMPORTANTE: Este endpoint DEBE estar antes de /{id} para evitar routing ambiguo
     * Retorna lista de DNIs en solicitudes que no tienen correspondencia en tabla asegurados
     */
    @GetMapping("/asegurados-nuevos")
    public ResponseEntity<?> obtenerAseguradosNuevos() {
        try {
            log.info("Obteniendo asegurados nuevos detectados...");
            List<Map<String, Object>> aseguradosNuevos = solicitudBolsaService.obtenerAseguradosNuevos();

            return ResponseEntity.ok(Map.of(
                "total", aseguradosNuevos.size(),
                "asegurados", aseguradosNuevos,
                "mensaje", aseguradosNuevos.isEmpty() ?
                    "No hay asegurados nuevos pendientes de sincronización" :
                    "Se encontraron " + aseguradosNuevos.size() + " asegurados nuevos"
            ));

        } catch (Exception e) {
            log.error("Error al obtener asegurados nuevos: ", e);
            return ResponseEntity.badRequest().body(
                Map.of("error", "Error: " + e.getMessage())
            );
        }
    }

    /**
     * Obtiene solicitudes asignadas a la gestora actual (Mi Bandeja)
     * GET /api/bolsas/solicitudes/mi-bandeja
     *
     * IMPORTANTE: Este endpoint DEBE estar antes de /{id} para evitar routing ambiguo
     * Retorna lista de solicitudes donde responsable_gestora_id = current user
     * v1.40.4: Removida restricción de rol para permitir acceso desde módulo Gestión de Citas
     */
    @GetMapping("/mi-bandeja")
    public ResponseEntity<?> obtenerMiBandeja(
            @RequestParam(required = false) String fechaIngresoInicio,
            @RequestParam(required = false) String fechaIngresoFin,
            @RequestParam(required = false) String fechaAsignacionInicio,
            @RequestParam(required = false) String fechaAsignacionFin) {
        try {
            log.info("═══════════════════════════════════════════════════════════");
            log.info("📬 ENDPOINT: GET /api/bolsas/solicitudes/mi-bandeja");
            log.info("   Obteniendo solicitudes de la gestora actual (Mi Bandeja)...");
            if (fechaIngresoInicio != null || fechaIngresoFin != null || fechaAsignacionInicio != null || fechaAsignacionFin != null) {
                log.info("📅 Filtros de fecha aplicados:");
                if (fechaIngresoInicio != null) log.info("   - F. Ingreso Inicio: {}", fechaIngresoInicio);
                if (fechaIngresoFin != null) log.info("   - F. Ingreso Fin: {}", fechaIngresoFin);
                if (fechaAsignacionInicio != null) log.info("   - F. Asignación Inicio: {}", fechaAsignacionInicio);
                if (fechaAsignacionFin != null) log.info("   - F. Asignación Fin: {}", fechaAsignacionFin);
            }

            // Obtener solicitudes asignadas a la gestora actual
            List<SolicitudBolsaDTO> solicitudes = solicitudBolsaService.obtenerSolicitudesAsignadasAGestora();

            // 📅 Aplicar filtros de fecha (v1.43.3)
            java.time.LocalDate tempIngresoInicio = null, tempIngresoFin = null, tempAsignacionInicio = null, tempAsignacionFin = null;
            try {
                if (fechaIngresoInicio != null && !fechaIngresoInicio.isBlank()) {
                    tempIngresoInicio = java.time.LocalDate.parse(fechaIngresoInicio);
                }
                if (fechaIngresoFin != null && !fechaIngresoFin.isBlank()) {
                    tempIngresoFin = java.time.LocalDate.parse(fechaIngresoFin);
                }
                if (fechaAsignacionInicio != null && !fechaAsignacionInicio.isBlank()) {
                    tempAsignacionInicio = java.time.LocalDate.parse(fechaAsignacionInicio);
                }
                if (fechaAsignacionFin != null && !fechaAsignacionFin.isBlank()) {
                    tempAsignacionFin = java.time.LocalDate.parse(fechaAsignacionFin);
                }
            } catch (Exception e) {
                log.warn("⚠️ Error parseando fechas: {}", e.getMessage());
            }

            final java.time.LocalDate diaIngresoInicio = tempIngresoInicio;
            final java.time.LocalDate diaIngresoFin = tempIngresoFin;
            final java.time.LocalDate diaAsignacionInicio = tempAsignacionInicio;
            final java.time.LocalDate diaAsignacionFin = tempAsignacionFin;

            if (diaIngresoInicio != null || diaIngresoFin != null || diaAsignacionInicio != null || diaAsignacionFin != null) {
                log.info("[DATES] Fechas parseadas:");
                if (diaIngresoInicio != null) log.info("   - Ingreso Inicio: {}", diaIngresoInicio);
                if (diaIngresoFin != null) log.info("   - Ingreso Fin: {}", diaIngresoFin);
                if (diaAsignacionInicio != null) log.info("   - Asignación Inicio: {}", diaAsignacionInicio);
                if (diaAsignacionFin != null) log.info("   - Asignación Fin: {}", diaAsignacionFin);

                final int totalAntes = solicitudes.size();
                solicitudes = solicitudes.stream()
                    .filter(s -> {
                        // Filtro F. Ingreso Bolsa (fechaCambioEstado)
                        if (diaIngresoInicio != null || diaIngresoFin != null) {
                            if (s.getFechaCambioEstado() == null) {
                                log.debug("  SKIP Solicitud {} sin fechaCambioEstado", s.getIdSolicitud());
                                return false;
                            }
                            java.time.LocalDate diaIngreso = s.getFechaCambioEstado().toLocalDateTime().toLocalDate();
                            log.debug("  [DEBUG] Solicitud {}: fechaCambioEstado = {}, comparando con {} a {}",
                                s.getIdSolicitud(), diaIngreso, diaIngresoInicio, diaIngresoFin);
                            if (diaIngresoInicio != null && diaIngreso.isBefore(diaIngresoInicio)) {
                                log.debug("    SKIP {} es antes de {}", diaIngreso, diaIngresoInicio);
                                return false;
                            }
                            if (diaIngresoFin != null && diaIngreso.isAfter(diaIngresoFin)) {
                                log.debug("    SKIP {} es después de {}", diaIngreso, diaIngresoFin);
                                return false;
                            }
                            log.debug("    PASS Solicitud {} pasa filtro F. Ingreso", s.getIdSolicitud());
                        }
                        // Filtro F. Asignación (fechaAsignacion)
                        if (diaAsignacionInicio != null || diaAsignacionFin != null) {
                            if (s.getFechaAsignacion() == null) {
                                log.debug("  SKIP Solicitud {} sin fechaAsignacion", s.getIdSolicitud());
                                return false;
                            }
                            java.time.LocalDate diaAsignacion = s.getFechaAsignacion().toLocalDateTime().toLocalDate();
                            log.debug("  [DEBUG] Solicitud {}: fechaAsignacion = {}, comparando con {} a {}",
                                s.getIdSolicitud(), diaAsignacion, diaAsignacionInicio, diaAsignacionFin);
                            if (diaAsignacionInicio != null && diaAsignacion.isBefore(diaAsignacionInicio)) {
                                log.debug("    SKIP {} es antes de {}", diaAsignacion, diaAsignacionInicio);
                                return false;
                            }
                            if (diaAsignacionFin != null && diaAsignacion.isAfter(diaAsignacionFin)) {
                                log.debug("    SKIP {} es después de {}", diaAsignacion, diaAsignacionFin);
                                return false;
                            }
                            log.debug("    PASS Solicitud {} pasa filtro F. Asignación", s.getIdSolicitud());
                        }
                        return true;
                    })
                    .collect(java.util.stream.Collectors.toList());
                log.info("[RESULT] Filtrado: {} solicitudes => {} solicitudes", totalAntes, solicitudes.size());
            }

            log.info("✅ Resultado final: Se encontraron {} solicitud(es) en la bandeja", solicitudes.size());
            log.info("═══════════════════════════════════════════════════════════");

            return ResponseEntity.ok(Map.of(
                "total", solicitudes.size(),
                "solicitudes", solicitudes,
                "mensaje", solicitudes.isEmpty() ?
                    "No tienes solicitudes asignadas aún" :
                    "Se encontraron " + solicitudes.size() + " solicitud(es) asignada(s)"
            ));

        } catch (Exception e) {
            log.error("❌ Error al obtener bandeja de gestora: ", e);
            log.error("═══════════════════════════════════════════════════════════");
            return ResponseEntity.status(500).body(
                Map.of("error", "Error al obtener bandeja: " + e.getMessage())
            );
        }
    }

    /**
     * Obtiene todas las solicitudes activas CON PAGINACIÓN
     * GET /api/bolsas/solicitudes?page=0&size=25
     *
     * @param pageable información de paginación (default: 25 registros para alinear con frontend)
     * @return página de solicitudes
     */
    /**
     * GET /api/bolsas/solicitudes
     * Lista solicitudes con soporte para FILTROS AVANZADOS (v2.6.0 + v1.42.0: asignación)
     * UX: Al usuario le basta seleccionar filtros y recibe resultados filtrados al instante
     *
     * @param idBolsa ID de bolsa (null o "todas" = todas las bolsas)
     * @param macrorregion descripción de macrorregión (null o "todas" = todas)
     * @param red descripción de red (null o "todas" = todas)
     * @param ipress descripción de IPRESS (null o "todas" = todas)
     * @param especialidad especialidad (null o "todas" = todas)
     * @param estadoId ID estado gestión citas (null = todos)
     * @param tipoCita tipo de cita (null o "todas" = todos)
     * @param asignacion filtro asignación: null/"todos" = todos, "asignados" = con gestora, "sin_asignar" = sin gestora
     * @param busqueda búsqueda por DNI solamente (null = ignorar)
     * @param pageable paginación
     * @return Page con solicitudes filtradas
     */
    @GetMapping
    public ResponseEntity<Page<SolicitudBolsaDTO>> listarTodas(
            @RequestParam(required = false) String bolsa,
            @RequestParam(required = false) String macrorregion,
            @RequestParam(required = false) String red,
            @RequestParam(required = false) String ipress,
            @RequestParam(required = false) String especialidad,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String tipoCita,
            @RequestParam(required = false) String asignacion,
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String fechaInicio,  // ✅ v1.66.0: Filtro rango fechas
            @RequestParam(required = false) String fechaFin,     // ✅ v1.66.0: Filtro rango fechas
            @PageableDefault(size = 25, page = 0) Pageable pageable) {

        // Si hay algún filtro, usar búsqueda con filtros (v2.6.0 + v1.66.0: rango fechas)
        if (bolsa != null || macrorregion != null || red != null || ipress != null ||
            especialidad != null || estado != null || tipoCita != null || asignacion != null || busqueda != null ||
            fechaInicio != null || fechaFin != null) {
            log.info("🔍 Solicitud con filtros - Bolsa: {}, Macro: {}, Red: {}, IPRESS: {}, Especialidad: {}, Estado: {}, TipoCita: {}, Asignación: {}, Búsqueda: {}, FechaInicio: {}, FechaFin: {}",
                bolsa, macrorregion, red, ipress, especialidad, estado, tipoCita, asignacion, busqueda, fechaInicio, fechaFin);
            return ResponseEntity.ok(solicitudBolsaService.listarConFiltros(
                    bolsa, macrorregion, red, ipress, especialidad, estado, tipoCita, asignacion, busqueda, fechaInicio, fechaFin, pageable));
        }

        // Sin filtros, listar todas (comportamiento anterior)
        log.info("📋 Listando solicitudes sin filtros - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        return ResponseEntity.ok(solicitudBolsaService.listarTodasPaginado(pageable));
    }

    /**
     * Exporta solicitudes seleccionadas a formato CSV
     * GET /api/bolsas/solicitudes/exportar?ids=1,2,3
     *
     * Permite descargar un archivo CSV con las solicitudes seleccionadas por el usuario
     * Campos incluidos: DNI, NOMBRE, EDAD, SEXO, TELÉFONO 1, TELÉFONO 2, ESPECIALIDAD,
     *                   IPRESS, RED, MACRORREGIÓN, TIPO BOLSA, ESTADO, FECHA SOLICITUD
     *
     * Accesible a: Todos los usuarios autenticados (ADMIN, SUPERADMIN, COORDINADOR, MEDICO, etc.)
     *
     * @param ids lista de IDs de solicitudes a exportar (parámetro query)
     * @return archivo CSV con los datos de las solicitudes
     */
    @GetMapping("/exportar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> exportarCSV(
        @RequestParam(value = "ids", required = false) List<Long> ids) {
        log.info("📄 Exportando {} solicitudes seleccionadas a CSV", ids != null ? ids.size() : 0);

        if (ids == null || ids.isEmpty()) {
            log.warn("⚠️ No se especificaron IDs para exportar");
            return ResponseEntity.badRequest().build();
        }

        byte[] csvData = solicitudBolsaService.exportarCSV(ids);

        if (csvData.length == 0) {
            log.warn("⚠️ No hay datos para exportar");
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok()
            .header("Content-Type", "text/csv; charset=UTF-8")
            .header("Content-Disposition", "attachment; filename=\"solicitudes_" + System.currentTimeMillis() + ".csv\"")
            .body(csvData);
    }

    /**
     * Obtener médicos por especialidad (v1.46.8)
     * POST /api/bolsas/solicitudes/medicos-por-especialidad?especialidad=CARDIOLOGIA
     *
     * Se usa POST en lugar de GET para evitar conflicto con ruta /{id}
     * @param especialidad nombre de la especialidad (ej: "CARDIOLOGIA", "NUTRICION")
     * @return lista de médicos activos para esa especialidad
     */
    @PostMapping("/fetch-doctors-by-specialty")
    @CheckMBACPermission(pagina = "/citas/gestion-asegurado", accion = "ver")
    public ResponseEntity<?> obtenerMedicosPorEspecialidad(@RequestParam String especialidad) {
        log.info("📥 POST /api/bolsas/solicitudes/fetch-doctors-by-specialty?especialidad={}", especialidad);

        try {
            // 1. Buscar el ID de la especialidad por nombre (case-insensitive)
            Optional<Especialidad> especialidadOpt = especialidadRepository
                    .findByDescServicioIgnoreCase(especialidad);

            if (especialidadOpt.isEmpty()) {
                log.warn("⚠️ Especialidad no encontrada: {}", especialidad);
                return ResponseEntity.ok()
                        .body(Map.of("status", "success", "data", Collections.emptyList()));
            }

            Long idServicio = especialidadOpt.get().getIdServicio();

            // 2. Obtener médicos usando el servicio existente
            List<DetalleMedicoDTO> medicos = detalleMedicoService
                    .obtenerMedicosPorServicio(idServicio);

            // 3. Formatear para el frontend (solo campos necesarios)
            List<Map<String, Object>> medicosList = new ArrayList<>();
            for (DetalleMedicoDTO m : medicos) {
                Map<String, Object> medicoMap = new HashMap<>();
                medicoMap.put("idPers", m.getIdPers());
                medicoMap.put("nombre", m.getNombre());
                medicoMap.put("documento", m.getNumDocPers());
                medicosList.add(medicoMap);
            }

            log.info("✅ Se encontraron {} médicos para {}", medicosList.size(), especialidad);

            return ResponseEntity.ok()
                    .body(Map.of("status", "success", "data", medicosList));

        } catch (Exception e) {
            log.error("❌ Error al obtener médicos para especialidad {}: {}", especialidad, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", "Error al obtener médicos"));
        }
    }

    /**
     * Obtiene una solicitud por ID
     * GET /api/bolsas/solicitudes/{id}
     *
     * IMPORTANTE: Solo acepta IDs numéricos para evitar conflicto con rutas específicas
     * @param id ID de la solicitud (debe ser un número)
     * @return solicitud encontrada o 404
     */
    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<SolicitudBolsaDTO> obtenerPorId(@PathVariable Long id) {
        log.info("Obteniendo solicitud por ID: {}", id);
        return solicitudBolsaService.obtenerPorId(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Asigna una gestora a una solicitud
     * PATCH /api/bolsas/solicitudes/{id}/asignar
     *
     * Roles permitidos: SUPERADMIN, ADMIN, COORD. GESTION CITAS
     *
     * @param id ID de la solicitud
     * @param idGestora ID de la gestora a asignar
     * @return mensaje de éxito
     */
    @PatchMapping("/{id}/asignar")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORD. GESTION CITAS')")
    //@CheckMBACPermission(pagina = "/modulos/bolsas/solicitudes", accion = "asignar")
    public ResponseEntity<?> asignarGestora(
            @PathVariable Long id,
            @RequestParam(value = "idGestora", required = false) Long idGestora) {

        try {
            // NEW v2.4.0: Soportar eliminación de asignación (idGestora = null)
            if (idGestora == null) {
                log.info("🗑️ Eliminando asignación de gestora en solicitud {}", id);
                solicitudBolsaService.eliminarAsignacionGestora(id);

                return ResponseEntity.ok(Map.of(
                    "mensaje", "Asignación de gestora eliminada exitosamente",
                    "idSolicitud", id
                ));
            }

            // ASIGNACIÓN NORMAL
            log.info("👤 Asignando gestora {} a solicitud {} (MBAC: COORDINADOR_DE_CITAS)", idGestora, id);
            solicitudBolsaService.asignarGestora(id, idGestora);

            return ResponseEntity.ok(Map.of(
                "mensaje", "Gestora asignada exitosamente",
                "idSolicitud", id,
                "idGestora", idGestora
            ));

        } catch (com.styp.cenate.exception.ResourceNotFoundException e) {
            log.error("❌ Recurso no encontrado: ", e);
            return ResponseEntity.status(404).body(
                Map.of("error", e.getMessage())
            );
        } catch (com.styp.cenate.exception.ValidationException e) {
            log.error("❌ Error de validación: ", e);
            return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage())
            );
        } catch (Exception e) {
            log.error("❌ Error inesperado al asignar gestora: ", e);
            return ResponseEntity.status(500).body(
                Map.of("error", "Error interno del servidor")
            );
        }
    }

    /**
     * Cambia el estado de una solicitud
     * PATCH /api/bolsas/solicitudes/{id}/estado
     *
     * Roles permitidos: SUPERADMIN, ADMIN, COORDINADOR GESTION DE CITAS, GESTOR DE CITAS
     *
     * @param id ID de la solicitud
     * @param nuevoEstadoCodigo código del nuevo estado (ej: PENDIENTE_CITA, CITADO, etc)
     * @return mensaje de éxito
     */
    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORD. GESTION CITAS', 'GESTOR DE CITAS')")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Long id,
            @RequestParam("nuevoEstadoCodigo") String nuevoEstadoCodigo) {

        try {
            log.info("📊 Cambiando estado de solicitud {} a {}", id, nuevoEstadoCodigo);

            // Buscar el estado por código en dim_estados_gestion_citas
            DimEstadosGestionCitas estado = estadosRepository.findByCodigoEstado(nuevoEstadoCodigo)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Estado no encontrado: " + nuevoEstadoCodigo));

            log.info("✅ Estado encontrado: {} (ID: {})", estado.getCodigoEstado(), estado.getIdEstado());

            // Cambiar el estado usando el ID encontrado
            solicitudBolsaService.cambiarEstado(id, estado.getIdEstado());

            return ResponseEntity.ok(Map.of(
                "mensaje", "Estado actualizado exitosamente",
                "idSolicitud", id,
                "nuevoEstadoCodigo", nuevoEstadoCodigo,
                "nuevoEstadoId", estado.getIdEstado()
            ));

        } catch (ResourceNotFoundException e) {
            log.error("❌ Estado no encontrado: {}", e.getMessage());
            return ResponseEntity.status(404).body(
                Map.of("error", e.getMessage())
            );
        } catch (Exception e) {
            log.error("❌ Error al cambiar estado: ", e);
            return ResponseEntity.status(500).body(
                Map.of("error", "Error: " + e.getMessage())
            );
        }
    }

    /**
     * Actualiza estado de solicitud + detalles de cita (fecha, hora, médico)
     * PATCH /api/bolsas/solicitudes/{id}/estado-y-cita
     *
     * Versión mejorada del endpoint /estado que permite guardar además:
     * - Fecha de la cita agendada
     * - Hora de la cita agendada
     * - ID del médico/personal asignado
     * - Notas adicionales
     *
     * Roles permitidos: SUPERADMIN, ADMIN, COORDINADOR GESTION DE CITAS, GESTOR DE CITAS
     *
     * @param id ID de la solicitud
     * @param dto Objeto con estado, fecha, hora, idMedico, notas
     * @return mensaje de éxito + solicitud actualizada
     */
    @PatchMapping("/{id}/estado-y-cita")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORD. GESTION CITAS', 'GESTOR DE CITAS')")
    @Transactional
    public ResponseEntity<?> cambiarEstadoYCita(
            @PathVariable Long id,
            @RequestBody ActualizarEstadoCitaDTO dto) {

        try {
            log.warn("🎬🎬🎬 ENDPOINT LLAMADO: cambiarEstadoYCita");
            log.warn("📊 ID Solicitud: {}", id);
            log.warn("📊 DTO Recibido: {}", dto);
            log.warn("📊 Estado Código: {}", dto.getNuevoEstadoCodigo());
            log.warn("📊 Fecha Atención: {}", dto.getFechaAtencion());
            log.warn("📊 Hora Atención: {}", dto.getHoraAtencion());
            log.warn("📊 ID Personal: {}", dto.getIdPersonal());
            
            log.info("📊 Actualizando estado y cita de solicitud {} a {}", id, dto.getNuevoEstadoCodigo());
            log.info("   Fecha: {}, Hora: {}, Personal: {}", dto.getFechaAtencion(), dto.getHoraAtencion(), dto.getIdPersonal());

            // Validar que el estado sea válido
            if (dto.getNuevoEstadoCodigo() == null || dto.getNuevoEstadoCodigo().trim().isEmpty()) {
                log.error("❌ VALIDACIÓN FALLIDA: nuevoEstadoCodigo es nulo o vacío");
                return ResponseEntity.status(400).body(
                    Map.of("error", "nuevoEstadoCodigo es obligatorio")
                );
            }

            // Buscar el estado por código
            DimEstadosGestionCitas estado = estadosRepository.findByCodigoEstado(dto.getNuevoEstadoCodigo())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Estado no encontrado: " + dto.getNuevoEstadoCodigo()));

            log.info("✅ Estado encontrado: {} (ID: {})", estado.getCodigoEstado(), estado.getIdEstado());

            // Obtener la solicitud
            SolicitudBolsa solicitud = solicitudRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Solicitud no encontrada con ID: " + id));

            log.info("✅ Solicitud encontrada: {}", solicitud.getNumeroSolicitud());

            // Actualizar estado usando el ID encontrado
            log.info("🔄 Actualizando estadoGestionCitasId a {}", estado.getIdEstado());
            solicitud.setEstadoGestionCitasId(estado.getIdEstado());
            solicitud.setFechaCambioEstado(OffsetDateTime.now());

            // Guardar detalles de cita
            // ✅ IMPORTANTE: Si son null, limpiar los campos existentes (útil cuando cambia de estado)
            if (dto.getFechaAtencion() != null) {
                log.info("📅 Guardando fecha de atención: {}", dto.getFechaAtencion());
                solicitud.setFechaAtencion(dto.getFechaAtencion());
            } else {
                log.warn("⚠️  fechaAtencion es NULL - Limpiando campo en BD");
                solicitud.setFechaAtencion(null);  // ✅ LIMPIAR
            }

            if (dto.getHoraAtencion() != null) {
                log.info("⏰ Guardando hora de atención: {}", dto.getHoraAtencion());
                solicitud.setHoraAtencion(dto.getHoraAtencion());
            } else {
                log.warn("⚠️  horaAtencion es NULL - Limpiando campo en BD");
                solicitud.setHoraAtencion(null);  // ✅ LIMPIAR
            }

            if (dto.getIdPersonal() != null && dto.getIdPersonal() > 0) {
                log.info("👨‍⚕️ Guardando personal/médico: {}", dto.getIdPersonal());
                solicitud.setIdPersonal(dto.getIdPersonal());

                // ✅ v1.63.1: Cuando se asigna un médico, obtener y guardar su especialidad
                try {
                    log.info("🔍 Buscando especialidad para médico ID: {}", dto.getIdPersonal());
                    DetalleMedicoDTO detalleMedico = detalleMedicoService.obtenerDetalleMedico(dto.getIdPersonal());

                    log.info("📋 Resultado de obtenerDetalleMedico: detalleMedico={}, es null? {}",
                        detalleMedico != null ? "Encontrado" : "NULL", detalleMedico == null);

                    if (detalleMedico != null) {
                        log.info("📋 Campos del médico: nombre={}, especialidad={}, idPers={}",
                            detalleMedico.getNombre(), detalleMedico.getPerPers(), detalleMedico.getIdPers());
                    }

                    if (detalleMedico != null && detalleMedico.getEspecialidad() != null) {
                        String especialidadMedico = detalleMedico.getEspecialidad();
                        solicitud.setEspecialidad(especialidadMedico);
                        log.warn("✅✅✅ ESPECIALIDAD DEL MÉDICO GUARDADA: {}", especialidadMedico);
                    } else {
                        log.warn("⚠️ No se encontró especialidad para el médico ID: {} (detalleMedico={})",
                            dto.getIdPersonal(), detalleMedico);
                    }
                } catch (Exception e) {
                    log.error("❌ ERROR CRITICO obteniendo especialidad del médico ID: {}", dto.getIdPersonal(), e);
                    log.error("❌ Stack trace completo: ", e);
                }

                // ✅ v1.47.0: Cuando se asigna un médico desde Gestión de Citas,
                // también asignar la gestora actual para que aparezca en "Mi Bandeja"
                String username = SecurityContextHolder.getContext().getAuthentication().getName();
                Usuario gestoraActual = usuarioRepository.findByNameUser(username)
                    .orElse(null);
                if (gestoraActual != null) {
                    solicitud.setResponsableGestoraId(gestoraActual.getIdUser());
                    log.info("✅ [SYNC] Asignando gestora (ID: {}, User: {}) a solicitud",
                        gestoraActual.getIdUser(), username);
                }
            } else {
                log.warn("⚠️  idPersonal es NULL o 0 - Limpiando campo en BD");
                solicitud.setIdPersonal(null);  // ✅ LIMPIAR
            }

            // Guardar cambios en BD
            log.info("💾 Guardando solicitud en BD...");
            solicitudRepository.save(solicitud);
            log.warn("✅✅✅ SOLICITUD ACTUALIZADA EXITOSAMENTE EN BD");

            // Construir respuesta segura (verificar nulls)
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Estado y cita actualizados exitosamente");
            response.put("idSolicitud", id);
            response.put("numeroSolicitud", solicitud.getNumeroSolicitud() != null ? solicitud.getNumeroSolicitud() : "");
            response.put("nuevoEstadoCodigo", dto.getNuevoEstadoCodigo());
            response.put("fechaAtencion", dto.getFechaAtencion());
            response.put("horaAtencion", dto.getHoraAtencion());
            response.put("idPersonal", dto.getIdPersonal());
            response.put("notas", dto.getNotas());
            
            log.warn("📤 Retornando response: {}", response);
            return ResponseEntity.ok(response);

        } catch (ResourceNotFoundException e) {
            log.error("❌ Recurso no encontrado: {}", e.getMessage());
            return ResponseEntity.status(404).body(
                Map.of("error", e.getMessage())
            );
        } catch (IllegalArgumentException e) {
            log.error("❌ Argumento inválido: {}", e.getMessage());
            return ResponseEntity.status(400).body(
                Map.of("error", e.getMessage())
            );
        } catch (Exception e) {
            log.error("❌ Error al actualizar estado y cita: ", e);
            return ResponseEntity.status(500).body(
                Map.of("error", "Error: " + e.getMessage())
            );
        }
    }

    /**
     * Actualiza los teléfonos (principal y/o alterno) de una solicitud
     * PUT /api/bolsas/solicitudes/{id}
     *
     * @param id ID de la solicitud
     * @param pacienteTelefono teléfono principal (puede ser null o blank)
     * @param pacienteTelefonoAlterno teléfono alterno (puede ser null o blank)
     * @return mensaje de éxito
     */
    @PutMapping("/{id}")
    @CheckMBACPermission(pagina = "/modulos/bolsas/solicitudes", accion = "actualizar")
    public ResponseEntity<?> actualizarTelefonos(
            @PathVariable Long id,
            @RequestParam(value = "pacienteTelefono", required = false) String pacienteTelefono,
            @RequestParam(value = "pacienteTelefonoAlterno", required = false) String pacienteTelefonoAlterno) {

        try {
            log.info("📱 Actualizando teléfonos de solicitud {} - Principal: {}, Alterno: {}",
                id, pacienteTelefono, pacienteTelefonoAlterno);

            solicitudBolsaService.actualizarTelefonos(id, pacienteTelefono, pacienteTelefonoAlterno);

            return ResponseEntity.ok(Map.of(
                "mensaje", "Teléfonos actualizados exitosamente",
                "idSolicitud", id,
                "telefonoPrincipal", pacienteTelefono != null ? pacienteTelefono : "",
                "telefonoAlterno", pacienteTelefonoAlterno != null ? pacienteTelefonoAlterno : ""
            ));

        } catch (Exception e) {
            log.error("Error al actualizar teléfonos: ", e);
            return ResponseEntity.badRequest().body(
                Map.of("error", "Error: " + e.getMessage())
            );
        }
    }

    /**
     * Elimina lógicamente una solicitud (soft delete)
     * DELETE /api/bolsas/solicitudes/{id}
     *
     * @param id ID de la solicitud
     * @return mensaje de éxito
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            log.info("Eliminando solicitud {}", id);
            solicitudBolsaService.eliminar(id);

            return ResponseEntity.ok(Map.of(
                "mensaje", "Solicitud eliminada exitosamente",
                "idSolicitud", id
            ));

        } catch (Exception e) {
            log.error("Error al eliminar solicitud: ", e);
            return ResponseEntity.badRequest().body(
                Map.of("error", "Error: " + e.getMessage())
            );
        }
    }

    /**
     * Cambia el tipo de bolsa de una solicitud
     * PATCH /api/bolsas/solicitudes/{id}/cambiar-bolsa
     * ⚠️ SOLO SUPERADMIN puede ejecutar esta operación
     *
     * @param id ID de la solicitud
     * @param idBolsaNueva ID del nuevo tipo de bolsa
     * @return solicitud actualizada
     */
    @PatchMapping("/{id}/cambiar-bolsa")
    public ResponseEntity<?> cambiarTipoBolsa(
            @PathVariable Long id,
            @RequestParam("idBolsaNueva") Long idBolsaNueva) {

        try {
            log.info("🔄 Cambiando tipo de bolsa para solicitud {} → Nueva bolsa: {}", id, idBolsaNueva);
            SolicitudBolsaDTO solicitudActualizada = solicitudBolsaService.cambiarTipoBolsa(id, idBolsaNueva);

            log.info("✅ Tipo de bolsa actualizado exitosamente");
            return ResponseEntity.ok(Map.of(
                "mensaje", "Tipo de bolsa actualizado exitosamente",
                "idSolicitud", id,
                "idBolsaNueva", idBolsaNueva,
                "solicitud", solicitudActualizada
            ));

        } catch (Exception e) {
            log.error("❌ Error al cambiar tipo de bolsa: ", e);
            return ResponseEntity.badRequest().body(
                Map.of("error", "Error: " + e.getMessage())
            );
        }
    }

    /**
     * Elimina múltiples solicitudes (soft delete en lote)
     * POST /api/bolsas/solicitudes/borrar
     *
     * @param payload Map con lista de IDs: {"ids": [1, 2, 3]}
     * @return estadísticas de borrado
     */
    @PostMapping("/borrar")
    public ResponseEntity<?> borrarMultiples(@RequestBody Map<String, Object> payload) {
        try {
            Object idsObj = payload.get("ids");
            if (idsObj == null) {
                log.warn("⚠️ Intento de borrado sin field 'ids'");
                return ResponseEntity.badRequest().body(
                    Map.of("error", "No se proporcionó el campo 'ids'")
                );
            }

            // Convertir ids a List<Long> de forma segura
            List<Long> ids = new ArrayList<>();
            if (idsObj instanceof List<?>) {
                for (Object obj : (List<?>) idsObj) {
                    if (obj instanceof Number) {
                        ids.add(((Number) obj).longValue());
                    } else if (obj instanceof String) {
                        try {
                            ids.add(Long.parseLong((String) obj));
                        } catch (NumberFormatException e) {
                            log.warn("⚠️ No se pudo parsear ID: {}", obj);
                        }
                    }
                }
            }

            if (ids.isEmpty()) {
                log.warn("⚠️ Intento de borrado sin IDs válidos");
                return ResponseEntity.badRequest().body(
                    Map.of("error", "No se proporcionaron IDs válidos para borrar")
                );
            }

            log.info("🗑️ Eliminando {} solicitudes: {}", ids.size(), ids);
            int totalBorrados = solicitudBolsaService.eliminarMultiples(ids);

            log.info("✅ {} solicitudes eliminadas exitosamente", totalBorrados);

            return ResponseEntity.ok(Map.of(
                "mensaje", totalBorrados + " solicitud(es) eliminada(s) exitosamente",
                "totalBorrados", totalBorrados,
                "ids", ids
            ));

        } catch (IllegalArgumentException e) {
            log.error("❌ Argumento inválido: ", e);
            return ResponseEntity.badRequest().body(
                Map.of("error", "Error: " + e.getMessage())
            );
        } catch (Exception e) {
            log.error("❌ Error al eliminar solicitudes: ", e);
            return ResponseEntity.status(500).body(
                Map.of("error", "Error interno del servidor: " + e.getMessage())
            );
        }
    }

    /**
     * Actualizar teléfonos del paciente en una solicitud
     * PATCH /api/bolsas/solicitudes/{id}/actualizar-telefonos
     *
     * @param id ID de la solicitud
     * @param body { pacienteTelefono, pacienteTelefonoAlterno }
     * @return Solicitud actualizada
     */
    @PatchMapping("/{id}/actualizar-telefonos")
    public ResponseEntity<?> actualizarTelefonos(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            log.info("📞 Actualizando teléfonos para solicitud ID: {}", id);

            String telefonoPrincipal = body.get("pacienteTelefono");
            String telefonoAlterno = body.get("pacienteTelefonoAlterno");

            // Validar que al menos uno esté presente
            if ((telefonoPrincipal == null || telefonoPrincipal.trim().isEmpty()) &&
                (telefonoAlterno == null || telefonoAlterno.trim().isEmpty())) {
                log.warn("⚠️ Intento de actualizar teléfonos sin proporcionar ninguno");
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Al menos uno de los teléfonos es requerido")
                );
            }

            // Obtener solicitud actual
            SolicitudBolsa solicitud = solicitudRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud no encontrada"));

            // Actualizar teléfonos
            solicitud.setPacienteTelefono(telefonoPrincipal != null ? telefonoPrincipal.trim() : "");
            solicitud.setPacienteTelefonoAlterno(telefonoAlterno != null ? telefonoAlterno.trim() : "");

            // Guardar cambios
            solicitudRepository.save(solicitud);

            log.info("✅ Teléfonos actualizados para solicitud {}", id);

            return ResponseEntity.ok(Map.of(
                "mensaje", "Teléfonos actualizados correctamente",
                "solicitud", SolicitudBolsaDTO.builder()
                    .idSolicitud(solicitud.getIdSolicitud())
                    .pacienteTelefono(solicitud.getPacienteTelefono())
                    .pacienteTelefonoAlterno(solicitud.getPacienteTelefonoAlterno())
                    .build()
            ));

        } catch (ResourceNotFoundException e) {
            log.error("❌ Solicitud no encontrada: {}", e.getMessage());
            return ResponseEntity.status(404).body(
                Map.of("error", e.getMessage())
            );
        } catch (Exception e) {
            log.error("❌ Error actualizando teléfonos: ", e);
            return ResponseEntity.status(500).body(
                Map.of("error", "Error al actualizar teléfonos: " + e.getMessage())
            );
        }
    }

    /**
     * 🔎 Obtiene todas las especialidades únicas pobladas
     * GET /api/bolsas/solicitudes/especialidades
     * v1.42.0: Para llenar dinámicamente el dropdown de filtro de especialidades
     * Cualquier usuario autenticado puede acceder (es solo lectura de datos públicos)
     *
     * @return lista de especialidades únicas ordenadas alfabéticamente
     */
    @GetMapping("/especialidades")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> obtenerEspecialidadesUnicas() {
        try {
            log.info("🔍 Obteniendo especialidades únicas para filtro...");
            List<String> especialidades = solicitudBolsaService.obtenerEspecialidadesUnicas();
            log.info("✅ Especialidades obtenidas: {}", especialidades.size());

            return ResponseEntity.ok(Map.of(
                "total", especialidades.size(),
                "especialidades", especialidades,
                "mensaje", especialidades.isEmpty()
                    ? "No hay especialidades disponibles"
                    : especialidades.size() + " especialidad(es) encontrada(s)"
            ));
        } catch (Exception e) {
            log.error("❌ Error obteniendo especialidades: ", e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error al obtener especialidades",
                "mensaje", e.getMessage()
            ));
        }
    }

    /**
     * Exporta solicitudes asignadas (Mi Bandeja) de la gestora actual a EXCEL
     * GET /api/bolsas/solicitudes/exportar-asignados
     *
     * @param ids lista opcional de IDs específicos a exportar
     * @return archivo EXCEL con todas las columnas de la tabla
     */
    @GetMapping("/exportar-asignados")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> exportarAsignados(
            @RequestParam(value = "ids", required = false) String ids) {
        try {
            log.info("📄 Exportando solicitudes asignadas a EXCEL");

            List<Long> idsList = new ArrayList<>();
            if (ids != null && !ids.isEmpty()) {
                // Parsear los IDs del parámetro (formato: "1,2,3")
                idsList = java.util.Arrays.stream(ids.split(","))
                    .map(String::trim)
                    .map(Long::parseLong)
                    .toList();
                log.info("✅ Exportando {} solicitudes específicas", idsList.size());
            } else {
                // Si no se especifican IDs, exportar todas las asignadas a la gestora actual
                idsList = solicitudBolsaService.obtenerSolicitudesAsignadasAGestora()
                    .stream()
                    .map(SolicitudBolsaDTO::getIdSolicitud)
                    .toList();
                log.info("✅ Exportando {} solicitudes asignadas a la gestora actual", idsList.size());
            }

            if (idsList.isEmpty()) {
                log.warn("⚠️ No hay solicitudes para exportar");
                return ResponseEntity.badRequest().body("No hay solicitudes para exportar".getBytes());
            }

            // Obtener datos en formato EXCEL
            byte[] excelData = solicitudBolsaService.exportarExcelAsignados(idsList);

            return ResponseEntity.ok()
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .header("Content-Disposition", "attachment; filename=\"pacientes_asignados.xlsx\"")
                .body(excelData);
        } catch (Exception e) {
            log.error("❌ Error exportando solicitudes asignadas: ", e);
            return ResponseEntity.status(500).body(("Error: " + e.getMessage()).getBytes());
        }
    }

    /**
     * Crear solicitud adicional desde importación manual de gestora (v1.46.0)
     * POST /api/bolsas/solicitudes/crear-adicional
     *
     * @param request datos del paciente a importar
     * @param userDetails datos del usuario autenticado
     * @return solicitud creada
     */
    @PostMapping("/crear-adicional")
    @CheckMBACPermission(pagina = "/citas/gestion-asegurado", accion = "crear")
    public ResponseEntity<SolicitudBolsaDTO> crearSolicitudAdicional(
            @RequestBody @jakarta.validation.Valid CrearSolicitudAdicionalRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.info("📝 POST /api/bolsas/solicitudes/crear-adicional - DNI: {}", request.getPacienteDni());

        String username = userDetails != null ? userDetails.getUsername() : "Sistema";
        SolicitudBolsaDTO nuevaSolicitud = solicitudBolsaService.crearSolicitudAdicional(request, username);

        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaSolicitud);
    }

    /**
     * Buscar solicitudes por DNI de paciente (v1.46.0)
     * GET /api/bolsas/solicitudes/buscar-dni/{dni}
     *
     * @param dni documento de identidad del paciente
     * @return lista de solicitudes encontradas
     */
    @GetMapping("/buscar-dni/{dni}")
    @CheckMBACPermission(pagina = "/citas/gestion-asegurado", accion = "ver")
    public ResponseEntity<List<SolicitudBolsaDTO>> buscarPorDni(@PathVariable String dni) {
        log.info("🔍 GET /api/bolsas/solicitudes/buscar-dni/{}", dni);
        List<SolicitudBolsaDTO> solicitudes = solicitudBolsaService.buscarPorDni(dni);
        return ResponseEntity.ok(solicitudes);
    }

}



package com.styp.cenate.api.bolsas;

import com.styp.cenate.dto.bolsas.BolsaXGestoraDTO;
import com.styp.cenate.dto.bolsas.SolicitudBolsaDTO;
import com.styp.cenate.dto.bolsas.ActualizarEstadoCitaDTO;
import com.styp.cenate.dto.bolsas.CrearSolicitudAdicionalRequest;
import com.styp.cenate.dto.bolsas.CargaMasivaRequest;
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
import com.styp.cenate.repository.chatbot.SolicitudCitaRepository;
import com.styp.cenate.model.chatbot.SolicitudCita;
import com.styp.cenate.dto.bolsas.TrazabilidadBolsaResponseDTO;
import com.styp.cenate.service.bolsas.TrazabilidadBolsaService;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

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
    private final SolicitudCitaRepository solicitudCitaRepository; // v1.67.0: Para horas ocupadas
    private final TrazabilidadBolsaService trazabilidadBolsaService; // v1.75.0: Timeline de solicitud

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

            // ✅ Obtener el id_user del usuario logueado desde dim_usuarios
            Long idUserLogueado = null;
            try {
                var auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated()) {
                    String username = auth.getName();
                    Optional<Usuario> usuarioOpt = usuarioRepository.findByNameUser(username);
                    if (usuarioOpt.isPresent()) {
                        idUserLogueado = usuarioOpt.get().getIdUser();
                        log.info("👤 Usuario logueado: {} (id_user: {})", username, idUserLogueado);
                    } else {
                        log.warn("⚠️ Usuario autenticado '{}' no encontrado en dim_usuarios", username);
                    }
                }
            } catch (Exception e) {
                log.warn("⚠️ No se pudo obtener id_user del usuario logueado: {}", e.getMessage());
            }

            historial = HistorialCargaBolsas.builder()
                .nombreArchivo(file.getOriginalFilename())
                .hashArchivo(hashArchivo)
                .usuarioCarga(usuarioCarga)
                .idUser(idUserLogueado)
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
     * 🚀 v1.79.1: Obtiene TODOS los registros gestionados (para SolicitudesAtendidas)
     * GET /api/bolsas/solicitudes/gestionados
     *
     * Query optimizada sin subconsultas correlacionadas → mucho más rápido.
     * Devuelve lista completa; el filtrado/paginación se hace en el frontend (client-side).
     */
    @GetMapping("/gestionados")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> listarGestionados() {
        try {
            log.info("🚀 GET /api/bolsas/solicitudes/gestionados — carga optimizada");
            List<Object[]> rows = solicitudRepository.findAllGestionadosList();

            List<java.util.Map<String, Object>> result = rows.stream().map(r -> {
                java.util.Map<String, Object> m = new java.util.HashMap<>();
                m.put("id_solicitud",              r[0]);
                m.put("numero_solicitud",           r[1]);
                m.put("paciente_id",               r[2]);
                m.put("paciente_nombre",            r[3]);
                m.put("paciente_dni",               r[4]);
                m.put("especialidad",               r[5]);
                m.put("fecha_preferida_no_atendida",r[6]);
                m.put("tipo_documento",             r[7]);
                m.put("fecha_nacimiento",           r[8]);
                m.put("paciente_sexo",              r[9]);
                m.put("paciente_telefono",          r[10]);
                m.put("paciente_telefono_alterno",  r[11]);
                m.put("paciente_email",             r[12]);
                m.put("codigo_ipress",              r[13]);
                m.put("tipo_cita",                  r[14]);
                m.put("id_bolsa",                   r[15]);
                m.put("desc_tipo_bolsa",            r[16]);
                m.put("id_servicio",                r[17]);
                m.put("codigo_adscripcion",         r[18]);
                m.put("id_ipress",                  r[19]);
                m.put("estado",                     r[20]);
                m.put("cod_estado_cita",            r[21]);
                m.put("desc_estado_cita",           r[22]);
                m.put("fecha_solicitud",            r[23]);
                m.put("fecha_actualizacion",        r[24]);
                m.put("estado_gestion_citas_id",    r[25]);
                m.put("activo",                     r[26]);
                m.put("desc_ipress",                r[27]);
                m.put("desc_red",                   r[28]);
                m.put("desc_macro",                 r[29]);
                m.put("responsable_gestora_id",     r[30]);
                m.put("fecha_asignacion",           r[31]);
                m.put("fecha_cambio_estado",        r[32]);
                m.put("usuario_cambio_estado_id",   r[33]);
                m.put("nombre_usuario_cambio_estado", r[34]);
                m.put("fecha_atencion",             r[35]);
                m.put("hora_atencion",              r[36]);
                m.put("id_personal",                r[37]);
                m.put("condicion_medica",           r[38]);
                m.put("fecha_atencion_medica",      r[39]);
                m.put("nombre_medico_asignado",     r[40]);
                m.put("id_ipress_atencion",         r[41]);
                m.put("cod_ipress_atencion",        r[42]);
                m.put("desc_ipress_atencion",       r[43]);
                m.put("nombre_gestora",             r[44]);
                return m;
            }).collect(java.util.stream.Collectors.toList());

            log.info("✅ Gestionados cargados: {} registros", result.size());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("❌ Error en /gestionados: ", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
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
     * 🆕 Obtiene todas las solicitudes asignadas a enfermeras (para COORD. ENFERMERIA)
     * GET /api/bolsas/solicitudes/bandeja-enfermeria-coordinador
     *
     * Solo accesible para SUPERADMIN y COORD. ENFERMERIA
     * Retorna todos los pacientes donde id_personal corresponde a un usuario con rol ENFERMERIA
     */
    @GetMapping("/bandeja-enfermeria-coordinador")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'COORD. ENFERMERIA')")
    public ResponseEntity<?> obtenerBandejaEnfermeriaCoordinador() {
        try {
            log.info("👩‍⚕️ GET /api/bolsas/solicitudes/bandeja-enfermeria-coordinador");
            List<SolicitudBolsaDTO> solicitudes = solicitudBolsaService.obtenerBandejaEnfermeriaCoordinador();
            log.info("✅ Bandeja coord. enfermería: {} pacientes", solicitudes.size());
            return ResponseEntity.ok(Map.of(
                "total", solicitudes.size(),
                "solicitudes", solicitudes,
                "mensaje", solicitudes.isEmpty()
                    ? "No hay pacientes asignados a enfermeras"
                    : solicitudes.size() + " paciente(s) asignado(s) a enfermeras"
            ));
        } catch (Exception e) {
            log.error("❌ Error en bandeja-enfermeria-coordinador: ", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtiene todas las solicitudes activas CON PAGINACIÓN
     * GET /api/bolsas/solicitudes?page=0&size=100
     *
     * @param pageable información de paginación (default: 100 registros para alinear con frontend)
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
            @RequestParam(required = false) String ipressAtencion,
            @RequestParam(required = false) String tipoCita,
            @RequestParam(required = false) String asignacion,
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String fechaInicio,
            @RequestParam(required = false) String fechaFin,
            @RequestParam(required = false) String condicionMedica,
            @RequestParam(required = false) Long gestoraId,
            @RequestParam(required = false) String estadoBolsa,
            @RequestParam(required = false) String categoriaEspecialidad,
            @RequestParam(required = false) String estrategia,
            @PageableDefault(size = 100, page = 0) Pageable pageable) {

        // Si hay algún filtro, usar búsqueda con filtros
        if (bolsa != null || macrorregion != null || red != null || ipress != null ||
            especialidad != null || estado != null || ipressAtencion != null || tipoCita != null ||
            asignacion != null || busqueda != null || fechaInicio != null || fechaFin != null ||
            condicionMedica != null || gestoraId != null || estadoBolsa != null || categoriaEspecialidad != null ||
            estrategia != null) {
            log.info("🔍 Solicitud con filtros - Especialidad: {}, Categoria: {}, Estrategia: {}", especialidad, categoriaEspecialidad, estrategia);
            return ResponseEntity.ok(solicitudBolsaService.listarConFiltros(
                    bolsa, macrorregion, red, ipress, especialidad, estado, ipressAtencion, tipoCita, asignacion, busqueda, fechaInicio, fechaFin, condicionMedica, gestoraId, estadoBolsa, categoriaEspecialidad, estrategia, pageable));
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
    public ResponseEntity<?> obtenerMedicosPorEspecialidad(@RequestParam String especialidad) {
        log.info("📥 POST /api/bolsas/solicitudes/fetch-doctors-by-specialty?especialidad={}", especialidad);

        try {
            // 1. Buscar el ID de la especialidad por nombre (case-insensitive)
            //    Primero intenta match exacto; si no encuentra, usa LIKE (contiene)
            Optional<Especialidad> especialidadOpt = especialidadRepository
                    .findByDescServicioIgnoreCase(especialidad);

            if (especialidadOpt.isEmpty()) {
                log.info("🔍 Match exacto no encontrado para '{}', intentando búsqueda LIKE...", especialidad);
                List<Especialidad> listaLike = especialidadRepository
                        .findByDescServicioContainingIgnoreCase(especialidad);
                if (!listaLike.isEmpty()) {
                    especialidadOpt = Optional.of(listaLike.get(0));
                    log.info("✅ Match LIKE encontrado: '{}'", especialidadOpt.get().getDescServicio());
                } else {
                    // Fallback: búsqueda sin acentos (Enfermería = ENFERMERIA)
                    List<Especialidad> sinAcentos = especialidadRepository
                            .buscarPorNombreSinAcentos(especialidad);
                    if (!sinAcentos.isEmpty()) {
                        especialidadOpt = Optional.of(sinAcentos.get(0));
                        log.info("✅ Match sin acentos encontrado: '{}'", especialidadOpt.get().getDescServicio());
                    }
                }
            }

            if (especialidadOpt.isEmpty()) {
                log.warn("⚠️ Especialidad no encontrada en DB: '{}'", especialidad);
                return ResponseEntity.ok()
                        .body(Map.of("status", "success", "data", Collections.emptyList()));
            }

            Long idServicio = especialidadOpt.get().getIdServicio();

            // 2. Obtener médicos usando el servicio existente
            List<DetalleMedicoDTO> medicos = detalleMedicoService
                    .obtenerMedicosPorServicio(idServicio);

            // 2b. Fallback por profesión: si no hay médicos por id_servicio,
            //     buscar por per_pers (ej: "NUTRICION" → encuentra "NUTRICIONISTA")
            if (medicos.isEmpty()) {
                log.info("⚠️ 0 médicos encontrados por id_servicio={} para '{}'. Buscando por profesión (per_pers)...",
                        idServicio, especialidad);
                medicos = detalleMedicoService.obtenerMedicosPorProfesion(especialidad);
                log.info("   → Fallback per_pers encontró {} médico(s)", medicos.size());
            }

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
     * v1.67.0: Obtener horas ocupadas de un profesional en una fecha
     * GET /api/bolsas/solicitudes/horas-ocupadas?idPersonal=123&fecha=2026-02-25
     *
     * Consulta dim_solicitud_bolsa + solicitud_cita para obtener todas las horas ya reservadas
     * @param idPersonal ID del profesional de salud
     * @param fecha fecha en formato yyyy-MM-dd
     * @return { "horasOcupadas": ["08:00", "09:30", "14:00"] }
     */
    @GetMapping("/horas-ocupadas")
    public ResponseEntity<?> obtenerHorasOcupadas(
            @RequestParam Long idPersonal,
            @RequestParam String fecha) {
        log.info("🕐 GET /horas-ocupadas idPersonal={} fecha={}", idPersonal, fecha);
        try {
            LocalDate fechaDate = LocalDate.parse(fecha);
            DateTimeFormatter hhmm = DateTimeFormatter.ofPattern("HH:mm");
            java.util.Set<String> horas = new java.util.TreeSet<>();

            // 1. Horas de dim_solicitud_bolsa (fecha_atencion + hora_atencion)
            List<SolicitudBolsa> bolsas = solicitudRepository
                    .findByIdPersonalAndFechaAtencionAndActivoTrue(idPersonal, fechaDate);
            for (SolicitudBolsa b : bolsas) {
                if (b.getHoraAtencion() != null) {
                    horas.add(b.getHoraAtencion().format(hhmm));
                }
            }

            // 2. Horas de solicitud_cita (fecha_cita + hora_cita)
            List<SolicitudCita> citas = solicitudCitaRepository
                    .findByPersonal_IdPersAndFechaCita(idPersonal, fechaDate);
            for (SolicitudCita c : citas) {
                if (c.getHoraCita() != null) {
                    horas.add(c.getHoraCita().format(hhmm));
                }
            }

            log.info("✅ {} horas ocupadas para personal {} en {}", horas.size(), idPersonal, fecha);
            return ResponseEntity.ok(Map.of("horasOcupadas", horas));
        } catch (Exception e) {
            log.error("❌ Error obteniendo horas ocupadas: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", "Error al obtener horas ocupadas"));
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
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORD. GESTION CITAS', 'GESTOR DE CITAS')")
    //@CheckMBACPermission(pagina = "/modulos/bolsas/bolsa-x-medico", accion = "asignar")
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

            // ✅ VALIDACIÓN 1: Si está en CITADO, solo permitir si el nuevo estado también es CITADO
            Long estadoGestionCitasId = solicitud.getEstadoGestionCitasId();
            if (estadoGestionCitasId != null) {
                DimEstadosGestionCitas estadoActual = estadosRepository.findById(estadoGestionCitasId).orElse(null);
                if (estadoActual != null && "CITADO".equalsIgnoreCase(estadoActual.getCodigoEstado())) {
                    // Si está en CITADO y quiere cambiar a otro estado → Bloquear
                    if (!("CITADO".equalsIgnoreCase(dto.getNuevoEstadoCodigo()))) {
                        log.warn("❌ VALIDACIÓN FALLIDA: Solicitud {} está CITADO, no puede cambiar a {}", id, dto.getNuevoEstadoCodigo());
                        return ResponseEntity.status(400).body(
                            Map.of(
                                "error", "No se puede cambiar estado",
                                "mensaje", "El paciente está CITADO. No se permite cambiar el estado. Solo se puede actualizar fecha, hora o médico de la cita.",
                                "estado_actual", "CITADO",
                                "idSolicitud", id
                            )
                        );
                    }
                }
            }

            // ✅ VALIDACIÓN 2: Campo estado - Bloquear solo si es ATENDIDO
            if ("ATENDIDO".equalsIgnoreCase(solicitud.getEstado())) {
                log.warn("❌ VALIDACIÓN FALLIDA: Solicitud {} tiene estado=ATENDIDO - No se puede cambiar", id);
                return ResponseEntity.status(400).body(
                    Map.of(
                        "error", "No se puede cambiar estado",
                        "mensaje", "La solicitud ya fue atendida (estado=ATENDIDO). No se permite realizar cambios.",
                        "estado_actual", "ATENDIDO",
                        "idSolicitud", id
                    )
                );
            }

            // ✅ v1.65.0: Actualizar condicion_medica y estado según el nuevo estado
            if ("CITADO".equalsIgnoreCase(dto.getNuevoEstadoCodigo())) {
                log.warn("🔄 Estado es CITADO - Actualizando condicion_medica a 'Pendiente'");
                solicitud.setCondicionMedica("Pendiente");
                solicitud.setEstado("PENDIENTE");
            } else if ("APAGADO".equalsIgnoreCase(dto.getNuevoEstadoCodigo()) ||
                       "NO_CONTESTA".equalsIgnoreCase(dto.getNuevoEstadoCodigo()) ||
                       "NO_GRUPO_ETARIO".equalsIgnoreCase(dto.getNuevoEstadoCodigo()) ||
                       "REPROG_FALLIDA".equalsIgnoreCase(dto.getNuevoEstadoCodigo())) {
                log.warn("🔄 Estado es {} - Limpiando condicion_medica (null)", dto.getNuevoEstadoCodigo());
                solicitud.setCondicionMedica(null);
                solicitud.setEstado("PENDIENTE");
            } else if ("ATENDIDO_IPRESS".equalsIgnoreCase(dto.getNuevoEstadoCodigo()) ||
                       "HC_BLOQUEADA".equalsIgnoreCase(dto.getNuevoEstadoCodigo()) ||
                       "NO_DESEA".equalsIgnoreCase(dto.getNuevoEstadoCodigo()) ||
                       "PARTICULAR".equalsIgnoreCase(dto.getNuevoEstadoCodigo()) ||
                       "NUM_NO_EXISTE".equalsIgnoreCase(dto.getNuevoEstadoCodigo()) ||
                       "NO_IPRESS_CENATE".equalsIgnoreCase(dto.getNuevoEstadoCodigo()) ||
                       "SIN_VIGENCIA".equalsIgnoreCase(dto.getNuevoEstadoCodigo()) ||
                       "TEL_SIN_SERVICIO".equalsIgnoreCase(dto.getNuevoEstadoCodigo()) ||
                       "YA_NO_REQUIERE".equalsIgnoreCase(dto.getNuevoEstadoCodigo())) {
                log.warn("🔄 Estado es {} - Limpiando condicion_medica (null) y actualizando campo estado a OBSERVADO", dto.getNuevoEstadoCodigo());
                solicitud.setCondicionMedica(null);
                solicitud.setEstado("OBSERVADO"); // Actualizar el campo estado directamente a OBSERVADO
            } else {
                log.info("ℹ️ Estado es {} - condicion_medica se mantiene como estaba", dto.getNuevoEstadoCodigo());
            }

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
    @CheckMBACPermission(pagina = "/modulos/bolsas/bolsa-x-medico", accion = "actualizar")
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
     * Actualiza la fecha preferida de una solicitud
     * PATCH /api/bolsas/solicitudes/{id}/fecha-preferida?fecha=2026-03-15
     */
    @PatchMapping("/{id}/fecha-preferida")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'COORD. GESTION CITAS', 'GESTOR DE CITAS', 'COORD. ENFERMERIA')")
    public ResponseEntity<?> actualizarFechaPreferida(
            @PathVariable Long id,
            @RequestParam(value = "fecha", required = false) String fechaStr) {
        try {
            java.time.LocalDate fecha = (fechaStr != null && !fechaStr.isBlank())
                ? java.time.LocalDate.parse(fechaStr)
                : null;
            log.info("📅 PATCH fecha-preferida solicitud {} → {}", id, fecha);
            solicitudBolsaService.actualizarFechaPreferida(id, fecha);
            return ResponseEntity.ok(Map.of(
                "mensaje", "Fecha preferida actualizada exitosamente",
                "idSolicitud", id,
                "fechaPreferida", fechaStr != null ? fechaStr : ""
            ));
        } catch (Exception e) {
            log.error("Error al actualizar fecha preferida: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Error: " + e.getMessage()));
        }
    }

    /**
     * ✅ v1.105.0: Actualiza la IPRESS de Atención de una solicitud
     * PATCH /api/bolsas/solicitudes/{id}/ipress-atencion
     */
    @PatchMapping("/{id}/ipress-atencion")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORD. GESTION CITAS', 'GESTOR DE CITAS')")
    public ResponseEntity<?> actualizarIpressAtencion(
            @PathVariable Long id,
            @RequestParam(value = "idIpressAtencion", required = false) Long idIpressAtencion) {
        try {
            log.info("🏥 PATCH ipress-atencion solicitud {} → idIpress: {}", id, idIpressAtencion);
            solicitudBolsaService.actualizarIpressAtencion(id, idIpressAtencion);
            return ResponseEntity.ok(Map.of(
                "mensaje", "IPRESS de Atención actualizada exitosamente",
                "idSolicitud", id,
                "idIpressAtencion", idIpressAtencion != null ? idIpressAtencion : ""
            ));
        } catch (Exception e) {
            log.error("Error al actualizar IPRESS Atención: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Error: " + e.getMessage()));
        }
    }

    /**
     * Actualiza la IPRESS de Adscripción (id_ipress) de una solicitud
     * PATCH /api/bolsas/solicitudes/{id}/ipress-adscripcion
     */
    @PatchMapping("/{id}/ipress-adscripcion")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORD. GESTION CITAS', 'COORDINADOR', 'GESTOR DE CITAS')")
    public ResponseEntity<?> actualizarIpressAdscripcion(
            @PathVariable Long id,
            @RequestParam(value = "idIpress", required = false) Long idIpress) {
        try {
            log.info("🏥 PATCH ipress-adscripcion solicitud {} → idIpress: {}", id, idIpress);
            solicitudBolsaService.actualizarIpressAdscripcion(id, idIpress);
            return ResponseEntity.ok(Map.of(
                "mensaje", "IPRESS de Adscripción actualizada exitosamente",
                "idSolicitud", id,
                "idIpress", idIpress != null ? idIpress : ""
            ));
        } catch (Exception e) {
            log.error("Error al actualizar IPRESS Adscripción: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Error: " + e.getMessage()));
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
     * Devuelve múltiples solicitudes al estado PENDIENTE_CITA con motivo de devolución (v1.81.5)
     * POST /api/bolsas/solicitudes/devolver-a-pendientes
     * Body: { "ids": [1,2,3], "motivo": "texto del motivo" }
     */
    @PostMapping("/devolver-a-pendientes")
    public ResponseEntity<?> devolverAPendientes(@RequestBody Map<String, Object> payload) {
        try {
            Object idsObj = payload.get("ids");
            String motivo = payload.get("motivo") instanceof String m ? m.trim() : "";

            if (idsObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No se proporcionó el campo 'ids'"));
            }
            if (motivo.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El motivo de devolución es obligatorio"));
            }

            List<Long> ids = new ArrayList<>();
            if (idsObj instanceof List<?>) {
                for (Object obj : (List<?>) idsObj) {
                    if (obj instanceof Number) ids.add(((Number) obj).longValue());
                    else if (obj instanceof String) { try { ids.add(Long.parseLong((String) obj)); } catch (NumberFormatException ignored) {} }
                }
            }

            if (ids.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No se proporcionaron IDs válidos"));
            }

            log.info("↩️ Devolviendo {} solicitudes a PENDIENTE | motivo: {}", ids.size(), motivo);
            int actualizados = solicitudBolsaService.devolverAPendientes(ids, motivo);

            return ResponseEntity.ok(Map.of(
                "mensaje", actualizados + " solicitud(es) devuelta(s) a pendientes exitosamente",
                "actualizados", actualizados,
                "ids", ids
            ));

        } catch (Exception e) {
            log.error("❌ Error al devolver solicitudes a pendientes: ", e);
            return ResponseEntity.status(500).body(Map.of("error", "Error interno: " + e.getMessage()));
        }
    }

    /**
     * Marca múltiples solicitudes como RECHAZADO en una sola operación (bulk)
     * POST /api/bolsas/solicitudes/rechazar-masivo
     *
     * Body: { "ids": [1, 2, 3] }
     * Response: { "actualizados": 3 }
     *
     * Roles permitidos: cualquier usuario autenticado con acceso al módulo de citas
     */
    @PostMapping("/rechazar-masivo")
    public ResponseEntity<?> rechazarMasivo(@RequestBody Map<String, Object> payload) {
        try {
            Object idsObj = payload.get("ids");
            if (idsObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No se proporcionó el campo 'ids'"));
            }

            List<Long> ids = new ArrayList<>();
            if (idsObj instanceof List<?>) {
                for (Object obj : (List<?>) idsObj) {
                    if (obj instanceof Number) {
                        ids.add(((Number) obj).longValue());
                    } else if (obj instanceof String) {
                        try { ids.add(Long.parseLong((String) obj)); }
                        catch (NumberFormatException e) { log.warn("⚠️ No se pudo parsear ID: {}", obj); }
                    }
                }
            }

            if (ids.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No se proporcionaron IDs válidos para rechazar"));
            }

            String motivo = payload.get("motivo") instanceof String m ? m.trim() : null;

            log.info("❌ Anulando {} solicitudes: {} | motivo: {}", ids.size(), ids, motivo);
            int actualizados = (motivo != null && !motivo.isEmpty())
                ? solicitudBolsaService.rechazarMasivoConMotivo(ids, motivo)
                : solicitudBolsaService.rechazarMasivo(ids);

            log.info("✅ {} solicitudes marcadas como RECHAZADO", actualizados);
            return ResponseEntity.ok(Map.of("actualizados", actualizados));

        } catch (RuntimeException e) {
            log.error("❌ Error al rechazar solicitudes: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Error inesperado al rechazar solicitudes: ", e);
            return ResponseEntity.status(500).body(Map.of("error", "Error interno del servidor"));
        }
    }

    /**
     * Asigna una gestora a múltiples solicitudes en una sola operación (bulk)
     * POST /api/bolsas/solicitudes/asignar-gestora-masivo
     *
     * Body: { "ids": [1, 2, 3, ...], "idGestora": 5 }
     * Response: { "actualizados": 47, "gestoraNombre": "Apellido, Nombre" }
     *
     * Roles permitidos: SUPERADMIN, ADMIN, COORD. GESTION CITAS, GESTOR DE CITAS
     */
    @PostMapping("/asignar-gestora-masivo")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORD. GESTION CITAS', 'GESTOR DE CITAS', 'COORD. ESPECIALIDADES', 'COORDINADOR')")
    public ResponseEntity<?> asignarGestoraMasivo(@RequestBody Map<String, Object> payload) {
        try {
            Object idsObj = payload.get("ids");
            Object idGestoraObj = payload.get("idGestora");

            if (idsObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No se proporcionó el campo 'ids'"));
            }
            if (idGestoraObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No se proporcionó el campo 'idGestora'"));
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
                        } catch (NumberFormatException ex) {
                            log.warn("⚠️ No se pudo parsear ID: {}", obj);
                        }
                    }
                }
            }

            if (ids.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No se proporcionaron IDs válidos"));
            }

            Long idGestora = idGestoraObj instanceof Number
                ? ((Number) idGestoraObj).longValue()
                : Long.parseLong(idGestoraObj.toString());

            log.info("👥 [BULK] Asignando gestora {} a {} solicitudes", idGestora, ids.size());
            int actualizados = solicitudBolsaService.asignarGestoraMasivo(ids, idGestora);
            log.info("✅ [BULK] {} solicitudes asignadas a gestora {}", actualizados, idGestora);

            return ResponseEntity.ok(Map.of(
                "mensaje", actualizados + " solicitud(es) asignada(s) exitosamente",
                "actualizados", actualizados
            ));

        } catch (com.styp.cenate.exception.ResourceNotFoundException e) {
            log.error("❌ Recurso no encontrado: ", e);
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (com.styp.cenate.exception.ValidationException e) {
            log.error("❌ Error de validación: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Error en asignación masiva: ", e);
            return ResponseEntity.status(500).body(Map.of("error", "Error interno: " + e.getMessage()));
        }
    }

    /**
     * Sincroniza teléfonos vacíos desde la tabla asegurados hacia dim_solicitud_bolsa.
     * POST /api/bolsas/solicitudes/sincronizar-telefonos
     */
    @PostMapping("/sincronizar-telefonos")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'COORD. GESTION CITAS', 'GESTOR DE CITAS')")
    public ResponseEntity<?> sincronizarTelefonos() {
        log.info("📞 Ejecutando sincronización de teléfonos desde asegurados → dim_solicitud_bolsa...");
        var resultado = solicitudBolsaService.sincronizarTelefonosDesdeAsegurados();
        return ResponseEntity.ok(resultado);
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
    public ResponseEntity<?> crearSolicitudAdicional(
            @RequestBody @jakarta.validation.Valid CrearSolicitudAdicionalRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.info("📝 POST /api/bolsas/solicitudes/crear-adicional - DNI: {}, Especialidad: {}", request.getPacienteDni(), request.getEspecialidad());

        // Regla: Un paciente PUEDE tener citas con diferentes especialidades en el mismo día.
        // Solo se bloquea si ya existe una asignación activa con LA MISMA especialidad
        // que NO esté en estado terminal (ATENDIDO, CANCELADO, DESERTOR, RESCATADO, RECHAZADO).
        java.util.List<com.styp.cenate.dto.bolsas.SolicitudBolsaDTO> existentes =
            solicitudBolsaService.buscarAsignacionesPorDni(request.getPacienteDni());

        java.util.Set<String> estadosTerminales = java.util.Set.of("ATENDIDO", "CANCELADO", "DESERTOR", "RESCATADO", "RECHAZADO", "NO ASISTIO");
        // IDs de estados de gestión que son terminales (2=BOLSA_ATENDIDO_IPRESS)
        // Cubre el caso donde sincronización actualizó estadoGestionCitasId pero aún no el campo estado
        java.util.Set<Long> gestionTerminales = java.util.Set.of(2L);
        String especialidadNueva = request.getEspecialidad() != null ? request.getEspecialidad().trim().toUpperCase() : "";

        existentes.stream()
            .filter(e -> e.getIdPersonal() != null)
            .filter(e -> {
                String estadoStr = e.getEstado() != null ? e.getEstado().toUpperCase() : "";
                boolean terminalPorEstado = estadosTerminales.contains(estadoStr);
                boolean terminalPorGestion = e.getEstadoGestionCitasId() != null
                        && gestionTerminales.contains(e.getEstadoGestionCitasId());
                return !terminalPorEstado && !terminalPorGestion;
            })
            .filter(e -> especialidadNueva.isEmpty() || especialidadNueva.equals(
                e.getEspecialidad() != null ? e.getEspecialidad().trim().toUpperCase() : ""))
            .findFirst()
            .ifPresent(existente -> {
                log.warn("⚠️ Paciente {} ya tiene cita activa en {}", request.getPacienteDni(), existente.getEspecialidad());
                throw new com.styp.cenate.exception.PacienteDuplicadoException(existente);
            });

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
    public ResponseEntity<List<SolicitudBolsaDTO>> buscarPorDni(@PathVariable String dni) {
        log.info("🔍 GET /api/bolsas/solicitudes/buscar-dni/{}", dni);
        List<SolicitudBolsaDTO> solicitudes = solicitudBolsaService.buscarPorDni(dni);
        return ResponseEntity.ok(solicitudes);
    }

    /**
     * Obtiene estadísticas de pacientes agrupados por gestora de citas
     * GET /api/bolsas/solicitudes/estadisticas/por-gestora
     *
     * Solo accesible para SUPERADMIN y COORD. GESTION CITAS
     *
     * @return lista de BolsaXGestoraDTO con conteos por estado por gestora
     */
    /**
     * Conteo de pacientes asignados por día para un mes dado
     * GET /api/bolsas/solicitudes/estadisticas/conteo-por-fecha?mes=YYYY-MM
     */
    @GetMapping("/estadisticas/conteo-por-fecha")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'COORD. GESTION CITAS', 'GESTOR DE CITAS')")
    public ResponseEntity<?> obtenerConteoPorFecha(
            @RequestParam(required = false) String mes) {
        try {
            if (mes == null || mes.isEmpty()) {
                mes = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM"));
            }
            log.info("📅 GET /api/bolsas/solicitudes/estadisticas/conteo-por-fecha mes={}", mes);
            var resultado = solicitudBolsaService.obtenerConteoPorFecha(mes);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("❌ Error al obtener conteo por fecha: ", e);
            return ResponseEntity.status(500).body(Map.of("error", "Error al obtener conteo por fecha"));
        }
    }

    /**
     * Estadísticas de pacientes agrupadas por médico asignado
     * GET /api/bolsas/solicitudes/estadisticas/por-medico
     */
    @GetMapping("/estadisticas/por-medico")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'COORD. GESTION CITAS', 'GESTOR DE CITAS')")
    public ResponseEntity<?> obtenerEstadisticasPorMedico(
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta) {
        try {
            log.info("📊 GET /api/bolsas/solicitudes/estadisticas/por-medico fechaDesde={} fechaHasta={}", fechaDesde, fechaHasta);
            var estadisticas = (fechaDesde != null || fechaHasta != null)
                ? solicitudBolsaService.obtenerEstadisticasPorMedico(fechaDesde, fechaHasta)
                : solicitudBolsaService.obtenerEstadisticasPorMedico();
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            log.error("❌ Error al obtener estadísticas por médico: ", e);
            return ResponseEntity.status(500).body(Map.of("error", "Error al obtener estadísticas por médico"));
        }
    }

    @GetMapping("/estadisticas/por-gestora")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'COORD. GESTION CITAS', 'GESTOR DE CITAS')")
    public ResponseEntity<?> obtenerEstadisticasPorGestora(
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta) {
        try {
            log.info("📊 GET /api/bolsas/solicitudes/estadisticas/por-gestora fechaDesde={} fechaHasta={}", fechaDesde, fechaHasta);
            List<BolsaXGestoraDTO> estadisticas = (fechaDesde != null || fechaHasta != null)
                ? solicitudBolsaService.obtenerEstadisticasPorGestora(fechaDesde, fechaHasta)
                : solicitudBolsaService.obtenerEstadisticasPorGestora();
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            log.error("❌ Error al obtener estadísticas por gestora: ", e);
            return ResponseEntity.status(500).body(Map.of("error", "Error al obtener estadísticas por gestora"));
        }
    }

    @GetMapping("/trazabilidad-recitas")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORD. ENFERMERIA', 'SOPORTE_TELEUE', 'ENFERMERIA')")
    public ResponseEntity<?> obtenerTrazabilidadRecitas(
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String fechaInicio,
            @RequestParam(required = false) String fechaFin,
            @RequestParam(required = false) String tipoCita,
            @RequestParam(required = false) Long idPersonal,
            @RequestParam(defaultValue = "desc")           String sortDir,
            @RequestParam(defaultValue = "fechaSolicitud") String sortField,
            @RequestParam(required = false) String especialidad,
            @RequestParam(required = false) String motivoInterconsulta,
            @RequestParam(required = false) String estadoBolsa,
            @RequestParam(required = false) String creadoPor,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "25") int size) {
        try {
            log.info("🔎 GET /api/bolsas/solicitudes/trazabilidad-recitas busqueda={} tipoCita={} idPersonal={} especialidad={} motivo={} estadoBolsa={} creadoPor={} sortField={} sortDir={}", busqueda, tipoCita, idPersonal, especialidad, motivoInterconsulta, estadoBolsa, creadoPor, sortField, sortDir);
            var pageable = org.springframework.data.domain.PageRequest.of(page, size);
            var resultado = solicitudBolsaService.obtenerTrazabilidadRecitas(
                busqueda, fechaInicio, fechaFin, tipoCita, idPersonal, sortDir, sortField,
                especialidad, motivoInterconsulta, estadoBolsa, creadoPor, pageable);
            return ResponseEntity.ok(Map.of(
                "solicitudes",  resultado.getContent(),
                "total",        resultado.getTotalElements(),
                "totalPaginas", resultado.getTotalPages(),
                "pagina",       page
            ));
        } catch (Exception e) {
            log.error("❌ Error trazabilidad recitas: ", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/trazabilidad-recitas/enfermeras")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORD. ENFERMERIA', 'SOPORTE_TELEUE', 'ENFERMERIA')")
    public ResponseEntity<?> listarEnfermerasTrazabilidad() {
        try {
            return ResponseEntity.ok(solicitudBolsaService.listarEnfermerasTrazabilidad());
        } catch (Exception e) {
            log.error("❌ Error listando enfermeras trazabilidad: ", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/trazabilidad-recitas/kpis")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORD. ENFERMERIA', 'SOPORTE_TELEUE', 'ENFERMERIA')")
    public ResponseEntity<?> obtenerKpisTrazabilidad() {
        try {
            return ResponseEntity.ok(solicitudBolsaService.obtenerKpisTrazabilidad());
        } catch (Exception e) {
            log.error("❌ Error KPIs trazabilidad: ", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Carga masiva de pacientes desde JSON (datos leídos del Excel en el frontend)
     * POST /api/bolsas/solicitudes/carga-masiva-pacientes
     *
     * Roles: SUPERADMIN, ADMIN, GESTOR DE CITAS, COORD. GESTION CITAS
     *
     * @param request datos del profesional + lista de pacientes
     * @return mapa con: total, insertados, duplicados, errores, detalleErrores
     */
    @PostMapping("/carga-masiva-pacientes")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'GESTOR DE CITAS', 'COORD. GESTION CITAS', 'SOPORTE_TELEUE')")
    public ResponseEntity<?> cargaMasivaPacientes(@RequestBody CargaMasivaRequest request) {
        try {
            log.info("📤 POST /api/bolsas/solicitudes/carga-masiva-pacientes - personal: {}, filas: {}",
                request.getIdPersonal(),
                request.getPacientes() != null ? request.getPacientes().size() : 0);
            var resultado = solicitudBolsaService.cargaMasivaPacientes(request);
            log.info("✅ Carga masiva completada - {}", resultado);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("❌ Error carga masiva: ", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/trazabilidad-recitas/fechas")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORD. ENFERMERIA', 'SOPORTE_TELEUE', 'ENFERMERIA')")
    public ResponseEntity<?> obtenerFechasConRecitas() {
        try {
            return ResponseEntity.ok(solicitudBolsaService.obtenerFechasConRecitas());
        } catch (Exception e) {
            log.error("❌ Error obteniendo fechas con recitas: ", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/trazabilidad-recitas/facetas")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORD. ENFERMERIA', 'SOPORTE_TELEUE', 'ENFERMERIA')")
    public ResponseEntity<?> listarFacetasRecitas() {
        try {
            return ResponseEntity.ok(solicitudBolsaService.listarFacetasRecitasInterconsultas());
        } catch (Exception e) {
            log.error("❌ Error obteniendo facetas recitas: ", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // =========================================================================
    // v1.75.0 — TRAZABILIDAD: timeline del ciclo de vida de una solicitud
    // =========================================================================

    /**
     * GET /api/bolsas/solicitudes/trazabilidad/{idSolicitud}
     * Devuelve el timeline completo: ingreso, asignación médico, cita, atención, anulación, recitas.
     */
    /**
     * GET /api/bolsas/solicitudes/agrupar-por-ipress-atencion
     * v1.84.2: Agrupación inteligente — GROUP BY server-side, solo transfiere {ipress, especialidad, ids[]}.
     * ~100x más rápido que cargar 9999 registros completos.
     */
    @GetMapping("/agrupar-por-ipress-atencion")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> agruparPorIpressAtencion(
            @RequestParam(required = false) String bolsa,
            @RequestParam(required = false) String macrorregion,
            @RequestParam(required = false) String red,
            @RequestParam(required = false) String ipress,
            @RequestParam(required = false) String especialidad,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String ipressAtencion,
            @RequestParam(required = false) String tipoCita,
            @RequestParam(required = false) String asignacion,
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String fechaInicio,
            @RequestParam(required = false) String fechaFin,
            @RequestParam(required = false) Long gestoraId,
            @RequestParam(required = false) String estadoBolsa,
            @RequestParam(required = false) String categoriaEspecialidad) {

        log.info("🧩 [v1.84.2] GET /agrupar-por-ipress-atencion categoría={}", categoriaEspecialidad);

        List<Object[]> rows = solicitudRepository.agruparPorIpressAtencionEspecialidad(
                bolsa, macrorregion, red, ipress, especialidad,
                estado, ipressAtencion, tipoCita, asignacion, busqueda,
                fechaInicio, fechaFin, gestoraId, estadoBolsa, categoriaEspecialidad);

        List<Map<String, Object>> result = rows.stream().map(r -> {
            String idsRaw = r[2] != null ? r[2].toString() : "";
            List<Long> ids = java.util.Arrays.stream(idsRaw.split(","))
                    .filter(s -> !s.isBlank())
                    .map(Long::parseLong)
                    .collect(java.util.stream.Collectors.toList());
            Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("ipress",      r[0]);
            m.put("especialidad", r[1]);
            m.put("total",       ids.size());
            m.put("grupos",      ids.size() / 4);
            m.put("ids",         ids);
            return m;
        }).collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/trazabilidad/{idSolicitud}")
    @Transactional(readOnly = true)
    public ResponseEntity<TrazabilidadBolsaResponseDTO> obtenerTrazabilidad(
            @PathVariable Long idSolicitud) {
        log.info("📋 [v1.75.0] GET /trazabilidad/{}", idSolicitud);
        return ResponseEntity.ok(trazabilidadBolsaService.obtenerTrazabilidad(idSolicitud));
    }

    /**
     * GET /api/bolsas/solicitudes/trazabilidad/por-dni/{dni}
     * v1.75.2: Obtiene el timeline de la solicitud más reciente activa para un DNI.
     * Utilizado por el botón "Ver historial" en módulos que solo conocen el DNI del paciente.
     */
    @GetMapping("/trazabilidad/por-dni/{dni}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> obtenerTrazabilidadPorDni(@PathVariable String dni) {
        log.info("📋 [v1.75.3] GET /trazabilidad/por-dni/{}", dni);
        // Busca primero la solicitud ORIGINAL (sin padre) para mostrar ciclo completo
        // con recitas/interconsultas como eventos derivados. Si no hay original activa,
        // cae al fallback de la más reciente.
        Optional<SolicitudBolsa> solicitud = solicitudRepository
                .findFirstByPacienteDniAndActivoTrueAndIdsolicitudgeneracionIsNullOrderByFechaSolicitudDesc(dni);
        if (solicitud.isEmpty()) {
            solicitud = solicitudRepository
                    .findFirstByPacienteDniAndActivoTrueOrderByFechaSolicitudDesc(dni);
        }
        return solicitud
                .map(s -> ResponseEntity.ok(trazabilidadBolsaService.obtenerTrazabilidad(s.getIdSolicitud())))
                .orElse(ResponseEntity.notFound().build());
    }

}



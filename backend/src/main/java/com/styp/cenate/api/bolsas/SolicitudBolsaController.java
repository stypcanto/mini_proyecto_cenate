package com.styp.cenate.api.bolsas;

import com.styp.cenate.dto.bolsas.SolicitudBolsaDTO;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import com.styp.cenate.repository.bolsas.DimEstadosGestionCitasRepository;
import com.styp.cenate.model.bolsas.DimEstadosGestionCitas;
import com.styp.cenate.exception.ResourceNotFoundException;

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
    public ResponseEntity<?> obtenerMiBandeja() {
        try {
            log.info("═══════════════════════════════════════════════════════════");
            log.info("📬 ENDPOINT: GET /api/bolsas/solicitudes/mi-bandeja");
            log.info("   Obteniendo solicitudes de la gestora actual (Mi Bandeja)...");

            // Obtener solicitudes asignadas a la gestora actual
            List<SolicitudBolsaDTO> solicitudes = solicitudBolsaService.obtenerSolicitudesAsignadasAGestora();

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
     * Lista solicitudes con soporte para FILTROS AVANZADOS (v2.6.0)
     * UX: Al usuario le basta seleccionar filtros y recibe resultados filtrados al instante
     *
     * @param idBolsa ID de bolsa (null o "todas" = todas las bolsas)
     * @param macrorregion descripción de macrorregión (null o "todas" = todas)
     * @param red descripción de red (null o "todas" = todas)
     * @param ipress descripción de IPRESS (null o "todas" = todas)
     * @param especialidad especialidad (null o "todas" = todas)
     * @param estadoId ID estado gestión citas (null = todos)
     * @param tipoCita tipo de cita (null o "todas" = todos)
     * @param busqueda búsqueda libre: paciente/DNI/IPRESS (null = ignorar)
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
            @RequestParam(required = false) String busqueda,
            @PageableDefault(size = 25, page = 0) Pageable pageable) {

        // Si hay algún filtro, usar búsqueda con filtros (v2.6.0)
        if (bolsa != null || macrorregion != null || red != null || ipress != null ||
            especialidad != null || estado != null || tipoCita != null || busqueda != null) {
            log.info("🔍 Solicitud con filtros - Bolsa: {}, Macro: {}, Red: {}, IPRESS: {}, Especialidad: {}, Estado: {}, TipoCita: {}, Búsqueda: {}",
                bolsa, macrorregion, red, ipress, especialidad, estado, tipoCita, busqueda);
            return ResponseEntity.ok(solicitudBolsaService.listarConFiltros(
                    bolsa, macrorregion, red, ipress, especialidad, estado, tipoCita, busqueda, pageable));
        }

        // Sin filtros, listar todas (comportamiento anterior)
        log.info("📋 Listando solicitudes sin filtros - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        return ResponseEntity.ok(solicitudBolsaService.listarTodasPaginado(pageable));
    }

    /**
     * Obtiene una solicitud por ID
     * GET /api/bolsas/solicitudes/{id}
     *
     * IMPORTANTE: Este endpoint DEBE estar al final para evitar capturar rutas específicas
     * @param id ID de la solicitud
     * @return solicitud encontrada o 404
     */
    @GetMapping("/{id}")
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
     * Roles permitidos: SUPERADMIN, ADMIN, COORDINADOR_GESTION_DE_CITAS
     *
     * @param id ID de la solicitud
     * @param idGestora ID de la gestora a asignar
     * @return mensaje de éxito
     */
    @PatchMapping("/{id}/asignar")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR_GESTION_DE_CITAS')")
    @CheckMBACPermission(pagina = "/modulos/bolsas/solicitudes", accion = "asignar")
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
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR GESTION DE CITAS', 'GESTOR DE CITAS')")
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
}

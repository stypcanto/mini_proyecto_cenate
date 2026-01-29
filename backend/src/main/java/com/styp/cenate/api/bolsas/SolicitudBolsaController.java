package com.styp.cenate.api.bolsas;

import com.styp.cenate.dto.bolsas.SolicitudBolsaDTO;
import com.styp.cenate.model.bolsas.HistorialCargaBolsas;
import com.styp.cenate.repository.bolsas.HistorialCargaBolsasRepository;
import com.styp.cenate.service.bolsas.SolicitudBolsaService;
import com.styp.cenate.security.mbac.CheckMBACPermission;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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
     * Obtiene todas las solicitudes activas
     * GET /api/bolsas/solicitudes
     * 
     * @return lista de solicitudes
     */
    @GetMapping
    public ResponseEntity<List<SolicitudBolsaDTO>> listarTodas() {
        log.info("Listando todas las solicitudes de bolsa");
        return ResponseEntity.ok(solicitudBolsaService.listarTodas());
    }

    /**
     * Obtiene una solicitud por ID
     * GET /api/bolsas/solicitudes/{id}
     * 
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
     * @param id ID de la solicitud
     * @param idGestora ID de la gestora a asignar
     * @return mensaje de éxito
     */
    @PatchMapping("/{id}/asignar")
    @CheckMBACPermission(pagina = "/modulos/bolsas/solicitudes", accion = "asignar")
    public ResponseEntity<?> asignarGestora(
            @PathVariable Long id,
            @RequestParam("idGestora") Long idGestora) {

        try {
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
     * @param id ID de la solicitud
     * @param nuevoEstadoId ID del nuevo estado (de dim_estados_gestion_citas)
     * @return mensaje de éxito
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Long id,
            @RequestParam("nuevoEstadoId") Long nuevoEstadoId) {

        try {
            log.info("Cambiando estado de solicitud {} a {}", id, nuevoEstadoId);
            solicitudBolsaService.cambiarEstado(id, nuevoEstadoId);

            return ResponseEntity.ok(Map.of(
                "mensaje", "Estado actualizado exitosamente",
                "idSolicitud", id,
                "nuevoEstadoId", nuevoEstadoId
            ));

        } catch (Exception e) {
            log.error("Error al cambiar estado: ", e);
            return ResponseEntity.badRequest().body(
                Map.of("error", "Error: " + e.getMessage())
            );
        }
    }

    /**
     * Obtiene lista de gestoras disponibles (usuarios con rol GESTOR_DE_CITAS)
     * GET /api/bolsas/solicitudes/gestoras-disponibles
     *
     * Retorna lista de usuarios activos con rol GESTOR_DE_CITAS para asignación
     * Usado en modal de asignación del frontend
     */
    @GetMapping("/gestoras-disponibles")
    public ResponseEntity<?> obtenerGestorasDisponibles() {
        try {
            log.info("👤 Obteniendo gestoras disponibles (rol GESTOR_DE_CITAS)...");

            // TODO: Implementar método en servicio para obtener gestoras
            // Por ahora retornar lista vacía
            List<Map<String, Object>> gestoras = new ArrayList<>();

            log.info("✅ Se encontraron {} gestoras disponibles", gestoras.size());

            return ResponseEntity.ok(Map.of(
                "total", gestoras.size(),
                "gestoras", gestoras,
                "mensaje", gestoras.isEmpty() ?
                    "No hay gestoras disponibles" :
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
}

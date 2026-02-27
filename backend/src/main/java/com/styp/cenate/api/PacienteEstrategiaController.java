package com.styp.cenate.api;

import com.styp.cenate.dto.AsignarEstrategiaRequest;
import com.styp.cenate.dto.BajaCenacronRequest;
import com.styp.cenate.dto.DesasignarEstrategiaRequest;
import com.styp.cenate.dto.PacienteEstrategiaResponse;
import com.styp.cenate.model.PacienteEstrategia;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.repository.PacienteEstrategiaRepository;
import com.styp.cenate.service.PacienteEstrategiaService;
import com.styp.cenate.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 📋 Controlador REST para gestionar asignación de estrategias a pacientes
 * Permite:
 * - Asignar estrategias a pacientes
 * - Desasignar/desvincular estrategias
 * - Consultar estrategias activas e historial
 * - Reportería de pacientes por estrategia
 *
 * Endpoints:
 * POST   /api/paciente-estrategia              - Asignar estrategia
 * PUT    /api/paciente-estrategia/{id}         - Desasignar estrategia
 * GET    /api/paciente-estrategia/{id}         - Obtener asignación específica
 * GET    /api/paciente-estrategia/paciente/{pk}/activas   - Estrategias activas
 * GET    /api/paciente-estrategia/paciente/{pk}/historial - Historial completo
 * GET    /api/paciente-estrategia/estrategia/{id}         - Pacientes de estrategia
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-06
 */
@RestController
@RequestMapping("/api/paciente-estrategia")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Paciente-Estrategia", description = "API para gestionar asignación de estrategias a pacientes")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://10.0.89.241:5173",
        "http://10.0.89.239:5173"
})
public class PacienteEstrategiaController {

    private final PacienteEstrategiaService pacienteEstrategiaService;
    private final UsuarioRepository usuarioRepository;
    private final PacienteEstrategiaRepository pacienteEstrategiaRepository;
    private final AseguradoRepository aseguradoRepository;

    /**
     * Asigna una estrategia a un paciente
     * POST /api/paciente-estrategia
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('MEDICO', 'ENFERMERIA', 'COORDINADOR', 'ADMIN', 'SUPERADMIN') or hasAnyAuthority('ROLE_COORD. GESTION CITAS', 'ROLE_COORDINADOR GESTION CITAS')")
    @Operation(summary = "Asignar estrategia a paciente",
            description = "Asigna una estrategia a un paciente. Solo permite una asignación ACTIVA por estrategia.")
    public ResponseEntity<Map<String, Object>> asignarEstrategia(
            @Valid @RequestBody AsignarEstrategiaRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            log.info("📝 Asignando estrategia {} al paciente {}",
                    request.getIdEstrategia(), request.getPkAsegurado());

            // Obtener ID del usuario del contexto de seguridad
            Long idUsuarioAsigno = null;
            if (userDetails != null) {
                // Buscar usuario por nombre de usuario
                com.styp.cenate.model.Usuario usuario = usuarioRepository.findByNameUser(userDetails.getUsername())
                        .orElse(null);
                if (usuario != null) {
                    idUsuarioAsigno = usuario.getIdUser();
                }
            }

            PacienteEstrategiaResponse response = pacienteEstrategiaService.asignarEstrategia(
                    request,
                    idUsuarioAsigno
            );

            Map<String, Object> resultado = new HashMap<>();
            resultado.put("success", true);
            resultado.put("data", response);
            resultado.put("message", "Estrategia asignada exitosamente");

            return ResponseEntity.status(HttpStatus.CREATED).body(resultado);

        } catch (IllegalArgumentException e) {
            log.warn("⚠️ Error de validación: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);

        } catch (Exception e) {
            log.error("❌ Error al asignar estrategia: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error interno del servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Da de baja a un paciente del programa CENACRON con auditoría del solicitante.
     * PUT /api/paciente-estrategia/baja-cenacron/{pkAsegurado}
     *
     * Diferencias respecto a /{id}/desasignar:
     * - Recibe el pkAsegurado (DNI/CIP) en lugar del id_asignacion numérico.
     * - Busca internamente la asignación ACTIVA por sigla 'CENACRON'.
     * - Registra el usuario autenticado como responsable del retiro (auditoría).
     * - Distingue semánticamente entre baja total y salida de especialidad.
     *
     * Tipos de baja:
     *   PROGRAMA_COMPLETO  → estado = INACTIVO  (el paciente abandona el programa)
     *   SOLO_ESPECIALIDAD  → estado = COMPLETADO (puede reingresarse a otra especialidad)
     *
     * @param pkAsegurado DNI o CIP del paciente asegurado
     * @param request     Tipo de baja y motivo clínico/administrativo
     * @param userDetails Principal de seguridad del usuario autenticado (para auditoría)
     */
    @PutMapping("/baja-cenacron/{pkAsegurado}")
    @PreAuthorize("hasAnyRole('MEDICO', 'ENFERMERIA', 'COORDINADOR', 'ADMIN', 'SUPERADMIN')")
    @Transactional
    @Operation(
        summary = "Dar de baja del programa CENACRON",
        description = "Desvincula a un paciente del programa CENACRON con registro de auditoría. " +
                      "Busca la asignación activa por sigla 'CENACRON'. " +
                      "PROGRAMA_COMPLETO → INACTIVO (baja definitiva). " +
                      "SOLO_ESPECIALIDAD → COMPLETADO (puede reingresarse)."
    )
    public ResponseEntity<Map<String, Object>> bajaCenacron(
            @PathVariable String pkAsegurado,
            @Valid @RequestBody BajaCenacronRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            log.info("Procesando baja CENACRON. Paciente: {}, TipoBaja: {}, UsuarioSolicita: {}",
                    pkAsegurado, request.getTipoBaja(),
                    userDetails != null ? userDetails.getUsername() : "desconocido");

            // 1. Buscar la asignación CENACRON activa del paciente (por sigla)
            PacienteEstrategia asignacion = pacienteEstrategiaRepository
                    .findAsignacionActivaPorSigla(pkAsegurado, "CENACRON")
                    .orElseThrow(() -> new IllegalArgumentException(
                            "El paciente no tiene una asignación CENACRON activa"
                    ));

            // 2. Resolver el usuario autenticado para registrar la auditoría
            Usuario usuarioDesvinculo = null;
            if (userDetails != null) {
                usuarioDesvinculo = usuarioRepository.findByNameUser(userDetails.getUsername())
                        .orElse(null);
                if (usuarioDesvinculo == null) {
                    log.warn("Usuario autenticado '{}' no encontrado en dim_usuarios. " +
                             "La baja se registrará sin auditor.", userDetails.getUsername());
                }
            }

            // 3. Determinar el nuevo estado según el tipo de baja
            //    PROGRAMA_COMPLETO → INACTIVO  (sale del programa, baja definitiva)
            //    SOLO_ESPECIALIDAD → COMPLETADO (sale de especialidad, puede reingresarse)
            String nuevoEstado = "PROGRAMA_COMPLETO".equals(request.getTipoBaja())
                    ? "INACTIVO"
                    : "COMPLETADO";

            // 4. Aplicar la desvinculación con auditoría completa
            asignacion.setEstado(nuevoEstado);
            asignacion.setFechaDesvinculacion(LocalDateTime.now());
            asignacion.setObservacionDesvinculacion(request.getMotivoBaja());
            asignacion.setUsuarioDesvinculo(usuarioDesvinculo);

            asignacion = pacienteEstrategiaRepository.save(asignacion);

            // Sincronizar paciente_cronico=false en asegurados al dar de baja
            log.info("🔄 Intentando actualizar paciente_cronico=false en asegurados. pkAsegurado recibido='{}'", pkAsegurado);
            int filas = aseguradoRepository.actualizarPacienteCronico(pkAsegurado, false);
            log.info("✅ paciente_cronico=false sincronizado en asegurados para '{}' ({} fila/s actualizada/s)", pkAsegurado, filas);
            if (filas == 0) {
                log.warn("⚠️ 0 filas actualizadas! No existe doc_paciente='{}' en tabla asegurados. " +
                         "Verificar si pk_asegurado ≠ doc_paciente.", pkAsegurado);
            }

            log.info("Baja CENACRON completada. Paciente: {}, NuevoEstado: {}, Auditor: {}",
                    pkAsegurado, nuevoEstado,
                    usuarioDesvinculo != null ? usuarioDesvinculo.getNombreCompleto() : "sin_auditor");

            // 5. Construir respuesta con datos de auditoría
            Map<String, Object> data = new HashMap<>();
            data.put("idAsignacion", asignacion.getIdAsignacion());
            data.put("pkAsegurado", asignacion.getPkAsegurado());
            data.put("estrategia", asignacion.getEstrategia().getSigla());
            data.put("estadoAnterior", "ACTIVO");
            data.put("estadoNuevo", asignacion.getEstado());
            data.put("tipoBaja", request.getTipoBaja());
            data.put("motivoBaja", asignacion.getObservacionDesvinculacion());
            data.put("fechaDesvinculacion", asignacion.getFechaDesvinculacion());
            data.put("usuarioDesvinculoNombre",
                    usuarioDesvinculo != null ? usuarioDesvinculo.getNombreCompleto() : null);
            data.put("idUsuarioDesvinculo",
                    usuarioDesvinculo != null ? usuarioDesvinculo.getIdUser() : null);

            String mensajeConfirmacion = "PROGRAMA_COMPLETO".equals(request.getTipoBaja())
                    ? "Paciente dado de baja del programa CENACRON exitosamente"
                    : "Paciente desvinculado de la especialidad CENACRON. Puede ser reingresado.";

            Map<String, Object> resultado = new HashMap<>();
            resultado.put("success", true);
            resultado.put("data", data);
            resultado.put("message", mensajeConfirmacion);

            return ResponseEntity.ok(resultado);

        } catch (IllegalArgumentException e) {
            log.warn("Baja CENACRON rechazada. Paciente: {}, Motivo: {}", pkAsegurado, e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);

        } catch (Exception e) {
            log.error("Error inesperado al procesar baja CENACRON. Paciente: {}", pkAsegurado, e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error interno del servidor al procesar la baja CENACRON");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Desasigna (desvincla) una estrategia de un paciente
     * PUT /api/paciente-estrategia/{id}/desasignar
     */
    @PutMapping("/{id}/desasignar")
    @PreAuthorize("hasAnyRole('MEDICO', 'ENFERMERIA', 'COORDINADOR', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "Desasignar estrategia de paciente",
            description = "Desvincla un paciente de una estrategia (INACTIVO o COMPLETADO)")
    public ResponseEntity<Map<String, Object>> desasignarEstrategia(
            @PathVariable Long id,
            @Valid @RequestBody DesasignarEstrategiaRequest request) {
        try {
            log.info("🔄 Desasignando estrategia con ID {}", id);

            PacienteEstrategiaResponse response = pacienteEstrategiaService.desasignarEstrategia(id, request);

            Map<String, Object> resultado = new HashMap<>();
            resultado.put("success", true);
            resultado.put("data", response);
            resultado.put("message", "Estrategia desasignada exitosamente");

            return ResponseEntity.ok(resultado);

        } catch (IllegalArgumentException e) {
            log.warn("⚠️ Error de validación: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);

        } catch (Exception e) {
            log.error("❌ Error al desasignar estrategia: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error interno del servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Obtiene una asignación específica por ID
     * GET /api/paciente-estrategia/{id}
     * Solo acepta IDs numéricos para evitar conflictos con otras rutas
     */
    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('MEDICO', 'ENFERMERIA', 'COORDINADOR', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "Obtener asignación específica",
            description = "Obtiene los detalles de una asignación por su ID")
    public ResponseEntity<Map<String, Object>> obtenerAsignacion(
            @PathVariable Long id) {
        try {
            log.info("🔍 Obteniendo asignación {}", id);

            PacienteEstrategiaResponse response = pacienteEstrategiaService.obtenerAsignacion(id);

            Map<String, Object> resultado = new HashMap<>();
            resultado.put("success", true);
            resultado.put("data", response);

            return ResponseEntity.ok(resultado);

        } catch (IllegalArgumentException e) {
            log.warn("⚠️ Asignación no encontrada: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);

        } catch (Exception e) {
            log.error("❌ Error al obtener asignación: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error interno del servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Obtiene todas las estrategias activas de un paciente
     * GET /api/paciente-estrategia/paciente/{pkAsegurado}/activas
     */
    @GetMapping("/paciente/{pkAsegurado}/activas")
    @PreAuthorize("hasAnyRole('MEDICO', 'ENFERMERIA', 'COORDINADOR', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "Obtener estrategias activas de paciente",
            description = "Retorna lista de estrategias ACTIVAS asignadas a un paciente")
    public ResponseEntity<Map<String, Object>> obtenerEstrategiasActivas(
            @PathVariable String pkAsegurado) {
        try {
            log.info("📋 Obteniendo estrategias activas del paciente {}", pkAsegurado);

            List<PacienteEstrategiaResponse> respuestas = pacienteEstrategiaService
                    .obtenerEstrategiasActivas(pkAsegurado);

            Map<String, Object> resultado = new HashMap<>();
            resultado.put("success", true);
            resultado.put("data", respuestas);
            resultado.put("total", respuestas.size());

            return ResponseEntity.ok(resultado);

        } catch (Exception e) {
            log.error("❌ Error al obtener estrategias activas: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error interno del servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Obtiene el historial completo de estrategias de un paciente
     * GET /api/paciente-estrategia/paciente/{pkAsegurado}/historial
     */
    @GetMapping("/paciente/{pkAsegurado}/historial")
    @PreAuthorize("hasAnyRole('MEDICO', 'ENFERMERIA', 'COORDINADOR', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "Obtener historial de estrategias",
            description = "Retorna historial completo de estrategias (activas, inactivas, completadas)")
    public ResponseEntity<Map<String, Object>> obtenerHistorialEstrategias(
            @PathVariable String pkAsegurado,
            @Parameter(description = "Página (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño de página")
            @RequestParam(defaultValue = "10") int size) {
        try {
            log.info("📜 Obteniendo historial de estrategias del paciente {}", pkAsegurado);

            if (page >= 0 && size > 0) {
                // Con paginación
                Page<PacienteEstrategiaResponse> pageResult = pacienteEstrategiaService
                        .obtenerHistorialEstrategiasPaginado(pkAsegurado, Pageable.ofSize(size).withPage(page));

                Map<String, Object> resultado = new HashMap<>();
                resultado.put("success", true);
                resultado.put("data", pageResult.getContent());
                resultado.put("total", pageResult.getTotalElements());
                resultado.put("pages", pageResult.getTotalPages());
                resultado.put("currentPage", page);

                return ResponseEntity.ok(resultado);
            } else {
                // Sin paginación
                List<PacienteEstrategiaResponse> respuestas = pacienteEstrategiaService
                        .obtenerHistorialEstrategias(pkAsegurado);

                Map<String, Object> resultado = new HashMap<>();
                resultado.put("success", true);
                resultado.put("data", respuestas);
                resultado.put("total", respuestas.size());

                return ResponseEntity.ok(resultado);
            }

        } catch (Exception e) {
            log.error("❌ Error al obtener historial: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error interno del servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Obtiene los pacientes activos asignados a una estrategia
     * GET /api/paciente-estrategia/estrategia/{idEstrategia}
     */
    @GetMapping("/estrategia/{idEstrategia}")
    @PreAuthorize("hasAnyRole('COORDINADOR', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "Obtener pacientes de una estrategia",
            description = "Retorna lista de pacientes activos asignados a una estrategia")
    public ResponseEntity<Map<String, Object>> obtenerPacientesActivosPorEstrategia(
            @PathVariable Long idEstrategia,
            @Parameter(description = "Página (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño de página")
            @RequestParam(defaultValue = "10") int size) {
        try {
            log.info("📋 Obteniendo pacientes activos de la estrategia {}", idEstrategia);

            if (page >= 0 && size > 0) {
                // Con paginación
                Page<PacienteEstrategiaResponse> pageResult = pacienteEstrategiaService
                        .obtenerPacientesActivosPorEstrategiaPaginado(idEstrategia, Pageable.ofSize(size).withPage(page));

                Map<String, Object> resultado = new HashMap<>();
                resultado.put("success", true);
                resultado.put("data", pageResult.getContent());
                resultado.put("total", pageResult.getTotalElements());
                resultado.put("pages", pageResult.getTotalPages());
                resultado.put("currentPage", page);

                return ResponseEntity.ok(resultado);
            } else {
                // Sin paginación
                List<PacienteEstrategiaResponse> respuestas = pacienteEstrategiaService
                        .obtenerPacientesActivosPorEstrategia(idEstrategia);

                Map<String, Object> resultado = new HashMap<>();
                resultado.put("success", true);
                resultado.put("data", respuestas);
                resultado.put("total", respuestas.size());

                return ResponseEntity.ok(resultado);
            }

        } catch (Exception e) {
            log.error("❌ Error al obtener pacientes: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error interno del servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Verifica si un paciente tiene asignación activa a una estrategia
     * GET /api/paciente-estrategia/paciente/{pkAsegurado}/verificar/{idEstrategia}
     */
    @GetMapping("/paciente/{pkAsegurado}/verificar/{idEstrategia}")
    @PreAuthorize("hasAnyRole('MEDICO', 'ENFERMERIA', 'COORDINADOR', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "Verificar asignación activa",
            description = "Verifica si un paciente tiene asignación ACTIVA a una estrategia")
    public ResponseEntity<Map<String, Object>> verificarAsignacionActiva(
            @PathVariable String pkAsegurado,
            @PathVariable Long idEstrategia) {
        try {
            log.info("🔍 Verificando asignación activa: paciente {} - estrategia {}", pkAsegurado, idEstrategia);

            boolean existe = pacienteEstrategiaService.tieneAsignacionActiva(pkAsegurado, idEstrategia);

            Map<String, Object> resultado = new HashMap<>();
            resultado.put("success", true);
            resultado.put("tieneAsignacionActiva", existe);

            return ResponseEntity.ok(resultado);

        } catch (Exception e) {
            log.error("❌ Error al verificar asignación: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error interno del servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Lista paginada de bajas del programa CENACRON con datos de auditoría.
     * GET /api/paciente-estrategia/bajas-cenacron
     */
    @GetMapping("/bajas-cenacron")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','COORDINADOR','MEDICO','ENFERMERIA')")
    @Operation(summary = "Listar bajas CENACRON",
            description = "Retorna lista paginada de pacientes dados de baja del programa CENACRON " +
                          "(estados INACTIVO o COMPLETADO) con datos completos de auditoría")
    public ResponseEntity<Map<String, Object>> listarBajasCenacron(
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String fechaInicio,
            @RequestParam(required = false) String fechaFin,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "25") int size) {
        try {
            log.info("📋 Listando bajas CENACRON — busqueda={}, estado={}, fechaInicio={}, fechaFin={}, page={}, size={}",
                    busqueda, estado, fechaInicio, fechaFin, page, size);

            Map<String, Object> resultado = pacienteEstrategiaService
                    .listarBajasCenacron(busqueda, estado, fechaInicio, fechaFin, page, size);

            resultado.put("success", true);
            return ResponseEntity.ok(resultado);

        } catch (Exception e) {
            log.error("❌ Error al listar bajas CENACRON: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error interno del servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Cuenta los pacientes activos de una estrategia
     * GET /api/paciente-estrategia/estrategia/{idEstrategia}/contar
     */
    @GetMapping("/estrategia/{idEstrategia}/contar")
    @PreAuthorize("hasAnyRole('COORDINADOR', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "Contar pacientes activos de estrategia",
            description = "Retorna la cantidad de pacientes activos en una estrategia")
    public ResponseEntity<Map<String, Object>> contarPacientesActivos(
            @PathVariable Long idEstrategia) {
        try {
            log.info("📊 Contando pacientes activos de la estrategia {}", idEstrategia);

            long total = pacienteEstrategiaService.contarPacientesActivosPorEstrategia(idEstrategia);

            Map<String, Object> resultado = new HashMap<>();
            resultado.put("success", true);
            resultado.put("totalPacientesActivos", total);

            return ResponseEntity.ok(resultado);

        } catch (Exception e) {
            log.error("❌ Error al contar pacientes: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error interno del servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}

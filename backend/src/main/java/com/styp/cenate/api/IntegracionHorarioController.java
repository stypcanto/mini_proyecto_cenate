package com.styp.cenate.api;

import com.styp.cenate.dto.ComparativoDisponibilidadHorarioDTO;
import com.styp.cenate.dto.SincronizacionResultadoDTO;
import com.styp.cenate.model.SincronizacionHorarioLog;
import com.styp.cenate.service.integracion.IIntegracionHorarioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 🔄 API REST para integración Disponibilidad → Horarios Chatbot.
 *
 * Endpoints para coordinadores:
 * - Sincronizar disponibilidades revisadas a horarios
 * - Obtener comparativos antes de sincronizar
 * - Ver historial de sincronizaciones
 * - Validar si una disponibilidad puede sincronizarse
 *
 * IMPORTANTE: Requiere rol COORDINADOR o COORDINADOR_ESPECIALIDADES
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Slf4j
@RestController
@RequestMapping("/api/integracion-horario")
@RequiredArgsConstructor
// TODO: Agregar @CheckMBACPermission cuando esté implementado
public class IntegracionHorarioController {

    private final IIntegracionHorarioService integracionService;

    /**
     * POST /api/integracion-horario/sincronizar
     *
     * Sincroniza una disponibilidad REVISADA a horario chatbot.
     *
     * Request body:
     * {
     *   "idDisponibilidad": 123,
     *   "idArea": 5
     * }
     *
     * Response:
     * {
     *   "status": 200,
     *   "data": {
     *     "idDisponibilidad": 123,
     *     "idHorario": 456,
     *     "tipoOperacion": "CREACION",
     *     "resultado": "EXITOSO",
     *     "periodo": "202601",
     *     "nombrePersonal": "Dr. Juan Pérez",
     *     "nombreArea": "Medicina General",
     *     "detallesProcesados": 18,
     *     "detallesCreados": 18,
     *     "detallesConError": 0,
     *     "horasSincronizadas": 180.00,
     *     "mensaje": "CREACION exitosa: 18/18 detalles sincronizados (180.00 horas)"
     *   },
     *   "message": "Sincronización exitosa"
     * }
     */
    @PostMapping("/sincronizar")
    public ResponseEntity<?> sincronizarDisponibilidad(
        @RequestBody Map<String, Long> request
    ) {
        Long idDisponibilidad = request.get("idDisponibilidad");
        Long idArea = request.get("idArea");

        log.info("📨 POST /api/integracion-horario/sincronizar - Disp #{} → Área #{}",
            idDisponibilidad, idArea);

        SincronizacionResultadoDTO resultado = integracionService.sincronizarDisponibilidadAHorario(
            idDisponibilidad,
            idArea
        );

        String mensaje = "EXITOSO".equals(resultado.getResultado())
            ? "Sincronización exitosa"
            : "Sincronización completada con errores parciales";

        return ResponseEntity.ok(Map.of(
            "status", 200,
            "data", resultado,
            "message", mensaje
        ));
    }

    /**
     * POST /api/integracion-horario/resincronizar
     *
     * Fuerza resincronización de una disponibilidad.
     * Útil cuando se modificó después de sincronizar.
     *
     * Request body:
     * {
     *   "idDisponibilidad": 123,
     *   "idArea": 5
     * }
     */
    @PostMapping("/resincronizar")
    public ResponseEntity<?> resincronizarDisponibilidad(
        @RequestBody Map<String, Long> request
    ) {
        Long idDisponibilidad = request.get("idDisponibilidad");
        Long idArea = request.get("idArea");

        log.info("📨 POST /api/integracion-horario/resincronizar - Disp #{} → Área #{}",
            idDisponibilidad, idArea);

        SincronizacionResultadoDTO resultado = integracionService.resincronizarDisponibilidad(
            idDisponibilidad,
            idArea
        );

        return ResponseEntity.ok(Map.of(
            "status", 200,
            "data", resultado,
            "message", "Resincronización completada"
        ));
    }

    /**
     * GET /api/integracion-horario/comparativo/{idDisponibilidad}/{idArea}
     *
     * Obtiene comparativo entre disponibilidad y horario actual.
     * Muestra preview de cambios antes de sincronizar.
     *
     * Response:
     * {
     *   "status": 200,
     *   "data": {
     *     "idDisponibilidad": 123,
     *     "horarioExiste": true,
     *     "tipoOperacion": "ACTUALIZACION",
     *     "turnosAAgregar": [...],
     *     "turnosAModificar": [...],
     *     "turnosAEliminar": [...],
     *     "horasActuales": 144.00,
     *     "horasNuevas": 180.00,
     *     "diferenciaHoras": 36.00
     *   },
     *   "message": "Comparativo generado exitosamente"
     * }
     */
    @GetMapping("/comparativo/{idDisponibilidad}/{idArea}")
    public ResponseEntity<?> obtenerComparativo(
        @PathVariable Long idDisponibilidad,
        @PathVariable Long idArea
    ) {
        log.info("📨 GET /api/integracion-horario/comparativo/{}/{}", idDisponibilidad, idArea);

        ComparativoDisponibilidadHorarioDTO comparativo = integracionService.obtenerComparativo(
            idDisponibilidad,
            idArea
        );

        return ResponseEntity.ok(Map.of(
            "status", 200,
            "data", comparativo,
            "message", "Comparativo generado exitosamente"
        ));
    }

    /**
     * GET /api/integracion-horario/historial/{idDisponibilidad}
     *
     * Obtiene historial de sincronizaciones de una disponibilidad.
     *
     * Response:
     * {
     *   "status": 200,
     *   "data": [
     *     {
     *       "idSincronizacion": 789,
     *       "tipoOperacion": "CREACION",
     *       "resultado": "EXITOSO",
     *       "fechaSincronizacion": "2026-01-03T10:30:00Z",
     *       "usuarioSincronizacion": "44914706",
     *       "detallesOperacion": {...}
     *     },
     *     ...
     *   ],
     *   "message": "Historial obtenido: 3 registros"
     * }
     */
    @GetMapping("/historial/{idDisponibilidad}")
    public ResponseEntity<?> obtenerHistorial(
        @PathVariable Long idDisponibilidad
    ) {
        log.info("📨 GET /api/integracion-horario/historial/{}", idDisponibilidad);

        List<SincronizacionHorarioLog> historial = integracionService.obtenerHistorialSincronizacion(
            idDisponibilidad
        );

        return ResponseEntity.ok(Map.of(
            "status", 200,
            "data", historial,
            "message", String.format("Historial obtenido: %d registro(s)", historial.size())
        ));
    }

    /**
     * GET /api/integracion-horario/validar/{idDisponibilidad}
     *
     * Valida si una disponibilidad puede sincronizarse.
     *
     * Response:
     * {
     *   "status": 200,
     *   "data": {
     *     "puedeRealizarSincronizacion": true,
     *     "idDisponibilidad": 123
     *   },
     *   "message": "La disponibilidad puede sincronizarse"
     * }
     *
     * O si no puede:
     * {
     *   "status": 200,
     *   "data": {
     *     "puedeRealizarSincronizacion": false,
     *     "idDisponibilidad": 123,
     *     "razon": "Solo disponibilidades en estado REVISADO pueden sincronizarse"
     *   },
     *   "message": "La disponibilidad no puede sincronizarse"
     * }
     */
    @GetMapping("/validar/{idDisponibilidad}")
    public ResponseEntity<?> validarSincronizacion(
        @PathVariable Long idDisponibilidad
    ) {
        log.info("📨 GET /api/integracion-horario/validar/{}", idDisponibilidad);

        boolean puede = integracionService.puedeRealizarSincronizacion(idDisponibilidad);

        String mensaje = puede
            ? "La disponibilidad puede sincronizarse"
            : "La disponibilidad no puede sincronizarse";

        return ResponseEntity.ok(Map.of(
            "status", 200,
            "data", Map.of(
                "puedeRealizarSincronizacion", puede,
                "idDisponibilidad", idDisponibilidad
            ),
            "message", mensaje
        ));
    }
}

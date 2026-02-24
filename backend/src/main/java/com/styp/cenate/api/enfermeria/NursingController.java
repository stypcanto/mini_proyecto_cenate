package com.styp.cenate.api.enfermeria;

import com.styp.cenate.dto.enfermeria.EnfermeraSimpleDto;
import com.styp.cenate.dto.enfermeria.NursingAttendRequest;
import com.styp.cenate.dto.enfermeria.NursingWorklistDto;
import com.styp.cenate.dto.enfermeria.RescatarPacienteDto;
import com.styp.cenate.model.enfermeria.AtencionEnfermeria;
import com.styp.cenate.service.enfermeria.NursingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/enfermeria")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Ajustar según seguridad
public class NursingController {

    private final NursingService nursingService;

    @GetMapping("/queue")
    public ResponseEntity<List<NursingWorklistDto>> getWorklist(@RequestParam(defaultValue = "TODOS") String estado) {
        log.info("📋 GET /api/enfermeria/queue - estado: {}", estado);
        List<NursingWorklistDto> worklist = nursingService.getWorklist(estado);
        log.info("✅ GET /api/enfermeria/queue - Retornando {} registros para estado: {}", worklist.size(), estado);
        return ResponseEntity.ok(worklist);
    }

    @PostMapping("/attend")
    public ResponseEntity<AtencionEnfermeria> attendPatient(@RequestBody NursingAttendRequest request) {
        return ResponseEntity.ok(nursingService.attendPatient(request));
    }

    // =========================================================================
    // 🆘 RESCATE DE PACIENTES — COORDINADORA ENFERMERÍA
    // =========================================================================

    /**
     * GET /api/enfermeria/pacientes/buscar?dni={dni}
     * Busca solicitudes de bolsa por DNI del paciente.
     */
    @GetMapping("/pacientes/buscar")
    public ResponseEntity<List<RescatarPacienteDto>> buscarPacientesPorDni(@RequestParam String dni) {
        log.info("🔍 GET /api/enfermeria/pacientes/buscar - DNI: {}", dni);
        List<RescatarPacienteDto> resultados = nursingService.buscarPacientesPorDni(dni);
        return ResponseEntity.ok(resultados);
    }

    /**
     * PUT /api/enfermeria/pacientes/{idSolicitud}/rescatar
     * Rescata un paciente: condicion_medica → "Pendiente", estado → "PENDIENTE", fecha_atencion_medica → null.
     * Body opcional: { "idPersonal": 123 }
     */
    @PutMapping("/pacientes/{idSolicitud}/rescatar")
    public ResponseEntity<RescatarPacienteDto> rescatarPaciente(
            @PathVariable Long idSolicitud,
            @RequestBody(required = false) Map<String, Object> body) {
        Long idPersonal = null;
        if (body != null && body.get("idPersonal") != null) {
            idPersonal = Long.valueOf(body.get("idPersonal").toString());
        }
        log.info("🆘 PUT /api/enfermeria/pacientes/{}/rescatar - idPersonal: {}", idSolicitud, idPersonal);
        RescatarPacienteDto resultado = nursingService.rescatarPaciente(idSolicitud, idPersonal);
        return ResponseEntity.ok(resultado);
    }

    /**
     * GET /api/enfermeria/enfermeras
     * Lista el personal activo con profesión de enfermería.
     */
    @GetMapping("/enfermeras")
    public ResponseEntity<List<EnfermeraSimpleDto>> listarEnfermeras() {
        log.info("📋 GET /api/enfermeria/enfermeras");
        return ResponseEntity.ok(nursingService.listarEnfermeras());
    }
}

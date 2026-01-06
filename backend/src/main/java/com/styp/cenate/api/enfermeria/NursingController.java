package com.styp.cenate.api.enfermeria;

import com.styp.cenate.dto.enfermeria.NursingAttendRequest;
import com.styp.cenate.dto.enfermeria.NursingWorklistDto;
import com.styp.cenate.model.enfermeria.AtencionEnfermeria;
import com.styp.cenate.service.enfermeria.NursingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}

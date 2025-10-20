package com.styp.cenate.api.usuario;

import com.styp.cenate.dto.ProfesionResponse;
import com.styp.cenate.service.profesion.ProfesionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profesiones")
@RequiredArgsConstructor
public class ProfesionController {

    private final ProfesionService profesionService;

    @GetMapping
    public ResponseEntity<List<ProfesionResponse>> listarTodas() {
        return ResponseEntity.ok(profesionService.obtenerTodas());
    }

    @GetMapping("/activas")
    public ResponseEntity<List<ProfesionResponse>> listarActivas() {
        return ResponseEntity.ok(profesionService.obtenerActivas());
    }
}

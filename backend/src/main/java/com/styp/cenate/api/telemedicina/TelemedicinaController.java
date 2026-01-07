package com.styp.cenate.api.telemedicina;

import com.styp.cenate.dto.telemedicina.CrearSalaRequest;
import com.styp.cenate.dto.telemedicina.SalaResponse;
import com.styp.cenate.dto.telemedicina.TokenResponse;
import com.styp.cenate.service.telemedicina.JaaSService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * Controller para gestión de videollamadas con Jitsi JaaS
 */
@Slf4j
@RestController
@RequestMapping("/api/telemedicina")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TelemedicinaController {

    private final JaaSService jaaSService;

    // Constructor para verificar que el bean se carga correctamente
    {
        log.info("✅ TelemedicinaController inicializado correctamente");
    }

    /**
     * Crea una nueva sala de videollamada y genera tokens para médico y paciente
     * 
     * POST /api/telemedicina/crear-sala
     */
    @PostMapping("/crear-sala")
    public ResponseEntity<SalaResponse> crearSala(@Valid @RequestBody CrearSalaRequest request) {
        log.info("📹 POST /api/telemedicina/crear-sala - Paciente: {} - Médico: {}", 
                request.getNombrePaciente(), request.getNombreMedico());

        try {
            // Generar nombre único de sala
            String roomName = jaaSService.generarNombreSala(
                    request.getDniPaciente(), 
                    request.getIdUsuarioMedico()
            );

            // Generar token para el médico (moderador)
            TokenResponse tokenMedico = jaaSService.generarToken(
                    roomName,
                    request.getNombreMedico() != null ? request.getNombreMedico() : "Médico",
                    null,
                    true, // El médico es moderador
                    24 // Expira en 24 horas
            );

            // Construir URL completa con token
            String roomUrl = String.format("%s?jwt=%s", tokenMedico.getRoomUrl(), tokenMedico.getToken());

            SalaResponse response = SalaResponse.builder()
                    .roomName(roomName)
                    .roomUrl(roomUrl)
                    .token(tokenMedico.getToken())
                    .fechaCreacion(LocalDateTime.now())
                    .nombrePaciente(request.getNombrePaciente())
                    .dniPaciente(request.getDniPaciente())
                    .nombreMedico(request.getNombreMedico())
                    .build();

            log.info("✅ Sala creada exitosamente: {} - URL: {}", roomName, roomUrl);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al crear sala de videollamada: {}", e.getMessage(), e);
            throw new RuntimeException("Error al crear sala de videollamada: " + e.getMessage(), e);
        }
    }

    /**
     * Genera un token adicional para un usuario (útil para pacientes)
     * 
     * POST /api/telemedicina/generar-token
     */
    @PostMapping("/generar-token")
    public ResponseEntity<TokenResponse> generarToken(
            @RequestParam String roomName,
            @RequestParam String userName,
            @RequestParam(required = false) String userEmail,
            @RequestParam(defaultValue = "false") boolean isModerator,
            @RequestParam(defaultValue = "24") int expirationHours
    ) {
        log.info("🔑 POST /api/telemedicina/generar-token - Sala: {} - Usuario: {}", roomName, userName);

        try {
            TokenResponse token = jaaSService.generarToken(
                    roomName,
                    userName,
                    userEmail,
                    isModerator,
                    expirationHours
            );

            log.info("✅ Token generado exitosamente para sala: {}", roomName);
            return ResponseEntity.ok(token);

        } catch (Exception e) {
            log.error("❌ Error al generar token: {}", e.getMessage(), e);
            throw new RuntimeException("Error al generar token: " + e.getMessage(), e);
        }
    }
}

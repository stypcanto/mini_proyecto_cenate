package com.styp.cenate.api.chatbot;

import com.styp.cenate.api.chatbot.dto.PatientCardDTO;
import com.styp.cenate.dto.chatbot.ChatbotTrazabilidadRequest;
import com.styp.cenate.dto.chatbot.ChatbotTrazabilidadResponse;
import com.styp.cenate.model.Asegurado;
import com.styp.cenate.model.PersonalCnt;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.repository.PersonalCntRepository;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import com.styp.cenate.service.chatbot.ChatbotTrazabilidadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * ============================================================
 * ChatbotTrazabilidadController (v1.75.1)
 * ============================================================
 * Endpoints para el Chatbot de Trazabilidad interno de CENATE.
 * Solo accesible para personal autenticado (JWT requerido).
 *
 * POST /api/v1/chatbot/trazabilidad/chat
 *   Body: { "mensaje": "¿Por qué el DNI 08643806 no puede ser citado?" }
 *
 * GET  /api/v1/chatbot/trazabilidad/paciente/{dni}
 *   Devuelve tarjeta estructurada del paciente para el chatbot.
 * ============================================================
 */
@RestController
@RequestMapping("/api/v1/chatbot/trazabilidad")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Chatbot Trazabilidad", description = "Endpoints para el asistente de trazabilidad interno de CENATE")
public class ChatbotTrazabilidadController {

    private final ChatbotTrazabilidadService chatbotTrazabilidadService;
    private final SolicitudBolsaRepository solicitudBolsaRepository;
    private final AseguradoRepository aseguradoRepository;
    private final PersonalCntRepository personalCntRepository;

    // =========================================================================
    // POST /chat — Consulta libre en lenguaje natural
    // =========================================================================

    /**
     * Procesa una consulta de trazabilidad usando IA + datos reales de BD.
     *
     * @param request Mensaje del usuario (personal interno CENATE)
     * @return Respuesta del asistente con datos trazados de PostgreSQL
     */
    @PostMapping("/chat")
    @Operation(summary = "Chat de trazabilidad con IA", description = "Procesa una pregunta en lenguaje natural y devuelve datos trazados desde PostgreSQL")
    public ResponseEntity<?> chat(@Valid @RequestBody ChatbotTrazabilidadRequest request) {
        log.info("[Trazabilidad] Solicitud recibida: {}", request.getMensaje());
        try {
            String respuesta = chatbotTrazabilidadService.chat(request.getMensaje());
            return ResponseEntity.ok(new ChatbotTrazabilidadResponse(respuesta, LocalDateTime.now()));
        } catch (Exception e) {
            log.error("[Trazabilidad] Error al procesar: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "No se pudo procesar la consulta. Intenta de nuevo.",
                    "detalle", e.getMessage(),
                    "timestamp", LocalDateTime.now().toString()));
        }
    }

    // =========================================================================
    // GET /paciente/{dni} — Tarjeta estructurada del paciente
    // =========================================================================

    /**
     * Devuelve la tarjeta de datos estructurados de un paciente para el chatbot.
     *
     * Lógica:
     * 1. Busca todos los registros en dim_solicitud_bolsa por DNI (activos + archivados).
     * 2. Enriquece con datos de contacto desde la tabla asegurados (best-effort).
     * 3. Resuelve nombre del medico desde dim_personal_cnt por id_personal (best-effort).
     * 4. Calcula totalDeserciones y alertaSeveridad.
     *
     * Siempre devuelve HTTP 200; usa encontrado=false si no hay registros.
     *
     * @param dni DNI del paciente (8 dígitos)
     * @return PatientCardDTO con datos consolidados del paciente
     */
    @GetMapping("/paciente/{dni}")
    @Operation(
        summary = "Patient card for chatbot",
        description = "Devuelve datos estructurados de un paciente (bolsas, deserciones, alerta) para el chatbot de trazabilidad. Siempre HTTP 200."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Tarjeta retornada. Verificar campo 'encontrado' para saber si hay datos.")
    })
    public ResponseEntity<PatientCardDTO> obtenerTarjetaPaciente(
            @Parameter(description = "DNI del paciente", example = "08643806")
            @PathVariable String dni) {

        log.info("[Trazabilidad] Tarjeta paciente solicitada. DNI: {}", dni);

        // ── 1. Cargar todos los registros del paciente (activos + archivados)
        List<SolicitudBolsa> registros = solicitudBolsaRepository.findByPacienteDni(dni);

        if (registros.isEmpty()) {
            log.info("[Trazabilidad] Sin registros para DNI: {}", dni);
            PatientCardDTO respuesta = PatientCardDTO.builder()
                    .encontrado(false)
                    .paciente(null)
                    .registros(List.of())
                    .totalDeserciones(0)
                    .alertaSeveridad("VERDE")
                    .build();
            return ResponseEntity.ok(respuesta);
        }

        // ── 2. Datos de contacto desde tabla asegurados (best-effort, nunca falla)
        String nombrePaciente = registros.get(0).getPacienteNombre();
        String telefonoPaciente = null;
        String emailPaciente = null;

        try {
            Optional<Asegurado> aseguradoOpt = aseguradoRepository.findByDocPaciente(dni);
            if (aseguradoOpt.isPresent()) {
                Asegurado asegurado = aseguradoOpt.get();
                // Priorizar celular sobre fijo
                telefonoPaciente = (asegurado.getTelCelular() != null && !asegurado.getTelCelular().isBlank())
                        ? asegurado.getTelCelular()
                        : asegurado.getTelFijo();
                emailPaciente = asegurado.getCorreoElectronico();
                // Usar nombre desde asegurados si está disponible (más actualizado)
                if (asegurado.getPaciente() != null && !asegurado.getPaciente().isBlank()) {
                    nombrePaciente = asegurado.getPaciente();
                }
            }
        } catch (Exception e) {
            log.warn("[Trazabilidad] No se pudo obtener datos de asegurado para DNI: {}. Causa: {}", dni, e.getMessage());
            // Continuar sin datos de contacto — no es un error bloqueante
        }

        // ── 3. Mapear registros de bolsa a RegistroInfo
        List<PatientCardDTO.RegistroInfo> registrosInfo = registros.stream()
                .map(r -> {
                    String nombreMedico = resolverNombreMedico(r.getIdPersonal());
                    String fechaAtencionStr = (r.getFechaAtencion() != null)
                            ? r.getFechaAtencion().toString()
                            : null;
                    return PatientCardDTO.RegistroInfo.builder()
                            .id(r.getIdSolicitud())
                            .especialidad(r.getEspecialidad())
                            .estado(r.getEstado())
                            .activo(Boolean.TRUE.equals(r.getActivo()))
                            .condicionMedica(r.getCondicionMedica())
                            .fechaAtencion(fechaAtencionStr)
                            .nombreMedico(nombreMedico)
                            .build();
                })
                .toList();

        // ── 4. Calcular total de deserciones
        long totalDeserciones = registros.stream()
                .filter(r -> esDesercion(r.getCondicionMedica(), r.getEstado()))
                .count();

        // ── 5. Calcular alerta de severidad
        String alertaSeveridad = calcularAlerta((int) totalDeserciones);

        log.info("[Trazabilidad] Tarjeta generada para DNI: {}. Registros: {}, Deserciones: {}, Alerta: {}",
                dni, registros.size(), totalDeserciones, alertaSeveridad);

        PatientCardDTO respuesta = PatientCardDTO.builder()
                .encontrado(true)
                .paciente(PatientCardDTO.PacienteInfo.builder()
                        .nombre(nombrePaciente)
                        .dni(dni)
                        .telefono(telefonoPaciente)
                        .email(emailPaciente)
                        .build())
                .registros(registrosInfo)
                .totalDeserciones((int) totalDeserciones)
                .alertaSeveridad(alertaSeveridad)
                .build();

        return ResponseEntity.ok(respuesta);
    }

    // =========================================================================
    // Métodos privados de soporte
    // =========================================================================

    /**
     * Resuelve el nombre completo del médico a partir de su id_personal.
     * Formato: "APELLIDO_PATERNO APELLIDO_MATERNO, NOMBRE"
     * Devuelve null si idPersonal es null o no existe en dim_personal_cnt.
     *
     * @param idPersonal FK hacia dim_personal_cnt.id_pers
     * @return nombre formateado o null
     */
    private String resolverNombreMedico(Long idPersonal) {
        if (idPersonal == null) {
            return null;
        }
        try {
            Optional<PersonalCnt> personalOpt = personalCntRepository.findById(idPersonal);
            if (personalOpt.isPresent()) {
                PersonalCnt personal = personalOpt.get();
                StringBuilder nombre = new StringBuilder();
                if (personal.getApePaterPers() != null) nombre.append(personal.getApePaterPers().trim());
                if (personal.getApeMaterPers() != null) {
                    if (!nombre.isEmpty()) nombre.append(" ");
                    nombre.append(personal.getApeMaterPers().trim());
                }
                if (personal.getNomPers() != null) {
                    if (!nombre.isEmpty()) nombre.append(", ");
                    nombre.append(personal.getNomPers().trim());
                }
                return nombre.isEmpty() ? null : nombre.toString();
            }
        } catch (Exception e) {
            log.warn("[Trazabilidad] No se pudo resolver médico con idPersonal: {}. Causa: {}", idPersonal, e.getMessage());
        }
        return null;
    }

    /**
     * Determina si un registro representa una deserción.
     *
     * Criterio (OR):
     * - condicionMedica contiene "Deserci" (case-insensitive)
     * - estado contiene "DESERTOR" (case-insensitive)
     *
     * @param condicionMedica campo condicion_medica del registro
     * @param estado          campo estado del registro
     * @return true si el registro es una deserción
     */
    private boolean esDesercion(String condicionMedica, String estado) {
        boolean condicionEsDesercion = condicionMedica != null
                && condicionMedica.toUpperCase().contains("DESERCI");
        boolean estadoEsDesertor = estado != null
                && estado.toUpperCase().contains("DESERTOR");
        return condicionEsDesercion || estadoEsDesertor;
    }

    /**
     * Calcula el nivel de alerta basado en el total de deserciones.
     *
     * @param totalDeserciones numero de registros de desercion
     * @return "VERDE", "AMARILLA" o "ROJA"
     */
    private String calcularAlerta(int totalDeserciones) {
        if (totalDeserciones == 0) return "VERDE";
        if (totalDeserciones <= 2) return "AMARILLA";
        return "ROJA";
    }
}

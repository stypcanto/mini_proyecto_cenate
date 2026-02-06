package com.styp.cenate.api.gestionpaciente;

import com.styp.cenate.dto.GestionPacienteDTO;
import com.styp.cenate.dto.AtenderPacienteRequest;
import com.styp.cenate.dto.EspecialidadSelectDTO;
import com.styp.cenate.service.gestionpaciente.IGestionPacienteService;
import com.styp.cenate.service.gestionpaciente.AtenderPacienteService;
import com.styp.cenate.repository.DimServicioEssiRepository;
import com.styp.cenate.security.mbac.CheckMBACPermission;
import com.styp.cenate.validation.AtenderPacienteValidator;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gestion-pacientes")
@RequiredArgsConstructor
@Validated
@Slf4j
@CrossOrigin(origins = "*")
public class GestionPacienteController {

    private final IGestionPacienteService servicio;
    private final AtenderPacienteService atenderPacienteService;
    private final DimServicioEssiRepository servicioEssiRepository;
    private final AtenderPacienteValidator atenderPacienteValidator;

    // ========================================================================
    // CRUD Básico
    // ========================================================================

    @GetMapping
    @CheckMBACPermission(pagina = "/citas/gestion-asegurado", accion = "ver", mensajeDenegado = "No tiene permiso para ver pacientes")
    public ResponseEntity<List<GestionPacienteDTO>> listar() {
        log.info("GET /api/gestion-pacientes - Listando todos los pacientes");
        List<GestionPacienteDTO> lista = servicio.listar();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GestionPacienteDTO> obtenerPorId(@PathVariable @Min(1) Long id) {
        log.info("GET /api/gestion-pacientes/{} - Buscando por ID", id);
        return servicio.buscarPorId(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping
    @CheckMBACPermission(pagina = "/citas/gestion-asegurado", accion = "crear", mensajeDenegado = "No tiene permiso para crear pacientes")
    public ResponseEntity<GestionPacienteDTO> crear(@Valid @RequestBody GestionPacienteDTO dto) {
        log.info("POST /api/gestion-pacientes - Creando paciente: {}", dto.getNumDoc());
        GestionPacienteDTO creado = servicio.guardar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    @CheckMBACPermission(pagina = "/citas/gestion-asegurado", accion = "editar", mensajeDenegado = "No tiene permiso para editar pacientes")
    public ResponseEntity<GestionPacienteDTO> actualizar(
        @PathVariable @Min(1) Long id,
        @Valid @RequestBody GestionPacienteDTO dto
    ) {
        log.info("PUT /api/gestion-pacientes/{} - Actualizando paciente", id);
        GestionPacienteDTO actualizado = servicio.actualizar(id, dto);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    @CheckMBACPermission(pagina = "/citas/gestion-asegurado", accion = "eliminar", mensajeDenegado = "No tiene permiso para eliminar pacientes")
    public ResponseEntity<Void> eliminar(@PathVariable @Min(1) Long id) {
        log.info("DELETE /api/gestion-pacientes/{} - Eliminando paciente", id);
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // ========================================================================
    // Búsquedas específicas
    // ========================================================================

    @GetMapping("/documento/{numDoc}")
    public ResponseEntity<List<GestionPacienteDTO>> buscarPorDocumento(
        @PathVariable @NotBlank @Size(min = 8, max = 15) String numDoc
    ) {
        log.info("GET /api/gestion-pacientes/documento/{} - Buscando por documento", numDoc);
        List<GestionPacienteDTO> lista = servicio.buscarPorNumDoc(numDoc);
        if (lista.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/condicion/{condicion}")
    public ResponseEntity<List<GestionPacienteDTO>> buscarPorCondicion(
        @PathVariable String condicion
    ) {
        log.info("GET /api/gestion-pacientes/condicion/{} - Buscando por condición", condicion);
        List<GestionPacienteDTO> lista = servicio.buscarPorCondicion(condicion);
        if (lista.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/gestora/{gestora}")
    public ResponseEntity<List<GestionPacienteDTO>> buscarPorGestora(
        @PathVariable String gestora
    ) {
        log.info("GET /api/gestion-pacientes/gestora/{} - Buscando por gestora", gestora);
        List<GestionPacienteDTO> lista = servicio.buscarPorGestora(gestora);
        if (lista.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(lista);
    }

    // Endpoint de red asistencial eliminado - el campo no existe en el modelo actual
    // @GetMapping("/red/{redAsistencial}")
    // public ResponseEntity<List<GestionPacienteDTO>> buscarPorRedAsistencial(...)

    @GetMapping("/ipress/{codIpress}")
    public ResponseEntity<List<GestionPacienteDTO>> buscarPorIpress(
        @PathVariable String codIpress
    ) {
        log.info("GET /api/gestion-pacientes/ipress/{} - Buscando por IPRESS", codIpress);
        List<GestionPacienteDTO> lista = servicio.buscarPorIpress(codIpress);
        if (lista.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(lista);
    }

    // ========================================================================
    // Buscar asegurado por DNI (para agregar a gestión)
    // ========================================================================

    @GetMapping("/asegurado/{dni}")
    public ResponseEntity<GestionPacienteDTO> buscarAseguradoPorDni(
        @PathVariable @NotBlank @Size(min = 8, max = 15) String dni
    ) {
        log.info("GET /api/gestion-pacientes/asegurado/{} - Buscando asegurado por DNI", dni);
        return servicio.buscarAseguradoPorDni(dni)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // ========================================================================
    // Gestión de Telemedicina
    // ========================================================================

    @GetMapping("/telemedicina")
    public ResponseEntity<List<GestionPacienteDTO>> listarSeleccionadosTelemedicina() {
        log.info("GET /api/gestion-pacientes/telemedicina - Listando seleccionados para telemedicina");
        List<GestionPacienteDTO> lista = servicio.listarSeleccionadosTelemedicina();
        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{id}/telemedicina")
    public ResponseEntity<GestionPacienteDTO> seleccionarParaTelemedicina(
        @PathVariable @Min(1) Long id,
        @RequestBody Map<String, Boolean> body
    ) {
        Boolean seleccionado = body.get("seleccionado");
        log.info("PUT /api/gestion-pacientes/{}/telemedicina - Seleccionar: {}", id, seleccionado);
        GestionPacienteDTO actualizado = servicio.seleccionarParaTelemedicina(id, seleccionado);
        return ResponseEntity.ok(actualizado);
    }

    @PutMapping("/telemedicina/multiple")
    public ResponseEntity<List<GestionPacienteDTO>> seleccionarMultiplesParaTelemedicina(
        @RequestBody Map<String, Object> body
    ) {
        @SuppressWarnings("unchecked")
        List<Long> ids = ((List<Number>) body.get("ids")).stream()
            .map(Number::longValue)
            .toList();
        Boolean seleccionado = (Boolean) body.get("seleccionado");

        log.info("PUT /api/gestion-pacientes/telemedicina/multiple - {} pacientes, seleccionar: {}",
            ids.size(), seleccionado);

        List<GestionPacienteDTO> actualizados = servicio.seleccionarMultiplesParaTelemedicina(ids, seleccionado);
        return ResponseEntity.ok(actualizados);
    }

    // ========================================================================
    // Actualización de Condición
    // ========================================================================

    @PutMapping("/{id}/condicion")
    public ResponseEntity<GestionPacienteDTO> actualizarCondicion(
        @PathVariable @Min(1) Long id,
        @RequestBody Map<String, String> body
    ) {
        String condicion = body.get("condicion");
        String observaciones = body.get("observaciones");

        log.info("PUT /api/gestion-pacientes/{}/condicion - Nueva condición: {}", id, condicion);

        GestionPacienteDTO actualizado = servicio.actualizarCondicion(id, condicion, observaciones);
        return ResponseEntity.ok(actualizado);
    }

    // ========================================================================
    // Pacientes asignados al médico actual
    // ========================================================================

    @GetMapping("/medico/asignados")
    @CheckMBACPermission(pagina = "/roles/medico/pacientes", accion = "ver", mensajeDenegado = "No tiene permiso para ver sus pacientes")
    public ResponseEntity<List<GestionPacienteDTO>> obtenerPacientesDelMedicoActual() {
        log.info("GET /api/gestion-pacientes/medico/asignados - Obteniendo pacientes del médico actual");
        List<GestionPacienteDTO> pacientes = servicio.obtenerPacientesDelMedicoActual();
        return ResponseEntity.ok(pacientes);
    }

    // ========================================================================
    // v1.47.0: Atender paciente (Recita + Interconsulta + Crónico)
    // ========================================================================

    @PostMapping("/{id}/atendido")
    @CheckMBACPermission(pagina = "/roles/medico/pacientes", accion = "editar", mensajeDenegado = "No tiene permiso para registrar atención")
    public ResponseEntity<Map<String, String>> atenderPaciente(
            @PathVariable @Min(1) Long id,
            @RequestBody @Valid AtenderPacienteRequest request,
            BindingResult bindingResult
    ) {
        log.info("🏥 [v1.47.0] POST /api/gestion-pacientes/{}/atendido - Registrando atención (idSolicitudBolsa: {})", id, id);
        log.info("📨 Request recibido: esCronico={}, enfermedades={}, tieneRecita={}, tieneInterconsulta={}",
            request.getEsCronico(),
            request.getEnfermedades() != null ? String.join(", ", request.getEnfermedades()) : "null",
            request.getTieneRecita(),
            request.getTieneInterconsulta());

        // ✅ Validación condicional
        atenderPacienteValidator.validate(request, bindingResult);
        if (bindingResult.hasErrors()) {
            String errorMessage = bindingResult.getAllErrors().stream()
                .map(error -> error.getDefaultMessage())
                .findFirst()
                .orElse("Validación fallida");
            return ResponseEntity.badRequest().body(Map.of(
                "error", errorMessage,
                "solicitudId", id.toString()
            ));
        }

        // ✅ v1.47.0: Usar idSolicitudBolsa (no idGestion) - el id es del dim_solicitud_bolsa
        // El atenderPacienteService ya espera idSolicitudBolsa
        String especialidad = request.getInterconsultaEspecialidad() != null
            ? request.getInterconsultaEspecialidad()
            : "General"; // Fallback a especialidad general

        atenderPacienteService.atenderPaciente(id, especialidad, request);

        return ResponseEntity.ok(Map.of(
            "mensaje", "Atención registrada correctamente",
            "solicitudId", id.toString()
        ));
    }

    @GetMapping("/especialidades")
    @CheckMBACPermission(pagina = "/roles/medico/pacientes", accion = "ver", mensajeDenegado = "No tiene permiso para ver especialidades")
    public ResponseEntity<List<EspecialidadSelectDTO>> obtenerEspecialidades() {
        log.info("GET /api/gestion-pacientes/especialidades - Obteniendo especialidades");

        List<EspecialidadSelectDTO> especialidades = servicioEssiRepository.findByEstado("A")
            .stream()
            .map(servicio -> EspecialidadSelectDTO.builder()
                .id(servicio.getIdServicio())
                .descServicio(servicio.getDescServicio())
                .build())
            .toList();

        return ResponseEntity.ok(especialidades);
    }
}

package com.styp.cenate.api.gestionpaciente;

import com.styp.cenate.dto.GestionPacienteDTO;
import com.styp.cenate.dto.AtenderPacienteRequest;
import com.styp.cenate.dto.EspecialidadSelectDTO;
import com.styp.cenate.dto.MedicoTeleurgenciasDTO;
import com.styp.cenate.dto.teleekgs.TeleECGImagenDTO;
import com.styp.cenate.model.AtencionClinica;
import com.styp.cenate.model.Asegurado;
import com.styp.cenate.repository.AtencionClinicaRepository;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.service.gestionpaciente.IGestionPacienteService;
import com.styp.cenate.service.gestionpaciente.AtenderPacienteService;
import com.styp.cenate.service.teleekgs.TeleECGService;
import com.styp.cenate.dto.bolsas.MotivoInterconsultaDTO;
import com.styp.cenate.repository.DimServicioEssiRepository;
import com.styp.cenate.repository.bolsas.DimMotivoInterconsultaRepository;
import com.styp.cenate.security.mbac.CheckMBACPermission;
import com.styp.cenate.validation.AtenderPacienteValidator;
import jakarta.annotation.PostConstruct;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
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
    private final TeleECGService teleECGService;
    private final AtencionClinicaRepository atencionClinicaRepository;
    private final AseguradoRepository aseguradoRepository;
    private final DimMotivoInterconsultaRepository motivoInterconsultaRepository;

    @PostConstruct
    public void init() {
        log.info("✅✅✅ GestionPacienteController INICIALIZADO EXITOSAMENTE ✅✅✅");
        log.info("📌 Servicio: " + (servicio != null ? servicio.getClass().getName() : "NULL"));
    }

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
    //@CheckMBACPermission(pagina = "/roles/medico/pacientes", accion = "ver", mensajeDenegado = "No tiene permiso para ver sus pacientes")
    public ResponseEntity<List<GestionPacienteDTO>> obtenerPacientesDelMedicoActual() {
        log.info("GET /api/gestion-pacientes/medico/asignados - Obteniendo pacientes del médico actual");
        List<GestionPacienteDTO> pacientes = servicio.obtenerPacientesDelMedicoActual();
        return ResponseEntity.ok(pacientes);
    }

    /**
     * ✅ v1.89.8: BATCH ENDPOINT - Obtener ECGs de TODOS los pacientes del médico en UNA SOLA llamada
     * ⭐ OPTIMIZACIÓN CRÍTICA: Reduce 21 llamadas → 1 llamada
     *
     * Retorna: {
     *   "07326045": [ {idImagen, evaluacion, fecha, ...}, ... ],
     *   "08290773": [ {idImagen, evaluacion, fecha, ...}, ... ],
     *   ...
     * }
     *
     * @return Map<DNI, List<ECGs>> agrupado por paciente
     */
    @GetMapping("/medico/ecgs-batch")
    //@CheckMBACPermission(pagina = "/roles/medico/pacientes", accion = "ver", mensajeDenegado = "No tiene permiso para obtener ECGs")
    public ResponseEntity<Map<String, List<TeleECGImagenDTO>>> obtenerECGsBatchDelMedico() {
        log.info("🚀 [v1.89.8] GET /api/gestion-pacientes/medico/ecgs-batch - Obteniendo TODOS los ECGs en batch");
        Map<String, List<TeleECGImagenDTO>> ecgsPorPaciente = servicio.obtenerECGsBatchDelMedicoActual();
        log.info("✅ [v1.89.8] Batch retornado: {} pacientes con ECGs", ecgsPorPaciente.size());
        return ResponseEntity.ok(ecgsPorPaciente);
    }

    /**
     * ⭐ v1.62.0: Contar pacientes pendientes del médico actual
     * Utilizado por notificaciones para mostrar campanita con contador
     * Polling cada 60 segundos desde frontend
     *
     * @return JSON con campo "pendientes" = número de pacientes con estado "Pendiente"
     */
    @GetMapping("/medico/contador-pendientes")
    //@CheckMBACPermission(pagina = "/roles/medico/pacientes", accion = "ver", mensajeDenegado = "No tiene permiso para ver sus pacientes")
    public ResponseEntity<Map<String, Long>> contarPacientesPendientes() {
        log.info("🔔 GET /api/gestion-pacientes/medico/contador-pendientes - Contando pacientes pendientes");
        long contador = servicio.contarPacientesPendientesDelMedicoActual();
        return ResponseEntity.ok(Map.of("pendientes", contador));
    }

    /**
     * ⭐ v1.76.0: Obtener datos del médico logueado (nombre + especialidad)
     * Utilizado por frontend para mostrar especialidad y determinar si mostrar columna de ECG
     *
     * @return JSON con nombre y especialidad del médico actual
     */
    @GetMapping("/medico/info")
    //@CheckMBACPermission(pagina = "/roles/medico/pacientes", accion = "ver", mensajeDenegado = "No tiene permiso")
    public ResponseEntity<Map<String, String>> obtenerInfoMedicoActual() {
        log.info("👨‍⚕️ GET /api/gestion-pacientes/medico/info - Obteniendo info del médico actual");
        Map<String, String> info = servicio.obtenerInfoMedicoActual();
        return ResponseEntity.ok(info);
    }

    /**
     * ⭐ Dashboard Coordinador: Obtener médicos de Teleurgencias con estadísticas
     * Retorna lista de médicos en el área de Teleurgencias con conteo de atenciones
     * @return Lista de MedicoTeleurgenciasDTO con estadísticas de atenciones
     */
    @GetMapping("/coordinador/medicos-teleurgencias")
    
    public ResponseEntity<List<MedicoTeleurgenciasDTO>> obtenerMedicosTeleurgenciasConEstadisticas() {
        log.info("📊 GET /api/gestion-pacientes/coordinador/medicos-teleurgencias - Obteniendo médicos de Teleurgencias");
        List<MedicoTeleurgenciasDTO> medicos = servicio.obtenerMedicosTeleurgenciasConEstadisticas();
        return ResponseEntity.ok(medicos);
    }

    // ========================================================================
    // v1.47.0: Atender paciente (Recita + Interconsulta + Crónico)
    // ========================================================================

    @PostMapping("/{id}/atendido")
    //@CheckMBACPermission(pagina = "/roles/medico/pacientes", accion = "editar", mensajeDenegado = "No tiene permiso para registrar atención")
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

        try {
            atenderPacienteService.atenderPaciente(id, especialidad, request);
            return ResponseEntity.ok(Map.of(
                "mensaje", "Atención registrada correctamente",
                "solicitudId", id.toString()
            ));
        } catch (Exception e) {
            log.error("❌ [v1.103.5] Error atendiendo paciente {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error al registrar atención: " + e.getMessage(),
                "solicitudId", id.toString()
            ));
        }
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

    // ========================================================================
    // v1.58.0: TeleECG - Panel de ECGs para coordinadores/médicos
    // ========================================================================

    @GetMapping("/teleecgs")
    @CheckMBACPermission(pagina = "/citas/gestion-asegurado", accion = "ver", mensajeDenegado = "No tiene permiso para ver ECGs")
    public ResponseEntity<Map<String, Object>> obtenerECGs(
            @RequestParam(required = false) String numDoc,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size
    ) {
        log.info("GET /api/gestion-pacientes/teleecgs - Listando ECGs para coordinador (DNI: {}, Estado: {})", numDoc, estado);

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        var imagenes = teleECGService.listarImagenes(numDoc, estado, null, null, null, pageable);

        return ResponseEntity.ok(Map.of(
            "totalElements", imagenes.getTotalElements(),
            "totalPages", imagenes.getTotalPages(),
            "currentPage", page,
            "content", imagenes.getContent()
        ));
    }

    @GetMapping("/teleecgs/{idImagen}")
    @CheckMBACPermission(pagina = "/citas/gestion-asegurado", accion = "ver", mensajeDenegado = "No tiene permiso para ver ECG")
    public ResponseEntity<TeleECGImagenDTO> obtenerECGDetalle(
            @PathVariable @Min(1) Long idImagen
    ) {
        log.info("GET /api/gestion-pacientes/teleecgs/{} - Obteniendo detalles ECG", idImagen);

        TeleECGImagenDTO ecg = teleECGService.obtenerDetallesImagen(idImagen, null, null);
        return ResponseEntity.ok(ecg);
    }

    @PutMapping("/teleecgs/{idImagen}/atender")
    @CheckMBACPermission(pagina = "/citas/gestion-asegurado", accion = "editar", mensajeDenegado = "No tiene permiso para atender ECGs")
    public ResponseEntity<Map<String, String>> atenderECG(
            @PathVariable @Min(1) Long idImagen,
            @RequestBody @Valid AtenderPacienteRequest request
    ) {
        log.info("PUT /api/gestion-pacientes/teleecgs/{}/atender - Atendiendo ECG con especialidad: {}",
            idImagen, request.getInterconsultaEspecialidad());

        // Reutilizar servicio de atención existente
        String especialidad = request.getInterconsultaEspecialidad() != null
            ? request.getInterconsultaEspecialidad()
            : "General";

        atenderPacienteService.atenderPaciente(idImagen, especialidad, request);

        return ResponseEntity.ok(Map.of(
            "mensaje", "ECG atendido correctamente",
            "imagenId", idImagen.toString()
        ));
    }

    /**
     * ✅ v1.64.0: Endpoint administrativo para actualizar valores por defecto en Bolsa 107
     * Aplica las transformaciones de datos a la BD:
     * - tiempoInicioSintomas null → "> 72 hrs."
     * - consentimientoInformado null (sin Deserción) → true
     * - estado Deserción → consentimientoInformado = false
     */
    @PostMapping("/admin/actualizar-valores-bolsa107")
    @CheckMBACPermission(pagina = "/roles/coordinador/gestion-pacientes", accion = "actualizar", mensajeDenegado = "No tiene permiso para actualizar valores de Bolsa 107")
    public ResponseEntity<?> actualizarValoresBolsa107() {
        try {
            log.info("🚀 Iniciando actualización de valores por defecto para Bolsa 107...");
            servicio.actualizarValoresPorDefectoBlsa107();
            return ResponseEntity.ok(Map.of(
                "mensaje", "✅ Valores por defecto de Bolsa 107 actualizados correctamente",
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            log.error("❌ Error al actualizar valores de Bolsa 107: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Error al actualizar: " + e.getMessage(),
                "timestamp", System.currentTimeMillis()
            ));
        }
    }

    // ✅ v1.78.3: Historial de controles de enfermería por DNI
    @GetMapping("/paciente/{dni}/controles-enfermeria")
    public ResponseEntity<List<Map<String, Object>>> obtenerControlesEnfermeria(@PathVariable String dni) {
        try {
            log.info("GET /api/gestion-pacientes/paciente/{}/controles-enfermeria", dni);
            // ✅ v1.103.7: pk_asegurado es UUID — resolver desde DNI antes de consultar
            String pkAsegurado = aseguradoRepository.findByDocPaciente(dni)
                    .map(Asegurado::getPkAsegurado)
                    .orElse(dni); // fallback a DNI para registros legacy
            List<AtencionClinica> controles = atencionClinicaRepository
                    .findByPkAseguradoAndIdTipoAtencionOrderByFechaAtencionDesc(pkAsegurado, 5L);

            List<Map<String, Object>> resultado = controles.stream().map(a -> {
                Map<String, Object> item = new java.util.LinkedHashMap<>();
                item.put("idAtencion", a.getIdAtencion());
                item.put("fechaAtencion", a.getFechaAtencion());
                item.put("presionArterial", a.getPresionArterial());
                item.put("glucosa", a.getGlucosa());
                item.put("pesoKg", a.getPesoKg());
                item.put("tallaCm", a.getTallaCm());
                item.put("imc", a.getImc());
                item.put("controlEnfermeria", a.getControlEnfermeria());
                item.put("adherenciaMorisky", a.getAdherenciaMorisky());
                item.put("nivelRiesgo", a.getNivelRiesgo());
                item.put("controlado", a.getControlado());
                item.put("observaciones", a.getObservacionesGenerales());
                return item;
            }).toList();

            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("❌ Error obteniendo controles enfermería para DNI {}: {}", dni, e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }

    // ✅ v1.79.0: Editar control de enfermería del mismo día
    @PutMapping("/atencion/{idAtencion}/enfermeria")
    public ResponseEntity<?> actualizarControlEnfermeria(
            @PathVariable Long idAtencion,
            @RequestBody Map<String, Object> body) {
        try {
            log.info("PUT /api/gestion-pacientes/atencion/{}/enfermeria", idAtencion);

            AtencionClinica atencion = atencionClinicaRepository.findById(idAtencion)
                    .orElseThrow(() -> new RuntimeException("Atención no encontrada: " + idAtencion));

            // Verificar que el registro sea del día actual (zona Lima)
            if (atencion.getFechaAtencion() == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Registro sin fecha de atención"));
            }
            LocalDate hoy = LocalDate.now(ZoneId.of("America/Lima"));
            LocalDate fechaRegistro = atencion.getFechaAtencion()
                    .atZoneSameInstant(ZoneId.of("America/Lima"))
                    .toLocalDate();
            if (!fechaRegistro.equals(hoy)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Solo se puede editar registros del día actual"));
            }

            if (body.containsKey("presionArterial")) atencion.setPresionArterial((String) body.get("presionArterial"));
            if (body.containsKey("glucosa") && body.get("glucosa") != null)
                atencion.setGlucosa(new BigDecimal(body.get("glucosa").toString()));
            if (body.containsKey("pesoKg") && body.get("pesoKg") != null)
                atencion.setPesoKg(new BigDecimal(body.get("pesoKg").toString()));
            if (body.containsKey("tallaCm") && body.get("tallaCm") != null)
                atencion.setTallaCm(new BigDecimal(body.get("tallaCm").toString()));
            if (body.containsKey("imc") && body.get("imc") != null)
                atencion.setImc(new BigDecimal(body.get("imc").toString()));
            if (body.containsKey("controlEnfermeria")) atencion.setControlEnfermeria((String) body.get("controlEnfermeria"));
            if (body.containsKey("adherenciaMorisky")) atencion.setAdherenciaMorisky((String) body.get("adherenciaMorisky"));
            if (body.containsKey("nivelRiesgo")) atencion.setNivelRiesgo((String) body.get("nivelRiesgo"));
            if (body.containsKey("controlado")) atencion.setControlado((String) body.get("controlado"));
            if (body.containsKey("observaciones")) atencion.setObservacionesGenerales((String) body.get("observaciones"));

            atencionClinicaRepository.save(atencion);
            log.info("✅ Control enfermería actualizado: idAtencion={}", idAtencion);
            return ResponseEntity.ok(Map.of("status", "ok", "idAtencion", idAtencion));

        } catch (Exception e) {
            log.error("❌ Error actualizando control enfermería {}: {}", idAtencion, e.getMessage(), e);
            String msg = e.getMessage() != null ? e.getMessage() : "Error interno al actualizar enfermería";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", msg));
        }
    }

    // ✅ v1.0.0: Obtener motivos de interconsulta (para rol ENFERMERIA)
    @GetMapping("/motivos-interconsulta")
    public ResponseEntity<List<MotivoInterconsultaDTO>> obtenerMotivosInterconsulta() {
        try {
            List<MotivoInterconsultaDTO> motivos = motivoInterconsultaRepository.findByActivoTrueOrderByOrdenAsc()
                    .stream()
                    .map(m -> MotivoInterconsultaDTO.builder()
                            .id(m.getId())
                            .codigo(m.getCodigo())
                            .descripcion(m.getDescripcion())
                            .activo(m.getActivo())
                            .orden(m.getOrden())
                            .build())
                    .toList();
            return ResponseEntity.ok(motivos);
        } catch (Exception e) {
            log.error("❌ Error obteniendo motivos de interconsulta: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ v1.78.2: Endpoint separado para cargar EKG sin afectar transacción principal
    @GetMapping("/paciente/{dni}/ekg")
    //@CheckMBACPermission(pagina = "/roles/medico/pacientes", accion = "ver")
    public ResponseEntity<Map<String, Object>> obtenerDatosEKG(@PathVariable String dni) {
        try {
            log.info("GET /api/gestion-pacientes/paciente/{}/ekg - Obteniendo datos EKG", dni);
            Map<String, Object> datosEKG = servicio.obtenerDatosEKGPaciente(dni);
            return ResponseEntity.ok(datosEKG);
        } catch (Exception e) {
            log.warn("No se pudieron obtener datos EKG para paciente {}: {}", dni, e.getMessage());
            return ResponseEntity.ok(Map.of(
                "fechaTomaEKG", null,
                "esUrgente", false,
                "error", e.getMessage()
            ));
        }
    }
}

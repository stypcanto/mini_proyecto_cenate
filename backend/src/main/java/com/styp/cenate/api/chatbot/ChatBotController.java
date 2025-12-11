package com.styp.cenate.api.chatbot;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.styp.cenate.dto.AtencionesServicioCenateDTO;
import com.styp.cenate.dto.AtencionesServicioGlobalDTO;
import com.styp.cenate.dto.ChatBotPacienteDTO;
import com.styp.cenate.dto.ChatBotServicioDTO;
import com.styp.cenate.service.chatbot.IChatBotService;
import com.styp.cenate.service.chatbot.atenciones.IAtencionesServicioCenateService;
import com.styp.cenate.service.chatbot.atenciones.IAtencionesServicioGlobalService;
import com.styp.cenate.service.personal.DimServicioEssiService;
import com.styp.cenate.utils.CalculoFechas;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.extern.slf4j.Slf4j;

/**
 * ============================================================
 * 🧩 Controlador REST: ChatBotController
 * ============================================================
 * Controlador que expone los endpoints principales del módulo ChatBot,
 * permitiendo consultar información de pacientes asegurados y sus
 * atenciones (CENATE y Global). Integra distintos servicios para construir
 * una respuesta consolidada usada por el frontend o ChatBot conversacional.
 *
 * <p><b>Base path:</b> {@code /api/chatbot}</p>
 * <p><b>Formato de respuesta:</b> JSON</p>
 * <p><b>Autenticación:</b> Depende de la configuración de seguridad del backend.</p>
 *
 * <h3>Códigos HTTP comunes</h3>
 * <ul>
 *   <li>200 OK – Operación exitosa.</li>
 *   <li>400 Bad Request – Error de validación de parámetros.</li>
 *   <li>404 Not Found – No se encontraron registros.</li>
 *   <li>500 Internal Server Error – Error inesperado.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/chatbot")
@Slf4j
@Validated
public class ChatBotController {

    private final IChatBotService servicioChatBot;
    private final IAtencionesServicioCenateService servicioAtencion;
    private final IAtencionesServicioGlobalService servicioAtencionGlobal;
    private final DimServicioEssiService servicioEssi;

    public ChatBotController(
            IChatBotService servicioChatBot,
            IAtencionesServicioCenateService servicioAtencion,
            IAtencionesServicioGlobalService servicioAtencionGlobal,
            DimServicioEssiService servicioEssi) {
        this.servicioChatBot = servicioChatBot;
        this.servicioAtencion = servicioAtencion;
        this.servicioAtencionGlobal = servicioAtencionGlobal;
        this.servicioEssi = servicioEssi;
    }

    // ============================================================
    // CONSULTA DE PACIENTE GENERAL
    // ============================================================

    /**
     * Consulta información consolidada de un paciente por número de documento.
     *
     * <p>Devuelve información básica del paciente (documento, nombre, sexo)
     * junto con sus banderas de cobertura y listas de atenciones tanto CENATE
     * como Global. Incluye además los servicios por defecto habilitados para
     * nuevas solicitudes.</p>
     *
     * <p><b>Ejemplo:</b> GET /api/chatbot/documento/12345678</p>
     *
     * @param documento Número de documento (8–12 caracteres).
     * @return {@link ChatBotPacienteDTO} con información consolidada del paciente.
     */
    @GetMapping("/documento/{documento}")
    public ResponseEntity<?> consultarDocumento(
            @PathVariable
            @NotBlank(message = "El documento es obligatorio")
            @Size(min = 8, max = 12, message = "El documento debe tener entre 8 y 12 caracteres")
            String documento) {

        log.info("Consultando asegurado por: {}", documento);

        // Información básica del paciente
        var entidad = servicioChatBot.consultarPaciente(documento);
        
        boolean esPacienteCenate= servicioAtencion.existsByDocPaciente(documento);
        boolean esPacienteNuevo= !esPacienteCenate;
        
        
        ChatBotPacienteDTO objPaciente = new ChatBotPacienteDTO();
        objPaciente.setDocumento(entidad.getDocPaciente());
        objPaciente.setNombre(entidad.getPaciente());
        objPaciente.setSexo(entidad.getSexo());
        objPaciente.setTieneCobertura(true);
        objPaciente.setEsPacienteCenate(esPacienteCenate);
        objPaciente.setEsPacienteNuevo(esPacienteNuevo);
        objPaciente.setTelefono(entidad.getTelefono());
        objPaciente.setFechaNacimiento(entidad.getFechaNacimiento());
        objPaciente.setEdad(CalculoFechas.calcularEdad(entidad.getFechaNacimiento()));
        
        // Consulta Servicios por defecto
        List<ChatBotServicioDTO> serviciosDefecto = servicioEssi
                .findByEstadoAndEsCenateAndEsAperturaNuevos()
                .stream()
                .map(a -> new ChatBotServicioDTO(a.getCodServicio(), a.getDescServicio()))
                .toList();

        if (esPacienteNuevo) {
            //objPaciente.setListarServiciosDefecto(serviciosDefecto);
            objPaciente.setListarServiciosDisponibles(new HashSet<>(serviciosDefecto));
            return ResponseEntity.ok(objPaciente);
        }
        
       // si no es nuevo- continua el flujo
        // Consulta Atenciones en 6 meses- Sin duplicados
        List<ChatBotServicioDTO> listaCenate = servicioAtencion.findByDocPaciente(documento)
                .stream().map(a -> new ChatBotServicioDTO(a.codServicio(), a.servicio())).distinct().toList();
        objPaciente.setListaAtencionesCenate(listaCenate);
        
        // INI - Consolidar disponibles******************************************
        Set<ChatBotServicioDTO> disponibles = new HashSet<>();
        disponibles.addAll(serviciosDefecto);// Por defecto se llena esto.
        
        // Consulta Servicios Disponibles en Cenate
        List<ChatBotServicioDTO> serviciosDisponibles = servicioEssi.listarActivosCenate()
        		.stream().map(a-> new ChatBotServicioDTO(a.getCodServicio(), a.getDescServicio()))
        		.collect(Collectors.toList());
        
        List<ChatBotServicioDTO> interseccion = listaCenate.stream()
        		.filter( s-> serviciosDisponibles.stream()
        				.anyMatch(a-> a.getIdServicio().equals(s.getIdServicio()))
        				).collect(Collectors.toList());
        
        disponibles.addAll(interseccion);
        
        
        
        objPaciente.setListarServiciosDisponibles(disponibles);
        // FIN - Consolidar disponibles******************************************
        return ResponseEntity.ok(objPaciente);
    }

    // ============================================================
    // ATENCIONES CENATE
    // ============================================================

    /**
     * Lista todas las atenciones registradas en CENATE por número de documento.
     *
     * <p><b>Ejemplo:</b> GET /api/chatbot/atencioncenate?documento=12345678</p>
     */
    @GetMapping("/atencioncenate")
    public ResponseEntity<?> consultarAtencionesPorDocumento(
            @RequestParam
            @NotBlank(message = "El parámetro 'documento' es obligatorio")
            @Size(min = 8, max = 12)
            String documento) {

        var lista = servicioAtencion.findByDocPaciente(documento);
        if (lista.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message", "No se encontraron atenciones para el documento",
                            "status", HttpStatus.NOT_FOUND.value(),
                            "timestamp", LocalDateTime.now().toString()));
        }
        return ResponseEntity.ok(lista);
    }

    /**
     * Lista las atenciones CENATE filtrando por documento y nombre exacto del servicio.
     *
     * <p><b>Ejemplo:</b> GET /api/chatbot/atencioncenate/buscar?documento=12345678&servicio=MEDICINA INTERNA</p>
     */
    @GetMapping("/atencioncenate/buscar")
    public ResponseEntity<?> consultarPorDocumentoYServicio(
            @RequestParam @NotBlank @Size(min = 8, max = 12) String documento,
            @RequestParam @NotBlank @Size(min = 3, max = 120) String servicio) {

        List<AtencionesServicioCenateDTO> lista =
                servicioAtencion.findByDocPacienteAndServicio(documento, servicio);

        if (lista.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message", "No se encontraron atenciones para el documento " + documento +
                                       " en el servicio: " + servicio,
                            "status", HttpStatus.NOT_FOUND.value(),
                            "timestamp", LocalDateTime.now().toString()));
        }
        return ResponseEntity.ok(lista);
    }

    // ============================================================
    // ATENCIONES GLOBALES
    // ============================================================

    /**
     * Consulta atenciones globales de un paciente por documento.
     *
     * <p><b>Ejemplo:</b> GET /api/chatbot/atencionglobal/12345678</p>
     */
    @GetMapping("/atencionglobal/{documento}")
    public ResponseEntity<?> listarPorDocumento(
            @PathVariable
            @NotBlank @Size(min = 8, max = 12)
            String documento) {

        log.info("Consultando atenciones globales por documento: {}", documento);
        List<AtencionesServicioGlobalDTO> lista = servicioAtencionGlobal.findByDocPaciente(documento);

        if (lista.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "status", HttpStatus.NOT_FOUND.value(),
                            "message", "No se encontraron atenciones para el documento " + documento,
                            "timestamp", OffsetDateTime.now().toString()));
        }

        return ResponseEntity.ok(Map.of(
                "status", HttpStatus.OK.value(),
                "count", lista.size(),
                "data", lista,
                "timestamp", OffsetDateTime.now().toString()));
    }

    /**
     * Consulta atenciones globales por documento y código de servicio.
     *
     * <p><b>Ejemplo:</b> GET /api/chatbot/atencionglobal/doc-codservicio?documento=12345678&codServicio=010</p>
     */
    @GetMapping("/atencionglobal/doc-codservicio")
    public ResponseEntity<?> porDocumentoYCodServicio(
            @RequestParam @NotBlank @Size(min = 8, max = 12) String documento,
            @RequestParam @NotBlank String codServicio) {

        List<AtencionesServicioGlobalDTO> lista =
                servicioAtencionGlobal.findByDocPacienteAndCodServicio(documento, codServicio);

        if (lista.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "status", HttpStatus.NOT_FOUND.value(),
                            "message", "No se encontraron atenciones para el documento " + documento +
                                       " con el código de servicio " + codServicio,
                            "timestamp", OffsetDateTime.now().toString()));
        }

        return ResponseEntity.ok(Map.of(
                "status", HttpStatus.OK.value(),
                "count", lista.size(),
                "data", lista,
                "timestamp", OffsetDateTime.now().toString()));
    }

    /**
     * Consulta atenciones globales por documento y nombre exacto del servicio.
     *
     * <p><b>Ejemplo:</b> GET /api/chatbot/atencionglobal/doc-nomservicio?documento=12345678&servicio=MEDICINA INTERNA</p>
     */
    @GetMapping("/atencionglobal/doc-nomservicio")
    public ResponseEntity<?> porDocumentoYServicio(
            @RequestParam @NotBlank @Size(min = 8, max = 12) String documento,
            @RequestParam @NotBlank @Size(min = 3, max = 120) String servicio) {

        List<AtencionesServicioGlobalDTO> lista =
                servicioAtencionGlobal.findByDocPacienteAndServicio(documento, servicio);

        if (lista.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "status", HttpStatus.NOT_FOUND.value(),
                            "message", "No se encontraron atenciones para el documento " + documento +
                                       " en el servicio: " + servicio,
                            "timestamp", OffsetDateTime.now().toString()));
        }

        return ResponseEntity.ok(Map.of(
                "status", HttpStatus.OK.value(),
                "count", lista.size(),
                "data", lista,
                "timestamp", OffsetDateTime.now().toString()));
    }

    /**
     * Búsqueda parcial (case-insensitive) de atenciones globales por servicio.
     *
     * <p><b>Ejemplo:</b> GET /api/chatbot/atencionglobal/doc-nomserviciolike?documento=12345678&servicio=medicina</p>
     */
    @GetMapping("/atencionglobal/doc-nomserviciolike")
    public ResponseEntity<?> porDocumentoYServicioParcial(
            @RequestParam @NotBlank @Size(min = 8, max = 12) String documento,
            @RequestParam @NotBlank @Size(min = 3, max = 120) String servicio) {

        List<AtencionesServicioGlobalDTO> lista =
                servicioAtencionGlobal.findByDocPacienteAndServicioContainingIgnoreCase(documento, servicio);

        if (lista.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "status", HttpStatus.NOT_FOUND.value(),
                            "message", "No se encontraron atenciones para el documento " + documento +
                                       " que contengan el servicio: " + servicio,
                            "timestamp", OffsetDateTime.now().toString()));
        }

        return ResponseEntity.ok(Map.of(
                "status", HttpStatus.OK.value(),
                "count", lista.size(),
                "data", lista,
                "timestamp", OffsetDateTime.now().toString()));
    }
    
  
    
    
    
}

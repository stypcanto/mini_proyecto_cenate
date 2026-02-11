package com.styp.cenate.service.gestionpaciente;

import com.styp.cenate.dto.GestionPacienteDTO;
import com.styp.cenate.dto.MedicoTeleurgenciasDTO;
import com.styp.cenate.model.Asegurado;
import com.styp.cenate.model.GestionPaciente;
import com.styp.cenate.model.Ipress;
import com.styp.cenate.model.PersonalCnt;
import com.styp.cenate.model.TeleECGImagen;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.model.chatbot.SolicitudCita;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.repository.GestionPacienteRepository;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.repository.PersonalCntRepository;
import com.styp.cenate.repository.TeleECGImagenRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import com.styp.cenate.repository.chatbot.SolicitudCitaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Period;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GestionPacienteServiceImpl implements IGestionPacienteService {

    private final GestionPacienteRepository repository;
    private final AseguradoRepository aseguradoRepository;
    private final IpressRepository ipressRepository;
    private final UsuarioRepository usuarioRepository;
    private final PersonalCntRepository personalCntRepository;
    private final SolicitudCitaRepository solicitudCitaRepository;
    private final SolicitudBolsaRepository solicitudBolsaRepository;
    private final TeleECGImagenRepository teleECGImagenRepository;
    private final JdbcTemplate jdbcTemplate;  // ✅ v1.78.0: Para consultas directas de especialidad

    @Override
    @Transactional
    public GestionPacienteDTO guardar(GestionPacienteDTO dto) {
        log.info("Guardando gestión para asegurado: {}", dto.getPkAsegurado());

        // Buscar el asegurado
        Asegurado asegurado = aseguradoRepository.findById(dto.getPkAsegurado())
            .orElseThrow(() -> new RuntimeException("Asegurado no encontrado: " + dto.getPkAsegurado()));

        // ✅ v1.46.0: PERMITIR MÚLTIPLES GESTIONES del mismo paciente
        // Un paciente puede tener múltiples gestiones (para diferentes médicos/asignaciones)
        // Solo validar que el asegurado exista (ya se hizo arriba)

        GestionPaciente entity = GestionPaciente.builder()
            .asegurado(asegurado)
            .condicion(dto.getCondicion())
            .gestora(dto.getGestora())
            .observaciones(dto.getObservaciones())
            .origen(dto.getOrigen())
            .seleccionadoTelemedicina(dto.getSeleccionadoTelemedicina())
            .build();

        GestionPaciente saved = repository.save(entity);
        log.info("Gestión guardada con ID: {}", saved.getIdGestion());

        return toDto(saved);
    }

    @Override
    @Transactional
    public GestionPacienteDTO actualizar(Long id, GestionPacienteDTO dto) {
        log.info("Actualizando gestión con ID: {}", id);

        GestionPaciente existing = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Gestión no encontrada con ID: " + id));

        // Solo actualizar campos de gestión (no datos del asegurado)
        existing.setCondicion(dto.getCondicion());
        existing.setGestora(dto.getGestora());
        existing.setObservaciones(dto.getObservaciones());
        existing.setOrigen(dto.getOrigen());
        existing.setSeleccionadoTelemedicina(dto.getSeleccionadoTelemedicina());

        GestionPaciente updated = repository.save(existing);
        log.info("Gestión actualizada: {}", updated.getIdGestion());

        return toDto(updated);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        log.info("Eliminando gestión con ID: {}", id);

        if (!repository.existsById(id)) {
            throw new RuntimeException("Gestión no encontrada con ID: " + id);
        }

        repository.deleteById(id);
        log.info("Gestión eliminada: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GestionPacienteDTO> listar() {
        log.info("Listando todas las gestiones");
        return repository.findAll().stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<GestionPacienteDTO> buscarPorId(Long id) {
        log.info("Buscando gestión por ID: {}", id);
        return repository.findById(id).map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GestionPacienteDTO> buscarPorNumDoc(String numDoc) {
        log.info("Buscando gestiones por documento: {}", numDoc);
        return repository.findByNumDoc(numDoc).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GestionPacienteDTO> buscarPorCondicion(String condicion) {
        log.info("Buscando gestiones por condición: {}", condicion);
        return repository.findByCondicion(condicion).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GestionPacienteDTO> buscarPorGestora(String gestora) {
        log.info("Buscando gestiones por gestora: {}", gestora);
        return repository.findByGestora(gestora).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GestionPacienteDTO> buscarPorIpress(String codIpress) {
        log.info("Buscando gestiones por IPRESS: {}", codIpress);
        return repository.findByIpress(codIpress).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GestionPacienteDTO> listarSeleccionadosTelemedicina() {
        log.info("Listando gestiones seleccionadas para telemedicina");
        return repository.findBySeleccionadoTelemedicina(true).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GestionPacienteDTO seleccionarParaTelemedicina(Long id, Boolean seleccionado) {
        log.info("Actualizando selección telemedicina para ID: {} a {}", id, seleccionado);

        GestionPaciente existing = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Gestión no encontrada con ID: " + id));

        existing.setSeleccionadoTelemedicina(seleccionado);

        GestionPaciente updated = repository.save(existing);
        return toDto(updated);
    }

    @Override
    @Transactional
    public List<GestionPacienteDTO> seleccionarMultiplesParaTelemedicina(List<Long> ids, Boolean seleccionado) {
        log.info("Actualizando selección telemedicina para {} gestiones", ids.size());

        List<GestionPaciente> gestiones = repository.findAllById(ids);

        gestiones.forEach(g -> g.setSeleccionadoTelemedicina(seleccionado));

        List<GestionPaciente> updated = repository.saveAll(gestiones);

        return updated.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GestionPacienteDTO actualizarCondicion(Long id, String condicion, String observaciones) {
        log.info("Actualizando condición para ID: {} a {}", id, condicion);

        // ✅ v1.64.0: Extraer campos clínicos de Bolsa 107 si vienen en JSON
        String tiempoInicioSintomas = null;
        Boolean consentimientoInformado = null;
        String observacionesLimpias = observaciones;

        if (observaciones != null && !observaciones.isEmpty()) {
            try {
                // Si es JSON (comienza con {), extraer campos
                if (observaciones.trim().startsWith("{")) {
                    com.fasterxml.jackson.databind.JsonNode node =
                        new com.fasterxml.jackson.databind.ObjectMapper().readTree(observaciones);

                    if (node.has("tiempoInicioSintomas")) {
                        tiempoInicioSintomas = node.get("tiempoInicioSintomas").asText();
                        log.info("✅ Extraído tiempoInicioSintomas: {}", tiempoInicioSintomas);
                    }
                    if (node.has("consentimientoInformado")) {
                        consentimientoInformado = node.get("consentimientoInformado").asBoolean();
                        log.info("✅ Extraído consentimientoInformado: {}", consentimientoInformado);
                    }
                    observacionesLimpias = ""; // No guardar JSON en observaciones
                }
            } catch (Exception e) {
                log.warn("No se pudo parsear JSON de observaciones, se guardará como texto: {}", e.getMessage());
                observacionesLimpias = observaciones;
            }
        }

        // ✅ v1.46.0: Intentar actualizar en GestionPaciente primero
        var gestionOpt = repository.findById(id);

        if (gestionOpt.isPresent()) {
            // Actualizar en gestion_paciente
            GestionPaciente existing = gestionOpt.get();
            existing.setCondicion(condicion);
            existing.setObservaciones(observacionesLimpias);
            GestionPaciente updated = repository.save(existing);
            log.info("✅ Condición actualizada en tabla gestion_paciente: {}", id);
            return toDto(updated);
        }

        // ✅ v1.46.0: Si no existe en gestion_paciente, intentar actualizar en SolicitudBolsa
        // El ID podría ser el idSolicitudBolsa
        var solicitudOpt = solicitudBolsaRepository.findById(id);

        if (solicitudOpt.isPresent()) {
            SolicitudBolsa existing = solicitudOpt.get();
            existing.setCondicionMedica(condicion);
            existing.setObservacionesMedicas(observacionesLimpias);

            // ✅ v1.64.0: Actualizar campos clínicos de Bolsa 107
            if (tiempoInicioSintomas != null) {
                existing.setTiempoInicioSintomas(tiempoInicioSintomas);
                log.info("✅ Actualizado tiempoInicioSintomas: {}", tiempoInicioSintomas);
            }
            if (consentimientoInformado != null) {
                existing.setConsentimientoInformado(consentimientoInformado);
                log.info("✅ Actualizado consentimientoInformado: {}", consentimientoInformado);
            }

            // ✅ v1.47.0: Guardar fecha de atención cuando se marca como "Atendido" o "Deserción"
            if ("Atendido".equalsIgnoreCase(condicion) || "Deserción".equalsIgnoreCase(condicion)) {
                // Usar zona horaria de Perú (UTC-5)
                // Obtener el momento actual (Instant es independiente de timezone)
                // Luego aplicar la zona horaria de Perú explícitamente
                ZonedDateTime zonedDateTime = Instant.now().atZone(ZoneId.of("America/Lima"));
                OffsetDateTime fechaAtencion = zonedDateTime.toOffsetDateTime();
                existing.setFechaAtencionMedica(fechaAtencion);
                log.info("✅ Fecha de atención registrada (Instant→America/Lima): {} | LocalTime: {}", fechaAtencion, zonedDateTime.toLocalTime());
            } else if ("Pendiente".equalsIgnoreCase(condicion)) {
                // ✅ v1.47.0: Limpiar fecha de atención cuando se cambia a "Pendiente"
                existing.setFechaAtencionMedica(null);
                log.info("✅ Fecha de atención limpiada - estado cambiado a Pendiente");
            }

            SolicitudBolsa updated = solicitudBolsaRepository.save(existing);
            log.info("✅ Condición actualizada en tabla dim_solicitud_bolsa: {}", id);
            return bolsaToGestionDTO(updated);
        }

        // Si no existe en ninguna tabla, lanzar excepción
        throw new RuntimeException("Gestión o Solicitud no encontrada con ID: " + id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<GestionPacienteDTO> buscarAseguradoPorDni(String dni) {
        log.info("Buscando asegurado por DNI: {}", dni);

        return aseguradoRepository.findByDocPaciente(dni)
            .map(this::aseguradoToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GestionPacienteDTO> obtenerPacientesDelMedicoActual() {
        try {
            // Obtener el usuario autenticado
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            log.info("Obteniendo pacientes para el médico: {}", username);

            // Buscar el usuario con sus datos personales completos
            Usuario usuario = usuarioRepository.findByNameUserWithFullDetails(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));

            // Verificar que el usuario tenga PersonalCnt (sea personal interno/CENATE)
            PersonalCnt personalCnt = usuario.getPersonalCnt();
            if (personalCnt == null) {
                log.warn("Usuario {} no tiene datos de PersonalCnt", username);
                return List.of();
            }

            Long idPers = personalCnt.getIdPers();
            log.info("ID del médico (PersonalCnt): {}", idPers);

            // ✅ v1.45.0: Buscar pacientes asignados directamente en dim_solicitud_bolsa (idPersonal)
            // Esta es la fuente correcta de asignaciones médicas (desde GestionAsegurado)
            // 🔧 v1.78.1: Buscar sin filtro activo=true para mostrar TODOS los pacientes asignados
            List<SolicitudBolsa> solicitudesBolsa = solicitudBolsaRepository.findByIdPersonal(idPers);
            log.info("Se encontraron {} solicitudes en bolsas para el médico {}", solicitudesBolsa.size(), idPers);

            // Extraer DNIs únicos de los pacientes de esas solicitudes
            Set<String> dnis = solicitudesBolsa.stream()
                .map(SolicitudBolsa::getPacienteDni)
                .filter(dni -> dni != null && !dni.isEmpty())
                .collect(Collectors.toSet());

            log.info("Se encontraron {} pacientes únicos en bolsas asignadas", dnis.size());

            if (dnis.isEmpty()) {
                // Fallback: Si no hay solicitudes en bolsas, buscar en citas (SolicitudCita)
                log.info("No hay solicitudes en bolsas. Intentando con citas (SolicitudCita)...");
                List<SolicitudCita> citas = solicitudCitaRepository.findByPersonal_IdPers(idPers);
                log.info("Se encontraron {} citas para el médico {}", citas.size(), idPers);

                dnis = citas.stream()
                    .map(SolicitudCita::getDocPaciente)
                    .filter(dni -> dni != null && !dni.isEmpty())
                    .collect(Collectors.toSet());

                log.info("Se encontraron {} pacientes únicos en citas", dnis.size());
            }

            if (dnis.isEmpty()) {
                return List.of();
            }

            // ✅ v1.45.0: Retornar directamente desde SolicitudBolsa (no buscar en GestionPaciente que puede estar vacía)
            // Si vinieron del primer query (SolicitudBolsa), retornar esos registros como DTOs
            if (!solicitudesBolsa.isEmpty()) {
                log.info("✅ Retornando pacientes desde solicitudesBolsa (dim_solicitud_bolsa)");
                return solicitudesBolsa.stream()
                    .map(this::bolsaToGestionDTO)
                    .collect(Collectors.toList());
            }

            // Si vinieron del fallback (SolicitudCita), buscar en GestionPaciente
            log.info("Buscando pacientes en gestion_paciente (fallback desde SolicitudCita)");
            List<GestionPaciente> gestiones = dnis.stream()
                .flatMap(dni -> repository.findByNumDoc(dni).stream())
                .collect(Collectors.toList());

            log.info("Se encontraron {} gestiones de pacientes para el médico {}", gestiones.size(), idPers);

            // Convertir a DTOs y retornar
            return gestiones.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error obteniendo pacientes del médico actual", e);
            throw new RuntimeException("Error obteniendo pacientes: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public long contarPacientesPendientesDelMedicoActual() {
        try {
            // ⭐ v1.62.0: Obtener el usuario autenticado
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            log.info("🔔 Contando pacientes pendientes para el médico: {}", username);

            // Buscar el usuario con sus datos personales completos
            Usuario usuario = usuarioRepository.findByNameUserWithFullDetails(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));

            // Verificar que el usuario tenga PersonalCnt (sea personal interno/CENATE)
            PersonalCnt personalCnt = usuario.getPersonalCnt();
            if (personalCnt == null) {
                log.warn("Usuario {} no tiene datos de PersonalCnt", username);
                return 0;
            }

            Long idPers = personalCnt.getIdPers();
            log.info("ID del médico (PersonalCnt): {}", idPers);

            // ⭐ v1.62.0: Contar pacientes pendientes usando query optimizada COUNT(*)
            long contador = solicitudBolsaRepository.countByIdPersonalAndCondicionPendiente(idPers);
            log.info("✅ Se encontraron {} pacientes pendientes para el médico {}", contador, idPers);

            return contador;

        } catch (Exception e) {
            log.error("Error contando pacientes pendientes del médico actual", e);
            throw new RuntimeException("Error contando pacientes pendientes: " + e.getMessage(), e);
        }
    }

    /**
     * ⭐ v1.76.0: Obtener información del médico logueado (nombre + especialidad)
     * Utilizado por frontend para mostrar especialidad y determinar si mostrar columna de ECG
     *
     * @return Map con "nombre" y "especialidad" del médico actual
     */
    @Override
    @Transactional(readOnly = true)
    public Map<String, String> obtenerInfoMedicoActual() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            log.info("👨‍⚕️ Obteniendo info del médico: {}", username);

            // Buscar el usuario con sus datos personales completos
            Usuario usuario = usuarioRepository.findByNameUserWithFullDetails(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));

            // Obtener PersonalCnt para acceder a especialidad
            PersonalCnt personalCnt = usuario.getPersonalCnt();
            if (personalCnt == null) {
                log.warn("Usuario {} no tiene datos de PersonalCnt", username);
                return Map.of(
                    "nombre", usuario.getNameUser(),
                    "especialidad", "Sin especialidad"
                );
            }

            // Obtener especialidad del PersonalCnt
            // ⭐ NOTA v1.78.0: Temporalmente retornando "Cardiología" para pruebas de featured EKG column
            // En producción, esto debe obtenerse de la BD correctamente
            String especialidad = "Cardiología";  // TEST: para verificar que la columna de EKG aparece

            try {
                if (personalCnt != null && personalCnt.getIdPers() != null) {
                    // TODO: Implementar query correcta para obtener especialidad desde BD
                    // String sqlEspecialidad = "SELECT COALESCE(desc_especialidad, 'Sin especialidad') FROM dim_especialidad WHERE id_especialidad = ?";
                    // especialidad = jdbcTemplate.queryForObject(sqlEspecialidad, String.class, personalCnt.getIdEspecialidad());

                    log.debug("✅ v1.78.0: Especalidad del doctor retornada (TEST): {}", especialidad);
                }
            } catch (Exception e) {
                log.warn("Error obteniendo especialidad para médico {}: {}", usuario.getIdUser(), e.getMessage());
                especialidad = "Cardiología";  // TEST value
            }

            // Construir nombre completo
            String nombreCompleto = buildFullName(
                personalCnt.getApePaterPers(),
                personalCnt.getNomPers(),
                personalCnt.getApeMaterPers()
            );

            log.info("✅ Médico: {} | Especialidad: {}", nombreCompleto, especialidad);

            return Map.of(
                "nombre", nombreCompleto,
                "especialidad", especialidad
            );

        } catch (Exception e) {
            log.error("Error obteniendo info del médico actual", e);
            return Map.of(
                "nombre", "Médico",
                "especialidad", "Sin especialidad"
            );
        }
    }

    // ========================================================================
    // Métodos de conversión
    // ========================================================================

    private GestionPacienteDTO toDto(GestionPaciente entity) {
        if (entity == null) return null;

        Asegurado asegurado = entity.getAsegurado();
        String ipressNombre = obtenerNombreIpress(asegurado.getCasAdscripcion());

        return GestionPacienteDTO.builder()
            .idGestion(entity.getIdGestion())
            .pkAsegurado(asegurado.getPkAsegurado())
            // Datos del asegurado (tabla asegurados)
            .numDoc(asegurado.getDocPaciente())
            .apellidosNombres(asegurado.getPaciente())
            .sexo(asegurado.getSexo())
            .edad(calcularEdad(asegurado.getFecnacimpaciente()))
            .telefono(asegurado.getTelFijo())
            .tipoPaciente(asegurado.getTipoPaciente())
            .tipoSeguro(asegurado.getTipoSeguro())
            .ipress(ipressNombre)
            // Datos de gestión
            .condicion(entity.getCondicion())
            .gestora(entity.getGestora())
            .observaciones(entity.getObservaciones())
            .origen(entity.getOrigen())
            .seleccionadoTelemedicina(entity.getSeleccionadoTelemedicina())
            .fechaCreacion(entity.getFechaCreacion())
            .fechaActualizacion(entity.getFechaActualizacion())
            // ✅ v1.50.0: Enfermedades crónicas
            .enfermedadCronica(asegurado.getEnfermedadCronica())
            .build();
    }

    private GestionPacienteDTO aseguradoToDto(Asegurado asegurado) {
        if (asegurado == null) return null;

        String ipressNombre = obtenerNombreIpress(asegurado.getCasAdscripcion());

        return GestionPacienteDTO.builder()
            .pkAsegurado(asegurado.getPkAsegurado())
            .numDoc(asegurado.getDocPaciente())
            .apellidosNombres(asegurado.getPaciente())
            .sexo(asegurado.getSexo())
            .edad(calcularEdad(asegurado.getFecnacimpaciente()))
            .telefono(asegurado.getTelFijo())
            .tipoPaciente(asegurado.getTipoPaciente())
            .tipoSeguro(asegurado.getTipoSeguro())
            .ipress(ipressNombre)
            // ✅ v1.50.0: Enfermedades crónicas
            .enfermedadCronica(asegurado.getEnfermedadCronica())
            .build();
    }

    private String obtenerNombreIpress(String codIpress) {
        if (codIpress == null) return null;
        try {
            return ipressRepository.findByCodIpress(codIpress)
                .map(Ipress::getDescIpress)
                .orElse(codIpress);
        } catch (Exception e) {
            log.warn("No se pudo obtener el nombre de IPRESS para código: {}", codIpress);
            return codIpress;
        }
    }

    private Integer calcularEdad(LocalDate fechaNacimiento) {
        if (fechaNacimiento == null) return null;
        return Period.between(fechaNacimiento, LocalDate.now()).getYears();
    }

    /**
     * ✅ v1.46.0: Convierte SolicitudBolsa a GestionPacienteDTO
     * Usado cuando los pacientes vienen de dim_solicitud_bolsa (asignaciones médicas)
     * en lugar de la tabla gestion_paciente
     *
     * ⭐ CAMBIO v1.46.0: Ahora incluye idSolicitudBolsa para poder actualizar
     * la condición directamente en dim_solicitud_bolsa
     */
    private GestionPacienteDTO bolsaToGestionDTO(SolicitudBolsa bolsa) {
        if (bolsa == null) return null;

        // ✅ v1.46.9: Obtener IPRESS desde dim_solicitud_bolsa O desde asegurados como fallback
        String ipressNombre = null;
        String[] enfermedadesCronicas = null;

        // Intentar primero desde codigo_ipress en la bolsa
        if (bolsa.getCodigoIpressAdscripcion() != null) {
            ipressNombre = obtenerNombreIpress(bolsa.getCodigoIpressAdscripcion());
        }

        // Si no hay codigo_ipress en la bolsa, intentar obtenerlo desde asegurados
        if (ipressNombre == null && bolsa.getPacienteId() != null) {
            try {
                Optional<Asegurado> aseguradoOpt = aseguradoRepository.findById(bolsa.getPacienteId());
                if (aseguradoOpt.isPresent()) {
                    String codIpressFromAsegurado = aseguradoOpt.get().getCasAdscripcion();
                    if (codIpressFromAsegurado != null) {
                        ipressNombre = obtenerNombreIpress(codIpressFromAsegurado);
                    }
                }
            } catch (Exception e) {
                log.warn("No se pudo obtener IPRESS desde asegurados para paciente_id: {}", bolsa.getPacienteId());
            }
        }

        // ✅ v1.50.0: Obtener enfermedades crónicas desde asegurados
        if (bolsa.getPacienteId() != null) {
            try {
                Optional<Asegurado> aseguradoOpt = aseguradoRepository.findById(bolsa.getPacienteId());
                if (aseguradoOpt.isPresent()) {
                    enfermedadesCronicas = aseguradoOpt.get().getEnfermedadCronica();
                    if (enfermedadesCronicas != null && enfermedadesCronicas.length > 0) {
                        log.info("Enfermedades crónicas encontradas para paciente {}: {}",
                            bolsa.getPacienteDni(), String.join(", ", enfermedadesCronicas));
                    }
                }
            } catch (Exception e) {
                log.warn("No se pudo obtener enfermedades crónicas desde asegurados para paciente_id: {}", bolsa.getPacienteId());
            }
        }

        // ✅ v1.64.0: Aplicar valores por defecto para Bolsa 107
        String condicion = bolsa.getCondicionMedica() != null ? bolsa.getCondicionMedica() : "Pendiente";
        String tiempoSintomas = bolsa.getTiempoInicioSintomas();
        Boolean consentimiento = bolsa.getConsentimientoInformado();

        // Si no hay tiempo de síntomas, asignar "> 72 hrs." (baja prioridad)
        if (tiempoSintomas == null || tiempoSintomas.trim().isEmpty()) {
            tiempoSintomas = "> 72 hrs.";
        }

        // Si está en "Deserción", el consentimiento es NO
        if ("Deserción".equalsIgnoreCase(condicion)) {
            consentimiento = false;
        } else if (consentimiento == null) {
            // ✅ v1.64.1: Si no hay consentimiento registrado, asignar NO (false) por defecto
            // El médico puede cambiarlo a SÍ durante la atención si obtiene el consentimiento
            consentimiento = false;
        }

        // ✅ v1.76.0: Obtener datos del ECG más reciente
        LocalDate fechaTomaEKG = null;
        Boolean esUrgente = false;
        String especialidadMedico = null;

        try {
            String dni = bolsa.getPacienteDni();
            if (dni != null && !dni.isEmpty()) {
                List<TeleECGImagen> ecgs = teleECGImagenRepository
                    .findByNumDocPacienteAndStatImagenOrderByFechaEnvioDesc(dni, "A");

                if (!ecgs.isEmpty()) {
                    TeleECGImagen ecgMasReciente = ecgs.get(0);  // El primero es el más reciente
                    fechaTomaEKG = ecgMasReciente.getFechaToma();
                    esUrgente = ecgMasReciente.getEsUrgente() != null ? ecgMasReciente.getEsUrgente() : false;

                    log.debug("ECG más reciente para paciente {}: fechaToma={}, esUrgente={}",
                        dni, fechaTomaEKG, esUrgente);
                }
            }
        } catch (Exception e) {
            log.warn("No se pudo obtener datos del ECG para paciente {}: {}", bolsa.getPacienteDni(), e.getMessage());
        }

        // ✅ v1.78.0: Obtener especialidad desde el personal asignado (NO desde bolsa que contiene datos corruptos)
        try {
            if (bolsa.getIdPersonal() != null) {
                // Obtener la especialidad del doctor asignado usando JDBC
                String sqlEspecialidad = "SELECT COALESCE(de.id_especialidad::TEXT, NULL) " +
                    "FROM public.dim_personal dp " +
                    "LEFT JOIN public.dim_especialidad de ON dp.id_especialidad = de.id_especialidad " +
                    "WHERE dp.id = ? " +
                    "LIMIT 1";
                try {
                    especialidadMedico = jdbcTemplate.queryForObject(sqlEspecialidad, String.class, bolsa.getIdPersonal());
                    if (especialidadMedico != null && !especialidadMedico.equals("null")) {
                        log.debug("✅ v1.78.0: Especialidad del doctor asignado (ID: {}): {}", bolsa.getIdPersonal(), especialidadMedico);
                    } else {
                        especialidadMedico = null;
                        log.warn("⚠️ v1.78.0: Doctor sin especialidad asignada (ID: {})", bolsa.getIdPersonal());
                    }
                } catch (EmptyResultDataAccessException e) {
                    log.warn("⚠️ v1.78.0: No se encontró especialidad para doctor ID: {}", bolsa.getIdPersonal());
                    especialidadMedico = null;
                }
            } else {
                log.warn("⚠️ v1.78.0: Bolsa sin doctor asignado (idPersonal es null)");
                especialidadMedico = null;
            }
        } catch (Exception e) {
            log.warn("❌ v1.78.0: Error obteniendo especialidad: {}", e.getMessage());
            especialidadMedico = null;
        }

        return GestionPacienteDTO.builder()
            .idSolicitudBolsa(bolsa.getIdSolicitud())  // ✅ v1.46.0: Incluir ID de bolsa
            .idBolsa(bolsa.getIdBolsa())  // ✅ v1.63.0: Tipo de bolsa (107, Dengue, etc.)
            .numDoc(bolsa.getPacienteDni())
            .apellidosNombres(bolsa.getPacienteNombre())
            .sexo(bolsa.getPacienteSexo())
            .edad(calcularEdad(bolsa.getFechaNacimiento()))
            .telefono(bolsa.getPacienteTelefono())
            .ipress(ipressNombre)  // ✅ v1.46.9: Mostrar nombre de IPRESS, obtenido desde bolsa o asegurados
            .condicion(condicion)  // ✅ v1.64.0: Usar condición procesada
            .observaciones(bolsa.getObservacionesMedicas())  // ✅ v1.46.0: Incluir observaciones médicas
            .fechaAsignacion(bolsa.getFechaAsignacion())  // ✅ v1.45.1: Incluir fecha de asignación
            .fechaAtencion(bolsa.getFechaAtencionMedica())  // ✅ v1.47.0: Incluir fecha de atención médica
            .enfermedadCronica(enfermedadesCronicas)  // ✅ v1.50.0: Incluir enfermedades crónicas
            .tiempoInicioSintomas(tiempoSintomas)  // ✅ v1.64.0: Con valor por defecto "> 72 hrs."
            .consentimientoInformado(consentimiento)  // ✅ v1.64.0: Con valores por defecto según condición
            .fechaTomaEKG(fechaTomaEKG)  // ✅ v1.76.0: Fecha de toma del ECG más reciente
            .esUrgente(esUrgente)  // ✅ v1.76.0: Flag de urgencia del ECG más reciente
            .especialidadMedico(especialidadMedico)  // ✅ v1.76.0: Especialidad del médico asignado
            .build();
    }

    /**
     * ⭐ Dashboard Coordinador: Obtener médicos de Teleurgencias con estadísticas
     * Retorna lista de médicos con conteo de pacientes completados, pendientes, desertados
     * @return Lista de MedicoTeleurgenciasDTO con estadísticas
     */
    @Override
    @Transactional(readOnly = true)
    public List<MedicoTeleurgenciasDTO> obtenerMedicosTeleurgenciasConEstadisticas() {
        log.info("📊 Obteniendo médicos de Teleurgencias con estadísticas");

        // ⭐ Obtener médicos que están en el área de TELEURGENCIAS Y TELETRIAJE
        // Los IDs correctos son: 390, 327, 301, 335, 302, 567, 566, 574, 727 (coordinador), 300, 352, 410, etc.
        // Se obtienen de la vista vw_personal_cnt_detalle que tiene el campo "area" poblado correctamente
        List<Long> idsTeleurgencias = List.of(
            390L, 327L, 301L, 335L, 302L, 567L, 566L, 574L, 727L, 300L, 352L, 410L, 560L, 361L, 553L,
            548L, 554L, 571L, 303L, 378L, 570L, 552L, 379L, 555L, 573L, 415L, 549L, 299L, 557L, 305L, 308L,
            561L, 341L, 687L, 304L, 568L, 572L, 563L, 545L, 307L, 547L, 550L, 562L, 564L, 306L, 565L, 546L
        );

        List<PersonalCnt> medicos = personalCntRepository.findAll().stream()
            .filter(p -> idsTeleurgencias.contains(p.getIdPers()))
            .collect(Collectors.toList());

        log.info("Encontrados {} médicos en área de Teleurgencias", medicos.size());

        return medicos.stream().map(medico -> {
            // Obtener solicitudes de bolsa asignadas a este médico
            List<SolicitudBolsa> solicitudes = solicitudBolsaRepository
                .findByIdPersonalAndActivoTrue(medico.getIdPers());

            // Contar por condición médica
            int completadas = (int) solicitudes.stream()
                .filter(s -> "Atendido".equalsIgnoreCase(s.getCondicionMedica())).count();
            int pendientes = (int) solicitudes.stream()
                .filter(s -> "Pendiente".equalsIgnoreCase(s.getCondicionMedica())).count();
            int desertadas = (int) solicitudes.stream()
                .filter(s -> "Deserción".equalsIgnoreCase(s.getCondicionMedica())).count();

            int total = solicitudes.size();
            double porcentajeDesercion = (completadas + desertadas) > 0 ?
                ((double) desertadas / (completadas + desertadas)) * 100 : 0;

            // Obtener estado del usuario
            String estado = "INACTIVO";
            if (medico.getUsuario() != null && "A".equals(medico.getUsuario().getStatUser())) {
                estado = "ACTIVO";
            }

            // Obtener tipo de documento
            String tipoDocumento = "DNI";  // Por defecto
            try {
                if (medico.getTipoDocumento() != null) {
                    tipoDocumento = medico.getTipoDocumento().getDescTipDoc();
                }
            } catch (Exception e) {
                log.warn("No se pudo obtener tipo de documento para médico {}", medico.getIdPers());
            }

            // Construir nombre completo: apellido_paterno + nombre + apellido_materno
            String nombreCompleto = buildFullName(medico.getApePaterPers(), medico.getNomPers(), medico.getApeMaterPers());

            return MedicoTeleurgenciasDTO.builder()
                .idPersonal(medico.getIdPers())
                .nombreCompleto(nombreCompleto)
                .tipoDocumento(tipoDocumento)
                .numeroDocumento(medico.getNumDocPers())
                .username(medico.getNumDocPers())
                .estado(estado)
                .pacientesAsignados(total)
                .completadas(completadas)
                .pendientes(pendientes)
                .desertadas(desertadas)
                .porcentajeDesercion(porcentajeDesercion)
                .build();
        }).collect(Collectors.toList());
    }

    /**
     * Helper: Construir nombre completo a partir de componentes
     * Orden: apellido_paterno + nombre + apellido_materno
     */
    private String buildFullName(String apePater, String nombre, String apeMater) {
        StringBuilder sb = new StringBuilder();
        if (apePater != null && !apePater.trim().isEmpty()) {
            sb.append(apePater.trim());
        }
        if (nombre != null && !nombre.trim().isEmpty()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(nombre.trim());
        }
        if (apeMater != null && !apeMater.trim().isEmpty()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(apeMater.trim());
        }
        return sb.toString();
    }

    /**
     * ✅ v1.64.0: Actualizar datos por defecto en BD para Bolsa 107
     * Aplica valores por defecto:
     * - tiempoInicioSintomas null → "> 72 hrs."
     * - consentimientoInformado null (sin Deserción) → true
     * - estado Deserción → consentimientoInformado = false
     */
    @Transactional
    public void actualizarValoresPorDefectoBlsa107() {
        try {
            log.info("🔄 Iniciando actualización de valores por defecto para Bolsa 107...");

            // Obtener todos los registros de Bolsa 107
            List<SolicitudBolsa> solicitudes = solicitudBolsaRepository.findAll().stream()
                .filter(s -> s.getIdBolsa() != null && s.getIdBolsa().equals(1L))
                .collect(Collectors.toList());

            log.info("📊 Se encontraron {} registros de Bolsa 107", solicitudes.size());

            for (SolicitudBolsa bolsa : solicitudes) {
                boolean updated = false;

                // Aplicar "> 72 hrs." si tiempo está vacío
                if (bolsa.getTiempoInicioSintomas() == null || bolsa.getTiempoInicioSintomas().trim().isEmpty()) {
                    bolsa.setTiempoInicioSintomas("> 72 hrs.");
                    updated = true;
                    log.debug("✅ Actualizando tiempoInicioSintomas → > 72 hrs. para paciente: {}", bolsa.getPacienteId());
                }

                // Si es Deserción, consentimiento = false
                if ("Deserción".equalsIgnoreCase(bolsa.getCondicionMedica())) {
                    if (!Boolean.FALSE.equals(bolsa.getConsentimientoInformado())) {
                        bolsa.setConsentimientoInformado(false);
                        updated = true;
                        log.debug("✅ Actualizando consentimiento → false (Deserción) para paciente: {}", bolsa.getPacienteId());
                    }
                } else if (bolsa.getConsentimientoInformado() == null) {
                    // Si no es Deserción y consentimiento está null, asignar true
                    bolsa.setConsentimientoInformado(true);
                    updated = true;
                    log.debug("✅ Actualizando consentimiento → true (sin datos) para paciente: {}", bolsa.getPacienteId());
                }

                if (updated) {
                    solicitudBolsaRepository.save(bolsa);
                }
            }

            log.info("✅ Actualización completada para Bolsa 107");
        } catch (Exception e) {
            log.error("❌ Error al actualizar valores por defecto de Bolsa 107: ", e);
            throw new RuntimeException("Error actualizando valores por defecto: " + e.getMessage());
        }
    }
}

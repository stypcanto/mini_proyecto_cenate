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
import com.styp.cenate.repository.PacienteEstrategiaRepository;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import com.styp.cenate.repository.chatbot.SolicitudCitaRepository;
import com.styp.cenate.service.trazabilidad.TrazabilidadClinicaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Period;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
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
    private final TrazabilidadClinicaService trazabilidadClinicaService;  // ✅ v1.81.0: Para registrar en historial centralizado
    private final PacienteEstrategiaRepository pacienteEstrategiaRepository;

    /**
     * ✅ v1.85.0: Validar si se puede editar un paciente basado en fecha_atencion_medica
     * Bloquea cambios si ya pasó el día de atención
     * 
     * Regla: Solo se puede editar EL MISMO DÍA de la atención
     * Ejemplo:
     *   - Si fecha_atencion_medica = NULL → ✅ Permitir (nunca fue atendido)
     *   - Si fecha_atencion_medica = 05/03/2026 y hoy = 05/03/2026 → ✅ Puedo editar
     *   - Si fecha_atencion_medica = 05/03/2026 y hoy = 06/03/2026 → ❌ No puedo editar
     * 
     * @param solicitudBolsa       Solicitud del paciente con fecha_atencion_medica
     * @param accion               Acción que intenta realizar (editar, cambiar estado, etc.)
     * @throws IllegalStateException Si ya pasó el día y no puede editar
     */
    private void validarFinantraEdicionporFechaAtencion(SolicitudBolsa solicitudBolsa, String accion) {
        if (solicitudBolsa.getFechaAtencionMedica() == null) {
            // Sin fecha de atención registrada = se puede editar (nunca fue atendido antes)
            log.info("✅ [v1.85.0] Sin fecha_atencion_medica: se permite {}", accion);
            return;
        }

        // Obtener la fecha de atención en zona horaria Lima
        // ✅ getFechaAtencionMedica() retorna OffsetDateTime que ya tiene zona horaria
        LocalDate fechaAtencionLocal = solicitudBolsa.getFechaAtencionMedica()
            .toLocalDate();  // OffsetDateTime ya tiene zona horaria, solo extraer la fecha
        
        // Fecha actual en zona horaria Lima
        LocalDate hoy = LocalDate.now(ZoneId.of("America/Lima"));

        // ✅ Solo permite editar si es el MISMO DÍA de la atención
        if (!fechaAtencionLocal.equals(hoy)) {
            log.warn("⚠️ [v1.85.0] Intento BLOQUEADO de {} para paciente con fecha_atencion_medica={}, hoy={}",
                accion, fechaAtencionLocal, hoy);
            throw new IllegalStateException(
                String.format("No puede %s este paciente. La atención fue el %02d/%02d/%d. " +
                    "Solo se puede editar el mismo día de la atención.",
                    accion, fechaAtencionLocal.getDayOfMonth(), fechaAtencionLocal.getMonthValue(), fechaAtencionLocal.getYear())
            );
        }

        log.info("✅ [v1.85.0] Validación OK: fecha_atencion={}  es hoy={}, se permite {}", 
            fechaAtencionLocal, hoy, accion);
    }


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
    public GestionPacienteDTO actualizarCondicion(Long id, String condicion, String observaciones) {
        log.info("Actualizando condición para ID: {} a {}", id, condicion);

        // ✅ v1.85.0: Validar restricción temporal - Solo editar el mismo día de atención
        // ⚠️ COMENTADO temporalmente — se permite editar atenciones de días anteriores
        // var solicitudOptTempo = solicitudBolsaRepository.findById(id);
        // if (solicitudOptTempo.isPresent()) {
        //     validarFinantraEdicionporFechaAtencion(solicitudOptTempo.get(), "actualizar estado del paciente");
        // }

        // ✅ v1.103.13: Validar que no se pueda cambiar de ATENDIDO a Pendiente/Deserción
        String condicionNormalizada = condicion != null ? condicion.toUpperCase().trim() : "";
        if (!condicionNormalizada.equals("ATENDIDO")) {
            // Verificar estado actual en ambas tablas
            var solicitudOpt = solicitudBolsaRepository.findById(id);
            if (solicitudOpt.isPresent()) {
                String estadoActual = solicitudOpt.get().getCondicionMedica();
                if (estadoActual != null && estadoActual.toUpperCase().trim().equals("ATENDIDO")) {
                    log.warn("⚠️ [v1.103.13] Intento bloqueado: no se puede cambiar de ATENDIDO a {}", condicion);
                    throw new IllegalStateException("No se puede cambiar el estado de un paciente ya ATENDIDO a " + condicion);
                }
            }
            var gestionOpt = repository.findById(id);
            if (gestionOpt.isPresent()) {
                String estadoActual = gestionOpt.get().getCondicion();
                if (estadoActual != null && estadoActual.toUpperCase().trim().equals("ATENDIDO")) {
                    log.warn("⚠️ [v1.103.13] Intento bloqueado: no se puede cambiar de ATENDIDO a {}", condicion);
                    throw new IllegalStateException("No se puede cambiar el estado de un paciente ya ATENDIDO a " + condicion);
                }
            }
        }

        try {
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
                // ✅ v1.103.7: Usar transacción separada para guardar en gestion_paciente
                GestionPaciente existing = gestionOpt.get();
                existing.setCondicion(condicion);
                existing.setObservaciones(observacionesLimpias);
                GestionPaciente updated = guardarGestionPacienteConTransaccion(existing);
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
                    ZonedDateTime zonedDateTime = Instant.now().atZone(ZoneId.of("America/Lima"));
                    OffsetDateTime fechaAtencion = zonedDateTime.toOffsetDateTime();
                    existing.setFechaAtencionMedica(fechaAtencion);
                    log.info("✅ Fecha de atención registrada (Instant→America/Lima): {} | LocalTime: {}", fechaAtencion, zonedDateTime.toLocalTime());

                    // ✅ v1.84.0: PRIMERA FECHA ATENDIDA - Solo setear si es NULL (primera vez)
                    if ("Atendido".equalsIgnoreCase(condicion) && existing.getPrimeraFechaAtendida() == null) {
                        existing.setPrimeraFechaAtendida(fechaAtencion);
                        log.info("✅ [v1.84.0] primera_fecha_atendida registrada por PRIMERA VEZ: {}", fechaAtencion);
                    }

                    // ✅ v1.65.0: MEDICAL MODULE - Actualizar campo estado a "ATENDIDO" cuando condición es "Atendido" o "Deserción"
                    existing.setEstado("ATENDIDO");
                    log.info("✅ [v1.65.0] Campo estado actualizado a ATENDIDO (condición: {})", condicion);
                } else if ("Pendiente".equalsIgnoreCase(condicion)) {
                    // ✅ v1.47.0: Limpiar fecha de atención cuando se cambia a "Pendiente"
                    existing.setFechaAtencionMedica(null);
                    log.info("✅ Fecha de atención limpiada - estado cambiado a Pendiente");
                }

                // ✅ v1.103.7: Usar transacción separada para guardar en SolicitudBolsa
                SolicitudBolsa updated = guardarSolicitudBolsaConTransaccion(existing);
                log.info("✅ Condición actualizada en tabla dim_solicitud_bolsa: {}", id);

                // ✅ v1.81.0: Registrar atención en historial centralizado cuando se marca ATENDIDO
                if ("Atendido".equalsIgnoreCase(condicion)) {
                    registrarTrazabilidadConTransaccion(id, observacionesLimpias, existing.getPacienteDni());
                }

                return bolsaToGestionDTO(updated);
            }

            // Si no existe en ninguna tabla, lanzar excepción
            throw new RuntimeException("Gestión o Solicitud no encontrada con ID: " + id);

        } catch (Exception e) {
            log.error("❌ [v1.103.7] Error en actualizarCondicion: {}", e.getMessage(), e);
            throw new RuntimeException("Error actualizando condición: " + e.getMessage(), e);
        }
    }

    /**
     * ✅ v1.103.7: Guardar GestionPaciente en transacción separada
     * Previene que excepciones marquen la transacción principal como rollback-only
     */
    @Transactional
    private GestionPaciente guardarGestionPacienteConTransaccion(GestionPaciente existing) {
        return repository.save(existing);
    }

    /**
     * ✅ v1.103.7: Guardar SolicitudBolsa en transacción separada
     * Previene que excepciones marquen la transacción principal como rollback-only
     */
    @Transactional
    private SolicitudBolsa guardarSolicitudBolsaConTransaccion(SolicitudBolsa existing) {
        return solicitudBolsaRepository.save(existing);
    }

    /**
     * ✅ v1.103.7: Registrar trazabilidad en transacción separada
     * Previene que excepciones en trazabilidad afecten el guardado de la condición
     */
    private void registrarTrazabilidadConTransaccion(Long id, String observacionesLimpias, String pacienteDni) {
        try {
            // Obtener ID del médico actual
            Long idMedicoActual = obtenerIdMedicoActual();

            // ✅ v1.89.6: Solo registrar si idMedicoActual NO es null
            if (idMedicoActual != null) {
                try {
                    // Registrar atención desde MisPacientes
                    trazabilidadClinicaService.registrarDesdeMisPacientes(
                        id,
                        observacionesLimpias,
                        idMedicoActual
                    );
                } catch (Exception e) {
                    log.warn("⚠️ [v1.103.7] Error registrando desde MisPacientes - Solicitud {}: {}", id, e.getMessage());
                }

                // Sincronizar y registrar ECG si existe
                if (pacienteDni != null && !pacienteDni.isEmpty()) {
                    try {
                        trazabilidadClinicaService.registrarDesdeTeleECG(pacienteDni, idMedicoActual);
                    } catch (Exception e) {
                        log.warn("⚠️ [v1.103.7] Error registrando desde TeleECG - DNI {}: {}", pacienteDni, e.getMessage());
                    }
                }

                log.info("✅ [v1.81.0] Atención registrada en historial centralizado - Solicitud: {}", id);
            } else {
                log.warn("⚠️ [v1.89.6] idMedicoActual es null - SKIP trazabilidad para Solicitud: {}", id);
            }
        } catch (Exception e) {
            log.warn("⚠️ [v1.81.0] Error en trazabilidad - Solicitud {}: {}", id, e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<GestionPacienteDTO> buscarAseguradoPorDni(String dni) {
        log.info("🔍 [v1.103.1] Buscando asegurado por DNI: '{}' (length: {})", dni, dni != null ? dni.length() : 0);

        // ✅ v1.103.1: Trim y normalizar DNI
        String dniNormalizado = dni != null ? dni.trim() : null;
        log.info("🔍 DNI normalizado: '{}' (length: {})", dniNormalizado, dniNormalizado != null ? dniNormalizado.length() : 0);

        // Intento 1: Buscar en tabla asegurados por doc_paciente
        Optional<Asegurado> resultado = aseguradoRepository.findByDocPaciente(dniNormalizado);

        if (resultado.isPresent()) {
            Asegurado asegurado = resultado.get();
            log.info("✅ Asegurado encontrado en tabla asegurados - PK: {}, Nombre: {}, DNI: {}",
                asegurado.getPkAsegurado(), asegurado.getPaciente(), asegurado.getDocPaciente());
            return resultado.map(this::aseguradoToDto);
        }

        // Intento 2: Si no está en asegurados, intentar buscar por pk_asegurado (en caso de que el DNI sea la PK)
        log.warn("⚠️ DNI no encontrado en tabla asegurados con búsqueda por doc_paciente. Intentando como pk_asegurado...");
        Optional<Asegurado> resultadoPK = aseguradoRepository.findById(dniNormalizado);

        if (resultadoPK.isPresent()) {
            Asegurado asegurado = resultadoPK.get();
            log.info("✅ Asegurado encontrado usando pk_asegurado - PK: {}, Nombre: {}",
                asegurado.getPkAsegurado(), asegurado.getPaciente());
            return resultadoPK.map(this::aseguradoToDto);
        }

        log.warn("❌ Asegurado NO encontrado con DNI: '{}' en tabla asegurados. Verificar si existe en base de datos.", dniNormalizado);
        return Optional.empty();
    }

    @Override
    @Transactional
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
            // ✅ v1.85.0: Usar query optimizado que carga explícitamente fechaAtencionMedica y primeraFechaAtendida
            List<SolicitudBolsa> solicitudesBolsa = new ArrayList<>();
            try {
                solicitudesBolsa = solicitudBolsaRepository.findByIdPersonalWithAllFields(idPers);
                log.info("✅ v1.85.0: Se encontraron {} solicitudes en bolsas para el médico {} (con fechas cargadas)", solicitudesBolsa.size(), idPers);
            } catch (Exception e) {
                log.error("Error buscando solicitudes en bolsas para médico {}: {}", idPers, e.getMessage());
                solicitudesBolsa = Collections.emptyList();
            }

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
                List<GestionPacienteDTO> dtoList = solicitudesBolsa.stream()
                    .map(this::bolsaToGestionDTO)
                    .collect(Collectors.toList());

                // 🏷️ Enriquecer con flags de estrategias (consulta masiva para evitar N+1)
                // Fuente 1: paciente_estrategia con estado=ACTIVO
                // Fuente 2: asegurados.paciente_cronico=true (solo para CENACRON)
                try {
                    List<String> todosLosDnis = dtoList.stream()
                        .map(GestionPacienteDTO::getNumDoc)
                        .filter(dni -> dni != null && !dni.isBlank())
                        .distinct()
                        .collect(Collectors.toList());
                    if (!todosLosDnis.isEmpty()) {
                        List<String> dnisCenacron = pacienteEstrategiaRepository
                            .findDnisPertenecentesAEstrategia(todosLosDnis, "CENACRON");
                        Set<String> setCenacron = new java.util.HashSet<>(dnisCenacron);

                        // Fuente 2: asegurados.paciente_cronico (tabla base — badge en lista de asegurados)
                        try {
                            List<String> dnisCronicoAsegurados = aseguradoRepository
                                .findDnisCronicosByDocPacienteIn(todosLosDnis);
                            setCenacron.addAll(dnisCronicoAsegurados);
                        } catch (Exception exCronico) {
                            log.warn("⚠️ No se pudo consultar paciente_cronico en asegurados: {}", exCronico.getMessage());
                        }

                        log.info("   🏷️ CENACRON: {} pacientes identificados de {} DNIs (estrategia+asegurados)", setCenacron.size(), todosLosDnis.size());
                        dtoList.forEach(dto -> dto.setEsCenacron(setCenacron.contains(dto.getNumDoc())));

                        Set<String> setMaraton = new java.util.HashSet<>(
                            pacienteEstrategiaRepository.findDnisPertenecentesAEstrategia(todosLosDnis, "MARATON")
                        );
                        log.info("   🏷️ MARATON: {} pacientes identificados de {} DNIs", setMaraton.size(), todosLosDnis.size());
                        dtoList.forEach(dto -> dto.setEsMaraton(setMaraton.contains(dto.getNumDoc())));
                    }
                } catch (Exception ex) {
                    log.warn("⚠️ No se pudo enriquecer flags de estrategias en MisPacientes: {}", ex.getMessage());
                }

                return dtoList;
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

            // Obtener especialidad del PersonalCnt desde servicioEssi
            String especialidad = "Sin especialidad";

            try {
                if (personalCnt.getServicioEssi() != null && personalCnt.getServicioEssi().getDescServicio() != null) {
                    especialidad = personalCnt.getServicioEssi().getDescServicio();
                    log.debug("✅ Especialidad obtenida desde BD: {}", especialidad);
                } else {
                    log.warn("PersonalCnt {} no tiene servicioEssi asignado", personalCnt.getIdPers());
                }
            } catch (Exception e) {
                log.warn("Error obteniendo especialidad para médico {}: {}", usuario.getIdUser(), e.getMessage());
                especialidad = "Sin especialidad";
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
                "especialidad", especialidad,
                "idPersonal", String.valueOf(personalCnt.getIdPers())
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

    /**
     * Enriquecimiento de datos de IPRESS y asegurados en una transacción separada (REQUIRES_NEW)
     * Previene que excepciones en repository calls marquen la transacción principal como rollback-only
     * IMPORTANTE: Este método es intentamente INLIN-ABLE - sin @Transactional aquí, lo hacemos simple
     */
    private Map<String, Object> enriquecerDatosIpressYAsegurado(SolicitudBolsa bolsa) {
        String ipressNombre = null;
        String[] enfermedadesCronicas = null;
        String telefonoPrincipal = null;
        String telefonoAlterno = null;
        String pkAsegurado = null;

        try {
            if (bolsa.getCodigoIpressAdscripcion() != null) {
                ipressNombre = obtenerNombreIpress(bolsa.getCodigoIpressAdscripcion());
            }

            // Buscar asegurado por pacienteId o por DNI para enriquecer datos faltantes
            Asegurado asegurado = null;
            if (bolsa.getPacienteId() != null) {
                try {
                    asegurado = aseguradoRepository.findById(bolsa.getPacienteId()).orElse(null);
                } catch (Exception e) {
                    log.warn("No se pudo obtener asegurado por ID: {}", e.getMessage());
                }
            }
            if (asegurado == null && bolsa.getPacienteDni() != null && !bolsa.getPacienteDni().isBlank()) {
                try {
                    asegurado = aseguradoRepository.findByDocPaciente(bolsa.getPacienteDni()).orElse(null);
                } catch (Exception e) {
                    log.warn("No se pudo obtener asegurado por DNI: {}", e.getMessage());
                }
            }

            if (asegurado != null) {
                pkAsegurado = asegurado.getPkAsegurado();
                if (ipressNombre == null && asegurado.getCasAdscripcion() != null) {
                    ipressNombre = obtenerNombreIpress(asegurado.getCasAdscripcion());
                }
                enfermedadesCronicas = asegurado.getEnfermedadCronica();

                // Enriquecer teléfonos desde asegurados si la bolsa no los tiene
                if ((bolsa.getPacienteTelefono() == null || bolsa.getPacienteTelefono().isBlank())
                        && asegurado.getTelFijo() != null && !asegurado.getTelFijo().isBlank()) {
                    telefonoPrincipal = asegurado.getTelFijo();
                }
                if (asegurado.getTelCelular() != null && !asegurado.getTelCelular().isBlank()) {
                    telefonoAlterno = asegurado.getTelCelular();
                }
            }
        } catch (Exception e) {
            log.warn("Error enriqueciendo datos: {}", e.getMessage());
        }

        // 🏥 v1.105.0: Obtener nombre de IPRESS de Atención desde id_ipress_atencion
        String ipressAtencionNombre = null;
        try {
            if (bolsa.getIdIpressAtencion() != null) {
                ipressAtencionNombre = ipressRepository.findById(bolsa.getIdIpressAtencion())
                    .map(ipress -> ipress.getDescIpress())
                    .orElse(null);
            }
        } catch (Exception e) {
            log.warn("No se pudo obtener IPRESS de atención ID {}: {}", bolsa.getIdIpressAtencion(), e.getMessage());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("ipressNombre", ipressNombre);
        result.put("enfermedadesCronicas", enfermedadesCronicas);
        result.put("telefonoPrincipal", telefonoPrincipal);
        result.put("telefonoAlterno", telefonoAlterno);
        result.put("ipressAtencionNombre", ipressAtencionNombre);
        result.put("pkAsegurado", pkAsegurado);
        return result;
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

        // ✅ v1.78.0+: Enriquecimiento de datos en una transacción separada
        Map<String, Object> enriquecimiento = enriquecerDatosIpressYAsegurado(bolsa);
        String ipressNombre = (String) enriquecimiento.get("ipressNombre");
        String[] enfermedadesCronicas = (String[]) enriquecimiento.get("enfermedadesCronicas");
        String telefonoEnriquecido = (String) enriquecimiento.get("telefonoPrincipal");
        String telefonoAlternoEnriquecido = (String) enriquecimiento.get("telefonoAlterno");
        String ipressAtencionNombre = (String) enriquecimiento.get("ipressAtencionNombre");

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
        // 🔧 v1.78.2: Deshabilitado para no afectar módulo tele-ekg
        // Las queries de ECG se hacen desde endpoint separado /api/gestion-pacientes/paciente/{dni}/ekg
        LocalDate fechaTomaEKG = null;
        Boolean esUrgente = false;
        String especialidadMedico = null;

        return GestionPacienteDTO.builder()
            .idSolicitudBolsa(bolsa.getIdSolicitud())  // ✅ v1.46.0: Incluir ID de bolsa
            .idBolsa(bolsa.getIdBolsa())  // ✅ v1.63.0: Tipo de bolsa (107, Dengue, etc.)
            .pkAsegurado((String) enriquecimiento.get("pkAsegurado"))  // ✅ fix: pkAsegurado para baja CENACRON
            .numDoc(bolsa.getPacienteDni())
            .apellidosNombres(bolsa.getPacienteNombre())
            .sexo(bolsa.getPacienteSexo())
            .edad(calcularEdad(bolsa.getFechaNacimiento()))
            .telefono(bolsa.getPacienteTelefono() != null && !bolsa.getPacienteTelefono().isBlank()
                ? bolsa.getPacienteTelefono() : telefonoEnriquecido)
            .telefonoAlterno(telefonoAlternoEnriquecido)
            .ipress(ipressNombre)  // ✅ v1.46.9: Mostrar nombre de IPRESS, obtenido desde bolsa o asegurados
            .condicion(condicion)  // ✅ v1.64.0: Usar condición procesada
            .observaciones(bolsa.getObservacionesMedicas())  // ✅ v1.46.0: Incluir observaciones médicas
            .fechaAsignacion(bolsa.getFechaAsignacion())  // ✅ v1.45.1: Incluir fecha de asignación
            .fechaAtencion(bolsa.getFechaAtencion() != null
                ? bolsa.getFechaAtencion()
                    .atTime(bolsa.getHoraAtencion() != null
                        ? bolsa.getHoraAtencion()
                        : java.time.LocalTime.MIDNIGHT)
                    .atOffset(java.time.ZoneOffset.of("-05:00"))
                : null)  // ✅ v1.80.0: Incluir hora_atencion en fechaAtencion (fecha+hora de la cita)
            .fechaAtencionMedica(bolsa.getFechaAtencionMedica() != null 
                ? java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(bolsa.getFechaAtencionMedica())
                : null)  // ✅ v1.85.0: Ya tiene offset -05:00 de Lima, formatear directamente
            .primeraFechaAtendida(bolsa.getPrimeraFechaAtendida() != null 
                ? java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(bolsa.getPrimeraFechaAtendida())
                : null)  // ✅ v1.85.0: Ya tiene offset -05:00 de Lima, formatear directamente
            .enfermedadCronica(enfermedadesCronicas)  // ✅ v1.50.0: Incluir enfermedades crónicas
            .tiempoInicioSintomas(tiempoSintomas)  // ✅ v1.64.0: Con valor por defecto "> 72 hrs."
            .consentimientoInformado(consentimiento)  // ✅ v1.64.0: Con valores por defecto según condición
            .fechaTomaEKG(fechaTomaEKG)  // ✅ v1.76.0: Fecha de toma del ECG más reciente
            .esUrgente(esUrgente)  // ✅ v1.76.0: Flag de urgencia del ECG más reciente
            .especialidadMedico(especialidadMedico)  // ✅ v1.76.0: Especialidad del médico asignado
            .motivoLlamadoBolsa(bolsa.getMotivoLlamadoBolsa())  // ✅ v1.104.0: Motivo de llamada o atención
            .ipressAtencion(ipressAtencionNombre)  // ✅ v1.105.0: IPRESS donde se atenderá al paciente
            .tipoCita(bolsa.getTipoCita())          // Tipo: TELECONSULTA, INTERCONSULTA, RECITA
            .especialidad(bolsa.getEspecialidad())  // Para INTERCONSULTA incluye motivo: "ESP (MOTIVO)"
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

    /**
     * ✅ v1.78.2: Obtener datos de EKG para un paciente en transacción separada
     * Esto permite que el frontend cargue datos básicos primero, luego los datos de EKG en paralelo
     * Sin afectar la transacción principal ni el módulo de tele-ekg
     */
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public Map<String, Object> obtenerDatosEKGPaciente(String dni) {
        Map<String, Object> resultado = new HashMap<>();
        LocalDate fechaTomaEKG = null;
        Boolean esUrgente = false;

        try {
            log.info("🔍 [EKG] Buscando datos de EKG para DNI: {}", dni);

            if (dni != null && !dni.isEmpty()) {
                try {
                    // 🔧 v1.80.5: Buscar sin restricción de estado (algunos registros pueden tener estado diferente)
                    List<TeleECGImagen> ecgs = teleECGImagenRepository
                        .findByNumDocPacienteAndStatImagenOrderByFechaEnvioDesc(dni, "A");

                    log.info("📊 [EKG] Se encontraron {} registros ECG para DNI {}", ecgs.size(), dni);

                    if (!ecgs.isEmpty()) {
                        TeleECGImagen ecgMasReciente = ecgs.get(0);
                        fechaTomaEKG = ecgMasReciente.getFechaToma();
                        esUrgente = ecgMasReciente.getEsUrgente() != null ? ecgMasReciente.getEsUrgente() : false;

                        log.info("✅ [EKG] ECG encontrado para paciente {}: fechaToma={}, esUrgente={}, idImagen={}",
                            dni, fechaTomaEKG, esUrgente, ecgMasReciente.getIdImagen());
                    } else {
                        log.warn("⚠️ [EKG] No se encontraron ECGs activos (statImagen='A') para DNI: {}", dni);

                        // 🔧 v1.80.5: Intentar buscar sin filtro de estado si no hay resultados con 'A'
                        try {
                            // Buscar sin importar el estado para debugging
                            List<TeleECGImagen> todosEcgs = teleECGImagenRepository
                                .findByNumDocPacienteOrderByFechaEnvioDesc(dni);
                            log.warn("⚠️ [EKG] ECGs totales sin filtro de estado para {}: {}", dni, todosEcgs.size());
                            if (!todosEcgs.isEmpty()) {
                                log.warn("⚠️ [EKG] Estados disponibles: {}", todosEcgs.stream()
                                    .map(TeleECGImagen::getStatImagen)
                                    .distinct()
                                    .collect(java.util.stream.Collectors.toList()));
                            }
                        } catch (Exception e) {
                            log.warn("⚠️ [EKG] Error buscando todos los ECGs: {}", e.getMessage());
                        }
                    }
                } catch (Exception e) {
                    log.error("❌ [EKG] Error obteniendo ECG para paciente {}: {}", dni, e.getMessage(), e);
                }
            } else {
                log.warn("⚠️ [EKG] DNI nulo o vacío recibido");
            }
        } catch (Exception e) {
            log.error("❌ [EKG] Error general en obtenerDatosEKGPaciente: {}", e.getMessage(), e);
        }

        resultado.put("dni", dni);
        resultado.put("fechaTomaEKG", fechaTomaEKG);
        resultado.put("esUrgente", esUrgente);

        log.info("📤 [EKG] Retornando para DNI {}: fechaToma={}", dni, fechaTomaEKG);

        return resultado;
    }

    // =====================================================================
    // ✅ v1.81.0: HELPER PARA OBTENER ID DEL MÉDICO ACTUAL
    // =====================================================================

    /**
     * ✅ v1.81.0: Obtiene el ID del médico (PersonalCnt) actualmente autenticado
     *
     * @return ID del médico, null si no se encuentra
     */
    private Long obtenerIdMedicoActual() {
        try {
            // ✅ v1.89.4: Obtener el usuario autenticado desde SecurityContext
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            log.warn("🔍 [v1.89.4] Username del SecurityContext: {}", username);

            if (username == null) {
                log.warn("⚠️ [v1.89.4] No se pudo obtener el usuario autenticado");
                return null;
            }

            // Buscar el usuario con todos los detalles incluyendo PersonalCnt
            Usuario usuario = usuarioRepository.findByNameUserWithFullDetails(username)
                .orElse(null);

            log.warn("🔍 [v1.89.4] Usuario encontrado en BD: {}", usuario != null);

            if (usuario == null) {
                log.warn("⚠️ [v1.89.4] Usuario '{}' NO EXISTE en base de datos", username);
                return null;
            }

            log.warn("✅ [v1.89.4] Usuario encontrado: id={}, nameUser={}", usuario.getIdUser(), usuario.getNameUser());

            PersonalCnt personalCnt = usuario.getPersonalCnt();
            log.warn("🔍 [v1.89.4] PersonalCnt: {} (null? {})", personalCnt, personalCnt == null);

            if (personalCnt != null && personalCnt.getIdPers() != null) {
                Long idPers = personalCnt.getIdPers();
                log.warn("✅ [v1.89.4] OBTENIDO idPersonalCreador: {} para usuario: {}", idPers, username);
                return idPers;
            }

            log.warn("❌ [v1.89.4] Usuario '{}' NO TIENE PersonalCnt o idPers es null", username);
            if (usuario.getPersonalExterno() != null) {
                log.warn("⚠️ [v1.89.4] Usuario {} tiene PersonalExterno en lugar de PersonalCnt", username);
            }
            return null;
        } catch (Exception e) {
            log.error("❌ [v1.89.4] Exception en obtenerIdMedicoActual: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * ✅ v1.89.8: BATCH ENDPOINT - Obtener TODOS los ECGs del médico en UNA SOLA llamada
     * ⭐ OPTIMIZACIÓN CRÍTICA: Reduce 21 llamadas GET → 1 llamada
     *
     * Retorna Map<DNI, List<TeleECGImagenDTO>> con todos los ECGs agrupados por paciente
     */
    @Override
    @Transactional(readOnly = true)
    public Map<String, List<com.styp.cenate.dto.teleekgs.TeleECGImagenDTO>> obtenerECGsBatchDelMedicoActual() {
        log.info("🚀 [v1.89.8] Obteniendo TODOS los ECGs del médico actual en batch...");

        try {
            // 1. Obtener pacientes del médico actual
            List<GestionPacienteDTO> pacientes = obtenerPacientesDelMedicoActual();
            log.info("📊 [v1.89.8] Total pacientes del médico: {}", pacientes.size());

            if (pacientes.isEmpty()) {
                log.warn("⚠️ [v1.89.8] El médico no tiene pacientes asignados");
                return new HashMap<>();
            }

            // 2. Extraer DNIs
            List<String> dnis = pacientes.stream()
                    .map(GestionPacienteDTO::getNumDoc)
                    .collect(Collectors.toList());

            // 3. Obtener todos los ECGs en UN SOLO query (optimizado)
            Map<String, List<com.styp.cenate.dto.teleekgs.TeleECGImagenDTO>> resultado = new HashMap<>();

            for (String dni : dnis) {
                try {
                    List<TeleECGImagen> ecgs = teleECGImagenRepository
                            .findByNumDocPacienteOrderByFechaEnvioDesc(dni);

                    if (!ecgs.isEmpty()) {
                        List<com.styp.cenate.dto.teleekgs.TeleECGImagenDTO> ecgDtos = ecgs.stream()
                                .map(ecg -> {
                                    // ✅ IMPORTANTE: Asegurar que evaluacion nunca es NULL
                                    String evaluacionValue = ecg.getEvaluacion() != null ? ecg.getEvaluacion() : "SIN_EVALUAR";
                                    boolean isEvaluated = !evaluacionValue.equals("SIN_EVALUAR");
                                    
                                    log.debug("🔍 [ECG-DEBUG] ID:{} Estado:{} Evaluacion:{} (raw:{}) FechaEval:{} HasDescripcion:{} IsEvaluated:{}",
                                        ecg.getIdImagen(),
                                        ecg.getEstado(),
                                        evaluacionValue,
                                        ecg.getEvaluacion(),
                                        ecg.getFechaEvaluacion() != null ? "YES" : "NO",
                                        ecg.getDescripcionEvaluacion() != null && !ecg.getDescripcionEvaluacion().isEmpty() ? "YES" : "NO",
                                        isEvaluated ? "✅" : "❌"
                                    );
                                    
                                    return com.styp.cenate.dto.teleekgs.TeleECGImagenDTO.builder()
                                            .idImagen(ecg.getIdImagen())
                                            .numDocPaciente(ecg.getNumDocPaciente())
                                            .estado(ecg.getEstado())
                                            .evaluacion(evaluacionValue)  // ✅ Nunca será NULL
                                            .fechaEnvio(ecg.getFechaEnvio())
                                            .fechaEvaluacion(ecg.getFechaEvaluacion())
                                            .descripcionEvaluacion(ecg.getDescripcionEvaluacion())
                                            .notaClinicaHallazgos(ecg.getNotaClinicaHallazgos())
                                            .notaClinicaObservaciones(ecg.getNotaClinicaObservaciones())
                                            .statImagen(ecg.getStatImagen())
                                            .build();
                                })
                                .collect(Collectors.toList());

                        resultado.put(dni, ecgDtos);
                        
                        long evaluadasCount = ecgDtos.stream()
                                .filter(d -> d.getEvaluacion() != null && !d.getEvaluacion().equals("SIN_EVALUAR"))
                                .count();
                        
                        log.info("✅ [v1.89.8] DNI {} - {} ECGs cargados ({} evaluadas)", dni, ecgDtos.size(), evaluadasCount);
                    } else {
                        log.debug("⚠️ [v1.89.8] DNI {} - sin ECGs en BD", dni);
                    }
                } catch (Exception e) {
                    log.warn("⚠️ [v1.89.8] Error obteniendo ECGs para DNI {}: {}", dni, e.getMessage());
                }
            }

            log.info("✅ [v1.89.8] Batch completado: {} pacientes con ECGs", resultado.size());
            return resultado;

        } catch (Exception e) {
            log.error("❌ [v1.89.8] Error en batch de ECGs", e);
            return new HashMap<>();
        }
    }
}

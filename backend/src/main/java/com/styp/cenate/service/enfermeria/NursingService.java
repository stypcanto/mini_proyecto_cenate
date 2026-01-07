package com.styp.cenate.service.enfermeria;

import com.styp.cenate.dto.enfermeria.NursingAttendRequest;
import com.styp.cenate.dto.enfermeria.NursingWorklistDto;
import com.styp.cenate.model.AtencionClinica;
import com.styp.cenate.model.chatbot.SolicitudCita;
import com.styp.cenate.model.enfermeria.AtencionEnfermeria;
import com.styp.cenate.model.enfermeria.PacienteInterconsulta;
import com.styp.cenate.repository.AtencionClinicaRepository;
import com.styp.cenate.repository.chatbot.SolicitudCitaRepository;
import com.styp.cenate.repository.enfermeria.AtencionEnfermeriaRepository;
import com.styp.cenate.repository.enfermeria.PacienteInterconsultaRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NursingService {

    private final AtencionClinicaRepository atencionClinicaRepository;
    private final SolicitudCitaRepository solicitudCitaRepository;
    private final AtencionEnfermeriaRepository atencionEnfermeriaRepository;
    private final PacienteInterconsultaRepository pacienteInterconsultaRepository;
    private final com.styp.cenate.repository.AseguradoRepository aseguradoRepository;
    private final UsuarioRepository usuarioRepository;
    private final IpressRepository ipressRepository;

    private static final Long ESTADO_CITA_PROGRAMADO = 1L; // Asumiendo ID 1 = Programado/Confirmado
    // TODO: Confirmar si CENACRON se identifica por idEstrategia
    private static final Long ID_ESTRATEGIA_CENACRON = 1L; // Ajustar según BD

    /**
     * Obtiene la lista de trabajo unificada para enfermería (Pendientes y
     * Atendidos).
     * 
     * @param estado "PENDIENTE", "ATENDIDO" o "TODOS"
     * @return Lista de pacientes
     */
    public List<NursingWorklistDto> getWorklist(String estado) {
        List<NursingWorklistDto> worklist = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // 1. ATENDIDOS: Buscar en atenciones_enfermeria (Histórico reciente)
        if ("ATENDIDO".equalsIgnoreCase(estado) || "TODOS".equalsIgnoreCase(estado)) {
            // Obtener el id_pers del personal enfermera logueado
            // idUsuarioEnfermera en la tabla podría ser id_user o id_pers, 
            // pero el comentario dice "ID del PersonalProf", así que intentamos id_pers primero
            Long idPersEnfermera = obtenerIdPersonalLogueado();
            
            // Obtener también id_user para comparar (por si hay registros con id_user)
            Long idUserEnfermera = obtenerIdUsuarioLogueado();
            
            log.info("🔍 Buscando atendidos para enfermera - id_pers: {}, id_user: {}", idPersEnfermera, idUserEnfermera);
            
            // Buscar TODAS las atenciones primero para debug
            List<AtencionEnfermeria> todasLasAtenciones = atencionEnfermeriaRepository.findAll();
            log.info("📊 Total de atenciones_enfermeria en la BD: {}", todasLasAtenciones.size());
            if (!todasLasAtenciones.isEmpty()) {
                log.info("📊 Ejemplo de id_usuario_enfermera en registros existentes: {}", 
                    todasLasAtenciones.stream()
                        .map(AtencionEnfermeria::getIdUsuarioEnfermera)
                        .limit(10)
                        .collect(Collectors.toList()));
            }
            
            // Buscar por id_pers primero
            List<AtencionEnfermeria> atendidosPorPers = atencionEnfermeriaRepository
                    .findByIdUsuarioEnfermeraOrderByFechaAtencionDesc(idPersEnfermera);
            log.info("📊 Encontradas {} atenciones con id_pers = {}", atendidosPorPers.size(), idPersEnfermera);
            
            // También buscar por id_user (por compatibilidad)
            List<AtencionEnfermeria> atendidosPorUser = atencionEnfermeriaRepository
                    .findByIdUsuarioEnfermeraOrderByFechaAtencionDesc(idUserEnfermera);
            log.info("📊 Encontradas {} atenciones con id_user = {}", atendidosPorUser.size(), idUserEnfermera);
            
            // Combinar ambas listas y eliminar duplicados
            List<AtencionEnfermeria> atendidos = new ArrayList<>();
            atendidos.addAll(atendidosPorPers);
            atendidos.addAll(atendidosPorUser);
            
            // Eliminar duplicados por idAtencionEnf
            atendidos = atendidos.stream()
                    .collect(Collectors.toMap(
                            AtencionEnfermeria::getIdAtencionEnf,
                            a -> a,
                            (a1, a2) -> a1 // En caso de duplicados, mantener el primero
                    ))
                    .values()
                    .stream()
                    .collect(Collectors.toList());

            log.info("✅ Encontradas {} atenciones para la enfermera logueada (antes del filtro de fecha)", atendidos.size());

            // Filtrar por fecha (últimos 365 días para incluir más registros históricos) y mapear a DTO
            // Cambiado de 90 a 365 días para incluir más historial
            List<NursingWorklistDto> atendidosFiltrados = atendidos.stream()
                    .filter(a -> {
                        boolean dentroPeriodo = a.getFechaAtencion().toLocalDate().isAfter(today.minusDays(365));
                        if (!dentroPeriodo) {
                            log.debug("⚠️ Atención {} excluida por fecha: {} (más de 365 días)", 
                                a.getIdAtencionEnf(), a.getFechaAtencion().toLocalDate());
                        }
                        return dentroPeriodo;
                    })
                    .map(this::mapToAtendidoDto)
                    .collect(Collectors.toList());
            
            log.info("✅ Después del filtro de fecha (últimos 365 días): {} atenciones", atendidosFiltrados.size());
            worklist.addAll(atendidosFiltrados);
        }

        // 2. PENDIENTES: Buscar en Orígenes y excluir los ya atendidos
        if ("PENDIENTE".equalsIgnoreCase(estado) || "TODOS".equalsIgnoreCase(estado)) {
            // Fuente A: Medicina General (Atenciones recientes 30 días, filtrado en memoria
            // por ahora)
            OffsetDateTime start = OffsetDateTime.of(today.minusDays(30), java.time.LocalTime.MIN,
                    ZoneOffset.of("-05:00"));
            OffsetDateTime end = OffsetDateTime.of(today, java.time.LocalTime.MAX, ZoneOffset.of("-05:00"));

            // Nota: Usamos findAll paginado o filtrado en repositorio idealmente.
            // Aquí usaremos findByFechaAtencionBetween
            List<AtencionClinica> medicos = atencionClinicaRepository
                    .findByFechaAtencionBetween(start, end, org.springframework.data.domain.Pageable.unpaged())
                    .getContent();

            for (AtencionClinica med : medicos) {
                // Filtro: Debe ser CENACRON (idEstrategia o flag) y NO tener atención enf
                String diagnosticoUpper = med.getDiagnostico().toUpperCase();
                boolean esCenacron = ID_ESTRATEGIA_CENACRON.equals(med.getIdEstrategia())
                        || diagnosticoUpper.contains("HIPERTENSION")
                        || diagnosticoUpper.contains("HIPERTENSIÓN") // Con acento
                        || diagnosticoUpper.contains("DIABETES");

                if (esCenacron
                        && atencionEnfermeriaRepository.findByIdAtencionMedicaRef(med.getIdAtencion()).isEmpty()) {
                    worklist.add(mapToPendienteDto(med));
                }
            }

            // Fuente B: Citas Programadas HOY
            List<SolicitudCita> citas = solicitudCitaRepository.findByFechaCitaAndIdEstadoCita(today,
                    ESTADO_CITA_PROGRAMADO);
            for (SolicitudCita cita : citas) {
                // Verificar si ya fue atendido
                if (atencionEnfermeriaRepository.findByIdCitaRef(cita.getIdSolicitud()).isEmpty()) {
                    worklist.add(mapToPendienteDto(cita));
                }
            }
        }

        // Ordenar por Semáforo (Días transcurridos Descendente) y luego hora
        worklist.sort(Comparator.comparing(NursingWorklistDto::getDiasTranscurridos,
                Comparator.nullsLast(Comparator.reverseOrder())));

        return worklist;
    }

    @Transactional
    public AtencionEnfermeria attendPatient(NursingAttendRequest request) {
        log.info("Registrando atención enfermería para paciente: {}", request.getIdPaciente());

        // Obtener automáticamente el id_pers de la enfermera logueada
        // Si el request viene con id_user, lo convertimos a id_pers
        Long idPersEnfermera;
        if (request.getIdUsuarioEnfermera() != null) {
            // Si viene id_user del frontend, intentamos obtener el id_pers correspondiente
            try {
                Usuario usuario = usuarioRepository.findById(request.getIdUsuarioEnfermera())
                        .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
                if (usuario.getPersonalCnt() != null) {
                    idPersEnfermera = usuario.getPersonalCnt().getIdPers();
                } else {
                    // Si no tiene PersonalCnt, usar directamente el id_user (por compatibilidad)
                    idPersEnfermera = request.getIdUsuarioEnfermera();
                    log.warn("⚠️ Usuario {} no tiene PersonalCnt asociado, usando id_user como id_pers", request.getIdUsuarioEnfermera());
                }
            } catch (Exception e) {
                // Si falla, obtener del usuario logueado directamente
                log.warn("⚠️ Error al obtener id_pers del request, usando usuario logueado: {}", e.getMessage());
                idPersEnfermera = obtenerIdPersonalLogueado();
            }
        } else {
            // Si no viene ID, usar el usuario logueado
            idPersEnfermera = obtenerIdPersonalLogueado();
        }

        log.info("💾 Guardando atención con idUsuarioEnfermera (id_pers): {}", idPersEnfermera);

        AtencionEnfermeria atencion = AtencionEnfermeria.builder()
                .idPaciente(request.getIdPaciente())
                .idAtencionMedicaRef(request.getIdAtencionMedicaRef())
                .idCitaRef(request.getIdCitaRef())
                .motivoConsulta(request.getMotivoConsulta())
                .observaciones(request.getObservaciones())
                .signosVitales(request.getSignosVitales())
                .idUsuarioEnfermera(idPersEnfermera) // Guardamos id_pers
                .fechaAtencion(LocalDateTime.now())
                .build();

        AtencionEnfermeria saved = atencionEnfermeriaRepository.save(atencion);

        if (request.isDerivaInterconsulta()) {
            PacienteInterconsulta interconsulta = PacienteInterconsulta.builder()
                    .idPaciente(request.getIdPaciente())
                    .idAtencionOrigen(saved.getIdAtencionEnf())
                    .especialidadDestino(request.getEspecialidadInterconsulta())
                    .motivoDerivacion(request.getMotivoInterconsulta())
                    .estado("PENDIENTE")
                    .build();
            pacienteInterconsultaRepository.save(interconsulta);
        }

        return saved;
    }

    // Mappers
    private NursingWorklistDto mapToAtendidoDto(AtencionEnfermeria entity) {
        // Enriquecer con datos del asegurado
        String nombrePaciente = "Paciente #" + entity.getIdPaciente();
        String dniPaciente = String.valueOf(entity.getIdPaciente());
        String pkAsegurado = null; // Para buscar historial
        Integer edadPaciente = null;
        String sexoPaciente = null;
        String diagnostico = "Sin diagnóstico";
        Boolean requiereTelemonitoreo = false;
        Long diasTranscurridos = 0L;
        String nombreIpress = null;
        String telefono = null;

        // Intentar buscar Asegurado de múltiples formas
        var aseguradoOpt = aseguradoRepository.findById(String.valueOf(entity.getIdPaciente()));

        // Si no se encuentra por idPaciente directo, intentar por referencia a AtencionClinica
        if (aseguradoOpt.isEmpty() && entity.getIdAtencionMedicaRef() != null) {
            var atencionClinicaOpt = atencionClinicaRepository.findById(entity.getIdAtencionMedicaRef());
            if (atencionClinicaOpt.isPresent()) {
                var atencionClinica = atencionClinicaOpt.get();
                pkAsegurado = atencionClinica.getPkAsegurado();
                aseguradoOpt = aseguradoRepository.findById(pkAsegurado);
                if (aseguradoOpt.isPresent()) {
                    diagnostico = atencionClinica.getDiagnostico();
                    requiereTelemonitoreo = Boolean.TRUE.equals(atencionClinica.getRequiereTelemonitoreo());
                    // Calcular días desde la atención médica original
                    if (atencionClinica.getFechaAtencion() != null) {
                        diasTranscurridos = ChronoUnit.DAYS.between(
                            atencionClinica.getFechaAtencion().toLocalDate(),
                            LocalDate.now()
                        );
                    }
                }
            }
        }

        if (aseguradoOpt.isPresent()) {
            var asegurado = aseguradoOpt.get();
            nombrePaciente = asegurado.getPaciente();
            dniPaciente = asegurado.getDocPaciente();
            pkAsegurado = asegurado.getPkAsegurado(); // ✅ Guardar pk completo
            sexoPaciente = asegurado.getSexo(); // ✅ Obtener sexo del asegurado
            if (asegurado.getFecnacimpaciente() != null) {
                edadPaciente = (int) ChronoUnit.YEARS.between(asegurado.getFecnacimpaciente(), LocalDate.now());
            }
            // Obtener teléfono (priorizar celular sobre fijo)
            telefono = asegurado.getTelCelular() != null && !asegurado.getTelCelular().trim().isEmpty()
                ? asegurado.getTelCelular()
                : (asegurado.getTelFijo() != null && !asegurado.getTelFijo().trim().isEmpty()
                    ? asegurado.getTelFijo()
                    : null);
            // 1. PRIORIDAD: Obtener IPRESS desde Asegurado.casAdscripcion (IPRESS real del paciente)
            if (asegurado.getCasAdscripcion() != null && !asegurado.getCasAdscripcion().trim().isEmpty()) {
                try {
                    String codIpress = asegurado.getCasAdscripcion().trim();
                    var ipressOpt = ipressRepository.findByCodIpress(codIpress);
                    if (ipressOpt.isPresent()) {
                        nombreIpress = ipressOpt.get().getDescIpress();
                        log.info("✅ IPRESS obtenida desde Asegurado.casAdscripcion {}: {}", codIpress, nombreIpress);
                    } else {
                        log.warn("⚠️ IPRESS con código '{}' no encontrada en dim_ipress, usando código como nombre", codIpress);
                        nombreIpress = codIpress;
                    }
                } catch (Exception e) {
                    log.error("❌ Error al buscar IPRESS con código {}: {}", asegurado.getCasAdscripcion(), e.getMessage(), e);
                    nombreIpress = asegurado.getCasAdscripcion();
                }
            }
        } else {
            // Si aún no encontramos el paciente, calcular días desde la atención de enfermería
            diasTranscurridos = ChronoUnit.DAYS.between(
                entity.getFechaAtencion().toLocalDate(),
                LocalDate.now()
            );
        }

        // 2. FALLBACK: Si no se obtuvo IPRESS desde Asegurado, intentar desde AtencionClinica.idIpress
        if (nombreIpress == null && entity.getIdAtencionMedicaRef() != null) {
            var atencionClinicaOpt = atencionClinicaRepository.findById(entity.getIdAtencionMedicaRef());
            if (atencionClinicaOpt.isPresent()) {
                var atencionClinica = atencionClinicaOpt.get();
                if (atencionClinica.getIdIpress() != null) {
                    try {
                        nombreIpress = ipressRepository.findById(atencionClinica.getIdIpress())
                            .map(ip -> ip.getDescIpress())
                            .orElse(null);
                        if (nombreIpress != null) {
                            log.info("✅ IPRESS obtenida desde AtencionClinica.idIpress {} (fallback): {}", atencionClinica.getIdIpress(), nombreIpress);
                        }
                    } catch (Exception e) {
                        log.warn("⚠️ Error al buscar IPRESS por idIpress {}: {}", atencionClinica.getIdIpress(), e.getMessage());
                    }
                }
            }
        }

        return NursingWorklistDto.builder()
                .idOrigen(entity.getIdAtencionEnf()) // ID propio
                .tipoOrigen("ATENCION_ENFERMERIA")
                .pacienteDni(dniPaciente)
                .pkAsegurado(pkAsegurado) // ✅ PK completo para buscar historial
                .pacienteNombre(nombrePaciente)
                .pacienteEdad(edadPaciente)
                .pacienteSexo(sexoPaciente) // ✅ Agregar sexo
                .telefono(telefono) // ✅ Agregar teléfono
                .fechaBase(entity.getFechaAtencion()) // Fecha de atención de enfermería
                .fechaAtencionEnfermeria(entity.getFechaAtencion())
                .diagnostico(diagnostico)
                .requiereTelemonitoreo(requiereTelemonitoreo)
                .esCronico(true) // Asumimos crónico si fue atendido por enfermería
                .usuarioEnfermera(String.valueOf(entity.getIdUsuarioEnfermera()))
                .estadoEnfermeria("ATENDIDO")
                .diasTranscurridos(diasTranscurridos)
                .colorSemaforo("AZUL") // Completado
                .tipoAtencion("Control (Atendido)")
                .nombreIpress(nombreIpress)
                .build();
    }

    private NursingWorklistDto mapToPendienteDto(AtencionClinica entity) {
        long dias = ChronoUnit.DAYS.between(entity.getFechaAtencion().toLocalDate(), LocalDate.now());
        String color = calcularSemaforo(dias);

        // Enriquecer con datos reales del asegurado
        String nombrePaciente = "Asegurado " + entity.getPkAsegurado(); // Fallback
        String dniPaciente = entity.getPkAsegurado(); // Fallback: pk completo
        Integer edadPaciente = null;
        String sexoPaciente = null;
        String pkAseguradoCompleto = entity.getPkAsegurado(); // Guardar pk completo para historial
        String nombreIpress = null;
        String telefono = null;

        // Buscar asegurado para obtener nombre real y DNI limpio
        var aseguradoOpt = aseguradoRepository.findById(entity.getPkAsegurado());
        if (aseguradoOpt.isPresent()) {
            var asegurado = aseguradoOpt.get();
            nombrePaciente = asegurado.getPaciente();
            dniPaciente = asegurado.getDocPaciente(); // ✅ DNI limpio (sin sufijo)
            sexoPaciente = asegurado.getSexo(); // ✅ Obtener sexo del asegurado
            if (asegurado.getFecnacimpaciente() != null) {
                edadPaciente = (int) ChronoUnit.YEARS.between(asegurado.getFecnacimpaciente(), LocalDate.now());
            }
            // Obtener teléfono (priorizar celular sobre fijo)
            telefono = asegurado.getTelCelular() != null && !asegurado.getTelCelular().trim().isEmpty()
                ? asegurado.getTelCelular()
                : (asegurado.getTelFijo() != null && !asegurado.getTelFijo().trim().isEmpty()
                    ? asegurado.getTelFijo()
                    : null);
            // 1. PRIORIDAD: Obtener IPRESS desde Asegurado.casAdscripcion (IPRESS real del paciente)
            if (asegurado.getCasAdscripcion() != null && !asegurado.getCasAdscripcion().trim().isEmpty()) {
                try {
                    String codIpress = asegurado.getCasAdscripcion().trim();
                    var ipressOpt = ipressRepository.findByCodIpress(codIpress);
                    if (ipressOpt.isPresent()) {
                        nombreIpress = ipressOpt.get().getDescIpress();
                        log.info("✅ IPRESS obtenida desde Asegurado.casAdscripcion {}: {}", codIpress, nombreIpress);
                    } else {
                        log.warn("⚠️ IPRESS con código '{}' no encontrada en dim_ipress, usando código como nombre", codIpress);
                        nombreIpress = codIpress;
                    }
                } catch (Exception e) {
                    log.error("❌ Error al buscar IPRESS con código {}: {}", asegurado.getCasAdscripcion(), e.getMessage(), e);
                    nombreIpress = asegurado.getCasAdscripcion();
                }
            } else {
                log.debug("⚠️ Asegurado {} no tiene casAdscripcion o está vacío", entity.getPkAsegurado());
            }
        } else {
            log.warn("⚠️ No se encontró asegurado con pkAsegurado: {}", entity.getPkAsegurado());
        }

        // 2. FALLBACK: Si no se obtuvo IPRESS desde Asegurado, intentar desde AtencionClinica.idIpress
        if (nombreIpress == null && entity.getIdIpress() != null) {
            try {
                var ipressOpt = ipressRepository.findById(entity.getIdIpress());
                if (ipressOpt.isPresent()) {
                    nombreIpress = ipressOpt.get().getDescIpress();
                    log.info("✅ IPRESS obtenida desde AtencionClinica.idIpress {} (fallback): {}", entity.getIdIpress(), nombreIpress);
                } else {
                    log.warn("⚠️ IPRESS con id {} no encontrada en dim_ipress para atención {}", entity.getIdIpress(), entity.getIdAtencion());
                }
            } catch (Exception e) {
                log.error("❌ Error al buscar IPRESS por idIpress {}: {}", entity.getIdIpress(), e.getMessage(), e);
            }
        }
        
        if (nombreIpress == null) {
            log.warn("⚠️ No se pudo obtener IPRESS para atención {} (idIpress: {}, pkAsegurado: {})", 
                entity.getIdAtencion(), entity.getIdIpress(), entity.getPkAsegurado());
        }

        return NursingWorklistDto.builder()
                .idOrigen(entity.getIdAtencion())
                .tipoOrigen("MEDICINA_GENERAL")
                .pacienteDni(dniPaciente) // ✅ DNI limpio
                .pkAsegurado(pkAseguradoCompleto) // ✅ PK completo para buscar historial
                .pacienteNombre(nombrePaciente) // ✅ Nombre real
                .pacienteEdad(edadPaciente) // ✅ Edad calculada
                .pacienteSexo(sexoPaciente) // ✅ Agregar sexo
                .telefono(telefono) // ✅ Agregar teléfono
                .fechaBase(entity.getFechaAtencion().toLocalDateTime())
                .diagnostico(entity.getCie10Codigo() + " - " + entity.getDiagnostico())
                .requiereTelemonitoreo(Boolean.TRUE.equals(entity.getRequiereTelemonitoreo()))
                .esCronico(true)
                .estadoEnfermeria("PENDIENTE")
                .diasTranscurridos(dias)
                .colorSemaforo(color)
                .tipoAtencion("Derivación Post-Consulta")
                .nombreIpress(nombreIpress)
                .build();
    }

    private NursingWorklistDto mapToPendienteDto(SolicitudCita entity) {
        String nombreIpress = null;
        String telefono = null;
        // Intentar obtener IPRESS y teléfono desde el asegurado si tiene DNI
        if (entity.getDocPaciente() != null) {
            try {
                var aseguradoOpt = aseguradoRepository.findByDocPaciente(entity.getDocPaciente());
                if (aseguradoOpt.isPresent()) {
                    var asegurado = aseguradoOpt.get();
                    // Obtener IPRESS
                    if (asegurado.getCasAdscripcion() != null) {
                        nombreIpress = ipressRepository.findByCodIpress(asegurado.getCasAdscripcion())
                            .map(ip -> ip.getDescIpress())
                            .orElse(asegurado.getCasAdscripcion());
                    }
                    // Obtener teléfono (priorizar celular sobre fijo)
                    telefono = asegurado.getTelCelular() != null && !asegurado.getTelCelular().trim().isEmpty()
                        ? asegurado.getTelCelular()
                        : (asegurado.getTelFijo() != null && !asegurado.getTelFijo().trim().isEmpty()
                            ? asegurado.getTelFijo()
                            : null);
                }
            } catch (Exception e) {
                log.warn("No se pudo obtener IPRESS para cita con DNI: {}", entity.getDocPaciente());
            }
        }
        
        // Si no se obtuvo teléfono del asegurado, usar el de la cita si existe
        if (telefono == null && entity.getTelefono() != null && !entity.getTelefono().trim().isEmpty()) {
            telefono = entity.getTelefono();
        }
        
        return NursingWorklistDto.builder()
                .idOrigen(entity.getIdSolicitud())
                .tipoOrigen("CITA")
                .pacienteDni(entity.getDocPaciente())
                .pacienteNombre(entity.getNombresPaciente())
                .pacienteEdad(entity.getEdad())
                .pacienteSexo(entity.getSexo())
                .telefono(telefono) // ✅ Agregar teléfono
                .fechaBase(LocalDateTime.of(entity.getFechaCita(),
                        entity.getHoraCita() != null ? entity.getHoraCita() : java.time.LocalTime.MIDNIGHT))
                .diagnostico("Cita Programada - " + entity.getObservacion())
                .esCronico(true) // Asumimos si viene a enfermería programado
                .estadoEnfermeria("PENDIENTE")
                .diasTranscurridos(0L)
                .colorSemaforo("VERDE") // Hoy
                .tipoAtencion("Cita Programada")
                .nombreIpress(nombreIpress)
                .build();
    }

    private String calcularSemaforo(long dias) {
        if (dias <= 15)
            return "VERDE";
        if (dias <= 30)
            return "AMARILLO";
        if (dias <= 60)
            return "ROJO";
        return "NEGRO";
    }

    /**
     * Obtener el id_pers del personal enfermera logueado
     */
    private Long obtenerIdPersonalLogueado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new IllegalStateException("No hay usuario autenticado");
        }
        
        String username = auth.getName();
        Usuario usuario = usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + username));
        
        if (usuario.getPersonalCnt() == null) {
            throw new IllegalStateException("El usuario no tiene personal asociado");
        }
        
        return usuario.getPersonalCnt().getIdPers();
    }
    
    /**
     * Obtener el ID del usuario enfermera logueado
     */
    private Long obtenerIdUsuarioLogueado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new IllegalStateException("No hay usuario autenticado");
        }
        
        String username = auth.getName();
        Usuario usuario = usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + username));
        
        return usuario.getIdUser();
    }
}

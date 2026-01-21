package com.styp.cenate.service.solicitudturno.impl;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.styp.cenate.dto.DetalleSolicitudTurnoRequest;
import com.styp.cenate.dto.DetalleSolicitudTurnoResponse;
import com.styp.cenate.dto.MiIpressResponse;
import com.styp.cenate.dto.SolicitudTurnoIpressRequest;
import com.styp.cenate.dto.SolicitudTurnoIpressResponse;
import com.styp.cenate.dto.solicitudturno.DetalleFechasResponse;
import com.styp.cenate.dto.solicitudturno.DetalleSolicitudTurnoUpsertRequest;
import com.styp.cenate.dto.solicitudturno.DetalleSolicitudTurnoUpsertResponse;
import com.styp.cenate.dto.solicitudturno.SolicitudTurnoDetalleFullResponse;
import com.styp.cenate.dto.solicitudturno.SolicitudTurnoEstadoResponse;
import com.styp.cenate.dto.solicitudturno.SolicitudTurnoIpressListadoRow;
import com.styp.cenate.enumd.BloqueTurno;
import com.styp.cenate.mapper.solicitudturno.SolicitudTurnoEstadoMapper;
import com.styp.cenate.model.DetalleSolicitudTurno;
import com.styp.cenate.model.DimServicioEssi;
import com.styp.cenate.model.Ipress;
import com.styp.cenate.model.PeriodoSolicitudTurno;
import com.styp.cenate.model.PersonalCnt;
import com.styp.cenate.model.Red;
import com.styp.cenate.model.SolicitudTurnoIpress;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.model.solicitudturnoipress.DetalleSolicitudTurnoFecha;
import com.styp.cenate.repository.DetalleSolicitudTurnoRepository;
import com.styp.cenate.repository.DimServicioEssiRepository;
import com.styp.cenate.repository.PeriodoSolicitudTurnoRepository;
import com.styp.cenate.repository.PersonalCntRepository;
import com.styp.cenate.repository.SolicitudTurnoIpressRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.solicitudturnoipress.DetalleSolicitudTurnoFechaRepository;
import com.styp.cenate.service.auditlog.AuditLogService;
import com.styp.cenate.service.solicitudturno.SolicitudTurnoIpressService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Implementacion del servicio de solicitudes de turnos de IPRESS.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SolicitudTurnoIpressServiceImpl implements SolicitudTurnoIpressService {

	private final SolicitudTurnoIpressRepository solicitudRepository;
	private final PeriodoSolicitudTurnoRepository periodoRepository;

	private final PersonalCntRepository personalCntRepository;
	private final UsuarioRepository usuarioRepository;
	private final DimServicioEssiRepository servicioEssiRepository;
	private final AuditLogService auditLogService;

	private final DetalleSolicitudTurnoRepository detalleRepository;
	private final DetalleSolicitudTurnoFechaRepository detalleFechaRepository;

	// ========================================
	// Obtener datos del usuario actual
	// ========================================

	@Override
	public MiIpressResponse obtenerMiIpress() {
		PersonalCnt personal = obtenerPersonalActual();

		MiIpressResponse.MiIpressResponseBuilder builder = MiIpressResponse.builder().idPers(personal.getIdPers())
				.dniUsuario(personal.getNumDocPers()).nombreCompleto(personal.getNombreCompleto())
				.emailContacto(
						personal.getEmailCorpPers() != null ? personal.getEmailCorpPers() : personal.getEmailPers())
				.telefonoContacto(personal.getMovilPers());

		Ipress ipress = personal.getIpress();
		if (ipress != null) {
			builder.idIpress(ipress.getIdIpress()).codIpress(ipress.getCodIpress())
					.nombreIpress(ipress.getDescIpress());

			Red red = ipress.getRed();
			if (red != null) {
				builder.idRed(red.getId()).nombreRed(red.getDescripcion());
			}
		}

		// Validar completitud de datos
		boolean datosCompletos = ipress != null && personal.getEmailCorpPers() != null
				&& personal.getMovilPers() != null;

		String mensaje = datosCompletos ? "Datos completos"
				: "Faltan datos. Contacte al administrador para actualizar su perfil.";

		builder.datosCompletos(datosCompletos).mensajeValidacion(mensaje);

		return builder.build();
	}

	// ========================================
	// Listar solicitudes
	// ========================================

	@Override
	public List<SolicitudTurnoIpressResponse> listarPorPeriodo(Long idPeriodo) {
		log.info("Listando solicitudes del periodo: {}", idPeriodo);
		return solicitudRepository.findByPeriodoWithIpress(idPeriodo).stream().map(this::convertToResponse)
				.collect(Collectors.toList());
	}

	@Override
	public List<SolicitudTurnoIpressResponse> listarPorPeriodoYRed(Long idPeriodo, Long idRed) {
		log.info("Listando solicitudes del periodo {} y red {}", idPeriodo, idRed);
		return solicitudRepository.findByPeriodoAndRed(idPeriodo, idRed).stream().map(this::convertToResponse)
				.collect(Collectors.toList());
	}

	@Override
	public List<SolicitudTurnoIpressResponse> listarPorIpress(Long idIpress) {
		log.info("Listando solicitudes de IPRESS: {}", idIpress);
		return solicitudRepository.findByIpress(idIpress).stream().map(this::convertToResponse)
				.collect(Collectors.toList());
	}

	@Override
	public List<SolicitudTurnoIpressResponse> listarMisSolicitudes() {
		PersonalCnt personal = obtenerPersonalActual();
		log.info("Listando solicitudes del usuario: {}", personal.getIdPers());
		return solicitudRepository.findByPersonalIdPersOrderByCreatedAtDesc(personal.getIdPers()).stream()
				.map(this::convertToResponse).collect(Collectors.toList());
	}

	// ========================================
	// Obtener solicitud
	// ========================================

	@Override
	public SolicitudTurnoIpressResponse obtenerPorId(Long id) {
		log.info("Obteniendo solicitud con ID: {}", id);
		SolicitudTurnoIpress solicitud = solicitudRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + id));
		return convertToResponse(solicitud);
	}

	@Override
	public SolicitudTurnoIpressResponse obtenerPorIdConDetalles(Long id) {
		log.info("Obteniendo solicitud con detalles, ID: {}", id);
		SolicitudTurnoIpress solicitud = solicitudRepository.findByIdWithDetalles(id)
				.orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + id));
		return convertToResponseWithDetalles(solicitud);
	}

	@Override
	public SolicitudTurnoIpressResponse obtenerMiSolicitud(Long idPeriodo) {
		PersonalCnt personal = obtenerPersonalActual();
		log.info("Obteniendo solicitud del usuario {} para periodo {}", personal.getIdPers(), idPeriodo);

		return solicitudRepository.findByPeriodoIdPeriodoAndPersonalIdPers(idPeriodo, personal.getIdPers())
				.map(this::convertToResponseWithDetalles).orElse(null);
	}

	@Override
	public boolean existeMiSolicitud(Long idPeriodo) {
		PersonalCnt personal = obtenerPersonalActual();
		return solicitudRepository.existsByPeriodoIdPeriodoAndPersonalIdPers(idPeriodo, personal.getIdPers());
	}

	// ========================================
	// Crear y actualizar
	// ========================================

	@Override
	@Transactional
	public SolicitudTurnoIpressResponse crear(SolicitudTurnoIpressRequest request) {
		PersonalCnt personal = obtenerPersonalActual();
		log.info("Creando solicitud para usuario {} en periodo {}", personal.getIdPers(), request.getIdPeriodo());

		// Validar que no exista solicitud previa
		if (solicitudRepository.existsByPeriodoIdPeriodoAndPersonalIdPers(request.getIdPeriodo(),
				personal.getIdPers())) {
			throw new RuntimeException("Ya existe una solicitud para este periodo. Use actualizar en su lugar.");
		}

		// Validar que el periodo existe y esta activo
		PeriodoSolicitudTurno periodo = periodoRepository.findById(request.getIdPeriodo())
				.orElseThrow(() -> new RuntimeException("Periodo no encontrado con ID: " + request.getIdPeriodo()));

		if (!periodo.isActivo()) {
			throw new RuntimeException("El periodo no esta activo para recibir solicitudes");
		}

		// Crear solicitud
		SolicitudTurnoIpress solicitud = SolicitudTurnoIpress.builder().periodo(periodo).personal(personal)
				.estado("BORRADOR").totalEspecialidades(0).totalTurnosSolicitados(0).build();

		solicitud.setUpdatedAt(OffsetDateTime.now());
		solicitud = solicitudRepository.save(solicitud);

		// Agregar detalles
		if (request.getDetalles() != null && !request.getDetalles().isEmpty()) {
			agregarDetalles(solicitud, request.getDetalles());
		}

		recalcularTotales(solicitud);
		solicitud.setUpdatedAt(OffsetDateTime.now());
		solicitud = solicitudRepository.save(solicitud);

		auditar("CREATE_SOLICITUD", String.format("Solicitud creada para IPRESS: %s, Periodo: %s",
				personal.getIpress() != null ? personal.getIpress().getDescIpress() : "N/A", periodo.getDescripcion()),
				"INFO", "SUCCESS");

		log.info("Solicitud creada exitosamente con ID: {}", solicitud.getIdSolicitud());
		return convertToResponseWithDetalles(solicitud);
	}

	@Override
	@Transactional
	public SolicitudTurnoIpressResponse actualizar(Long id, SolicitudTurnoIpressRequest request) {
//        log.info("Actualizando solicitud con ID: {}", id);
//
//        SolicitudTurnoIpress solicitud = solicitudRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + id));
//
//        // Validar que la solicitud pertenece al usuario actual o es coordinador
//        validarPropietarioOCoordinador(solicitud);
//
//        // Solo se puede editar en borrador o enviado (no revisado)
//        if (solicitud.isRevisado()) {
//            throw new RuntimeException("No se puede modificar una solicitud ya revisada");
//        }
//
//        // Eliminar detalles anteriores y agregar nuevos
//        //detalleRepository.deleteBySolicitudIdSolicitud(id);
//        solicitud.getDetalles().clear();
//
//        if (request.getDetalles() != null && !request.getDetalles().isEmpty()) {
//            agregarDetalles(solicitud, request.getDetalles());
//        }
//        solicitud.setUpdatedAt(OffsetDateTime.now());
//        solicitud = solicitudRepository.save(solicitud);
//
//        auditar("UPDATE_SOLICITUD",
//                String.format("Solicitud actualizada ID: %d, IPRESS: %s",
//                        id, solicitud.getNombreIpress()),
//                "INFO", "SUCCESS");
//
//        log.info("Solicitud actualizada exitosamente");
//        return convertToResponseWithDetalles(solicitud);

		SolicitudTurnoIpress solicitud = solicitudRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + id));

		validarPropietarioOCoordinador(solicitud);

		if (solicitud.isRevisado()) {
			throw new RuntimeException("No se puede modificar una solicitud ya revisada");
		}

		// Borra todo en BD
		detalleRepository.deleteBySolicitudIdSolicitud(id);

		// Limpia en memoria
		solicitud.getDetalles().clear();

		// Agrega todos los detalles válidos
		if (request.getDetalles() != null && !request.getDetalles().isEmpty()) {
			agregarDetalles(solicitud, request.getDetalles());
		}

		recalcularTotales(solicitud);
		// Actualiza cabecera
		solicitud.setUpdatedAt(OffsetDateTime.now()); // o @UpdateTimestamp

		solicitud = solicitudRepository.save(solicitud);

		return convertToResponseWithDetalles(solicitud);
	}

	@Override
	@Transactional
	public SolicitudTurnoIpressResponse guardarBorrador(SolicitudTurnoIpressRequest request) {
		PersonalCnt personal = obtenerPersonalActual();

		// Verificar si ya existe una solicitud
		var existente = solicitudRepository.findByPeriodoIdPeriodoAndPersonalIdPers(request.getIdPeriodo(),
				personal.getIdPers());

		if (existente.isPresent()) {
			// Actualizar existente
			return actualizar(existente.get().getIdSolicitud(), request);
		} else {
			// Crear nueva
			return crear(request);
		}
	}

	// ========================================
	// Cambios de estado
	// ========================================

	@Override
	@Transactional
	public SolicitudTurnoIpressResponse enviar(Long id) {
		log.info("Enviando solicitud con ID: {}", id);

		SolicitudTurnoIpress solicitud = solicitudRepository.findByIdWithDetalles(id)
				.orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + id));

		// Validar propietario
		validarPropietario(solicitud);

		// Validar que tenga al menos un detalle con turnos
		boolean tieneTurnos = solicitud.getDetalles().stream()
				.anyMatch(d -> d.getTurnosSolicitados() != null && d.getTurnosSolicitados() > 0);

		if (!tieneTurnos) {
			throw new RuntimeException("Debe solicitar al menos un turno antes de enviar");
		}

		// Validar que el periodo siga activo
		if (!solicitud.getPeriodo().isActivo()) {
			throw new RuntimeException("El periodo ya no esta activo");
		}

		recalcularTotales(solicitud);

		if (solicitud.getTotalTurnosSolicitados() <= 0) {
			throw new RuntimeException("No se puede enviar una solicitud sin turnos");
		}

		solicitud.enviar();
		solicitud = solicitudRepository.save(solicitud);

		auditar("ENVIAR_SOLICITUD", String.format("Solicitud enviada ID: %d, IPRESS: %s, Periodo: %s", id,
				solicitud.getNombreIpress(), solicitud.getPeriodo().getDescripcion()), "INFO", "SUCCESS");

		log.info("Solicitud enviada exitosamente");
		return convertToResponseWithDetalles(solicitud);
	}

	@Override
	@Transactional
	public SolicitudTurnoIpressResponse marcarRevisada(Long id) {
		log.info("Marcando solicitud como revisada, ID: {}", id);

		SolicitudTurnoIpress solicitud = solicitudRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + id));

		if (!solicitud.isEnviado()) {
			throw new RuntimeException("Solo se pueden revisar solicitudes enviadas");
		}

		solicitud.marcarRevisada();
		solicitud = solicitudRepository.save(solicitud);

		auditar("REVISAR_SOLICITUD",
				String.format("Solicitud marcada como revisada ID: %d, IPRESS: %s", id, solicitud.getNombreIpress()),
				"INFO", "SUCCESS");

		log.info("Solicitud marcada como revisada");
		return convertToResponse(solicitud);
	}

	@Override
	@Transactional
	public void eliminar(Long id) {
		log.info("Eliminando solicitud con ID: {}", id);

		SolicitudTurnoIpress solicitud = solicitudRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + id));

		// Validar propietario
		validarPropietario(solicitud);

		// Solo se puede eliminar en borrador
		if (!solicitud.isBorrador()) {
			throw new RuntimeException("Solo se pueden eliminar solicitudes en estado BORRADOR");
		}

		String descripcion = String.format("IPRESS: %s, Periodo: %s", solicitud.getNombreIpress(),
				solicitud.getPeriodo().getDescripcion());

		solicitudRepository.delete(solicitud);

		auditar("DELETE_SOLICITUD", "Solicitud eliminada: " + descripcion, "WARNING", "SUCCESS");

		log.info("Solicitud eliminada exitosamente");
	}

	// ========================================
	// Metodos privados auxiliares
	// ========================================

	private PersonalCnt obtenerPersonalActual() {
		String username = SecurityContextHolder.getContext().getAuthentication().getName();
		Usuario usuario = usuarioRepository.findByNameUser(username)
				.orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));

		return personalCntRepository.findByUsuario_IdUser(usuario.getIdUser())
				.orElseThrow(() -> new RuntimeException("Personal no encontrado para el usuario: " + username));
	}

	private void validarPropietario(SolicitudTurnoIpress solicitud) {
		PersonalCnt personal = obtenerPersonalActual();
		if (!solicitud.getPersonal().getIdPers().equals(personal.getIdPers())) {
			throw new RuntimeException("No tiene permisos para modificar esta solicitud");
		}
	}

	private void validarPropietarioOCoordinador(SolicitudTurnoIpress solicitud) {
		// Por ahora solo validamos propietario
		// TODO: Agregar validacion de rol COORDINADOR si es necesario
		validarPropietario(solicitud);
	}

	private void agregarDetalles(SolicitudTurnoIpress solicitud, List<DetalleSolicitudTurnoRequest> detallesRequest) {

		List<DetalleSolicitudTurno> nuevos = new ArrayList<>();

		for (DetalleSolicitudTurnoRequest x : detallesRequest) {
			if (x.getTurnos() == null || x.getTurnos() <= 0)
				continue;

			DimServicioEssi especialidad = servicioEssiRepository.findById(x.getIdServicio())
					.orElseThrow(() -> new RuntimeException("Especialidad no encontrada con ID: " + x.getIdServicio()));

			String diasManana = (x.getDiasManana() == null) ? null : String.join(",", x.getDiasManana());
			String diasTarde = (x.getDiasTarde() == null) ? null : String.join(",", x.getDiasTarde());

			DetalleSolicitudTurno detalle = DetalleSolicitudTurno.builder().solicitud(solicitud)
					.especialidad(especialidad).turnosSolicitados(x.getTurnos()).requiere(true).turnoPreferente("")
					.diaPreferente("").observacion("").mananaActiva(Boolean.TRUE.equals(x.getMananaActiva()))
					.tardeActiva(Boolean.TRUE.equals(x.getTardeActiva())).diasManana(diasManana).diasTarde(diasTarde)
					.build();

			nuevos.add(detalle);
		}

		// Mantén sincronizada la colección en memoria
		solicitud.getDetalles().addAll(nuevos);

		// Fuerza persistencia de todos (cero “me guardó solo 1” por cascade/config)
		detalleRepository.saveAll(nuevos);

	}

	// ========================================
	// Conversores
	// ========================================

	private SolicitudTurnoIpressResponse convertToResponse(SolicitudTurnoIpress solicitud) {
		SolicitudTurnoIpressResponse.SolicitudTurnoIpressResponseBuilder builder = SolicitudTurnoIpressResponse
				.builder().idSolicitud(solicitud.getIdSolicitud()).idPeriodo(solicitud.getPeriodo().getIdPeriodo())
				.periodoDescripcion(solicitud.getPeriodo().getDescripcion()).estado(solicitud.getEstado())
				.fechaEnvio(solicitud.getFechaEnvio()).createdAt(solicitud.getCreatedAt())
				.updatedAt(solicitud.getUpdatedAt());

		// Datos del personal
		PersonalCnt personal = solicitud.getPersonal();
		if (personal != null) {
			builder.idPers(personal.getIdPers()).dniUsuario(personal.getNumDocPers())
					.nombreCompleto(personal.getNombreCompleto())
					.emailContacto(
							personal.getEmailCorpPers() != null ? personal.getEmailCorpPers() : personal.getEmailPers())
					.telefonoContacto(personal.getMovilPers());

			// Datos IPRESS
			Ipress ipress = personal.getIpress();
			if (ipress != null) {
				builder.idIpress(ipress.getIdIpress()).codIpress(ipress.getCodIpress())
						.nombreIpress(ipress.getDescIpress());

				// Datos Red
				Red red = ipress.getRed();
				if (red != null) {
					builder.idRed(red.getId()).nombreRed(red.getDescripcion());
				}
			}
		}

		return builder.build();
	}

	private SolicitudTurnoIpressResponse convertToResponseWithDetalles(SolicitudTurnoIpress solicitud) {
//		SolicitudTurnoIpressResponse response = convertToResponse(solicitud);
//
//		// Cargar detalles
//		List<DetalleSolicitudTurnoResponse> detalles = new ArrayList<>();
//		int totalTurnos = 0;
//		int especialidadesConTurnos = 0;
//
//		for (DetalleSolicitudTurno detalle : solicitud.getDetalles()) {
//			detalles.add(convertDetalleToResponse(detalle));
//
//			if (detalle.getTurnosSolicitados() != null && detalle.getTurnosSolicitados() > 0) {
//				totalTurnos += detalle.getTurnosSolicitados();
//				especialidadesConTurnos++;
//			}
//		}
//
//		response.setDetalles(detalles);
//		response.setTotalTurnosSolicitados(totalTurnos);
//		response.setTotalEspecialidades(especialidadesConTurnos);
//
//		return response;
		SolicitudTurnoIpressResponse response = convertToResponse(solicitud);

		// Cargar detalles (SIN calcular totales)
		List<DetalleSolicitudTurnoResponse> detalles = solicitud.getDetalles().stream()
				.map(this::convertDetalleToResponse).toList();

		response.setDetalles(detalles);

		response.setTotalTurnosSolicitados(
				solicitud.getTotalTurnosSolicitados() != null ? solicitud.getTotalTurnosSolicitados() : 0);

		response.setTotalEspecialidades(
				solicitud.getTotalEspecialidades() != null ? solicitud.getTotalEspecialidades() : 0);

		return response;
	}

	private DetalleSolicitudTurnoResponse convertDetalleToResponse(DetalleSolicitudTurno detalle) {
		return DetalleSolicitudTurnoResponse.builder().idDetalle(detalle.getIdDetalle())
				.idSolicitud(detalle.getSolicitud().getIdSolicitud())
				.idServicio(detalle.getEspecialidad().getIdServicio())
				.codServicio(detalle.getEspecialidad().getCodServicio())
				.nombreEspecialidad(detalle.getEspecialidad().getDescServicio())
				.requiere(Boolean.TRUE.equals(detalle.getRequiere())).turnosSolicitados(detalle.getTurnosSolicitados())
				.mananaActiva(Boolean.TRUE.equals(detalle.getMananaActiva()))
				.diasManana(splitDias(detalle.getDiasManana()))
				.tardeActiva(Boolean.TRUE.equals(detalle.getTardeActiva())).diasTarde(splitDias(detalle.getDiasTarde()))
				.observacion(detalle.getObservacion()).createdAt(detalle.getCreatedAt()).build();
	}

	private void auditar(String action, String detalle, String nivel, String estado) {
		try {
			String usuario = SecurityContextHolder.getContext().getAuthentication().getName();
			auditLogService.registrarEvento(usuario, action, "SOLICITUD_TURNOS", detalle, nivel, estado);
		} catch (Exception e) {
			log.warn("No se pudo registrar auditoria: {}", e.getMessage());
		}
	}

	private List<String> splitDias(String dias) {
		if (dias == null || dias.isBlank())
			return List.of();
		return java.util.Arrays.stream(dias.split(",")).map(String::trim).filter(s -> !s.isBlank()).toList();
	}

	public List<SolicitudTurnoIpressListadoRow> listar(Long idPeriodo, String estado) {
		if (estado != null && ("TODAS".equalsIgnoreCase(estado) || estado.isBlank())) {
			estado = null;
		}
		return solicitudRepository.listarResumen(idPeriodo, estado);
	}

	@Transactional
	@Override
	public SolicitudTurnoEstadoResponse aprobarSolicitud(Long idSolicitud) {
		SolicitudTurnoIpress s = solicitudRepository.findById(idSolicitud)
				.orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada: " + idSolicitud));
		if (!"ENVIADO".equalsIgnoreCase(s.getEstado())) {
			throw new IllegalStateException("Solo se puede aprobar una solicitud en estado ENVIADO.");
		}
		s.setEstado("APROBADA");
		if (s.getFechaEnvio() == null) {
			s.setFechaEnvio(OffsetDateTime.now());
		}

		return SolicitudTurnoEstadoMapper.toResponse(solicitudRepository.save(s));
	}

	@Transactional
	@Override
	public SolicitudTurnoEstadoResponse rechazarSolicitud(Long idSolicitud, String motivo) {
		SolicitudTurnoIpress s = solicitudRepository.findById(idSolicitud)
				.orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada: " + idSolicitud));

		if (!"ENVIADO".equalsIgnoreCase(s.getEstado())) {
			throw new IllegalStateException("Solo se puede rechazar una solicitud en estado ENVIADO.");
		}

		if (motivo == null || motivo.trim().isEmpty()) {
			throw new IllegalArgumentException("El motivo del rechazo es obligatorio.");
		}

		s.setEstado("RECHAZADA");
		s.setMotivoRechazo(motivo.trim());

		return SolicitudTurnoEstadoMapper.toResponse(solicitudRepository.save(s));
	}

	private void recalcularTotales(SolicitudTurnoIpress sol) {
		int totalTurnos = sol.getDetalles().stream()
				.mapToInt(d -> Math.max(0, d.getTurnosSolicitados() == null ? 0 : d.getTurnosSolicitados())).sum();

		int totalEspecialidades = (int) sol.getDetalles().stream().filter(d -> Boolean.TRUE.equals(d.getRequiere()))
				.filter(d -> (d.getTurnosSolicitados() != null && d.getTurnosSolicitados() > 0)).count();

		sol.setTotalTurnosSolicitados(totalTurnos);
		sol.setTotalEspecialidades(totalEspecialidades);
	}

	@Override
	@Transactional
	public DetalleSolicitudTurnoUpsertResponse upsertDetalle(Long idSolicitud, DetalleSolicitudTurnoUpsertRequest req) {

		// 1) Validar solicitud
		SolicitudTurnoIpress solicitud = solicitudRepository.findById(idSolicitud)
				.orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + idSolicitud));

		validarPropietarioOCoordinador(solicitud);

		if (solicitud.isRevisado()) {
			throw new RuntimeException("No se puede modificar una solicitud ya revisada");
		}

		// 2) Especialidad
		DimServicioEssi especialidad = servicioEssiRepository.findById(req.getIdServicio())
				.orElseThrow(() -> new RuntimeException("Especialidad no encontrada con ID: " + req.getIdServicio()));

		// 3) Upsert por (solicitud, servicio)
		DetalleSolicitudTurno detalle = detalleRepository
				.findBySolicitud_IdSolicitudAndEspecialidad_IdServicio(idSolicitud, req.getIdServicio()).orElseGet(
						() -> DetalleSolicitudTurno.builder().solicitud(solicitud).especialidad(especialidad).build());

		// 4) Set campos según tu JSON + nombres BD
		int tm = req.getTurnoTM() == null ? 0 : req.getTurnoTM();
		int man = req.getTurnoManana() == null ? 0 : req.getTurnoManana();
		int tar = req.getTurnoTarde() == null ? 0 : req.getTurnoTarde();

		detalle.setRequiere(Boolean.TRUE.equals(req.getRequiere()));
		detalle.setTurnosSolicitados(req.getTurnos() == null ? (tm + man + tar) : req.getTurnos());

		detalle.setTurnosTm(tm);
		detalle.setTurnosManana(man);
		detalle.setTurnosTarde(tar);

		detalle.setTeleconsultorioActivo(Boolean.TRUE.equals(req.getTc()));
		detalle.setTeleconsultaActivo(Boolean.TRUE.equals(req.getTl()));

		detalle.setEstado(req.getEstado() == null ? "PENDIENTE" : req.getEstado());
		detalle.setObservacion(req.getObservacion());

		// Compatibilidad con tus flags antiguos
		detalle.setMananaActiva(man > 0);
		detalle.setTardeActiva(tar > 0);

		detalle = detalleRepository.save(detalle);

		log.info("Detalle usado => idDetalle={}, idSolicitud={}, idServicio={}", detalle.getIdDetalle(),
				detalle.getSolicitud().getIdSolicitud(), detalle.getEspecialidad().getIdServicio());

		long antes = detalleFechaRepository.countByDetalle_IdDetalle(detalle.getIdDetalle());
		log.info("Fechas antes delete={}", antes);

		detalleFechaRepository.deleteByDetalle_IdDetalle(detalle.getIdDetalle());

		long despues = detalleFechaRepository.countByDetalle_IdDetalle(detalle.getIdDetalle());
		log.info("Fechas después delete={}", despues);

		if (req.getFechasDetalle() != null && !req.getFechasDetalle().isEmpty()) {
			List<DetalleSolicitudTurnoFecha> nuevas = new ArrayList<>();

			for (var f : req.getFechasDetalle()) {
				var fecha = java.time.LocalDate.parse(f.getFecha());
				var bloque = BloqueTurno.valueOf(f.getBloque());

				nuevas.add(DetalleSolicitudTurnoFecha.builder().detalle(detalle).fecha(fecha).bloque(bloque).build());
			}
			detalleFechaRepository.saveAll(nuevas);
		}

		// 6) Recalcular totales (recargar con detalles para evitar colecciones
		// desfasadas)
		SolicitudTurnoIpress solConDetalles = solicitudRepository.findByIdWithDetalles(idSolicitud)
				.orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + idSolicitud));

		recalcularTotales(solConDetalles);
		solConDetalles.setUpdatedAt(OffsetDateTime.now());
		solicitudRepository.save(solConDetalles);

		// 7) Response
		var fechasGuardadas = detalleFechaRepository.findByDetalle_IdDetalleOrderByFechaAsc(detalle.getIdDetalle())
				.stream()
				.map(x -> DetalleSolicitudTurnoUpsertResponse.FechaDetalleResponse.builder()
						.idDetalleFecha(x.getIdDetalleFecha()).fecha(x.getFecha().toString())
						.bloque(x.getBloque().name()).build())
				.toList();

		return DetalleSolicitudTurnoUpsertResponse.builder().idDetalle(detalle.getIdDetalle()).idSolicitud(idSolicitud)
				.idServicio(req.getIdServicio()).turnoTM(detalle.getTurnosTm()).turnoManana(detalle.getTurnosManana())
				.turnoTarde(detalle.getTurnosTarde()).tc(detalle.getTeleconsultorioActivo())
				.tl(detalle.getTeleconsultaActivo()).estado(detalle.getEstado()).fechasDetalle(fechasGuardadas).build();
	}

	@Override
	@Transactional(readOnly = true)
	public DetalleFechasResponse obtenerFechasDetalle(Long idDetalle) {

		// 1) Traer el detalle (para idServicio y nombreServicio)
		DetalleSolicitudTurno detalle = detalleRepository.findById(idDetalle)
				.orElseThrow(() -> new RuntimeException("Detalle no encontrado con ID: " + idDetalle));

		// (Opcional) Validar propietario si quieres: que el detalle pertenezca al
		// usuario actual
		// validarPropietario(detalle.getSolicitud());

		Long idServicio = detalle.getEspecialidad() != null ? detalle.getEspecialidad().getIdServicio() : null;
		String nombreServicio = detalle.getEspecialidad() != null ? detalle.getEspecialidad().getDescServicio() : null;

		// 2) Listar fechas del detalle
		var fechas = detalleFechaRepository.findByDetalle_IdDetalleOrderByFechaAsc(idDetalle).stream()
				.map(f -> DetalleFechasResponse.FechaDetalle.builder().idDetalleFecha(f.getIdDetalleFecha())
						.fecha(f.getFecha().toString()).bloque(f.getBloque().name()).build())
				.toList();

		// 3) Armar response
		return DetalleFechasResponse.builder().idDetalle(detalle.getIdDetalle()).idServicio(idServicio)
				.nombreServicio(nombreServicio).fechas(fechas).build();
	}

	@Override
	public SolicitudTurnoDetalleFullResponse obtenerPorIdFull(Long id) {

		SolicitudTurnoIpress s = solicitudRepository.findByIdFull(id)
				.orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + id));

		validarPropietarioOCoordinador(s);

		var periodo = s.getPeriodo();
		var per = s.getPersonal();
		var ipress = per != null ? per.getIpress() : null;

		var detalles = (s.getDetalles() == null ? List.<DetalleSolicitudTurno>of() : s.getDetalles()).stream()
				.map(d -> {
					var esp = d.getEspecialidad();

					var fechas = (d.getFechasDetalle() == null ? List.<DetalleSolicitudTurnoFecha>of()
							: d.getFechasDetalle()).stream().sorted((a, b) -> {
								int c = a.getFecha().compareTo(b.getFecha());
								if (c != 0)
									return c;
								return a.getBloque().name().compareTo(b.getBloque().name());
							})
							.map(fd -> SolicitudTurnoDetalleFullResponse.FechaDetalleFull.builder()
									.idDetalleFecha(fd.getIdDetalleFecha()).fecha(fd.getFecha().toString())
									.bloque(fd.getBloque().name()).createdAt(fd.getCreatedAt()).build())
							.toList();

					int tm = d.getTurnosTm() == null ? 0 : d.getTurnosTm();
					int man = d.getTurnosManana() == null ? 0 : d.getTurnosManana();
					int tar = d.getTurnosTarde() == null ? 0 : d.getTurnosTarde();
					int total = d.getTurnosSolicitados() == null ? (tm + man + tar) : d.getTurnosSolicitados();

					return SolicitudTurnoDetalleFullResponse.DetalleFull.builder().idDetalle(d.getIdDetalle())
							.idServicio(esp != null ? esp.getIdServicio() : null)
							.nombreServicio(esp != null ? esp.getDescServicio() : null)
							.codigoServicio(esp != null ? esp.getCodServicio() : null)
							.requiere(Boolean.TRUE.equals(d.getRequiere())).turnos(total).turnoTM(tm).turnoManana(man)
							.turnoTarde(tar).tc(Boolean.TRUE.equals(d.getTeleconsultorioActivo()))
							.tl(Boolean.TRUE.equals(d.getTeleconsultaActivo())).observacion(d.getObservacion())
							.estado(d.getEstado()).fechaCreacion(d.getCreatedAt())

							.fechasDetalle(fechas).build();
				}).toList();

		return SolicitudTurnoDetalleFullResponse.builder().idSolicitud(s.getIdSolicitud())

				.idPeriodo(periodo != null ? periodo.getIdPeriodo() : null)
				.periodo(periodo != null ? periodo.getPeriodo() : null) // ajusta getter
				.periodoDescripcion(periodo != null ? periodo.getDescripcion() : null)
				.fechaInicio(periodo != null && periodo.getFechaInicio() != null
						? periodo.getFechaInicio().toLocalDate().toString()
						: null)
				.fechaFin(periodo != null && periodo.getFechaFin() != null
						? periodo.getFechaFin().toLocalDate().toString()
						: null)

				.estado(s.getEstado())

				.fechaCreacion(s.getCreatedAt()).fechaActualizacion(s.getUpdatedAt()).fechaEnvio(s.getFechaEnvio())

				.totalTurnosSolicitados(s.getTotalTurnosSolicitados()).totalEspecialidades(s.getTotalEspecialidades())

				.idIpress(ipress != null ? ipress.getIdIpress() : null)
				.nombreIpress(ipress != null ? ipress.getDescIpress() : null)
				.codigoRenaes(ipress != null ? ipress.getCodIpress() : null) // ajusta si tu campo renaes es otro

				.idUsuarioCreador(per != null && per.getUsuario() != null ? per.getUsuario().getIdUser() : null) // ajusta
																													// según
																													// tu
																													// modelo
				.nombreUsuarioCreador(per != null ? per.getNombreCompleto() : null)

				.detalles(detalles).build();
	}

}

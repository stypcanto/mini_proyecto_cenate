package com.styp.cenate.service.solicitudturno.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.styp.cenate.dto.PeriodoSolicitudTurnoRequest;
import com.styp.cenate.dto.PeriodoSolicitudTurnoResponse;
import com.styp.cenate.dto.solicitudturno.PeriodoFechasUpdateRequest;
import com.styp.cenate.dto.solicitudturno.PeriodoFechasUpdateResponse;
import com.styp.cenate.dto.solicitudturno.PeriodoSolicitudTurnoResumenView;
import com.styp.cenate.dto.solicitudturno.PeriodoSolicitudTurnoRow;
import com.styp.cenate.model.PeriodoSolicitudTurno;
import com.styp.cenate.repository.PeriodoSolicitudTurnoRepository;
import com.styp.cenate.repository.SolicitudTurnoIpressRepository;
import com.styp.cenate.service.auditlog.AuditLogService;
import com.styp.cenate.service.solicitudturno.PeriodoSolicitudTurnoService;
import com.styp.cenate.utils.DateTimeUtils;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Implementacion del servicio de periodos de solicitud de turnos.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PeriodoSolicitudTurnoServiceImpl implements PeriodoSolicitudTurnoService {

	private final PeriodoSolicitudTurnoRepository periodoRepository;
	private final SolicitudTurnoIpressRepository solicitudRepository;
	private final AuditLogService auditLogService;

	@Override
	public List<PeriodoSolicitudTurnoResponse> listarTodos() {
		log.info("Listando todos los periodos de solicitud");
		return periodoRepository.findAllByOrderByPeriodoDesc().stream().map(this::convertToResponse)
				.collect(Collectors.toList());
	}

	@Override
	public List<PeriodoSolicitudTurnoResponse> listarActivos() {
		log.info("Listando periodos activos");
		return periodoRepository.findActivos().stream().map(this::convertToResponse).collect(Collectors.toList());
	}

	@Override
	public List<PeriodoSolicitudTurnoResponse> listarVigentes() {
		log.info("Listando periodos vigentes");
		return periodoRepository.findVigentes().stream().map(this::convertToResponse).collect(Collectors.toList());
	}

	@Override
	public PeriodoSolicitudTurnoResponse obtenerPorId(Long id) {
		log.info("Obteniendo periodo con ID: {}", id);
		PeriodoSolicitudTurno periodo = periodoRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Periodo no encontrado con ID: " + id));
		return convertToResponse(periodo);
	}

	@Override
	@Transactional
	public PeriodoSolicitudTurnoResponse crear(PeriodoSolicitudTurnoRequest request, String createdBy) {
		log.info("Creando nuevo periodo: {}", request.getPeriodo());

		// Validar que no exista un periodo con el mismo codigo
		if (periodoRepository.existsByPeriodo(request.getPeriodo())) {
			throw new RuntimeException("Ya existe un periodo con el codigo: " + request.getPeriodo());
		}

		// Validar fechas
		if (request.getFechaFin().isBefore(request.getFechaInicio())) {
			throw new RuntimeException("La fecha de fin no puede ser anterior a la fecha de inicio");
		}

		PeriodoSolicitudTurno periodo = PeriodoSolicitudTurno.builder().periodo(request.getPeriodo())
				.descripcion(request.getDescripcion()).fechaInicio(DateTimeUtils.startOfDay(request.getFechaInicio()))
				.fechaFin(DateTimeUtils.endOfDay(request.getFechaFin())).instrucciones(request.getInstrucciones())
				.estado("BORRADOR").createdBy(createdBy).build();

		periodo = periodoRepository.save(periodo);

		auditar("CREATE_PERIODO", "Periodo creado: " + periodo.getDescripcion(), "INFO", "SUCCESS");

		log.info("Periodo creado exitosamente con ID: {}", periodo.getIdPeriodo());
		return convertToResponse(periodo);
	}

	@Override
	@Transactional
	public PeriodoSolicitudTurnoResponse actualizar(Long id, PeriodoSolicitudTurnoRequest request) {
		log.info("Actualizando periodo con ID: {}", id);

		PeriodoSolicitudTurno periodo = periodoRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Periodo no encontrado con ID: " + id));

		// Solo se puede editar si esta en BORRADOR
		if (!periodo.isBorrador()) {
			throw new RuntimeException("Solo se pueden editar periodos en estado BORRADOR");
		}

		// Validar fechas
		if (request.getFechaFin().isBefore(request.getFechaInicio())) {
			throw new RuntimeException("La fecha de fin no puede ser anterior a la fecha de inicio");
		}

		periodo.setDescripcion(request.getDescripcion());
		periodo.setFechaInicio(DateTimeUtils.startOfDay(request.getFechaInicio()));
		periodo.setFechaFin(DateTimeUtils.endOfDay(request.getFechaFin()));
		periodo.setInstrucciones(request.getInstrucciones());

		periodo = periodoRepository.save(periodo);

		auditar("UPDATE_PERIODO", "Periodo actualizado: " + periodo.getDescripcion(), "INFO", "SUCCESS");

		log.info("Periodo actualizado exitosamente");
		return convertToResponse(periodo);
	}

	@Override
	@Transactional
	public PeriodoSolicitudTurnoResponse cambiarEstado(Long id, String nuevoEstado) {
		log.info("Cambiando estado del periodo {} a {}", id, nuevoEstado);

		PeriodoSolicitudTurno periodo = periodoRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Periodo no encontrado con ID: " + id));

		String estadoAnterior = periodo.getEstado();

		// Validar transiciones de estado validas
		validarTransicionEstado(estadoAnterior, nuevoEstado);

		periodo.setEstado(nuevoEstado);
		periodo = periodoRepository.save(periodo);

		auditar("CAMBIO_ESTADO_PERIODO",
				String.format("Periodo %s: %s -> %s", periodo.getDescripcion(), estadoAnterior, nuevoEstado), "INFO",
				"SUCCESS");

		log.info("Estado del periodo cambiado exitosamente");
		return convertToResponse(periodo);
	}

//    @Override
//    @Transactional
//    public void eliminar(Long id) {
//        log.info("Eliminando periodo con ID: {}", id);
//
//        PeriodoSolicitudTurno periodo = periodoRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Periodo no encontrado con ID: " + id));
//
//        // Solo se puede eliminar si esta en BORRADOR
//        if (!periodo.isBorrador()) {
//            throw new RuntimeException("Solo se pueden eliminar periodos en estado BORRADOR");
//        }
//
//        String descripcion = periodo.getDescripcion();
//        periodoRepository.delete(periodo);
//
//        auditar("DELETE_PERIODO", "Periodo eliminado: " + descripcion, "WARNING", "SUCCESS");
//
//        log.info("Periodo eliminado exitosamente");
//    }

	@Override
	public PeriodoSolicitudTurnoResponse obtenerConEstadisticas(Long id) {
		log.info("Obteniendo periodo con estadisticas, ID: {}", id);

		PeriodoSolicitudTurno periodo = periodoRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Periodo no encontrado con ID: " + id));

		PeriodoSolicitudTurnoResponse response = convertToResponse(periodo);

		// Agregar estadisticas
		response.setTotalSolicitudes(periodoRepository.countSolicitudesByPeriodo(id));
		response.setSolicitudesEnviadas(periodoRepository.countSolicitudesEnviadasByPeriodo(id));

		return response;
	}

	// ========================================
	// Metodos privados
	// ========================================

	private void validarTransicionEstado(String estadoActual, String nuevoEstado) {
		// Transiciones validas:
		// BORRADOR -> ACTIVO
		// ACTIVO -> CERRADO
		// CERRADO -> ACTIVO (reactivar)

		if ("BORRADOR".equals(estadoActual) && !"ACTIVO".equals(nuevoEstado)) {
			throw new RuntimeException("Un periodo en BORRADOR solo puede pasar a ACTIVO");
		}

		if ("ACTIVO".equals(estadoActual) && !"CERRADO".equals(nuevoEstado)) {
			throw new RuntimeException("Un periodo ACTIVO solo puede pasar a CERRADO");
		}

		if ("CERRADO".equals(estadoActual) && !"ACTIVO".equals(nuevoEstado)) {
			throw new RuntimeException("Un periodo CERRADO solo puede reactivarse a ACTIVO");
		}
	}

	private PeriodoSolicitudTurnoResponse convertToResponse(PeriodoSolicitudTurno periodo) {
		return PeriodoSolicitudTurnoResponse.builder().idPeriodo(periodo.getIdPeriodo()).periodo(periodo.getPeriodo())
				.descripcion(periodo.getDescripcion()).fechaInicio(periodo.getFechaInicio())
				.fechaFin(periodo.getFechaFin()).estado(periodo.getEstado()).instrucciones(periodo.getInstrucciones())
				.createdBy(periodo.getCreatedBy()).createdAt(periodo.getCreatedAt()).updatedAt(periodo.getUpdatedAt())
				.build();
	}

	private void auditar(String action, String detalle, String nivel, String estado) {
		try {
			String usuario = SecurityContextHolder.getContext().getAuthentication().getName();
			auditLogService.registrarEvento(usuario, action, "SOLICITUD_TURNOS", detalle, nivel, estado);
		} catch (Exception e) {
			log.warn("No se pudo registrar auditoria: {}", e.getMessage());
		}
	}

	@Override
	@Transactional
	public void eliminar(Long idPeriodo) {

		// 1) validar que exista el periodo
		var periodo = periodoRepository.findById(idPeriodo)
				.orElseThrow(() -> new RuntimeException("Periodo no encontrado con ID: " + idPeriodo));

		if (!periodo.isActivo()) {
			throw new RuntimeException("Solo se pueden eliminar periodos en estado ACTIVO");
		}

		// 2) validar que NO tenga solicitudes
		long cant = solicitudRepository.countByPeriodo_IdPeriodo(idPeriodo);
		if (cant > 0) {
			// ideal: lanza excepción de negocio que tu GlobalExceptionHandler mapee a 409
			throw new IllegalStateException(
					"No se puede eliminar el periodo porque tiene " + cant + " solicitud(es) IPRESS asociada(s).");
		}

		// 3) eliminar
		periodoRepository.delete(periodo);
	}

	@Transactional
	public PeriodoFechasUpdateResponse actualizarFechas(Long idPeriodo, PeriodoFechasUpdateRequest req) {

		PeriodoSolicitudTurno periodo = periodoRepository.findById(idPeriodo)
				.orElseThrow(() -> new RuntimeException("Periodo no encontrado con ID: " + idPeriodo));

		// Validación: inicio < fin
		if (!req.getFechaInicio().isBefore(req.getFechaFin())) {
			throw new RuntimeException("fechaInicio debe ser menor que fechaFin");
		}

		// (Opcional) Si el periodo está CERRADO, no permitir
		if (periodo.isCerrado()) {
			throw new RuntimeException("No se puede modificar fechas de un periodo CERRADO");
		}

		// (Opcional) Si quieres bloquear cambios cuando ya hay solicitudes:
		// boolean existeSolicitudes =
		// solicitudRepository.existsByPeriodo_IdPeriodo(idPeriodo);
		// if (existeSolicitudes) throw new RuntimeException("No se puede modificar
		// fechas: existen solicitudes asociadas");

		periodo.setFechaInicio(req.getFechaInicio());
		periodo.setFechaFin(req.getFechaFin());

		// updatedAt se actualiza solo por @UpdateTimestamp (si lo tienes),
		// pero igual guardar persiste el cambio.
		PeriodoSolicitudTurno guardado = periodoRepository.save(periodo);

		return PeriodoFechasUpdateResponse.builder().idPeriodo(guardado.getIdPeriodo())
				.fechaInicio(guardado.getFechaInicio()).fechaFin(guardado.getFechaFin())
				.updatedAt(guardado.getUpdatedAt()).build();
	}

	public Page<PeriodoSolicitudTurnoRow> listar(String estado, Integer anio, Pageable pageable) {

		// "TODOS" o vacío => sin filtro por estado
		String estadoNorm = (estado == null || estado.isBlank() || "TODOS".equalsIgnoreCase(estado)) ? null
				: estado.trim().toUpperCase();

		// periodo es "YYYYMM" => año filtra con LIKE "2026%"
		String anioLike = (anio == null) ? null : (anio.toString() + "%");

		Specification<PeriodoSolicitudTurno> spec = (root, query, cb) -> {
			List<Predicate> p = new ArrayList<>();

			if (estadoNorm != null) {
				p.add(cb.equal(cb.upper(root.get("estado")), estadoNorm));
			}
			if (anioLike != null) {
				p.add(cb.like(root.get("periodo"), anioLike));
			}

			return cb.and(p.toArray(new Predicate[0]));
		};

		return periodoRepository.findAll(spec, pageable)
				.map(p -> PeriodoSolicitudTurnoRow.builder().idPeriodo(p.getIdPeriodo()).periodo(p.getPeriodo())
						.descripcion(p.getDescripcion()).fechaInicio(p.getFechaInicio()).fechaFin(p.getFechaFin())
						.estado(p.getEstado()).createdAt(p.getCreatedAt()).updatedAt(p.getUpdatedAt()).build());
	}

	@Override
	public List<Integer> listarAnios() {
		return periodoRepository.listarAniosDisponibles();
	}

	@Override
	public Page<PeriodoSolicitudTurnoRow> listarConConteoSolicitudes(String estado, Integer anio, Pageable pageable) {
		return periodoRepository.listarConConteoSolicitudes(estado, anio, pageable);
	}

	@Override
	public Page<PeriodoSolicitudTurnoResumenView> listarConResumen(String estado, Integer anio, Pageable pageable) {
		return periodoRepository.listarConResumen(estado, anio, pageable);
	}

}

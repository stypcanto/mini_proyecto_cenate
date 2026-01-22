package com.styp.cenate.service.solicitudturno;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.styp.cenate.dto.PeriodoSolicitudTurnoRequest;
import com.styp.cenate.dto.PeriodoSolicitudTurnoResponse;
import com.styp.cenate.dto.solicitudturno.PeriodoFechasUpdateRequest;
import com.styp.cenate.dto.solicitudturno.PeriodoFechasUpdateResponse;
import com.styp.cenate.dto.solicitudturno.PeriodoSolicitudTurnoResumenView;
import com.styp.cenate.dto.solicitudturno.PeriodoSolicitudTurnoRow;

/**
 * Servicio para gestionar periodos de solicitud de turnos.
 */
public interface PeriodoSolicitudTurnoService {

	/**
	 * Lista todos los periodos
	 */
	List<PeriodoSolicitudTurnoResponse> listarTodos();

	/**
	 * Lista periodos activos
	 */
	List<PeriodoSolicitudTurnoResponse> listarActivos();

	/**
	 * Lista periodos vigentes (activos y dentro del rango de fechas)
	 */
	List<PeriodoSolicitudTurnoResponse> listarVigentes();

	/**
	 * Obtiene un periodo por ID
	 */
	PeriodoSolicitudTurnoResponse obtenerPorId(Long id);

	/**
	 * Crea un nuevo periodo
	 */
	PeriodoSolicitudTurnoResponse crear(PeriodoSolicitudTurnoRequest request, String createdBy);

	/**
	 * Actualiza un periodo existente
	 */
	PeriodoSolicitudTurnoResponse actualizar(Long id, PeriodoSolicitudTurnoRequest request);

	/**
	 * Cambia el estado de un periodo (BORRADOR, ACTIVO, CERRADO)
	 */
	PeriodoSolicitudTurnoResponse cambiarEstado(Long id, String nuevoEstado);

	/**
	 * Elimina un periodo (solo si esta en BORRADOR)
	 */
	void eliminar(Long id);

	/**
	 * Obtiene estadisticas de un periodo
	 */
	PeriodoSolicitudTurnoResponse obtenerConEstadisticas(Long id);

	PeriodoFechasUpdateResponse actualizarFechas(Long idPeriodo, PeriodoFechasUpdateRequest req);

	Page<PeriodoSolicitudTurnoRow> listar(String estado, Integer anio, Pageable pageable);

	Page<PeriodoSolicitudTurnoRow> listarConConteoSolicitudes(String estado, Integer anio, Pageable pageable);
	
	Page<PeriodoSolicitudTurnoResumenView> listarConResumen(String estado, Integer anio, Pageable pageable);

	List<Integer> listarAnios();

}

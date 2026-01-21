package com.styp.cenate.service.solicitudturno;

import java.util.List;

import com.styp.cenate.dto.MiIpressResponse;
import com.styp.cenate.dto.SolicitudTurnoIpressRequest;
import com.styp.cenate.dto.SolicitudTurnoIpressResponse;
import com.styp.cenate.dto.solicitudturno.DetalleFechasResponse;
import com.styp.cenate.dto.solicitudturno.DetalleSolicitudTurnoUpsertRequest;
import com.styp.cenate.dto.solicitudturno.DetalleSolicitudTurnoUpsertResponse;
import com.styp.cenate.dto.solicitudturno.SolicitudTurnoDetalleFullResponse;
import com.styp.cenate.dto.solicitudturno.SolicitudTurnoEstadoResponse;
import com.styp.cenate.dto.solicitudturno.SolicitudTurnoIpressListadoRow;

/**
 * Servicio para gestionar solicitudes de turnos de IPRESS.
 */
public interface SolicitudTurnoIpressService {

	/**
	 * Obtiene los datos de IPRESS del usuario actual (auto-detectados)
	 */
	MiIpressResponse obtenerMiIpress();

	/**
	 * Lista solicitudes por periodo
	 */
	List<SolicitudTurnoIpressResponse> listarPorPeriodo(Long idPeriodo);

	/**
	 * Lista solicitudes por periodo con filtro de Red
	 */
	List<SolicitudTurnoIpressResponse> listarPorPeriodoYRed(Long idPeriodo, Long idRed);

	/**
	 * Lista solicitudes por IPRESS
	 */
	List<SolicitudTurnoIpressResponse> listarPorIpress(Long idIpress);

	/**
	 * Obtiene una solicitud por ID
	 */
	SolicitudTurnoIpressResponse obtenerPorId(Long id);

	/**
	 * Obtiene una solicitud por ID con detalles
	 */
	SolicitudTurnoIpressResponse obtenerPorIdConDetalles(Long id);

	/**
	 * Obtiene la solicitud del usuario actual para un periodo
	 */
	SolicitudTurnoIpressResponse obtenerMiSolicitud(Long idPeriodo);

	/**
	 * Verifica si el usuario actual ya tiene solicitud en un periodo
	 */
	boolean existeMiSolicitud(Long idPeriodo);

	/**
	 * Crea una nueva solicitud (como borrador)
	 */
	SolicitudTurnoIpressResponse crear(SolicitudTurnoIpressRequest request);

	/**
	 * Actualiza una solicitud existente (solo si esta en borrador)
	 */
	SolicitudTurnoIpressResponse actualizar(Long id, SolicitudTurnoIpressRequest request);

	/**
	 * Guarda solicitud como borrador
	 */
	SolicitudTurnoIpressResponse guardarBorrador(SolicitudTurnoIpressRequest request);

	/**
	 * Envia una solicitud
	 */
	SolicitudTurnoIpressResponse enviar(Long id);

	/**
	 * Marca una solicitud como revisada (solo Coordinador)
	 */
	SolicitudTurnoIpressResponse marcarRevisada(Long id);

	/**
	 * Elimina una solicitud (solo si esta en borrador)
	 */
	void eliminar(Long id);

	/**
	 * Lista solicitudes del usuario actual
	 */
	List<SolicitudTurnoIpressResponse> listarMisSolicitudes();

	/*
	 * Consultar solicitudes de ippress por periodo y estado (Para el admin)
	 */
	List<SolicitudTurnoIpressListadoRow> listar(Long idPeriodo, String estado);

	/**
	 * Aprobar solicitud (solo coordinador)
	 */
	SolicitudTurnoEstadoResponse aprobarSolicitud(Long idSolicitud);

	/**
	 * Rechazar solicitud (solo coordinador)
	 */
	SolicitudTurnoEstadoResponse rechazarSolicitud(Long idSolicitud, String motivo);
	
	
	DetalleSolicitudTurnoUpsertResponse upsertDetalle(Long idSolicitud, DetalleSolicitudTurnoUpsertRequest request);

	
	DetalleFechasResponse obtenerFechasDetalle(Long idDetalle);

	
	SolicitudTurnoDetalleFullResponse obtenerPorIdFull(Long id);

	

}

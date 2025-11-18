package com.styp.cenate.service.usuario;

import java.util.Optional;

import com.styp.cenate.dto.SolicitudContrasenaDTO;

public interface SolicitudContrasenaService {

	/**
	 * Guarda una solicitud. Si viene idempotencia y ya existe un registro con esa
	 * clave, devuelve el existente (idempotencia).
	 */
	SolicitudContrasenaDTO guardar(SolicitudContrasenaDTO dto);

	Optional<SolicitudContrasenaDTO> buscarPorId(Long id);

	Optional<SolicitudContrasenaDTO> buscarPorIdempotencia(String idempotencia);

	/**
	 * Actualiza el estado (ej: PENDIENTE, ENVIADO, ERROR, PROCESADO)
	 */
	Optional<SolicitudContrasenaDTO> actualizarEstado(Long id, String nuevoEstado);

	/**
	 * Incrementa y persiste el contador de intentos de envío.
	 */
	Optional<SolicitudContrasenaDTO> incrementarIntentos(Long id);

	/**
	 * Registra el último error de proceso/envío.
	 */
	Optional<SolicitudContrasenaDTO> registrarError(Long id, String error);

}

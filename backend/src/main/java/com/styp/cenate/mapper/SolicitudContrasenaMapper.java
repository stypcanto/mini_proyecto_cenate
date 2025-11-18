package com.styp.cenate.mapper;

import com.styp.cenate.dto.SolicitudContrasenaDTO;
import com.styp.cenate.model.SolicitudContrasena;
import com.styp.cenate.model.Usuario;

public class SolicitudContrasenaMapper {

	public static SolicitudContrasenaDTO toDTO(SolicitudContrasena entity) {
		if (entity == null) {
			return null;
		}

		return SolicitudContrasenaDTO.builder().id(entity.getId())
				.idUsuario(entity.getUsuario() != null ? entity.getUsuario().getIdUser() : null)
				.contrasenaHash(entity.getContrasenaHash()).fechaEmision(entity.getFechaEmision())
				.fechaRegistro(entity.getFecha_registro()).estado(entity.getEstado())
				.correoDestino(entity.getCorreoDestino())
				.intentosEnvio(entity.getIntentosEnvio()).ultimoError(entity.getUltimoError())
				.ipSolicitante(entity.getIpSolicitante()).idempotencia(entity.getIdempotencia()).build();
	}
	

    public static SolicitudContrasena toEntity(SolicitudContrasenaDTO dto) {
        if (dto == null) {
            return null;
        }
        SolicitudContrasena entity = new SolicitudContrasena();
        entity.setId(dto.getId());
        entity.setContrasenaHash(dto.getContrasenaHash());
        entity.setFechaEmision(dto.getFechaEmision());
        entity.setFecha_registro(dto.getFechaRegistro());
        entity.setEstado(dto.getEstado());
        entity.setIntentosEnvio(dto.getIntentosEnvio());
        entity.setUltimoError(dto.getUltimoError());
        entity.setCorreoDestino(dto.getCorreoDestino());
        entity.setIpSolicitante(dto.getIpSolicitante());
        entity.setIdempotencia(dto.getIdempotencia());
        if (dto.getIdUsuario() != null) {
            Usuario usuario = new Usuario();
            usuario.setIdUser(dto.getIdUsuario());
            entity.setUsuario(usuario);
        }
        return entity;
    }
	

}

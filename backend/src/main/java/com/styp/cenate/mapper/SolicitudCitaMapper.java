package com.styp.cenate.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.styp.cenate.dto.SolicitudCitaDTO;
import com.styp.cenate.model.SolicitudCita;

@Component
public class SolicitudCitaMapper {



	public static SolicitudCitaDTO toDto(SolicitudCita entity) {
		if (entity == null)
			return null;

		return SolicitudCitaDTO.builder().idSolicitud(entity.getIdSolicitud()).periodo(entity.getPeriodo())
				.docPaciente(entity.getDocPaciente()).nombresPaciente(entity.getNombresPaciente())
				.sexo(entity.getSexo()).edad(entity.getEdad()).telefono(entity.getTelefono())
				.fechaCita(entity.getFechaCita()).horaCita(entity.getHoraCita())
				.fechaSolicitud(entity.getFechaSolicitud()).fechaActualiza(entity.getFechaActualiza())
				.estadoSolicitud(entity.getEstadoSolicitud()).observacion(entity.getObservacion())

				.idPersonal(entity.getPersonal() != null ? entity.getPersonal().getIdPers() : null)
				.nombrePersonal(entity.getPersonal() != null ? entity.getPersonal().getNombreCompleto() : null)

				.idAreaHospitalaria(entity.getAreaHospitalaria() != null ? entity.getAreaHospitalaria().getId() : null)
				.descAreaHospitalaria(
						entity.getAreaHospitalaria() != null ? entity.getAreaHospitalaria().getDescripcion() : null)

				.idServicio(entity.getServicio() != null ? entity.getServicio().getIdServicio() : null)
				.descServicio(entity.getServicio() != null ? entity.getServicio().getDescServicio() : null)

				.idActividad(entity.getActividad() != null ? entity.getActividad().getIdActividad() : null)
				.descActividad(entity.getActividad() != null ? entity.getActividad().getDescActividad() : null)

				.idSubactividad(entity.getSubactividad() != null ? entity.getSubactividad().getIdSubactividad() : null)
				.descSubactividad(
						entity.getSubactividad() != null ? entity.getSubactividad().getDescSubactividad() : null)
				.build();
	}

	public static SolicitudCita toEntity(SolicitudCitaDTO dto) {
		if (dto == null)
			return null;

		SolicitudCita entity = new SolicitudCita();
		entity.setIdSolicitud(dto.getIdSolicitud());
		entity.setPeriodo(dto.getPeriodo());
		entity.setDocPaciente(dto.getDocPaciente());
		entity.setNombresPaciente(dto.getNombresPaciente());
		entity.setSexo(dto.getSexo());
		entity.setEdad(dto.getEdad());
		entity.setTelefono(dto.getTelefono());
		entity.setFechaCita(dto.getFechaCita());
		entity.setHoraCita(dto.getHoraCita());
		entity.setFechaSolicitud(dto.getFechaSolicitud());
		entity.setFechaActualiza(dto.getFechaActualiza());
		entity.setEstadoSolicitud(dto.getEstadoSolicitud());
		entity.setObservacion(dto.getObservacion());

		//  Relaciones se asignan en el ServiceImpl (attachRelationsWithRepositories)
		entity.setPersonal(null);
		entity.setAreaHospitalaria(null);
		entity.setServicio(null);
		entity.setActividad(null);
		entity.setSubactividad(null);

		return entity;
	}


    public static List<SolicitudCitaDTO> toDtoList(List<SolicitudCita> entities) {
        return entities.stream()
                .map(SolicitudCitaMapper::toDto) 
                .collect(Collectors.toList());
    }

    public static List<SolicitudCita> toEntityList(List<SolicitudCitaDTO> dtos) {
        return dtos.stream()
                .map(SolicitudCitaMapper::toEntity)
                .collect(Collectors.toList());
    }
}

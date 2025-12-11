package com.styp.cenate.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.styp.cenate.dto.chatbot.SolicitudCitaRequestDTO;
import com.styp.cenate.dto.chatbot.SolicitudCitaResponseDTO;
import com.styp.cenate.model.chatbot.SolicitudCita;

@Component
public class SolicitudCitaMapper {



	public static SolicitudCitaResponseDTO toDto(SolicitudCita entity) {
		if (entity == null)
			return null;

		return SolicitudCitaResponseDTO.builder().idSolicitud(entity.getIdSolicitud()).periodo(entity.getPeriodo())
				.docPaciente(entity.getDocPaciente()).nombresPaciente(entity.getNombresPaciente())
				.sexo(entity.getSexo()).edad(entity.getEdad()).telefono(entity.getTelefono())
				.fechaCita(entity.getFechaCita()).horaCita(entity.getHoraCita())
				.observacion(entity.getObservacion())

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

	public static SolicitudCita toEntity(SolicitudCitaRequestDTO dto) {
		if (dto == null)
			return null;

		SolicitudCita entity = new SolicitudCita();
		entity.setIdSolicitud(dto.getIdSolicitud());
		entity.setPeriodo(dto.getPeriodo());
		entity.setDocPaciente(dto.getDocPaciente());
//		entity.setNombresPaciente(dto.getNombresPaciente());
//		entity.setSexo(dto.getSexo());
//		entity.setEdad(dto.getEdad());
		entity.setTelefono(dto.getTelefono());
		entity.setFechaCita(dto.getFechaCita());
		entity.setHoraCita(dto.getHoraCita());
		entity.setObservacion(dto.getObservacion());

		//  Relaciones se asignan en el ServiceImpl (attachRelationsWithRepositories)
		entity.setPersonal(null);
		entity.setAreaHospitalaria(null);
		entity.setServicio(null);
		entity.setActividad(null);
		entity.setSubactividad(null);

		return entity;
	}


    public static List<SolicitudCitaResponseDTO> toDtoList(List<SolicitudCita> entities) {
        return entities.stream()
                .map(SolicitudCitaMapper::toDto) 
                .collect(Collectors.toList());
    }

    public static List<SolicitudCita> toEntityList(List<SolicitudCitaRequestDTO> dtos) {
        return dtos.stream()
                .map(SolicitudCitaMapper::toEntity)
                .collect(Collectors.toList());
    }
}

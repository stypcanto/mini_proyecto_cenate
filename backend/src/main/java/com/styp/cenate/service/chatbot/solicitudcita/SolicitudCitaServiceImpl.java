package com.styp.cenate.service.chatbot.solicitudcita;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.styp.cenate.dto.SolicitudCitaDTO;
import com.styp.cenate.exception.RegistroCitaExistenteException;
import com.styp.cenate.mapper.SolicitudCitaMapper;
import com.styp.cenate.model.chatbot.SolicitudCita;
import com.styp.cenate.repository.ActividadEssiRepository;
import com.styp.cenate.repository.AreaHospitalariaRepository;
import com.styp.cenate.repository.DimServicioEssiRepository;
import com.styp.cenate.repository.PersonalCntRepository;
import com.styp.cenate.repository.SubactividadEssiRepository;
import com.styp.cenate.repository.chatbot.DimEstadoCitaRepository;
import com.styp.cenate.repository.chatbot.SolicitudCitaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class SolicitudCitaServiceImpl implements ISolicitudCitaService {

	private final SolicitudCitaMapper solicitudCitaMapper;

	private final SolicitudCitaRepository solicitudRepo;
	private final PersonalCntRepository personalRepo;
	private final AreaHospitalariaRepository areaRepo;
	private final DimServicioEssiRepository servicioRepo;
	private final ActividadEssiRepository actividadRepo;
	private final SubactividadEssiRepository subactividadRepo;
	private final DimEstadoCitaRepository estadoCitaRepo;

	@Override
	public SolicitudCitaDTO guardar(SolicitudCitaDTO dto) {
		SolicitudCita entity = SolicitudCitaMapper.toEntity(dto);
		// Validar existencia de cita
		boolean existencia = existeCitaPorPersonalYFechaHora(dto.getIdPersonal(), dto.getFechaCita(),
				dto.getHoraCita());
		if (existencia) {
			throw new RegistroCitaExistenteException("Horario de cita ya se encuentra registrado.");
		}

		attachRelationsWithRepositories(entity, dto);
// CON RELACION
//		Long estadoDefecto = 2L; // RESERVADO
//		DimEstadoCita estado = estadoCitaRepo.findById(estadoDefecto)
//				.orElseThrow(() -> new IllegalArgumentException("Estado de cita no encontrado: " + estadoDefecto));
//
//		entity.setEstadoCita(estado);
		// SIN RELACION
		entity.setIdEstadoCita(2L);

		return SolicitudCitaMapper.toDto(solicitudRepo.save(entity));
	}

	@Override
	public SolicitudCitaDTO actualizar(Long idSolicitud, SolicitudCitaDTO dto) {
		SolicitudCita existente = solicitudRepo.findById(idSolicitud)
				.orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada: " + idSolicitud));

		existente.setPeriodo(dto.getPeriodo());
		existente.setDocPaciente(dto.getDocPaciente());
		existente.setNombresPaciente(dto.getNombresPaciente());
		existente.setSexo(dto.getSexo());
		existente.setEdad(dto.getEdad());
		existente.setTelefono(dto.getTelefono());
		existente.setFechaCita(dto.getFechaCita());
		existente.setHoraCita(dto.getHoraCita());
//		existente.setFechaSolicitud(dto.getFechaSolicitud());
//		existente.setFechaActualiza(dto.getFechaActualiza());
		existente.setObservacion(dto.getObservacion());
		attachRelationsWithRepositories(existente, dto);
		return SolicitudCitaMapper.toDto(solicitudRepo.save(existente));
	}

	@Override
	public void eliminar(Long idSolicitud) {
		if (!solicitudRepo.existsById(idSolicitud)) {
			throw new IllegalArgumentException("Solicitud no encontrada: " + idSolicitud);
		}
		solicitudRepo.deleteById(idSolicitud);
	}

	@Override
	@Transactional(readOnly = true)
	public List<SolicitudCitaDTO> listar() {
		return null;
	}

	@Override
	@Transactional(readOnly = true)
	public Optional<SolicitudCitaDTO> buscarPorId(Long idSolicitud) {
		return solicitudRepo.findById(idSolicitud).map(SolicitudCitaMapper::toDto);
	}

	@Override
	@Transactional(readOnly = true)
	public List<SolicitudCitaDTO> buscarPorDocPaciente(String docPaciente) {
		return SolicitudCitaMapper.toDtoList(solicitudRepo.findByDocPaciente(docPaciente));
	}

	@Override
	@Transactional(readOnly = true)
	public List<SolicitudCitaDTO> buscarPorEstado(String estadoSolicitud) {
		return null;
	}

	@Override
	@Transactional(readOnly = true)
	public List<SolicitudCitaDTO> buscarPorIdServicio(Long idServicio) {
		return null;
	}

	@Override
	@Transactional(readOnly = true)
	public List<SolicitudCitaDTO> buscarPorPeriodoYServicio(String periodo, Long idServicio) {
		return null;
	}

	@Override
	@Transactional(readOnly = true)
	public List<SolicitudCitaDTO> buscarPorActividadOSubactividad(Long idActividad, Long idSubactividad) {
		return null;
	}

	@Override
	@Transactional(readOnly = true)
	public List<SolicitudCitaDTO> buscarPorIdPersonal(Long idPers) {
		return null;
	}

	private void attachRelationsWithRepositories(SolicitudCita entity, SolicitudCitaDTO dto) {
		if (dto.getIdPersonal() != null) {
			entity.setPersonal(personalRepo.findById(dto.getIdPersonal())
					.orElseThrow(() -> new IllegalArgumentException("Personal no existe: " + dto.getIdPersonal())));
		} else {
			entity.setPersonal(null);
		}

		if (dto.getIdAreaHospitalaria() != null) {
			entity.setAreaHospitalaria(areaRepo.findById(dto.getIdAreaHospitalaria()).orElseThrow(
					() -> new IllegalArgumentException("Área hospitalaria no existe: " + dto.getIdAreaHospitalaria())));
		} else {
			entity.setAreaHospitalaria(null);
		}

		if (dto.getIdServicio() != null) {
			entity.setServicio(servicioRepo.findById(dto.getIdServicio())
					.orElseThrow(() -> new IllegalArgumentException("Servicio no existe: " + dto.getIdServicio())));
		} else {
			entity.setServicio(null);
		}
		if (dto.getIdActividad() != null) {
			entity.setActividad(actividadRepo.findById(dto.getIdActividad())
					.orElseThrow(() -> new IllegalArgumentException("Actividad no existe: " + dto.getIdActividad())));
		} else {
			entity.setActividad(null);
		}

		if (dto.getIdSubactividad() != null) {
			entity.setSubactividad(subactividadRepo.findById(dto.getIdSubactividad()).orElseThrow(
					() -> new IllegalArgumentException("Subactividad no existe: " + dto.getIdSubactividad())));
		} else {
			entity.setSubactividad(null);
		}

	}

	@Override
	public SolicitudCitaDTO actualizarEstado(Long id, String estado, String observacion) {
		SolicitudCita solicitud = solicitudRepo.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada: " + id));

		solicitud.setObservacion(observacion);
		solicitud.setFechaActualiza(OffsetDateTime.now());
		return SolicitudCitaMapper.toDto(solicitudRepo.save(solicitud));
	}

	private void validarCamposObligatorios(SolicitudCitaDTO dto) {
		if (dto.getPeriodo() == null || dto.getPeriodo().isBlank())
			throw new IllegalArgumentException("Periodo es obligatorio");
		if (dto.getDocPaciente() == null || dto.getDocPaciente().isBlank())
			throw new IllegalArgumentException("Documento del paciente es obligatorio");

	}

	public boolean existeCitaPorPersonalYFechaHora(Long idPers, LocalDate fechaCita, LocalTime horaCita) {
		if (idPers == null || fechaCita == null || horaCita == null) {
			throw new IllegalArgumentException("Los parámetros idPers, fechaCita y horaCita son obligatorios");
		}
		return solicitudRepo.existsByPersonal_IdPersAndFechaCitaAndHoraCita(idPers, fechaCita, horaCita);
	}

}

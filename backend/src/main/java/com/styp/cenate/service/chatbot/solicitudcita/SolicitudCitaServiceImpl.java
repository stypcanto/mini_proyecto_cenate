package com.styp.cenate.service.chatbot.solicitudcita;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.styp.cenate.dto.chatbot.SolicitudCitaRequestDTO;
import com.styp.cenate.dto.chatbot.SolicitudCitaResponseDTO;
import com.styp.cenate.exception.AseguradoNoEncontradoException;
import com.styp.cenate.exception.RegistroCitaExistenteException;
import com.styp.cenate.mapper.SolicitudCitaMapper;
import com.styp.cenate.model.Asegurado;
import com.styp.cenate.model.chatbot.SolicitudCita;
import com.styp.cenate.repository.ActividadEssiRepository;
import com.styp.cenate.repository.AreaHospitalariaRepository;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.repository.DimServicioEssiRepository;
import com.styp.cenate.repository.PersonalCntRepository;
import com.styp.cenate.repository.SubactividadEssiRepository;
import com.styp.cenate.repository.chatbot.DimEstadoCitaRepository;
import com.styp.cenate.repository.chatbot.SolicitudCitaRepository;
import com.styp.cenate.utils.CalculoFechas;

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
	private final AseguradoRepository aseguradoRepo;

	@Override
	public SolicitudCitaResponseDTO guardar(SolicitudCitaRequestDTO dto) {
		SolicitudCita entity = SolicitudCitaMapper.toEntity(dto);
		
		// buscar datos del asegurado.
		Asegurado asegurado = aseguradoRepo.findByDocPaciente(dto.getDocPaciente())
				.orElseThrow(() -> new AseguradoNoEncontradoException("No existe el paciente"));
		
		entity.setNombresPaciente(asegurado.getPaciente());
		entity.setEdad(CalculoFechas.calcularEdad(asegurado.getFecnacimpaciente()));
		entity.setSexo(asegurado.getSexo());
		
		// Validar existencia de cita
		boolean existencia = existeCitaPorPersonalYFechaHora(dto.getIdPersonal(), dto.getFechaCita(),
				dto.getHoraCita());
		if (existencia) {
			throw new RegistroCitaExistenteException("Horario de cita ya se encuentra registrado.");
		}

		attachRelationsWithRepositories(entity, dto);
		entity.setIdEstadoCita(2L);

		return SolicitudCitaMapper.toDto(solicitudRepo.save(entity));
	}
	
	

	@Override
	public SolicitudCitaResponseDTO actualizar(Long idSolicitud, SolicitudCitaRequestDTO dto) {
		SolicitudCita existente = solicitudRepo.findById(idSolicitud)
				.orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada: " + idSolicitud));

		existente.setPeriodo(dto.getPeriodo());
		existente.setDocPaciente(dto.getDocPaciente());
//		existente.setNombresPaciente(dto.getNombresPaciente());
//		existente.setSexo(dto.getSexo());
//		existente.setEdad(dto.getEdad());
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
	public List<SolicitudCitaRequestDTO> listar() {
		return null;
	}

	@Override
	@Transactional(readOnly = true)
	public Optional<SolicitudCitaResponseDTO> buscarPorId(Long idSolicitud) {
		return solicitudRepo.findById(idSolicitud).map(SolicitudCitaMapper::toDto);
	}

	@Override
	@Transactional(readOnly = true)
	public List<SolicitudCitaResponseDTO> buscarPorDocPaciente(String docPaciente) {
		return SolicitudCitaMapper.toDtoList(solicitudRepo.findByDocPaciente(docPaciente));
	}

	@Override
	@Transactional(readOnly = true)
	public List<SolicitudCitaResponseDTO> buscarPorEstado(String estadoSolicitud) {
		return null;
	}

	@Override
	@Transactional(readOnly = true)
	public List<SolicitudCitaResponseDTO> buscarPorIdServicio(Long idServicio) {
		return null;
	}

	@Override
	@Transactional(readOnly = true)
	public List<SolicitudCitaResponseDTO> buscarPorPeriodoYServicio(String periodo, Long idServicio) {
		return null;
	}

	@Override
	@Transactional(readOnly = true)
	public List<SolicitudCitaResponseDTO> buscarPorActividadOSubactividad(Long idActividad, Long idSubactividad) {
		return null;
	}

	@Override
	@Transactional(readOnly = true)
	public List<SolicitudCitaResponseDTO> buscarPorIdPersonal(Long idPers) {
		return null;
	}

	private void attachRelationsWithRepositories(SolicitudCita entity, SolicitudCitaRequestDTO dto) {
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
	public SolicitudCitaResponseDTO actualizarEstado(Long id, String estado, String observacion) {
		SolicitudCita solicitud = solicitudRepo.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada: " + id));

		solicitud.setObservacion(observacion);
		solicitud.setFechaActualiza(OffsetDateTime.now());
		return SolicitudCitaMapper.toDto(solicitudRepo.save(solicitud));
	}

	private void validarCamposObligatorios(SolicitudCitaRequestDTO dto) {
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

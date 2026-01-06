package com.styp.cenate.repository.chatbot;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.styp.cenate.model.chatbot.SolicitudCita;

@Repository
public interface SolicitudCitaRepository extends JpaRepository<SolicitudCita, Long> {

	// Buscar por documento del paciente
	List<SolicitudCita> findByDocPaciente(String docPaciente);

	// // Buscar por estado de solicitud
	// List<SolicitudCita> findByEstadoSolicitud(String estadoSolicitud);

	// Buscar por servicio (usando la relación)
	List<SolicitudCita> findByServicio_IdServicio(Long idServicio);

	// Buscar por periodo y servicio
	List<SolicitudCita> findByPeriodoAndServicio_IdServicio(String periodo, Long idServicio);

	// Buscar por subactividad o actividad
	List<SolicitudCita> findByActividad_IdActividadOrSubactividad_IdSubactividad(Long idActividad, Long idSubactividad);

	// Buscar por personal (médico u operador que registra)
	List<SolicitudCita> findByPersonal_IdPers(Long idPers);

	boolean existsByPersonal_IdPersAndFechaCitaAndHoraCita(Long idPers, LocalDate fechaCita, LocalTime horaCita);

	// Buscar citas programadas por fecha y estado
	List<SolicitudCita> findByFechaCitaAndIdEstadoCita(LocalDate fechaCita, Long idEstadoCita);

}

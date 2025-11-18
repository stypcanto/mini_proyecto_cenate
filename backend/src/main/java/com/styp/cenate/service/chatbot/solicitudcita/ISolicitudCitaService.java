package com.styp.cenate.service.chatbot.solicitudcita;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import com.styp.cenate.dto.SolicitudCitaDTO;

public interface ISolicitudCitaService {

	
    SolicitudCitaDTO guardar(SolicitudCitaDTO solicitudCitaDTO);
    SolicitudCitaDTO actualizar(Long idSolicitud, SolicitudCitaDTO solicitudCitaDTO);
    void eliminar(Long idSolicitud);
    
    SolicitudCitaDTO actualizarEstado(Long id, String estado, String observacion);
    
    

    // --- Consultas  ---
    List<SolicitudCitaDTO> listar();
    Optional<SolicitudCitaDTO> buscarPorId(Long idSolicitud);

    // --- Consultas Repository ---
    List<SolicitudCitaDTO> buscarPorDocPaciente(String docPaciente);                 // findByDocPaciente
    List<SolicitudCitaDTO> buscarPorEstado(String estadoSolicitud);                  // findByEstadoSolicitud
    List<SolicitudCitaDTO> buscarPorIdServicio(Long idServicio);                     // findByServicio_IdServicio
    List<SolicitudCitaDTO> buscarPorPeriodoYServicio(String periodo, Long idServicio); // findByPeriodoAndServicio_IdServicio
    List<SolicitudCitaDTO> buscarPorActividadOSubactividad(Long idActividad, Long idSubactividad); // findByActividad_IdActividadOrSubactividad_IdSubactividad
    List<SolicitudCitaDTO> buscarPorIdPersonal(Long idPers);                         // findByPersonal_IdPers
    
    
    boolean existeCitaPorPersonalYFechaHora(Long idPers, LocalDate fechaCita, LocalTime horaCita);
	
    
}

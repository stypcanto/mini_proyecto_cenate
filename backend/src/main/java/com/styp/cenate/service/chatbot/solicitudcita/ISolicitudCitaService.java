package com.styp.cenate.service.chatbot.solicitudcita;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import com.styp.cenate.dto.chatbot.SolicitudCitaRequestDTO;
import com.styp.cenate.dto.chatbot.SolicitudCitaResponseDTO;

public interface ISolicitudCitaService {

	
	SolicitudCitaResponseDTO guardar(SolicitudCitaRequestDTO solicitudCitaDTO);
	SolicitudCitaResponseDTO actualizar(Long idSolicitud, SolicitudCitaRequestDTO solicitudCitaDTO);
    
    
    SolicitudCitaResponseDTO actualizarEstado(Long id, Long estado, String observacion);
    
    

    // --- Consultas  ---
    List<SolicitudCitaRequestDTO> listar();
    Optional<SolicitudCitaResponseDTO> buscarPorId(Long idSolicitud);

    // --- Consultas Repository ---
    List<SolicitudCitaResponseDTO> buscarPorDocPaciente(String docPaciente);                 // findByDocPaciente
    List<SolicitudCitaResponseDTO> buscarPorEstado(String estadoSolicitud);                  // findByEstadoSolicitud
    List<SolicitudCitaResponseDTO> buscarPorIdServicio(Long idServicio);                     // findByServicio_IdServicio
    List<SolicitudCitaResponseDTO> buscarPorPeriodoYServicio(String periodo, Long idServicio); // findByPeriodoAndServicio_IdServicio
    List<SolicitudCitaResponseDTO> buscarPorActividadOSubactividad(Long idActividad, Long idSubactividad); // findByActividad_IdActividadOrSubactividad_IdSubactividad
    List<SolicitudCitaResponseDTO> buscarPorIdPersonal(Long idPers);                         // findByPersonal_IdPers
    
    
    boolean existeCitaPorPersonalYFechaHora(Long idPers, LocalDate fechaCita, LocalTime horaCita);
    
    
    // La eliminacion sera lógica, se cambiara a estado_registro = false. 
    // se desactiva de manera definitiva, solo procede si tiene el estado 2
    void eliminarCita(Long codigo);
	
    
}

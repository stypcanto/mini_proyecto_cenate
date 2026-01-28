package com.styp.cenate.service.disponibilidad;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.styp.cenate.dto.disponibilidad.SolicitudDisponibilidadRequest;
import com.styp.cenate.dto.disponibilidad.SolicitudDisponibilidadResponse;
import com.styp.cenate.mapper.SolicitudDisponibilidadMapper;
import com.styp.cenate.model.PeriodoMedicoDisponibilidad;
import com.styp.cenate.model.PersonalCnt;
import com.styp.cenate.model.SolicitudDisponibilidadMedico;
import com.styp.cenate.model.SolicitudDisponibilidadMedicoDet;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.PersonalCntRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.disponibilidad.PeriodoMedicoDisponibilidadRepository;
import com.styp.cenate.repository.disponibilidad.SolicitudDisponibilidadDetRepository;
import com.styp.cenate.repository.disponibilidad.SolicitudDisponibilidadRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Implementación del servicio de gestión de solicitudes de disponibilidad médica
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SolicitudDisponibilidadServiceImpl implements ISolicitudDisponibilidadService {

    private final SolicitudDisponibilidadRepository solicitudRepository;
    private final SolicitudDisponibilidadDetRepository detalleRepository;
    private final PeriodoMedicoDisponibilidadRepository periodoRepository;
    private final PersonalCntRepository personalRepository;
    private final UsuarioRepository usuarioRepository;
    private final SolicitudDisponibilidadMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudDisponibilidadResponse> obtenerSolicitudesMedico(String nombreUsuario) {
        log.info("Obteniendo solicitudes de disponibilidad para el médico: {}", nombreUsuario);
        
        // Obtener usuario y su personalCnt
        Usuario usuario = usuarioRepository.findByNameUser(nombreUsuario)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Usuario no encontrado: " + nombreUsuario));
        
        PersonalCnt personal = personalRepository.findByUsuario_IdUser(usuario.getIdUser())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Personal no encontrado para usuario: " + nombreUsuario));
        
        List<SolicitudDisponibilidadMedico> solicitudes = 
            solicitudRepository.findByPersonal_IdPersOrderByCreatedAtDesc(personal.getIdPers());
        
        return mapper.toResponseList(solicitudes);
    }

    @Override
    @Transactional(readOnly = true)
    public SolicitudDisponibilidadResponse obtenerSolicitudPorId(Long idSolicitud) {
        log.info("Obteniendo solicitud de disponibilidad con ID: {}", idSolicitud);
        
        SolicitudDisponibilidadMedico solicitud = solicitudRepository.findById(idSolicitud)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Solicitud no encontrada con ID: " + idSolicitud));
        
        return mapper.toResponse(solicitud);
    }

    @Override
    public SolicitudDisponibilidadResponse crearSolicitud(
            SolicitudDisponibilidadRequest request,
            String nombreUsuario) {
        log.info("Creando nueva solicitud de disponibilidad para el médico: {}", nombreUsuario);
        
        // Validar período
        validarPeriodo(request.getIdPeriodo());
        
        // Obtener ID del personal
        Long idPersonal = obtenerIdPersonalPorUsuario(nombreUsuario);
        
        // Crear entidad principal
        SolicitudDisponibilidadMedico solicitud = 
            mapper.toEntity(request, idPersonal, nombreUsuario);
        
        // Crear detalles
        if (request.getDetalles() != null && !request.getDetalles().isEmpty()) {
            for (SolicitudDisponibilidadRequest.DetalleSolicitudDisponibilidadRequest detalleReq : request.getDetalles()) {
                SolicitudDisponibilidadMedicoDet detalle = 
                    mapper.toDetailEntity(detalleReq, solicitud);
                solicitud.agregarDetalle(detalle);
            }
        }
        
        // Guardar
        SolicitudDisponibilidadMedico guardada = solicitudRepository.save(solicitud);
        log.info("Solicitud creada exitosamente con ID: {}", guardada.getIdSolicitud());
        
        return mapper.toResponse(guardada);
    }

    @Override
    public SolicitudDisponibilidadResponse actualizarSolicitud(
            Long idSolicitud,
            SolicitudDisponibilidadRequest request) {
        log.info("Actualizando solicitud de disponibilidad con ID: {}", idSolicitud);
        
        SolicitudDisponibilidadMedico solicitud = solicitudRepository.findById(idSolicitud)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Solicitud no encontrada"));
        
        // Validar que sea BORRADOR
        if (!"BORRADOR".equals(solicitud.getEstado())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Solo se pueden editar solicitudes en estado BORRADOR");
        }
        
        // Actualizar datos
        solicitud.setObservacionMedico(request.getObservaciones());
        solicitud.setEstado(request.getEstado() != null ? request.getEstado() : "BORRADOR");
        solicitud.setUpdatedAt(LocalDateTime.now());
        
        // Actualizar detalles
        solicitud.getDetalles().clear();
        if (request.getDetalles() != null && !request.getDetalles().isEmpty()) {
            for (SolicitudDisponibilidadRequest.DetalleSolicitudDisponibilidadRequest detalleReq : request.getDetalles()) {
                SolicitudDisponibilidadMedicoDet detalle = 
                    mapper.toDetailEntity(detalleReq, solicitud);
                solicitud.agregarDetalle(detalle);
            }
        }
        
        SolicitudDisponibilidadMedico actualizada = solicitudRepository.save(solicitud);
        log.info("Solicitud actualizada exitosamente");
        
        return mapper.toResponse(actualizada);
    }

    @Override
    public SolicitudDisponibilidadResponse enviarSolicitud(Long idSolicitud) {
        log.info("Enviando solicitud de disponibilidad con ID: {}", idSolicitud);
        
        SolicitudDisponibilidadMedico solicitud = solicitudRepository.findById(idSolicitud)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Solicitud no encontrada"));
        
        // Validar estado
        if (!"BORRADOR".equals(solicitud.getEstado())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Solo se pueden enviar solicitudes en estado BORRADOR");
        }
        
        // Validar que tenga detalles
        if (solicitud.getDetalles() == null || solicitud.getDetalles().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "La solicitud debe tener al menos un detalle");
        }
        
        // Cambiar estado
        solicitud.setEstado("ENVIADO");
        solicitud.setUpdatedAt(LocalDateTime.now());
        SolicitudDisponibilidadMedico enviada = solicitudRepository.save(solicitud);
        
        log.info("Solicitud enviada exitosamente");
        return mapper.toResponse(enviada);
    }

    @Override
    @Transactional(readOnly = true)
    public SolicitudDisponibilidadResponse obtenerSolicitudPeriodoActual(String nombreUsuario) {
        log.info("Obteniendo solicitud activa del período actual para: {}", nombreUsuario);
        
        try {
            Long idPersonal = obtenerIdPersonalPorUsuario(nombreUsuario);
            
            // Obtener período actual
            YearMonth ahora = YearMonth.now();
            String periodoBusqueda = String.format("%04d%02d", ahora.getYear(), ahora.getMonthValue());
            
            // Buscar período
            List<PeriodoMedicoDisponibilidad> periodos = periodoRepository
                .findByPeriodoContaining(periodoBusqueda);
            
            if (periodos.isEmpty()) {
                log.warn("No hay período activo");
                throw new IllegalArgumentException("No hay período activo");
            }
            
            Long idPeriodo = periodos.get(0).getIdPeriodoRegDisp();
            
            // Buscar solicitud activa
            Optional<SolicitudDisponibilidadMedico> solicitud = 
                solicitudRepository.findByPersonal_IdPersAndPeriodo_IdPeriodoAndEstado(
                    idPersonal,
                    idPeriodo,
                    "ENVIADO"
                );
            
            if (!solicitud.isPresent()) {
                log.warn("No hay solicitud activa en período actual");
                throw new IllegalArgumentException("No hay solicitud activa");
            }
            
            return mapper.toResponse(solicitud.get());
        } catch (Exception e) {
            log.error("Error al obtener solicitud del período actual: {}", e.getMessage(), e);
            throw new RuntimeException("Error al obtener solicitud: " + e.getMessage());
        }
    }

    @Override
    public void eliminarSolicitud(Long idSolicitud) {
        log.info("Eliminando solicitud de disponibilidad con ID: {}", idSolicitud);
        
        SolicitudDisponibilidadMedico solicitud = solicitudRepository.findById(idSolicitud)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Solicitud no encontrada"));
        
        // Solo se puede eliminar en estado BORRADOR
        if (!"BORRADOR".equals(solicitud.getEstado())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Solo se pueden eliminar solicitudes en estado BORRADOR");
        }
        
        // Eliminación física (cascada eliminará los detalles)
        solicitudRepository.delete(solicitud);
        
        log.info("Solicitud eliminada exitosamente");
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudDisponibilidadResponse> obtenerSolicitudesMedicoPorPeriodo(
            String nombreUsuario,
            Long idPeriodo) {
        log.info("Obteniendo solicitudes del médico {} en período {}", nombreUsuario, idPeriodo);
        
        Long idPersonal = obtenerIdPersonalPorUsuario(nombreUsuario);
        List<SolicitudDisponibilidadMedico> solicitudes = 
            solicitudRepository.findByPersonal_IdPersAndPeriodo_IdPeriodo(idPersonal, idPeriodo);
        
        return mapper.toResponseList(solicitudes);
    }

    /**
     * Obtiene el ID del personal asociado a un usuario
     */
    private Long obtenerIdPersonalPorUsuario(String nombreUsuario) {
        Usuario usuario = usuarioRepository.findByNameUser(nombreUsuario)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Usuario no encontrado: " + nombreUsuario));
        
        PersonalCnt personal = personalRepository.findByUsuario_IdUser(usuario.getIdUser())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Personal no asociado al usuario: " + nombreUsuario));
        
        return personal.getIdPers();
    }

    /**
     * Valida que el período exista
     */
    private void validarPeriodo(Long idPeriodo) {
        Optional<PeriodoMedicoDisponibilidad> periodo = periodoRepository.findById(idPeriodo);
        if (!periodo.isPresent()) {
            throw new IllegalArgumentException("Período de disponibilidad no encontrado");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudDisponibilidadResponse> obtenerSolicitudesPorPeriodo(Long idPeriodo) {
        log.info("Obteniendo solicitudes para el período: {}", idPeriodo);
        
        validarPeriodo(idPeriodo);
        List<SolicitudDisponibilidadMedico> solicitudes = 
            solicitudRepository.findByPeriodo_IdPeriodoOrderByCreatedAtDesc(idPeriodo);
        
        log.info("Se encontraron {} solicitudes para el período", solicitudes.size());
        return mapper.toResponseList(solicitudes);
    }
}

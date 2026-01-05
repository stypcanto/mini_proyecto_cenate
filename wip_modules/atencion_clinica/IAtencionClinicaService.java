package com.styp.cenate.service.atencion;

import com.styp.cenate.dto.AtencionClinicaCreateDTO;
import com.styp.cenate.dto.AtencionClinicaDTO;
import com.styp.cenate.dto.AtencionClinicaUpdateDTO;
import com.styp.cenate.dto.ObservacionEnfermeriaDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.OffsetDateTime;

/**
 * Interfaz del servicio para gestionar Atenciones Clínicas
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
public interface IAtencionClinicaService {

    /**
     * Obtiene las atenciones de un asegurado (paginado)
     *
     * @param pkAsegurado PK del asegurado
     * @param pageable    Configuración de paginación
     * @return Page con las atenciones del asegurado
     */
    Page<AtencionClinicaDTO> obtenerAtencionesPorAsegurado(String pkAsegurado, Pageable pageable);

    /**
     * Obtiene el detalle completo de una atención
     *
     * @param idAtencion ID de la atención
     * @return DTO con el detalle completo
     * @throws com.styp.cenate.exception.ResourceNotFoundException si no se encuentra
     */
    AtencionClinicaDTO obtenerAtencionDetalle(Long idAtencion);

    /**
     * Obtiene las atenciones creadas por un profesional (para rol MEDICO)
     *
     * @param idPersonalCreador ID del profesional
     * @param pageable          Configuración de paginación
     * @return Page con las atenciones creadas por el profesional
     */
    Page<AtencionClinicaDTO> obtenerAtencionesPorProfesional(Long idPersonalCreador, Pageable pageable);

    /**
     * Crea una nueva atención clínica
     *
     * @param dto               DTO con los datos de la atención
     * @param idPersonalCreador ID del profesional que crea la atención
     * @return DTO de la atención creada
     * @throws com.styp.cenate.exception.ResourceNotFoundException si asegurado/ipress no existen
     */
    AtencionClinicaDTO crearAtencion(AtencionClinicaCreateDTO dto, Long idPersonalCreador);

    /**
     * Actualiza una atención existente
     * Solo puede actualizar el creador o ADMIN/SUPERADMIN
     *
     * @param idAtencion           ID de la atención
     * @param dto                  DTO con los datos a actualizar
     * @param idPersonalModificador ID del profesional que modifica
     * @param rolUsuario           Rol del usuario (para validación de permisos)
     * @return DTO de la atención actualizada
     * @throws com.styp.cenate.exception.ResourceNotFoundException si no se encuentra
     * @throws com.styp.cenate.exception.UnauthorizedException    si no tiene permiso
     */
    AtencionClinicaDTO actualizarAtencion(Long idAtencion, AtencionClinicaUpdateDTO dto,
                                          Long idPersonalModificador, String rolUsuario);

    /**
     * Agrega una observación de enfermería a una atención
     * Solo para rol ENFERMERIA
     *
     * @param idAtencion  ID de la atención
     * @param dto         DTO con la observación
     * @param idPersonal  ID del personal de enfermería
     */
    void agregarObservacionEnfermeria(Long idAtencion, ObservacionEnfermeriaDTO dto, Long idPersonal);

    /**
     * Elimina una atención clínica
     * Solo ADMIN/SUPERADMIN
     *
     * @param idAtencion ID de la atención a eliminar
     * @throws com.styp.cenate.exception.ResourceNotFoundException si no se encuentra
     */
    void eliminarAtencion(Long idAtencion);

    /**
     * Búsqueda avanzada de atenciones con filtros múltiples
     *
     * @param pkAsegurado    PK del asegurado (opcional)
     * @param idIpress       ID de IPRESS (opcional)
     * @param idEspecialidad ID de especialidad (opcional)
     * @param idTipoAtencion ID de tipo de atención (opcional)
     * @param idEstrategia   ID de estrategia (opcional)
     * @param fechaInicio    Fecha inicial (opcional)
     * @param fechaFin       Fecha final (opcional)
     * @param pageable       Configuración de paginación
     * @return Page con las atenciones filtradas
     */
    Page<AtencionClinicaDTO> busquedaAvanzada(String pkAsegurado, Long idIpress, Long idEspecialidad,
                                               Long idTipoAtencion, Long idEstrategia,
                                               OffsetDateTime fechaInicio, OffsetDateTime fechaFin,
                                               Pageable pageable);

    /**
     * Obtiene atenciones con interconsulta pendiente
     *
     * @param pageable Configuración de paginación
     * @return Page con atenciones con interconsulta
     */
    Page<AtencionClinicaDTO> obtenerAtencionesConInterconsulta(Pageable pageable);

    /**
     * Obtiene atenciones que requieren telemonitoreo
     *
     * @param pageable Configuración de paginación
     * @return Page con atenciones que requieren telemonitoreo
     */
    Page<AtencionClinicaDTO> obtenerAtencionesConTelemonitoreo(Pageable pageable);

    /**
     * Cuenta atenciones de un asegurado
     *
     * @param pkAsegurado PK del asegurado
     * @return Cantidad de atenciones
     */
    Long contarAtencionesPorAsegurado(String pkAsegurado);

    /**
     * Cuenta atenciones creadas por un profesional
     *
     * @param idPersonalCreador ID del profesional
     * @return Cantidad de atenciones
     */
    Long contarAtencionesPorProfesional(Long idPersonalCreador);
}

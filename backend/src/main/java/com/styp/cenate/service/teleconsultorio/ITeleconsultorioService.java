package com.styp.cenate.service.teleconsultorio;

import java.util.Optional;

import com.styp.cenate.dto.teleconsultorio.TeleconsultorioConfigDTO;

/**
 * Interfaz del servicio para gestión de configuración de teleconsultorio
 */
public interface ITeleconsultorioService {

    /**
     * Obtiene la configuración de teleconsultorio para una solicitud
     * @param idSolicitud ID de la solicitud
     * @return Configuración o empty si no existe
     */
    Optional<TeleconsultorioConfigDTO> obtenerConfiguracion(Long idSolicitud);

    /**
     * Guarda o actualiza la configuración de teleconsultorio para una solicitud
     * @param config Configuración a guardar
     * @return Configuración guardada
     */
    TeleconsultorioConfigDTO guardarConfiguracion(TeleconsultorioConfigDTO config);

    /**
     * Elimina la configuración de teleconsultorio para una solicitud
     * @param idSolicitud ID de la solicitud
     */
    void eliminarConfiguracion(Long idSolicitud);

    /**
     * Verifica si existe configuración para una solicitud
     * @param idSolicitud ID de la solicitud
     * @return true si existe configuración
     */
    boolean existeConfiguracion(Long idSolicitud);

    /**
     * Obtiene el total de horas configuradas para una solicitud
     * @param idSolicitud ID de la solicitud
     * @return Total de horas o 0 si no existe configuración
     */
    Integer obtenerTotalHoras(Long idSolicitud);

    /**
     * Valida si la configuración es correcta
     * @param config Configuración a validar
     * @return true si es válida
     */
    boolean validarConfiguracion(TeleconsultorioConfigDTO config);
}
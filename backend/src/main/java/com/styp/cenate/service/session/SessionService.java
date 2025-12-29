package com.styp.cenate.service.session;

import com.styp.cenate.model.ActiveSession;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Servicio para gestión de sesiones activas
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2025-12-29
 */
public interface SessionService {

    /**
     * Registra una nueva sesión de usuario
     *
     * @param userId ID del usuario
     * @param username Username del usuario
     * @param ipAddress IP desde donde se conecta
     * @param userAgent User-Agent del navegador
     * @return ID de la sesión creada
     */
    String registrarNuevaSesion(Long userId, String username, String ipAddress, String userAgent);

    /**
     * Cierra una sesión por su ID
     *
     * @param sessionId ID de la sesión
     */
    void cerrarSesion(String sessionId);

    /**
     * Actualiza la actividad de una sesión
     *
     * @param sessionId ID de la sesión
     */
    void actualizarActividad(String sessionId);

    /**
     * Obtiene todas las sesiones activas de un usuario
     *
     * @param username Username del usuario
     * @return Lista de sesiones activas
     */
    List<ActiveSession> obtenerSesionesActivas(String username);

    /**
     * Detecta sesiones concurrentes de un usuario
     *
     * @param username Username del usuario
     * @return true si tiene sesiones concurrentes
     */
    boolean tieneSesionesConcurrentes(String username);

    /**
     * Cierra todas las sesiones de un usuario
     *
     * @param username Username del usuario
     */
    void cerrarTodasLasSesiones(String username);

    /**
     * Limpia sesiones inactivas (>30 minutos sin actividad)
     *
     * @return Número de sesiones cerradas
     */
    int limpiarSesionesInactivas();

    /**
     * Obtiene estadísticas de sesiones activas
     *
     * @return Mapa con estadísticas
     */
    Map<String, Object> obtenerEstadisticas();

    /**
     * Busca una sesión por su ID
     *
     * @param sessionId ID de la sesión
     * @return Sesión si existe
     */
    Optional<ActiveSession> buscarPorSessionId(String sessionId);

    /**
     * Cuenta sesiones activas totales
     *
     * @return Número de sesiones activas
     */
    Long contarSesionesActivas();

    /**
     * Detecta accesos sospechosos (mismo usuario, diferentes IPs simultáneas)
     *
     * @param username Username del usuario
     * @param currentIp IP actual
     * @return Lista de sesiones sospechosas
     */
    List<ActiveSession> detectarAccesosSospechosos(String username, String currentIp);
}

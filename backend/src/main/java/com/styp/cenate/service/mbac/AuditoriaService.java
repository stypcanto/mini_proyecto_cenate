package com.styp.cenate.service.mbac;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.styp.cenate.dto.mbac.AuditoriaModularResponseDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Interfaz de servicio para la gestión de auditoría modular.
 * Proporciona métodos para consultar los registros de auditoría de permisos.
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
public interface AuditoriaService {

    /**
     * Obtiene toda la auditoría modular paginada.
     * 
     * @param pageable Información de paginación
     * @return Página de registros de auditoría
     */
    Page<AuditoriaModularResponseDTO> obtenerAuditoriaModular(Pageable pageable);

    /**
     * Obtiene la auditoría de un usuario específico.
     * 
     * @param userId ID del usuario
     * @param pageable Información de paginación
     * @return Página de registros de auditoría del usuario
     */
    Page<AuditoriaModularResponseDTO> obtenerAuditoriaPorUsuario(Long userId, Pageable pageable);

    /**
     * Obtiene la auditoría por nombre de usuario.
     * 
     * @param username Nombre de usuario
     * @param pageable Información de paginación
     * @return Página de registros de auditoría del usuario
     */
    Page<AuditoriaModularResponseDTO> obtenerAuditoriaPorUsername(String username, Pageable pageable);

    /**
     * Obtiene la auditoría de un módulo específico.
     * 
     * @param modulo Nombre del módulo
     * @param pageable Información de paginación
     * @return Página de registros de auditoría del módulo
     */
    Page<AuditoriaModularResponseDTO> obtenerAuditoriaPorModulo(String modulo, Pageable pageable);

    /**
     * Obtiene la auditoría por tipo de acción.
     * 
     * @param accion Acción realizada (INSERT, UPDATE, DELETE)
     * @param pageable Información de paginación
     * @return Página de registros de auditoría de la acción
     */
    Page<AuditoriaModularResponseDTO> obtenerAuditoriaPorAccion(String accion, Pageable pageable);

    /**
     * Obtiene la auditoría en un rango de fechas.
     * 
     * @param fechaInicio Fecha de inicio
     * @param fechaFin Fecha de fin
     * @param pageable Información de paginación
     * @return Página de registros de auditoría en el rango especificado
     */
    Page<AuditoriaModularResponseDTO> obtenerAuditoriaPorRangoFechas(
            LocalDateTime fechaInicio, 
            LocalDateTime fechaFin, 
            Pageable pageable
    );

    /**
     * Obtiene la auditoría de un usuario en un rango de fechas.
     * 
     * @param userId ID del usuario
     * @param fechaInicio Fecha de inicio
     * @param fechaFin Fecha de fin
     * @param pageable Información de paginación
     * @return Página de registros de auditoría
     */
    Page<AuditoriaModularResponseDTO> obtenerAuditoriaPorUsuarioYFechas(
            Long userId, 
            LocalDateTime fechaInicio, 
            LocalDateTime fechaFin, 
            Pageable pageable
    );

    /**
     * Obtiene la auditoría por módulo y acción.
     * 
     * @param modulo Nombre del módulo
     * @param accion Acción realizada
     * @param pageable Información de paginación
     * @return Página de registros de auditoría
     */
    Page<AuditoriaModularResponseDTO> obtenerAuditoriaPorModuloYAccion(
            String modulo, 
            String accion, 
            Pageable pageable
    );

    /**
     * Obtiene un resumen de eventos por tipo.
     * 
     * @return Mapa con el conteo de eventos por tipo
     */
    Map<String, Long> obtenerResumenPorTipoEvento();

    /**
     * Obtiene los últimos N eventos de auditoría.
     * 
     * @param limit Número de eventos a obtener
     * @return Lista de los últimos eventos
     */
    List<AuditoriaModularResponseDTO> obtenerUltimosEventos(int limit);

    /**
     * Busca en la auditoría por texto en el detalle.
     *
     * @param searchText Texto a buscar
     * @param pageable Información de paginación
     * @return Página de registros que coinciden con la búsqueda
     */
    Page<AuditoriaModularResponseDTO> buscarEnDetalle(String searchText, Pageable pageable);

    /**
     * Obtiene sesiones activas (usuarios conectados).
     *
     * @return Lista de mapas con información de usuarios conectados
     */
    List<Map<String, Object>> obtenerSesionesActivas();

    /**
     * Cierra forzadamente una sesión activa de un usuario.
     * Crea un evento de LOGOUT en la auditoría.
     *
     * @param usuarioSesion ID del usuario cuya sesión se cerrará
     * @return true si se cerró exitosamente, false si no había sesión activa
     */
    boolean cerrarSesionUsuario(String usuarioSesion);
}

package com.styp.cenate.service.bolsas;

import com.styp.cenate.dto.bolsas.SolicitudBolsaDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Interfaz de servicio para solicitudes de bolsa
 * Define los métodos de lógica de negocio
 * 
 * @version v1.6.0
 * @since 2026-01-23
 */
public interface SolicitudBolsaService {

    /**
     * Importa solicitudes de bolsa desde archivo Excel
     * Valida DNI en asegurados, código en IPRESS, auto-enriquece datos
     * v1.20.0: Integración con auditoría de errores en tabla audit_errores_importacion_bolsa
     *
     * @param file archivo Excel
     * @param idBolsa ID del tipo de bolsa seleccionado
     * @param idServicio ID del servicio/especialidad seleccionado
     * @param usuarioCarga usuario que realiza la carga
     * @param idHistorial ID del historial de carga (para auditoría de errores)
     * @return estadísticas de importación (filas OK, errores, etc.)
     */
    Map<String, Object> importarDesdeExcel(
        MultipartFile file,
        Long idBolsa,
        Long idServicio,
        String usuarioCarga,
        Long idHistorial
    );

    /**
     * Obtiene todas las solicitudes activas
     */
    List<SolicitudBolsaDTO> listarTodas();

    /**
     * Obtiene todas las solicitudes activas CON PAGINACIÓN
     * @param pageable información de paginación
     * @return página de solicitudes
     */
    org.springframework.data.domain.Page<SolicitudBolsaDTO> listarTodasPaginado(
            org.springframework.data.domain.Pageable pageable);

    /**
     * 🆕 v2.6.0 - Obtiene solicitudes CON FILTROS AVANZADOS + PAGINACIÓN
     * Soporta filtrado server-side integrado con paginación
     * UX: El usuario selecciona filtros y recibe resultados filtrados al instante
     *
     * @param bolsaNombre nombre/descripción bolsa (null = todas)
     * @param macrorregion descripción macrorregión (null = todas)
     * @param red descripción red (null = todas)
     * @param ipress descripción IPRESS (null = todas)
     * @param especialidad especialidad (null = todas)
     * @param estadoCodigo código estado gestión citas (null = todos)
     * @param tipoCita tipo cita (null = todos)
     * @param busqueda búsqueda libre: paciente/DNI/IPRESS (null = ignorar)
     * @param pageable paginación
     * @return Page con solicitudes filtradas
     */
    org.springframework.data.domain.Page<SolicitudBolsaDTO> listarConFiltros(
            String bolsaNombre,
            String macrorregion,
            String red,
            String ipress,
            String especialidad,
            String estadoCodigo,
            String tipoCita,
            String busqueda,
            org.springframework.data.domain.Pageable pageable);

    /**
     * Obtiene una solicitud por su ID
     */
    Optional<SolicitudBolsaDTO> obtenerPorId(Long id);

    /**
     * Asigna una gestora a una solicitud
     */
    void asignarGestora(Long idSolicitud, Long idGestora);

    /**
     * Elimina la asignación de gestora (deja en null)
     * @param idSolicitud ID de la solicitud
     */
    void eliminarAsignacionGestora(Long idSolicitud);

    /**
     * Cambia el estado de una solicitud
     */
    void cambiarEstado(Long idSolicitud, Long nuevoEstadoId);

    /**
     * Elimina lógicamente una solicitud (soft delete)
     */
    void eliminar(Long idSolicitud);

    /**
     * Elimina lógicamente múltiples solicitudes (soft delete en lote)
     * @param ids lista de IDs de solicitudes a eliminar
     * @return cantidad de solicitudes eliminadas
     */
    int eliminarMultiples(List<Long> ids);

    /**
     * Obtiene asegurados nuevos detectados (que no existen en tabla asegurados)
     * Busca solicitudes con nombre "Paciente DNI" e identifica los DNIs faltantes
     */
    List<Map<String, Object>> obtenerAseguradosNuevos();

    /**
     * Sincroniza automáticamente asegurados desde dim_solicitud_bolsa
     * Crea asegurados nuevos y actualiza teléfono/correo de existentes
     * @return reporte de sincronización (nuevos creados, actualizados)
     */
    Map<String, Object> sincronizarAseguradosDesdebolsas();

    /**
     * Obtiene asegurados sincronizados recientemente (últimas 24 horas)
     * Para mostrar popup al admin de qué pacientes fueron registrados/actualizados
     */
    List<Map<String, Object>> obtenerAseguradosSincronizadosReciente();

    /**
     * Cambia el tipo de bolsa de una solicitud
     * SOLO SUPERADMIN puede ejecutar esta operación
     *
     * @param idSolicitud ID de la solicitud a actualizar
     * @param idBolsaNueva ID de la nueva bolsa
     * @return la solicitud actualizada
     */
    SolicitudBolsaDTO cambiarTipoBolsa(Long idSolicitud, Long idBolsaNueva);

    /**
     * Obtiene lista de gestoras disponibles (usuarios con rol GESTOR_DE_CITAS)
     * Filtra por estado activo
     * Usado en modal de asignación del frontend
     *
     * @return List de maps con {id, nombre, nombreCompleto, activo}
     */
    List<Map<String, Object>> obtenerGestorasDisponibles();

    /**
     * Actualiza los teléfonos (principal y/o alterno) de una solicitud
     * Al menos uno de los teléfonos debe estar presente (no ambos null/blank)
     *
     * @param idSolicitud ID de la solicitud
     * @param telefonoPrincipal teléfono principal (puede ser null o blank)
     * @param telefonoAlterno teléfono alterno (puede ser null o blank)
     * @throws ValidationException si ambos teléfonos están blank o si solicitud es inactiva
     * @throws ResourceNotFoundException si solicitud no existe
     */
    void actualizarTelefonos(Long idSolicitud, String telefonoPrincipal, String telefonoAlterno);

    /**
     * Obtiene solicitudes asignadas a la gestora actual (Mi Bandeja)
     * Filtra por responsable_gestora_id = ID del usuario actual
     * Solo usuarios con rol GESTOR_DE_CITAS pueden acceder
     *
     * @return lista de solicitudes asignadas a la gestora actual
     */
    List<SolicitudBolsaDTO> obtenerSolicitudesAsignadasAGestora();
}

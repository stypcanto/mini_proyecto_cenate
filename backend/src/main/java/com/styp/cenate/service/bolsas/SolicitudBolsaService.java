package com.styp.cenate.service.bolsas;

import com.styp.cenate.dto.bolsas.BolsaXGestoraDTO;
import com.styp.cenate.dto.bolsas.SolicitudBolsaDTO;
import com.styp.cenate.dto.bolsas.CrearSolicitudAdicionalRequest;
import com.styp.cenate.dto.bolsas.CargaMasivaRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;
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
     * ✅ v1.42.0 - Agregado filtro asignación (cards clickeables)
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
     * @param asignacion filtro asignación: "asignados" (con gestora) o "sin_asignar" (sin gestora), null = todos
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
            String ipressAtencion,
            String tipoCita,
            String asignacion,
            String busqueda,
            String fechaInicio,
            String fechaFin,
            String condicionMedica,
            Long gestoraId,
            String estadoBolsa,
            String categoriaEspecialidad,
            String estrategia,
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
     * Asigna una gestora a múltiples solicitudes en una sola operación (bulk)
     * @param ids       lista de IDs de solicitudes a asignar
     * @param idGestora ID del usuario gestora
     * @return cantidad de registros actualizados
     */
    int asignarGestoraMasivo(List<Long> ids, Long idGestora);

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
     * Marca múltiples solicitudes como RECHAZADO en una sola operación (bulk)
     * @param ids lista de IDs de solicitudes a rechazar
     * @return cantidad de registros actualizados
     */
    int rechazarMasivo(List<Long> ids);

    /**
     * Marca múltiples solicitudes como RECHAZADO guardando el motivo de anulación (v1.69.0)
     * @param ids    lista de IDs de solicitudes a anular
     * @param motivo motivo de la anulación
     * @return cantidad de registros actualizados
     */
    int rechazarMasivoConMotivo(List<Long> ids, String motivo);

    /**
     * Devuelve múltiples solicitudes al estado PENDIENTE_CITA guardando el motivo de devolución (v1.81.5)
     * Limpia médico asignado, fecha/hora cita y condición médica.
     * @param ids    lista de IDs de solicitudes a devolver
     * @param motivo motivo de la devolución
     * @return cantidad de registros actualizados
     */
    int devolverAPendientes(List<Long> ids, String motivo);

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
     * ✅ v1.105.0: Actualiza la IPRESS de Atención de una solicitud
     * @param idSolicitud ID de la solicitud
     * @param idIpressAtencion ID de la nueva IPRESS de atención (null para limpiar)
     */
    void actualizarIpressAtencion(Long idSolicitud, Long idIpressAtencion);

    /** Actualiza la IPRESS de Adscripción (id_ipress) de una solicitud */
    void actualizarIpressAdscripcion(Long idSolicitud, Long idIpress);

    /**
     * Actualiza la fecha preferida de una solicitud
     * @param idSolicitud ID de la solicitud
     * @param fecha nueva fecha preferida (null para limpiar)
     */
    void actualizarFechaPreferida(Long idSolicitud, java.time.LocalDate fecha);

    /**
     * Obtiene solicitudes asignadas a la gestora actual (Mi Bandeja)
     * Filtra por responsable_gestora_id = ID del usuario actual
     * Solo usuarios con rol GESTOR_DE_CITAS pueden acceder
     *
     * @return lista de solicitudes asignadas a la gestora actual
     */
    List<SolicitudBolsaDTO> obtenerSolicitudesAsignadasAGestora();

    /**
     * 🆕 Obtiene todas las solicitudes asignadas a enfermeras (para COORD. ENFERMERIA)
     * Filtra por id_personal IN (ids de usuarios con rol ENFERMERIA) Y activo = true
     *
     * @return lista de solicitudes de todos los pacientes asignados a enfermeras
     */
    List<SolicitudBolsaDTO> obtenerBandejaEnfermeriaCoordinador();

    /**
     * 🔎 Obtiene todas las especialidades únicas pobladas en la tabla
     * v1.42.0: Para llenar dinámicamente el filtro de especialidades
     * Retorna SOLO especialidades no-vacías ordenadas alfabéticamente
     *
     * @return lista de especialidades únicas (nunca NULL, nunca vacío)
     */
    List<String> obtenerEspecialidadesUnicas();

    /**
     * Exporta solicitudes asignadas a la gestora actual a formato EXCEL
     * Usado en la descarga desde "Mi Bandeja" (GestionAsegurado)
     * Incluye TODAS las columnas de la tabla
     *
     * @param ids lista de IDs de solicitudes a exportar
     * @return datos EXCEL (.xlsx) en bytes
     */
    byte[] exportarExcelAsignados(List<Long> ids);

    /**
     * Exporta solicitudes asignadas a la gestora actual a formato CSV
     * Usado en la descarga desde "Mi Bandeja" (GestionAsegurado)
     *
     * @param ids lista de IDs de solicitudes a exportar
     * @return datos CSV en bytes
     */
    byte[] exportarCSVAsignados(List<Long> ids);

    /**
     * Exporta solicitudes seleccionadas a formato CSV
     * Usado en la descarga desde el universo general de solicitudes
     * Puede exportar cualquier solicitud (sin restricción de gestora)
     *
     * @param ids lista de IDs de solicitudes a exportar
     * @return datos CSV en bytes
     */
    byte[] exportarCSV(List<Long> ids);

    /**
     * Crear solicitud adicional desde importación manual (v1.46.0)
     * Genera número de solicitud único y crea registro en dim_solicitud_bolsa
     *
     * @param request datos del paciente a importar
     * @param username usuario que realiza la importación
     * @return solicitud creada con número de solicitud asignado
     */
    SolicitudBolsaDTO crearSolicitudAdicional(CrearSolicitudAdicionalRequest request, String username);

    Optional<SolicitudBolsaDTO> buscarAsignacionExistente(String pacienteDni);

    /** v1.67.x: Retorna TODAS las asignaciones activas de un paciente (para validar por especialidad) */
    java.util.List<SolicitudBolsaDTO> buscarAsignacionesPorDni(String pacienteDni);

    /**
     * Buscar solicitudes por DNI de paciente (v1.46.0)
     * Valida que el paciente no esté duplicado antes de importar
     *
     * @param dni documento de identidad del paciente
     * @return lista de solicitudes encontradas (vacía si no existe)
     */
    List<SolicitudBolsaDTO> buscarPorDni(String dni);

    /**
     * Obtiene estadísticas de pacientes agrupados por gestora de citas
     * Calcula total, pendientes, citados, atendidos y anulados por gestora
     *
     * @return lista de BolsaXGestoraDTO ordenada por total desc
     */
    List<BolsaXGestoraDTO> obtenerEstadisticasPorGestora();

    List<BolsaXGestoraDTO> obtenerEstadisticasPorGestora(String fechaDesde, String fechaHasta);

    /**
     * Conteo de pacientes asignados por día para un mes dado (YYYY-MM)
     * @return lista de mapas {fecha, total} para el calendario
     */
    List<java.util.Map<String, Object>> obtenerConteoPorFecha(String mes);

    List<com.styp.cenate.dto.bolsas.BolsaXMedicoDTO> obtenerEstadisticasPorMedico();
    List<com.styp.cenate.dto.bolsas.BolsaXMedicoDTO> obtenerEstadisticasPorMedico(String fechaDesde, String fechaHasta);

    /**
     * Trazabilidad de recitas e interconsultas generadas para Coordinadora de Enfermería.
     * Incluye quién las generó, para qué paciente y con qué especialidad.
     */
    org.springframework.data.domain.Page<Map<String, Object>> obtenerTrazabilidadRecitas(
        String busqueda,
        String fechaInicio,
        String fechaFin,
        String tipoCita,
        Long idPersonal,
        String sortDir,
        String sortField,
        String especialidad,
        String motivoInterconsulta,
        String estadoBolsa,
        String creadoPor,
        Long idTipoBolsa,
        org.springframework.data.domain.Pageable pageable
    );

    /** Lista de profesionales que generaron recitas/interconsultas con conteo total. */
    List<Map<String, Object>> listarEnfermerasTrazabilidad();

    /** Fechas únicas con conteo, para pintar el calendario de filtros. */
    List<Map<String, Object>> obtenerFechasConRecitas();

    /** KPIs globales de trazabilidad (total tabla, no solo página actual). */
    Map<String, Object> obtenerKpisTrazabilidad();

    /** Facetas para filtros desplegables: especialidades, motivos, estados y creadores con conteo. */
    Map<String, Object> listarFacetasRecitasInterconsultas();

    /** Listado completo de motivos de interconsulta */
    java.util.List<java.util.Map<String, Object>> listarMotivosInterconsulta();

    /** Listado de enfermeros únicos activos (personas con especialidad ENFERMERIA) */
    java.util.List<java.util.Map<String, Object>> listarEnfermeros();

    /**
     * Sincroniza teléfonos desde la tabla asegurados hacia dim_solicitud_bolsa.
     * Para solicitudes activas que tengan teléfono vacío/null, busca el asegurado
     * por DNI y copia tel_fijo → paciente_telefono, tel_celular → paciente_telefono_alterno.
     *
     * @return reporte con total procesados, actualizados, sin datos en asegurados
     */
    Map<String, Object> sincronizarTelefonosDesdeAsegurados();

    /**
     * Carga masiva de pacientes desde Excel (v1.65.0)
     * Reemplaza el flujo manual SQL+Python por un endpoint REST.
     *
     * Por cada PacienteExcelRow:
     *   1. Inserta el DNI en asegurados (ON CONFLICT DO NOTHING)
     *   2. Verifica duplicado en dim_solicitud_bolsa (id_bolsa + paciente_id)
     *   3. Si no existe, crea SolicitudBolsa con los valores del Excel + valores fijos
     *
     * @param request datos del profesional + lista de pacientes
     * @return mapa con: total, insertados, duplicados, errores, detalleErrores
     */
    Map<String, Object> cargaMasivaPacientes(CargaMasivaRequest request);

    /**
     * Reprograma la fecha de atención de múltiples solicitudes en una sola operación (v1.85.0).
     *
     * Si {@code request.getGestoraId()} está presente, también actualiza el responsable_gestora_id.
     * Solo aplica a solicitudes con activo = true.
     *
     * @param request datos de reprogramación: lista de IDs, nueva fecha y gestora opcional
     * @return mapa con status, cantidad de registros actualizados y fecha aplicada
     */
    Map<String, Object> reprogramarMasivo(com.styp.cenate.dto.bolsas.ReprogramarMasivoRequest request);
}

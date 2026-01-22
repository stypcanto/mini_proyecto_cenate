package com.styp.cenate.service.teleekgs;

import com.styp.cenate.dto.teleekgs.*;
import com.styp.cenate.model.*;
import com.styp.cenate.repository.TeleECGAuditoriaRepository;
import com.styp.cenate.repository.TeleECGImagenRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.service.email.EmailService;
import com.styp.cenate.service.auditlog.AuditLogService;
import com.styp.cenate.service.storage.FileStorageService;
import com.styp.cenate.exception.ValidationException;
import com.styp.cenate.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Servicio principal para gestión de electrocardiogramas (TeleEKG)
 *
 * Versión 2.0.0 - Implementación con Filesystem Storage
 * Migración de BYTEA a /opt/cenate/teleekgs/
 *
 * @author Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-13
 */
@Service
@Slf4j
@Transactional
public class TeleECGService {

    @PostConstruct
    public void init() {
        log.info("✅ TeleECGService inicializado exitosamente");
    }

    @Autowired
    private TeleECGImagenRepository teleECGImagenRepository;

    @Autowired
    private TeleECGAuditoriaRepository teleECGAuditoriaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private IpressRepository ipressRepository;

    @Autowired
    private AseguradoRepository aseguradoRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private TeleECGEstadoTransformer estadoTransformer;

    /**
     * Subir nueva imagen ECG
     *
     * Flujo:
     * 1. Validar archivo (MIME, tamaño, magic bytes)
     * 2. Calcular SHA256
     * 3. Detectar duplicados
     * 4. Guardar archivo en filesystem
     * 5. Verificar integridad post-escritura
     * 6. Crear registro en BD
     * 7. Registrar auditoría
     * 8. Enviar notificación email
     */
    public TeleECGImagenDTO subirImagenECG(
            SubirImagenECGDTO dto,
            Long idIpressOrigen,
            Long idUsuarioEnvio,
            String ipOrigen,
            String navegador) throws IOException {

        log.info("📤 Subiendo imagen ECG para paciente: {}", dto.getNumDocPaciente());

        // 🔍 0. VALIDACIÓN CRÍTICA: Verificar que el asegurado EXISTE en la BD
        // ✅ v1.21.5: Primero buscar por PK si se proporciona (más directo), sino por DNI
        Optional<Asegurado> aseguradoVerificacion;

        if (dto.getPkAsegurado() != null && !dto.getPkAsegurado().trim().isEmpty()) {
            log.info("🔍 Buscando asegurado por PK: {}", dto.getPkAsegurado());
            aseguradoVerificacion = aseguradoRepository.findById(dto.getPkAsegurado());
            if (!aseguradoVerificacion.isPresent()) {
                log.warn("⚠️ PK no encontrado, intentando búsqueda por DNI: {}", dto.getNumDocPaciente());
                aseguradoVerificacion = aseguradoRepository.findByDocPaciente(dto.getNumDocPaciente());
            }
        } else {
            log.info("🔍 Buscando asegurado por DNI: {}", dto.getNumDocPaciente());
            aseguradoVerificacion = aseguradoRepository.findByDocPaciente(dto.getNumDocPaciente());
        }

        if (!aseguradoVerificacion.isPresent()) {
            log.warn("❌ Asegurado no existe en BD - PK: {}, DNI: {}", dto.getPkAsegurado(), dto.getNumDocPaciente());
            throw new ValidationException("El asegurado con DNI " + dto.getNumDocPaciente() + " no existe en la base de datos. Por favor, registra al paciente primero.");
        }
        log.info("✅ Asegurado validado correctamente");

        // 1. Obtener IPRESS
        Ipress ipressOrigen = ipressRepository.findById(idIpressOrigen)
            .orElseThrow(() -> new RuntimeException("IPRESS no encontrada: " + idIpressOrigen));

        // 2. Calcular SHA256
        String sha256 = fileStorageService.calcularSHA256(dto.getArchivo());
        log.info("✅ SHA256 calculado: {}", sha256);

        // 3. Detectar duplicados
        Optional<TeleECGImagen> duplicado = teleECGImagenRepository
            .findBySha256AndStatImagenEquals(sha256, "A");

        if (duplicado.isPresent()) {
            throw new RuntimeException("Imagen duplicada detectada (ID: " + duplicado.get().getIdImagen() + ")");
        }

        // 4. v1.22.0: Leer contenido de imagen para almacenar en BD (BYTEA)
        byte[] contenidoImagen;
        try {
            contenidoImagen = dto.getArchivo().getBytes();
            log.info("✅ Imagen leída para BD: {} bytes", contenidoImagen.length);
        } catch (IOException e) {
            throw new RuntimeException("Error al leer contenido de imagen: " + e.getMessage(), e);
        }

        // 5. Generar nombre de archivo único (para referencia)
        String timestamp = LocalDateTime.now()
            .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String unique = java.util.UUID.randomUUID().toString().substring(0, 4);
        String extension = obtenerExtension(dto.getArchivo().getOriginalFilename());
        String nombreArchivo = String.format("%s_%s_%s.%s",
            dto.getNumDocPaciente(), timestamp, unique, extension);

        // 6. v1.22.0: Crear registro en BD con imagen BYTEA
        TeleECGImagen imagen = new TeleECGImagen();
        imagen.setNumDocPaciente(dto.getNumDocPaciente());
        imagen.setNombresPaciente(dto.getNombresPaciente());
        imagen.setApellidosPaciente(dto.getApellidosPaciente());
        imagen.setStorageTipo("DATABASE");  // v1.22.0: Almacenamiento en BD
        imagen.setStorageRuta("bytea://" + nombreArchivo);  // Referencia simbólica
        imagen.setContenidoImagen(contenidoImagen);  // v1.22.0: BYTEA content
        imagen.setNombreArchivo(nombreArchivo);
        imagen.setNombreOriginal(dto.getArchivo().getOriginalFilename());
        imagen.setExtension(extension);
        imagen.setMimeType(dto.getArchivo().getContentType());
        imagen.setSizeBytes(dto.getArchivo().getSize());
        imagen.setSha256(sha256);
        imagen.setIpressOrigen(ipressOrigen);
        imagen.setCodigoIpress(ipressOrigen.getCodIpress());
        imagen.setNombreIpress(ipressOrigen.getDescIpress());
        imagen.setEstado("ENVIADA");  // v3.0.0: Cambio de PENDIENTE a ENVIADA
        imagen.setStatImagen("A");
        imagen.setIpOrigen(ipOrigen);
        imagen.setNavegador(navegador);
        imagen.setRutaAcceso("/api/teleekgs/upload");
        imagen.setObservaciones(dto.getObservaciones());

        imagen = teleECGImagenRepository.save(imagen);
        log.info("✅ Imagen registrada en BD: ID={}", imagen.getIdImagen());

        // 7. Registrar auditoría
        auditLogService.registrarEvento(
            "SYSTEM",
            "UPLOAD_ECG",
            "TELEEKGS",
            String.format("Imagen ECG subida - Paciente: %s, Tamaño: %d bytes, SHA256: %s",
                dto.getNumDocPaciente(), dto.getArchivo().getSize(), sha256),
            "INFO",
            "SUCCESS"
        );

        // 8. Enviar email (opcional, no falla si hay error)
        // TODO: Implementar método específico en EmailService para notificación TeleEKG
        // Por ahora se omite para no bloquear la funcionalidad principal

        log.info("✅ Imagen ECG subida exitosamente: ID={}", imagen.getIdImagen());

        return convertirADTO(imagen);
    }

    /**
     * Listar imágenes con filtros
     */
    public Page<TeleECGImagenDTO> listarImagenes(
            String numDoc,
            String estado,
            Long idIpress,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta,
            Pageable pageable) {

        log.info("📋 Listando imágenes - Filtro DNI: {}, Estado: {}", numDoc, estado);

        // Usar LocalDateTime.MIN/MAX como fallback para evitar problemas con NULL en PostgreSQL
        LocalDateTime desde = fechaDesde != null ? fechaDesde : LocalDateTime.of(1900, 1, 1, 0, 0);
        LocalDateTime hasta = fechaHasta != null ? fechaHasta : LocalDateTime.of(2999, 12, 31, 23, 59);

        Page<TeleECGImagen> pagina = teleECGImagenRepository.buscarFlexible(
            numDoc, estado, idIpress, desde, hasta, pageable
        );

        return pagina.map(this::convertirADTO);
    }

    /**
     * Obtener detalles de imagen (sin contenido binario)
     */
    public TeleECGImagenDTO obtenerDetallesImagen(Long idImagen, Long idUsuario, String ipCliente) {
        log.info("🔍 Obteniendo detalles imagen: {}", idImagen);

        TeleECGImagen imagen = teleECGImagenRepository.findById(idImagen)
            .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));

        // Registrar auditoría
        registrarAuditoria(imagen, idUsuario, "VISUALIZADA", ipCliente, "EXITOSA");

        return convertirADTO(imagen);
    }

    /**
     * Descargar contenido de imagen (JPEG/PNG)
     * v1.22.0: Lee desde BYTEA en BD o filesystem (legacy)
     */
    public byte[] descargarImagen(Long idImagen, Long idUsuario, String ipCliente) throws IOException {
        log.info("⬇️ Descargando imagen: {}", idImagen);

        TeleECGImagen imagen = teleECGImagenRepository.findById(idImagen)
            .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));

        byte[] contenido;

        // v1.22.0: Verificar tipo de almacenamiento
        if ("DATABASE".equals(imagen.getStorageTipo()) && imagen.getContenidoImagen() != null) {
            // Leer desde BD (BYTEA)
            contenido = imagen.getContenidoImagen();
            log.info("✅ Imagen leída desde BD: {} bytes", contenido.length);
        } else {
            // Legacy: Leer desde filesystem
            contenido = fileStorageService.leerArchivo(imagen.getStorageRuta());
            log.info("✅ Imagen leída desde filesystem: {} bytes", contenido.length);
        }

        // Registrar auditoría
        registrarAuditoria(imagen, idUsuario, "DESCARGADA", ipCliente, "EXITOSA");

        return contenido;
    }

    /**
     * Procesar imagen (v3.0.0 - ATENDER, OBSERVAR, o cambiar estado)
     *
     * Acciones disponibles:
     * - ATENDER: Cambiar ENVIADA/OBSERVADA → ATENDIDA
     * - OBSERVAR: Cambiar ENVIADA → OBSERVADA (agregar observaciones)
     * - REENVIADO: Marcar imagen anterior como subsanada
     */
    public TeleECGImagenDTO procesarImagen(
            Long idImagen,
            ProcesarImagenECGDTO dto,
            Long idUsuario,
            String ipCliente) {

        log.info("⚙️ Procesando imagen {} - Acción: {}", idImagen, dto.getAccion());

        TeleECGImagen imagen = teleECGImagenRepository.findById(idImagen)
            .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));

        String estadoAnterior = imagen.getEstado();

        // Cambiar estado según acción (v3.0.0)
        switch (dto.getAccion()) {
            case "ATENDER":
                // Cambiar cualquier estado a ATENDIDA
                if (!estadoAnterior.equals("ATENDIDA")) {
                    imagen.setEstado("ATENDIDA");
                    imagen.setFechaRecepcion(LocalDateTime.now());
                    imagen.setObservaciones(dto.getObservaciones());
                    registrarAuditoria(imagen, idUsuario, "ATENDIDA", ipCliente, "EXITOSA");
                    log.info("✅ Imagen atendida: {} → ATENDIDA", estadoAnterior);
                }
                break;

            case "OBSERVAR":
                // Cambiar ENVIADA → OBSERVADA con observaciones (problemas detectados)
                if ("ENVIADA".equals(estadoAnterior)) {
                    imagen.setEstado("OBSERVADA");
                    imagen.setObservaciones(dto.getObservaciones());  // Aquí van los motivos/observaciones
                    registrarAuditoria(imagen, idUsuario, "OBSERVADA", ipCliente, "EXITOSA");
                    log.info("✅ Observaciones agregadas: {} → OBSERVADA", estadoAnterior);
                } else {
                    throw new RuntimeException("Solo se pueden observar imágenes en estado ENVIADA, actual: " + estadoAnterior);
                }
                break;

            case "REENVIADO":
                // Marcar esta imagen como "subsanada" (hay una nueva que la reemplaza)
                if ("OBSERVADA".equals(estadoAnterior)) {
                    imagen.setFueSubsanado(true);
                    registrarAuditoria(imagen, idUsuario, "SUBSANADA", ipCliente, "EXITOSA");
                    log.info("✅ Imagen marcada como subsanada: ID={}", idImagen);
                } else {
                    throw new RuntimeException("Solo imágenes OBSERVADA pueden ser marcadas como subsanadas");
                }
                break;

            default:
                throw new RuntimeException("Acción inválida: " + dto.getAccion());
        }

        imagen = teleECGImagenRepository.save(imagen);

        log.info("✅ Imagen procesada: {} → {}", estadoAnterior, imagen.getEstado());

        return convertirADTO(imagen);
    }

    /**
     * Rechazar imagen ECG por mala calidad - Devolver a IPRESS
     * v3.1.0: Nuevo flujo de validación
     *
     * Cambios de estado:
     * - ENVIADA → RECHAZADA (registra motivo y descripción)
     * - Notifica a IPRESS que debe recargar la imagen
     * - Auditoría completa de quién rechazó, cuándo y por qué
     */
    public TeleECGImagenDTO rechazarImagen(
            Long idImagen,
            RechazarImagenECGDTO dto,
            Long idUsuario,
            String ipCliente) {

        log.info("❌ Rechazando imagen {} - Motivo: {}", idImagen, dto.getMotivoDescripcion());

        // Validar que el motivo sea válido
        if (!dto.esMotivoValido()) {
            throw new ValidationException("Motivo de rechazo inválido: " + dto.getMotivo());
        }

        TeleECGImagen imagen = teleECGImagenRepository.findById(idImagen)
            .orElseThrow(() -> new ResourceNotFoundException("Imagen no encontrada: " + idImagen));

        String estadoAnterior = imagen.getEstado();

        // Solo se pueden rechazar imágenes en estado ENVIADA
        if (!"ENVIADA".equals(estadoAnterior)) {
            throw new ValidationException(
                "Solo se pueden rechazar imágenes en estado ENVIADA, actual: " + estadoAnterior
            );
        }

        // Cambiar estado y guardar motivo
        imagen.setEstado("RECHAZADA");
        imagen.setMotivoRechazo(dto.getMotivoDescripcion());
        imagen.setObservaciones(dto.getDescripcion());
        imagen.setFechaRechazo(LocalDateTime.now());

        // Guardar imagen rechazada
        imagen = teleECGImagenRepository.save(imagen);

        // Registrar en auditoría
        registrarAuditoria(
            imagen,
            idUsuario,
            "RECHAZADA",
            ipCliente,
            "EXITOSA - Motivo: " + dto.getMotivoDescripcion()
        );

        log.info("✅ Imagen rechazada: {} → RECHAZADA (Motivo: {})", idImagen, dto.getMotivoDescripcion());

        // TODO: Enviar notificación por email a IPRESS informando del rechazo
        // emailService.notificarRechazoECG(imagen.getIpressOrigen(), imagen, dto);

        return convertirADTO(imagen);
    }

    /**
     * Limpiar imágenes vencidas (automático cada 2am)
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void limpiarImagenesVencidas() {
        log.info("🗑️ Iniciando limpieza de imágenes vencidas (>30 días)");

        LocalDateTime ahora = LocalDateTime.now();
        List<TeleECGImagen> vencidas = teleECGImagenRepository
            .findByStatImagenAndFechaExpiracionBefore("A", ahora);

        int archivadas = 0;
        int errores = 0;

        for (TeleECGImagen imagen : vencidas) {
            try {
                // Archivar archivo (mover a /archive/)
                String rutaArchive = fileStorageService.archivarArchivo(imagen.getStorageRuta());
                imagen.setStorageRuta(rutaArchive);
                imagen.setStatImagen("I");
                teleECGImagenRepository.save(imagen);
                archivadas++;

                log.debug("✅ Imagen archivada: ID={}, DNI={}", imagen.getIdImagen(), imagen.getNumDocPaciente());

            } catch (Exception e) {
                log.error("❌ Error archivando imagen: ID={}", imagen.getIdImagen(), e);
                errores++;
            }
        }

        log.info("✅ Limpieza completada. Archivadas: {}, Errores: {}", archivadas, errores);

        // Auditoría del cleanup
        auditLogService.registrarEvento(
            "SYSTEM",
            "CLEANUP_ECG",
            "TELEEKGS",
            String.format("Limpieza automática. Archivadas: %d, Errores: %d", archivadas, errores),
            "INFO",
            "SUCCESS"
        );
    }

    /**
     * Obtener estadísticas del módulo
     */
    public TeleECGEstadisticasDTO obtenerEstadisticas() {
        log.info("📊 Generando estadísticas TeleEKG");

        // ✅ FIX T-ECG-001 v1.21.5: Usar List<Object[]> para mejor mapeo de Hibernate
        // Retorna: [[total, pendientes (ENVIADA), observadas (OBSERVADA), atendidas (ATENDIDA)]]
        List<Object[]> resultados = teleECGImagenRepository.getEstadisticasCompletas();

        Object[] estadisticasArr;
        if (resultados == null || resultados.isEmpty()) {
            log.warn("⚠️ Estadísticas vacías, retornando zeros");
            estadisticasArr = new Object[]{0L, 0L, 0L, 0L};
        } else {
            estadisticasArr = resultados.get(0);  // Obtener el primer (único) resultado
        }

        long totalImagenes = estadisticasArr[0] != null ? ((Number) estadisticasArr[0]).longValue() : 0;
        long pendientes = estadisticasArr[1] != null ? ((Number) estadisticasArr[1]).longValue() : 0;
        long observadas = estadisticasArr[2] != null ? ((Number) estadisticasArr[2]).longValue() : 0;
        long atendidas = estadisticasArr[3] != null ? ((Number) estadisticasArr[3]).longValue() : 0;

        log.info("✅ Estadísticas calculadas: Total={}, Pendientes={}, Observadas={}, Atendidas={}",
            totalImagenes, pendientes, observadas, atendidas);

        TeleECGEstadisticasDTO estadisticas = TeleECGEstadisticasDTO.builder()
            .fecha(LocalDateTime.now().toLocalDate())
            .totalImagenesCargadas(totalImagenes)
            .totalImagenesPendientes(pendientes)
            .totalImagenesRechazadas(observadas)
            .totalImagenesProcesadas(atendidas)
            .totalImagenesVinculadas(atendidas)
            .totalImagenesActivas(totalImagenes)  // Todas activas (ya filtradas por fecha_expiracion)
            .tasaRechazoPorcentaje(totalImagenes > 0 ? (observadas * 100.0 / totalImagenes) : 0.0)
            .tasaVinculacionPorcentaje(atendidas > 0 ? (atendidas * 100.0 / atendidas) : 0.0)
            .tasaProcesamientoPorcentaje(totalImagenes > 0 ? (atendidas * 100.0 / totalImagenes) : 0.0)
            .porcentajePendientes(totalImagenes > 0 ? (pendientes * 100.0 / totalImagenes) : 0.0)
            .statusSalud("SALUDABLE")
            .statusDetalles("Sistema funcionando normalmente")
            .build();

        estadisticas.determinarStatus();
        return estadisticas;
    }

    /**
     * Obtener imágenes próximas a vencer (<3 días)
     */
    public List<TeleECGImagenDTO> obtenerProximasVencer() {
        log.info("⚠️ Obteniendo imágenes próximas a vencer");

        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime en3Dias = ahora.plusDays(3);

        List<TeleECGImagen> proximas = teleECGImagenRepository.findAll()
            .stream()
            .filter(img -> img.getStatImagen().equals("A"))
            .filter(img -> img.getFechaExpiracion() != null)
            .filter(img -> img.getFechaExpiracion().isAfter(ahora))
            .filter(img -> img.getFechaExpiracion().isBefore(en3Dias))
            .collect(Collectors.toList());

        return proximas.stream().map(this::convertirADTO).collect(Collectors.toList());
    }

    /**
     * Eliminar una imagen ECG de la base de datos (eliminación física)
     *
     * IMPORTANTE: No registrar auditoría antes de eliminar porque el cascading delete
     * eliminaría también el registro de auditoría que acaba de crearse.
     * La auditoría se registra DESPUÉS de verificar que la imagen existe, pero
     * el registro se guarda sin vincular a la imagen (si es necesario auditar).
     */
    public void eliminarImagen(Long idImagen, Long idUsuario, String ipCliente) {
        log.info("🗑️ Eliminando imagen ECG: {}", idImagen);

        TeleECGImagen imagen = teleECGImagenRepository.findById(idImagen)
            .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));

        // Guardar datos de auditoría ANTES de eliminar
        String metadatosEliminacion = String.format(
            "Imagen ECG eliminada - Paciente: %s, Archivo: %s, Tamaño: %d bytes",
            imagen.getNumDocPaciente(),
            imagen.getNombreArchivo(),
            imagen.getSizeBytes() != null ? imagen.getSizeBytes() : 0
        );

        // Eliminar de la BD (cascading delete elimina auditoría relacionada)
        teleECGImagenRepository.deleteById(idImagen);

        // Registrar en log de auditoría general del sistema (no vinculado a imagen)
        auditLogService.registrarEvento(
            "USER_ID_" + idUsuario,
            "DELETE_ECG",
            "TELEEKGS",
            metadatosEliminacion,
            "INFO",
            "SUCCESS"
        );

        log.info("✅ Imagen eliminada y auditoría registrada: {}", idImagen);
    }

    /**
     * Obtener auditoría de imagen
     */
    public Page<TeleECGAuditoriaDTO> obtenerAuditoria(Long idImagen, Pageable pageable) {
        log.info("📜 Obteniendo auditoría imagen: {}", idImagen);

        Page<TeleECGAuditoria> pagina = teleECGAuditoriaRepository
            .findByImagenIdImagenOrderByFechaAccionDesc(idImagen, pageable);

        return pagina.map(this::convertirAuditDTO);
    }

    /**
     * Evaluar una imagen ECG (v1.29.0 - Triaje Clínico Completo)
     * Médico marca como NORMAL o ANORMAL + diagnósticos estructurados + contexto clínico
     * Dataset para entrenamiento de modelos ML
     */
    public TeleECGImagenDTO evaluarImagen(Long idImagen, String evaluacion, String descripcion,
                                         String urgencia, Object contextoClinico,
                                         java.util.List<String> derivacionesSeleccionadas,
                                         String motivoNoDiagnostico,
                                         String diagnosticoRitmo, String diagnosticoPR,
                                         String diagnosticoQRS,
                                         Long idUsuarioEvaluador, String ipCliente) {
        log.info("📋 Evaluando ECG ID: {} - Evaluación: {} - v1.29.0 TRIAJE COMPLETO", idImagen, evaluacion);

        // 1. Validar entrada
        if (!evaluacion.equals("NORMAL") && !evaluacion.equals("ANORMAL")) {
            throw new ValidationException("Evaluación debe ser NORMAL o ANORMAL");
        }

        // ✅ FIX v1.21.5: Observaciones OPCIONALES
        // Si se proporciona descripción, debe tener mínimo 10 caracteres
        // Si está vacía, es permitido
        if (descripcion != null && descripcion.trim().length() > 0 && descripcion.trim().length() < 10) {
            throw new ValidationException("Si proporciona observaciones, debe tener mínimo 10 caracteres");
        }

        if (descripcion != null && descripcion.length() > 1000) {
            throw new ValidationException("Observaciones no pueden exceder 1000 caracteres");
        }

        // 2. Buscar imagen
        TeleECGImagen imagen = teleECGImagenRepository.findById(idImagen)
            .orElseThrow(() -> new ResourceNotFoundException("ECG no encontrada: " + idImagen));

        // 3. Validar que no esté vencida
        if (imagen.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new ValidationException("ECG ha expirado y no puede ser evaluada");
        }

        // 4. Setear datos de evaluación básica
        imagen.setEvaluacion(evaluacion);
        imagen.setDescripcionEvaluacion(descripcion);
        imagen.setFechaEvaluacion(LocalDateTime.now());

        // 5. ✅ v1.29.0: Setear urgencia
        if (urgencia != null && !urgencia.isEmpty()) {
            imagen.setUrgencia(urgencia);
        }

        // 6. ✅ v1.29.0: Setear contexto clínico como JSON
        if (contextoClinico != null) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                String contextoJson = mapper.writeValueAsString(contextoClinico);
                imagen.setContextoClinico(contextoJson);
            } catch (Exception e) {
                log.warn("⚠️ Error al convertir contexto clínico a JSON: {}", e.getMessage());
            }
        }

        // 7. ✅ v1.29.0: Setear derivaciones seleccionadas como JSON
        if (derivacionesSeleccionadas != null && !derivacionesSeleccionadas.isEmpty()) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                String derivacionesJson = mapper.writeValueAsString(derivacionesSeleccionadas);
                imagen.setDerivacionesSeleccionadas(derivacionesJson);
            } catch (Exception e) {
                log.warn("⚠️ Error al convertir derivaciones a JSON: {}", e.getMessage());
            }
        }

        // 8. ✅ v1.29.0: Setear motivo no diagnóstico
        if (motivoNoDiagnostico != null && !motivoNoDiagnostico.isEmpty()) {
            imagen.setMotivoNoDiagnostico(motivoNoDiagnostico);
        }

        // 9. ✅ v1.29.0 FINAL: Setear diagnósticos estructurados como JSON
        if (diagnosticoRitmo != null || diagnosticoPR != null || diagnosticoQRS != null) {
            try {
                java.util.Map<String, String> diagnosticos = new java.util.HashMap<>();
                if (diagnosticoRitmo != null) diagnosticos.put("ritmo", diagnosticoRitmo);
                if (diagnosticoPR != null) diagnosticos.put("pr", diagnosticoPR);
                if (diagnosticoQRS != null) diagnosticos.put("qrs", diagnosticoQRS);

                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                String diagnosticosJson = mapper.writeValueAsString(diagnosticos);
                imagen.setDiagnosticosEstructurados(diagnosticosJson);

                log.debug("✅ Diagnósticos guardados - Ritmo: {}, PR: {}, QRS: {}",
                    diagnosticoRitmo, diagnosticoPR, diagnosticoQRS);
            } catch (Exception e) {
                log.warn("⚠️ Error al convertir diagnósticos a JSON: {}", e.getMessage());
            }
        }

        // Buscar usuario evaluador
        if (idUsuarioEvaluador != null) {
            usuarioRepository.findById(idUsuarioEvaluador).ifPresent(imagen::setUsuarioEvaluador);
        }

        // 10. Guardar cambios
        TeleECGImagen imagenActualizada = teleECGImagenRepository.save(imagen);

        // 11. Registrar en auditoría
        registrarAuditoria(
            imagenActualizada,
            idUsuarioEvaluador,
            "EVALUAR",
            ipCliente,
            String.format("ECG evaluada como %s - Triaje clínico completo (v1.29.0)", evaluacion)
        );

        log.info("✅ Evaluación completa guardada: ID={}, Evaluación={}, Urgencia={}",
            idImagen, evaluacion, urgencia);

        return convertirADTO(imagenActualizada);
    }

    /**
     * ✅ LEGACY OVERLOAD: Evaluar imagen con 5 parámetros (backwards compatibility)
     * Mantiene compatibilidad con código existente que usa la firma anterior
     */
    public TeleECGImagenDTO evaluarImagen(Long idImagen, String evaluacion, String descripcion,
                                         Long idUsuarioEvaluador, String ipCliente) {
        return evaluarImagen(idImagen, evaluacion, descripcion, null, null, null, null,
                           null, null, null, idUsuarioEvaluador, ipCliente);
    }

    /**
     * 📋 Guardar Nota Clínica para una imagen ECG (v3.0.0)
     * Complementa la evaluación médica con hallazgos clínicos y plan de seguimiento
     */
    public TeleECGImagenDTO guardarNotaClinica(Long idImagen, NotaClinicaDTO notaClinica,
                                               Long idUsuarioMedico, String ipCliente) {
        log.info("📋 Guardando Nota Clínica para ECG ID: {}", idImagen);

        // 1. Validar entrada
        if (notaClinica == null) {
            throw new ValidationException("Nota clínica no puede ser nula");
        }

        if (notaClinica.getHallazgos() == null || notaClinica.getHallazgos().isEmpty()) {
            throw new ValidationException("Debe seleccionar al menos un hallazgo");
        }

        // Validar observaciones si se proporcionan
        if (notaClinica.getObservacionesClinicas() != null &&
            notaClinica.getObservacionesClinicas().trim().length() > 2000) {
            throw new ValidationException("Observaciones no pueden exceder 2000 caracteres");
        }

        // 2. Buscar imagen
        TeleECGImagen imagen = teleECGImagenRepository.findById(idImagen)
            .orElseThrow(() -> new ResourceNotFoundException("ECG no encontrada: " + idImagen));

        // 3. Validar que no esté vencida
        if (imagen.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new ValidationException("ECG ha expirado y no puede ser procesada");
        }

        // 4. Convertir datos a JSON
        String hallazgosJson = convertirAJson(notaClinica.getHallazgos());
        String planSeguimientoJson = convertirAJson(notaClinica.getPlanSeguimiento());

        // 5. Setear datos de nota clínica
        imagen.setNotaClinicaHallazgos(hallazgosJson);
        imagen.setNotaClinicaObservaciones(notaClinica.getObservacionesClinicas());
        imagen.setNotaClinicaPlanSeguimiento(planSeguimientoJson);
        imagen.setFechaNotaClinica(LocalDateTime.now());

        // Buscar usuario médico
        if (idUsuarioMedico != null) {
            usuarioRepository.findById(idUsuarioMedico).ifPresent(imagen::setUsuarioNotaClinica);
        }

        // 6. Guardar cambios
        TeleECGImagen imagenActualizada = teleECGImagenRepository.save(imagen);

        // 7. Registrar en auditoría
        registrarAuditoria(
            imagenActualizada,
            idUsuarioMedico,
            "NOTA_CLINICA",
            ipCliente,
            "Nota clínica registrada con hallazgos y plan de seguimiento"
        );

        log.info("✅ Nota clínica guardada: ID={}", idImagen);

        return convertirADTO(imagenActualizada);
    }

    /**
     * Helper: Convertir objeto a JSON string
     */
    private String convertirAJson(Object objeto) {
        if (objeto == null) return null;
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.writeValueAsString(objeto);
        } catch (Exception e) {
            log.error("Error al convertir objeto a JSON", e);
            return null;
        }
    }

    // ============================================================
    // MÉTODOS HELPER
    // ============================================================

    /**
     * Convertir TeleECGImagen a DTO con todos los campos mapeados
     */
    private TeleECGImagenDTO convertirADTO(TeleECGImagen imagen) {
        if (imagen == null) return null;

        TeleECGImagenDTO dto = new TeleECGImagenDTO();
        dto.setIdImagen(imagen.getIdImagen());
        dto.setNumDocPaciente(imagen.getNumDocPaciente());
        dto.setNombresPaciente(imagen.getNombresPaciente());
        dto.setApellidosPaciente(imagen.getApellidosPaciente());
        dto.setPacienteNombreCompleto(imagen.getApellidosPaciente() + ", " + imagen.getNombresPaciente());

        // Obtener datos adicionales del asegurado por número de documento
        try {
            Optional<Asegurado> asegurado = aseguradoRepository.findByDocPaciente(imagen.getNumDocPaciente());
            if (asegurado.isPresent()) {
                Asegurado paciente = asegurado.get();
                dto.setGeneroPaciente(paciente.getSexo());

                // v1.27.5: Agregar fecha de nacimiento
                if (paciente.getFecnacimpaciente() != null) {
                    dto.setFechaNacimientoPaciente(paciente.getFecnacimpaciente());

                    // Calcular edad desde fecha de nacimiento
                    java.time.LocalDate today = java.time.LocalDate.now();
                    long edadLong = java.time.temporal.ChronoUnit.YEARS.between(
                        paciente.getFecnacimpaciente(),
                        today
                    );
                    dto.setEdadPaciente((int) edadLong);
                }

                // Preferir teléfono celular sobre fijo
                String telefono = paciente.getTelCelular();
                if (telefono == null || telefono.isEmpty()) {
                    telefono = paciente.getTelFijo();
                }
                dto.setTelefonoPrincipalPaciente(telefono);
            }
        } catch (Exception e) {
            log.warn("⚠️ No se pudieron obtener datos adicionales del paciente: {}", imagen.getNumDocPaciente());
        }

        dto.setCodigoIpress(imagen.getCodigoIpress());
        dto.setNombreIpress(imagen.getNombreIpress());
        dto.setNombreArchivo(imagen.getNombreArchivo());
        dto.setNombreOriginal(imagen.getNombreOriginal());
        dto.setExtension(imagen.getExtension());
        dto.setMimeType(imagen.getMimeType());
        dto.setSizeBytes(imagen.getSizeBytes());
        dto.setTamanoFormato(TeleECGImagenDTO.formatoTamanio(imagen.getSizeBytes()));
        dto.setSha256(imagen.getSha256());
        dto.setStorageTipo(imagen.getStorageTipo());
        dto.setStorageRuta(imagen.getStorageRuta());
        dto.setStorageBucket(imagen.getStorageBucket());
        dto.setEstado(imagen.getEstado());
        dto.setEstadoFormato(TeleECGImagenDTO.formatoEstado(imagen.getEstado()));
        // v3.0.0: Agregar nuevos campos
        if (imagen.getImagenAnterior() != null && imagen.getImagenAnterior().getIdImagen() != null) {
            dto.setIdImagenAnterior(imagen.getImagenAnterior().getIdImagen());
        }
        dto.setFueSubsanado(imagen.getFueSubsanado() != null ? imagen.getFueSubsanado() : false);
        // Deprecated: mantener por compatibilidad
        dto.setMotivoRechazo(imagen.getMotivoRechazo());
        dto.setObservaciones(imagen.getObservaciones());

        // v3.0.0: Campos de evaluación para ML dataset
        dto.setEvaluacion(imagen.getEvaluacion());
        dto.setDescripcionEvaluacion(imagen.getDescripcionEvaluacion());

        // Obtener nombre del usuario evaluador si existe
        if (imagen.getUsuarioEvaluador() != null) {
            usuarioRepository.findById(imagen.getUsuarioEvaluador().getIdUser()).ifPresent(usuario -> {
                dto.setUsuarioEvaluadorNombre(usuario.getNameUser());
            });
        }

        dto.setFechaEvaluacion(imagen.getFechaEvaluacion());

        dto.setFechaEnvio(imagen.getFechaEnvio());
        dto.setFechaRecepcion(imagen.getFechaRecepcion());
        dto.setFechaExpiracion(imagen.getFechaExpiracion());

        if (imagen.getFechaExpiracion() != null) {
            dto.setDiasRestantes(TeleECGImagenDTO.calcularDiasRestantes(imagen.getFechaExpiracion()));
            dto.setVigencia(TeleECGImagenDTO.obtenerVigencia(imagen.getFechaExpiracion()));
        }

        dto.setStatImagen(imagen.getStatImagen());
        dto.setCreatedAt(imagen.getCreatedAt());
        dto.setUpdatedAt(imagen.getUpdatedAt());

        return dto;
    }

    /**
     * Convertir TeleECGAuditoria a DTO
     */
    private TeleECGAuditoriaDTO convertirAuditDTO(TeleECGAuditoria auditoria) {
        if (auditoria == null) return null;

        TeleECGAuditoriaDTO dto = new TeleECGAuditoriaDTO();
        return dto;
    }

    /**
     * Obtener extensión de archivo
     */
    private String obtenerExtension(String nombreArchivo) {
        if (nombreArchivo == null || !nombreArchivo.contains(".")) {
            return "jpg";
        }
        return nombreArchivo.substring(nombreArchivo.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * Listar ECGs agrupadas por asegurado (v1.21.5)
     *
     * Retorna una lista de asegurados con todas sus ECGs agrupadas
     * Ideal para dashboard que muestra 1 fila por asegurado
     */
    public List<AseguradoConECGsDTO> listarAgrupaPorAsegurado(
            String numDoc,
            String estado,
            Long idIpress,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta) {

        log.info("📋 Listando ECGs agrupadas por asegurado - Filtro DNI: {}, Estado: {}", numDoc, estado);

        // Usar LocalDateTime.MIN/MAX como fallback
        LocalDateTime desde = fechaDesde != null ? fechaDesde : LocalDateTime.of(1900, 1, 1, 0, 0);
        LocalDateTime hasta = fechaHasta != null ? fechaHasta : LocalDateTime.of(2999, 12, 31, 23, 59);

        // Obtener todas las imágenes sin paginación (sin límite)
        List<TeleECGImagen> imagenes = teleECGImagenRepository.buscarFlexibleSinPaginacion(
            numDoc, estado, idIpress, desde, hasta
        );

        // Agrupar por DNI del paciente
        Map<String, List<TeleECGImagen>> imagenesPorDni = imagenes.stream()
            .collect(Collectors.groupingBy(TeleECGImagen::getNumDocPaciente));

        // Convertir cada grupo a AseguradoConECGsDTO
        List<AseguradoConECGsDTO> resultado = new ArrayList<>();

        for (Map.Entry<String, List<TeleECGImagen>> entry : imagenesPorDni.entrySet()) {
            String dni = entry.getKey();
            List<TeleECGImagen> imagenesDelAsegurado = entry.getValue();

            // Obtener primer imagen como referencia para datos del asegurado
            TeleECGImagen primeraImagen = imagenesDelAsegurado.get(0);

            // Convertir la primera imagen a DTO para acceder a los campos de paciente
            TeleECGImagenDTO primerDTO = convertirADTO(primeraImagen);

            // Contar por estado
            long pendientes = imagenesDelAsegurado.stream()
                .filter(img -> "ENVIADA".equals(img.getEstado()))
                .count();
            long observadas = imagenesDelAsegurado.stream()
                .filter(img -> "OBSERVADA".equals(img.getEstado()))
                .count();
            long atendidas = imagenesDelAsegurado.stream()
                .filter(img -> "ATENDIDA".equals(img.getEstado()))
                .count();

            // Convertir todas las imágenes a DTOs
            List<TeleECGImagenDTO> dtos = imagenesDelAsegurado.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());

            // Determinar estado principal (si alguna está pendiente, mostrar PENDIENTE)
            String estadoPrincipal = primeraImagen.getEstado();
            if (pendientes > 0) {
                estadoPrincipal = "ENVIADA";
            }

            // Obtener evaluación principal (NORMAL/ANORMAL si existe alguna)
            String evaluacionPrincipal = imagenesDelAsegurado.stream()
                .filter(img -> img.getEvaluacion() != null && !img.getEvaluacion().isEmpty())
                .map(TeleECGImagen::getEvaluacion)
                .findFirst()
                .orElse("SIN_EVALUAR");

            AseguradoConECGsDTO asegurado = AseguradoConECGsDTO.builder()
                .numDocPaciente(dni)
                .nombresPaciente(primeraImagen.getNombresPaciente())
                .apellidosPaciente(primeraImagen.getApellidosPaciente())
                .pacienteNombreCompleto(
                    primeraImagen.getNombresPaciente() + " " + primeraImagen.getApellidosPaciente()
                )
                .nombreIpress(primeraImagen.getNombreIpress())
                .codigoIpress(primeraImagen.getCodigoIpress())
                .telefonoPrincipal(primerDTO.getTelefonoPrincipalPaciente())
                .edadPaciente(primerDTO.getEdadPaciente())
                .generoPaciente(primerDTO.getGeneroPaciente())
                .totalEcgs((long) imagenesDelAsegurado.size())
                .fechaPrimerEcg(imagenesDelAsegurado.stream()
                    .map(TeleECGImagen::getFechaEnvio)
                    .min(Comparator.naturalOrder())
                    .orElse(null))
                .fechaUltimoEcg(imagenesDelAsegurado.stream()
                    .map(TeleECGImagen::getFechaEnvio)
                    .max(Comparator.naturalOrder())
                    .orElse(null))
                .estadoPrincipal(estadoPrincipal)
                .estadoTransformado(estadoPrincipal)  // Será transformado en el controller
                .evaluacionPrincipal(evaluacionPrincipal)
                .ecgsPendientes(pendientes)
                .ecgsObservadas(observadas)
                .ecgsAtendidas(atendidas)
                .imagenes(dtos)
                .build();

            resultado.add(asegurado);
        }

        // Ordenar por fecha último ECG descendente (más recientes primero)
        resultado.sort((a, b) -> {
            LocalDateTime fechaA = a.getFechaUltimoEcg() != null ? a.getFechaUltimoEcg() : LocalDateTime.MIN;
            LocalDateTime fechaB = b.getFechaUltimoEcg() != null ? b.getFechaUltimoEcg() : LocalDateTime.MIN;
            return fechaB.compareTo(fechaA);
        });

        log.info("✅ ECGs agrupadas: {} asegurados encontrados", resultado.size());
        return resultado;
    }

    /**
     * Registrar evento en auditoría
     */
    private void registrarAuditoria(TeleECGImagen imagen, Long idUsuario, String accion,
                                   String ipCliente, String resultado) {
        try {
            TeleECGAuditoria auditoria = new TeleECGAuditoria();
            auditoria.setImagen(imagen);

            // ✅ FIX: Asegurar que siempre hay un usuario (id_usuario es NOT NULL en BD)
            if (idUsuario != null) {
                var usuarioOpt = usuarioRepository.findById(idUsuario);
                if (usuarioOpt.isPresent()) {
                    Usuario usuario = usuarioOpt.get();
                    auditoria.setUsuario(usuario);
                    auditoria.setNombreUsuario(usuario.getNameUser());
                } else {
                    log.warn("⚠️ Usuario no encontrado para auditoría: {}", idUsuario);
                    return; // No registrar si el usuario no existe
                }
            } else {
                log.warn("⚠️ Sin usuario para auditoría, no registrando");
                return; // No registrar si no hay usuario
            }

            auditoria.setAccion(accion);
            auditoria.setResultado(resultado);
            auditoria.setIpUsuario(ipCliente);
            auditoria.setDescripcion(String.format("Acción: %s en imagen ECG ID: %d", accion, imagen.getIdImagen()));

            teleECGAuditoriaRepository.save(auditoria);

            log.debug("📝 Auditoría registrada: {} - {}", accion, resultado);

        } catch (Exception e) {
            log.warn("⚠️ Error registrando auditoría", e);
        }
    }

    /**
     * 🔄 ACTUALIZAR TRANSFORMACIONES (v1.0.0 - NUEVO)
     * Permite rotar y voltear imágenes de forma persistente en BD
     * @since 2026-01-21
     */
    @Transactional
    public TeleECGImagen actualizarTransformaciones(
            Long idImagen,
            ActualizarTransformacionesDTO dto,
            Long idUsuario,
            String ipCliente) {

        // 1. Buscar imagen
        TeleECGImagen imagen = teleECGImagenRepository.findById(idImagen)
                .orElseThrow(() -> new RuntimeException("Imagen no encontrada: " + idImagen));

        log.info("🔄 Actualizando transformaciones de imagen ECG ID: {}", idImagen);

        // 2. Validar rotación (solo 0, 90, 180, 270)
        if (!java.util.List.of(0, 90, 180, 270).contains(dto.getRotacion())) {
            throw new RuntimeException("Rotación inválida. Debe ser 0, 90, 180 o 270 grados");
        }

        // 3. Guardar valores anteriores para auditoría
        Integer rotacionAnterior = imagen.getRotacion();
        Boolean flipHAnterior = imagen.getFlipHorizontal();
        Boolean flipVAnterior = imagen.getFlipVertical();

        // 4. Actualizar transformaciones
        imagen.setRotacion(dto.getRotacion());
        imagen.setFlipHorizontal(dto.getFlipHorizontal());
        imagen.setFlipVertical(dto.getFlipVertical());

        // 5. Guardar en BD
        imagen = teleECGImagenRepository.save(imagen);
        log.info("✅ Transformaciones guardadas: rot={}, flipH={}, flipV={}",
                dto.getRotacion(), dto.getFlipHorizontal(), dto.getFlipVertical());

        // 6. Registrar en auditoría
        try {
            String detalles = String.format(
                    "Rotación: %d° (antes: %d°), FlipH: %s (antes: %s), FlipV: %s (antes: %s)",
                    dto.getRotacion(), rotacionAnterior,
                    dto.getFlipHorizontal(), flipHAnterior,
                    dto.getFlipVertical(), flipVAnterior
            );
            registrarAuditoria(imagen, idUsuario, "TRANSFORMACION_ACTUALIZADA", ipCliente, detalles);
        } catch (Exception e) {
            log.warn("⚠️ Error registrando auditoría de transformación", e);
        }

        return imagen;
    }

    /**
     * ✂️ RECORTAR IMAGEN (v1.0.0 - NUEVO)
     * Modifica PERMANENTEMENTE el contenido de la imagen en BD
     * ¡ADVERTENCIA: IRREVERSIBLE! Recalcula SHA256.
     * @since 2026-01-21
     */
    @Transactional
    public TeleECGImagen recortarImagen(
            Long idImagen,
            RecortarImagenDTO dto,
            Long idUsuario,
            String ipCliente) {

        // 1. Buscar imagen
        TeleECGImagen imagen = teleECGImagenRepository.findById(idImagen)
                .orElseThrow(() -> new RuntimeException("Imagen no encontrada: " + idImagen));

        log.info("✂️ Iniciando recorte PERMANENTE de imagen ECG ID: {}", idImagen);

        // 2. Guardar SHA256 antiguo para auditoría
        String sha256Anterior = imagen.getSha256();
        Long sizeAnterior = imagen.getSizeBytes();

        // 3. Extraer y decodificar base64
        String base64Data;
        try {
            // Formato esperado: "data:image/png;base64,iVBORw0KGg..."
            int commaIndex = dto.getImagenBase64().indexOf(",");
            if (commaIndex > 0) {
                base64Data = dto.getImagenBase64().substring(commaIndex + 1);
            } else {
                base64Data = dto.getImagenBase64();
            }
        } catch (Exception e) {
            throw new RuntimeException("Formato de base64 inválido", e);
        }

        byte[] imagenRecortada;
        try {
            imagenRecortada = java.util.Base64.getDecoder().decode(base64Data);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Error decodificando base64", e);
        }

        // 4. Validar tamaño (máximo 5MB)
        if (imagenRecortada.length > 5_242_880) {
            throw new RuntimeException("Imagen recortada excede 5MB (" + imagenRecortada.length + " bytes)");
        }

        // 5. Actualizar contenido de imagen
        imagen.setContenidoImagen(imagenRecortada);
        imagen.setSizeBytes((long) imagenRecortada.length);
        if (dto.getMimeType() != null) {
            imagen.setMimeType(dto.getMimeType());
        }

        // 6. Calcular nuevo SHA256 para integridad
        String nuevoSha256 = calcularSHA256(imagenRecortada);
        imagen.setSha256(nuevoSha256);

        // 7. Guardar en BD (PERMANENTE - IRREVERSIBLE)
        imagen = teleECGImagenRepository.save(imagen);
        log.warn("⚠️  IMAGEN MODIFICADA PERMANENTEMENTE - ID: {}, Nuevo SHA256: {}", idImagen, nuevoSha256);

        // 8. Registrar en auditoría (CRÍTICO)
        try {
            String detalles = String.format(
                    "RECORTE PERMANENTE: SHA256 anterior=%s, nuevo=%s, Tamaño anterior=%d bytes, nuevo=%d bytes",
                    sha256Anterior.substring(0, 8) + "...",
                    nuevoSha256.substring(0, 8) + "...",
                    sizeAnterior,
                    imagenRecortada.length
            );
            registrarAuditoria(imagen, idUsuario, "IMAGEN_RECORTADA", ipCliente, detalles);
        } catch (Exception e) {
            log.error("❌ CRÍTICO: Error registrando auditoría de recorte", e);
        }

        return imagen;
    }

    /**
     * Calcular SHA256 de un arreglo de bytes
     * Utilizado para verificar integridad de imágenes
     */
    private String calcularSHA256(byte[] data) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 no disponible", e);
        }
    }
}

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

        // 4. Guardar archivo en filesystem
        String rutaCompleta = fileStorageService.guardarArchivo(
            dto.getArchivo(),
            dto.getNumDocPaciente(),
            ipressOrigen.getCodIpress()
        );
        log.info("✅ Archivo guardado: {}", rutaCompleta);

        // 5. Verificar integridad
        if (!fileStorageService.verificarIntegridad(rutaCompleta, sha256)) {
            fileStorageService.eliminarArchivo(rutaCompleta);
            throw new RuntimeException("Error de integridad al guardar archivo");
        }

        // 6. Crear registro en BD
        TeleECGImagen imagen = new TeleECGImagen();
        imagen.setNumDocPaciente(dto.getNumDocPaciente());
        imagen.setNombresPaciente(dto.getNombresPaciente());
        imagen.setApellidosPaciente(dto.getApellidosPaciente());
        imagen.setStorageTipo("FILESYSTEM");
        imagen.setStorageRuta(rutaCompleta);
        imagen.setNombreArchivo(new java.io.File(rutaCompleta).getName());
        imagen.setNombreOriginal(dto.getArchivo().getOriginalFilename());
        imagen.setExtension(obtenerExtension(dto.getArchivo().getOriginalFilename()));
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
     */
    public byte[] descargarImagen(Long idImagen, Long idUsuario, String ipCliente) throws IOException {
        log.info("⬇️ Descargando imagen: {}", idImagen);

        TeleECGImagen imagen = teleECGImagenRepository.findById(idImagen)
            .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));

        // Leer desde filesystem
        byte[] contenido = fileStorageService.leerArchivo(imagen.getStorageRuta());

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

        // ✅ FIX T-ECG-001: Usar query que filtra por fecha_expiracion
        Object[] estadisticasArr = teleECGImagenRepository.getEstadisticasCompletas();

        long totalImagenes = estadisticasArr[0] != null ? ((Number) estadisticasArr[0]).longValue() : 0;
        long pendientes = estadisticasArr[1] != null ? ((Number) estadisticasArr[1]).longValue() : 0;
        long procesadas = estadisticasArr[2] != null ? ((Number) estadisticasArr[2]).longValue() : 0;
        long rechazadas = estadisticasArr[3] != null ? ((Number) estadisticasArr[3]).longValue() : 0;
        long vinculadas = estadisticasArr[4] != null ? ((Number) estadisticasArr[4]).longValue() : 0;

        log.info("✅ Estadísticas calculadas: Total={}, Pendientes={}, Procesadas={}, Rechazadas={}, Vinculadas={}",
            totalImagenes, pendientes, procesadas, rechazadas, vinculadas);

        TeleECGEstadisticasDTO estadisticas = TeleECGEstadisticasDTO.builder()
            .fecha(LocalDateTime.now().toLocalDate())
            .totalImagenesCargadas(totalImagenes)
            .totalImagenesProcesadas(procesadas)
            .totalImagenesRechazadas(rechazadas)
            .totalImagenesVinculadas(vinculadas)
            .totalImagenesPendientes(pendientes)
            .totalImagenesActivas(totalImagenes)  // Todas activas (ya filtradas por fecha_expiracion)
            .tasaRechazoPorcentaje(totalImagenes > 0 ? (rechazadas * 100.0 / totalImagenes) : 0.0)
            .tasaVinculacionPorcentaje(procesadas > 0 ? (vinculadas * 100.0 / procesadas) : 0.0)
            .tasaProcesamientoPorcentaje(totalImagenes > 0 ? (procesadas * 100.0 / totalImagenes) : 0.0)
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
     * Evaluar una imagen ECG (v3.0.0 - Nuevo)
     * Médico marca como NORMAL o ANORMAL + descripción
     * Dataset para entrenamiento de modelos ML
     */
    public TeleECGImagenDTO evaluarImagen(Long idImagen, String evaluacion, String descripcion,
                                         Long idUsuarioEvaluador, String ipCliente) {
        log.info("📋 Evaluando ECG ID: {} - Evaluación: {}", idImagen, evaluacion);

        // 1. Validar entrada
        if (!evaluacion.equals("NORMAL") && !evaluacion.equals("ANORMAL")) {
            throw new ValidationException("Evaluación debe ser NORMAL o ANORMAL");
        }

        if (descripcion == null || descripcion.trim().length() < 10) {
            throw new ValidationException("Descripción debe tener mínimo 10 caracteres");
        }

        if (descripcion.length() > 1000) {
            throw new ValidationException("Descripción no puede exceder 1000 caracteres");
        }

        // 2. Buscar imagen
        TeleECGImagen imagen = teleECGImagenRepository.findById(idImagen)
            .orElseThrow(() -> new ResourceNotFoundException("ECG no encontrada: " + idImagen));

        // 3. Validar que no esté vencida
        if (imagen.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new ValidationException("ECG ha expirado y no puede ser evaluada");
        }

        // 4. Setear datos de evaluación
        imagen.setEvaluacion(evaluacion);
        imagen.setDescripcionEvaluacion(descripcion);
        imagen.setFechaEvaluacion(LocalDateTime.now());

        // Buscar usuario evaluador
        if (idUsuarioEvaluador != null) {
            usuarioRepository.findById(idUsuarioEvaluador).ifPresent(imagen::setUsuarioEvaluador);
        }

        // 5. Guardar cambios
        TeleECGImagen imagenActualizada = teleECGImagenRepository.save(imagen);

        // 6. Registrar en auditoría
        registrarAuditoria(
            imagenActualizada,
            idUsuarioEvaluador,
            "EVALUAR",
            ipCliente,
            String.format("ECG evaluada como %s", evaluacion)
        );

        log.info("✅ Evaluación guardada: ID={}, Evaluación={}", idImagen, evaluacion);

        return convertirADTO(imagenActualizada);
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

                // Calcular edad desde fecha de nacimiento
                if (paciente.getFecnacimpaciente() != null) {
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
     * Registrar evento en auditoría
     */
    private void registrarAuditoria(TeleECGImagen imagen, Long idUsuario, String accion,
                                   String ipCliente, String resultado) {
        try {
            TeleECGAuditoria auditoria = new TeleECGAuditoria();
            auditoria.setImagen(imagen);

            // Buscar usuario por ID si está disponible
            if (idUsuario != null) {
                usuarioRepository.findById(idUsuario).ifPresent(usuario -> {
                    auditoria.setUsuario(usuario);
                    auditoria.setNombreUsuario(usuario.getNameUser());
                });
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
}

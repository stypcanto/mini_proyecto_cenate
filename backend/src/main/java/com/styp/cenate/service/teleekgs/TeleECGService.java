package com.styp.cenate.service.teleekgs;

import com.styp.cenate.dto.teleekgs.*;
import com.styp.cenate.model.*;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.repository.TeleECGAuditoriaRepository;
import com.styp.cenate.repository.TeleECGImagenRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import com.styp.cenate.repository.TipoBolsaRepository;
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
import org.springframework.transaction.annotation.Propagation;
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.LocalDate;
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

    @Autowired
    private SolicitudBolsaRepository solicitudBolsaRepository;

    @Autowired
    private TipoBolsaRepository tipoBolsaRepository;

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

        // 🔧 v1.71.0: Obtener nombre y apellido REALES del asegurado (no del DTO que puede estar incompleto)
        String nombreCompleto = aseguradoVerificacion.get().getPaciente() != null
            ? aseguradoVerificacion.get().getPaciente()
            : dto.getNombresPaciente() != null
                ? dto.getNombresPaciente()
                : "Sin nombre";

        imagen.setNombresPaciente(nombreCompleto);  // Guardar nombre completo real
        imagen.setApellidosPaciente("");  // Dejar vacío - usamos nombre completo en nombresPaciente
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
        imagen.setEsUrgente(dto.getEsUrgente() != null ? dto.getEsUrgente() : false);  // v4.0.0: Marcar como urgente si aplica
        imagen.setFechaToma(dto.getFechaToma());  // v1.76.0: Guardar fecha de toma del EKG

        imagen = teleECGImagenRepository.save(imagen);
        log.info("✅ Imagen registrada en BD: ID={}", imagen.getIdImagen());

        // 6.5. 🆕 v1.58.0: Crear bolsa automática en dim_solicitud_bolsa para CENATE
        try {
            crearBolsaTeleECG(imagen, aseguradoVerificacion.get(), ipressOrigen);
            log.info("✅ Bolsa TeleECG creada automáticamente para paciente {}", imagen.getNumDocPaciente());
        } catch (Exception e) {
            log.error("⚠️ Error creando bolsa TeleECG (continuando): {}", e.getMessage(), e);
            // NO bloquear - si falla creación de bolsa, la imagen ya se guardó
        }

        // 7. Registrar auditoría (no es crítica - si falla, no cancela la transacción)
        try {
            auditLogService.registrarEvento(
                "SYSTEM",
                "UPLOAD_ECG",
                "TELEEKGS",
                String.format("Imagen ECG subida - Paciente: %s, Tamaño: %d bytes, SHA256: %s",
                    dto.getNumDocPaciente(), dto.getArchivo().getSize(), sha256),
                "INFO",
                "SUCCESS"
            );
        } catch (Exception e) {
            log.warn("⚠️ Error registrando auditoría (no es crítico): {}", e.getMessage());
            // No lanzar excepción - la imagen ya se guardó exitosamente
        }

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
        try {
            auditLogService.registrarEvento(
                "USER_ID_" + idUsuario,
                "DELETE_ECG",
                "TELEEKGS",
                metadatosEliminacion,
                "INFO",
                "SUCCESS"
            );
            log.info("✅ Imagen eliminada y auditoría registrada: {}", idImagen);
        } catch (Exception e) {
            log.warn("⚠️ Error registrando auditoría de eliminación (no es crítico): {}", e.getMessage());
            // La imagen ya fue eliminada exitosamente, el error de auditoría no es crítico
        }
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
     * ✅ v1.86.2: Ultra-simple, sin lazy-loading, sin transacciones complejas
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public TeleECGImagenDTO evaluarImagen(Long idImagen, String evaluacion, String descripcion,
                                         Long idUsuarioEvaluador, String ipCliente) {
        log.info("📋 [EVALUAR] ID: {} - {}", idImagen, evaluacion);

        // Buscar
        var imagenOpt = teleECGImagenRepository.findById(idImagen);
        if (imagenOpt.isEmpty()) {
            throw new ResourceNotFoundException("ECG no encontrada: " + idImagen);
        }

        TeleECGImagen imagen = imagenOpt.get();

        // Actualizar campos
        imagen.setEvaluacion(evaluacion);
        imagen.setDescripcionEvaluacion(descripcion != null ? descripcion.trim() : "");
        imagen.setFechaEvaluacion(LocalDateTime.now());
        imagen.setIdUsuarioEvaluador(idUsuarioEvaluador);

        // Guardar
        teleECGImagenRepository.save(imagen);

        log.info("✅ [EVALUAR OK] ID: {} - GUARDADO", idImagen);

        // Respuesta simple (sin relaciones)
        TeleECGImagenDTO dto = new TeleECGImagenDTO();
        dto.setIdImagen(idImagen);
        dto.setEvaluacion(evaluacion);
        dto.setFechaEvaluacion(LocalDateTime.now());
        dto.setIdUsuarioEvaluador(idUsuarioEvaluador);
        return dto;
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

        // 3. Validar que no esté vencida (✅ FIX v1.86.0: Agregar null check)
        if (imagen.getFechaExpiracion() == null || imagen.getFechaExpiracion().isBefore(LocalDateTime.now())) {
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

    /**
     * ✅ v1.76.0: Actualizar fecha de toma del EKG
     */
    public TeleECGImagenDTO actualizarFechaToma(Long idImagen, String fechaTomaStr) {
        log.info("🗓️ Actualizando fecha de toma - ID: {}, Fecha: {}", idImagen, fechaTomaStr);

        TeleECGImagen imagen = teleECGImagenRepository.findById(idImagen)
            .orElseThrow(() -> new ResourceNotFoundException("Imagen ECG no encontrada: " + idImagen));

        try {
            // Parsear fecha en formato YYYY-MM-DD
            LocalDate fechaToma = LocalDate.parse(fechaTomaStr);

            // Validar que no sea fecha futura
            if (fechaToma.isAfter(LocalDate.now())) {
                throw new ValidationException("La fecha de toma no puede ser una fecha futura");
            }

            // Actualizar y guardar
            imagen.setFechaToma(fechaToma);
            imagen.setUpdatedAt(LocalDateTime.now());
            imagen = teleECGImagenRepository.save(imagen);

            log.info("✅ Fecha de toma actualizada correctamente");
            return convertirADTO(imagen);
        } catch (Exception e) {
            log.error("❌ Error al parsear fecha: {}", fechaTomaStr);
            throw new ValidationException("Formato de fecha inválido. Use YYYY-MM-DD");
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

        // 🔧 v1.71.0: Construir nombre completo correctamente
        // Si tenemos nombres y apellidos, combinarlos; si no, usar solo el nombre
        if (imagen.getApellidosPaciente() != null && !imagen.getApellidosPaciente().isEmpty()) {
            dto.setPacienteNombreCompleto(imagen.getApellidosPaciente() + ", " + imagen.getNombresPaciente());
        } else {
            // Si no hay apellidos separados, mostrar solo el nombre (que contiene el completo)
            dto.setPacienteNombreCompleto(imagen.getNombresPaciente());
        }

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

        // ✅ v1.60.5: Mapear indicador de urgencia desde la entidad
        dto.setEsUrgente(imagen.getEsUrgente() != null ? imagen.getEsUrgente() : false);

        // ✅ v1.76.0: Mapear fecha de toma del EKG
        dto.setFechaToma(imagen.getFechaToma());

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
    public Page<AseguradoConECGsDTO> listarAgrupaPorAsegurado(
            String numDoc,
            String estado,
            Long idIpress,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta,
            Pageable pageable) {

        log.info("📋 Listando ECGs agrupadas por asegurado - Filtro DNI: {}, Estado: {}, Página: {}/{}",
            numDoc, estado, pageable.getPageNumber(), pageable.getPageSize());

        // Usar LocalDateTime.MIN/MAX como fallback
        LocalDateTime desde = fechaDesde != null ? fechaDesde : LocalDateTime.of(1900, 1, 1, 0, 0);
        LocalDateTime hasta = fechaHasta != null ? fechaHasta : LocalDateTime.of(2999, 12, 31, 23, 59);

        // ✅ v1.81.2: Soportar DNIs con/sin ceros iniciales
        String numDocSinCeros = numDoc != null ? numDoc.replaceAll("^0+", "") : null;

        // ✅ v1.70.0: Obtener imágenes con paginación (máx pageSize registros)
        Page<TeleECGImagen> imagenesPaginadas = teleECGImagenRepository.buscarFlexibleSinPaginacion(
            numDoc, numDocSinCeros, estado, idIpress, desde, hasta, pageable
        );

        // Agrupar por DNI del paciente (solo contenido de la página actual)
        List<TeleECGImagen> imagenes = imagenesPaginadas.getContent();
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

        log.info("✅ ECGs agrupadas: {} asegurados encontrados (página {}/{}, total: {})",
            resultado.size(), pageable.getPageNumber(), pageable.getPageSize(), imagenesPaginadas.getTotalElements());

        // ✅ v1.70.0: Retornar Page para mantener metadatos de paginación
        return new PageImpl<>(resultado, pageable, imagenesPaginadas.getTotalElements());
    }

    /**
     * ⚠️ DEPRECATED v1.70.0: Usar listarAgrupaPorAsegurado con Pageable
     * Este método mantiene compatibilidad con endpoints antiguos
     * LIMITA a 1000 registros máximo para evitar problemas de memoria
     */
    public List<AseguradoConECGsDTO> listarAgrupaPorAseguradoLimitado(
            String numDoc,
            String estado,
            Long idIpress,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta) {

        log.info("📋 [DEPRECATED] Listando ECGs agrupadas por asegurado (LIMITADO) - DNI: {}, Estado: {}", numDoc, estado);

        // Usar LocalDateTime.MIN/MAX como fallback
        LocalDateTime desde = fechaDesde != null ? fechaDesde : LocalDateTime.of(1900, 1, 1, 0, 0);
        LocalDateTime hasta = fechaHasta != null ? fechaHasta : LocalDateTime.of(2999, 12, 31, 23, 59);

        // ✅ v1.70.0: Obtener imágenes con LIMIT 1000 para evitar sobrecargar memoria
        List<TeleECGImagen> imagenes = teleECGImagenRepository.buscarFlexibleSinPaginacionLimitado(
            numDoc, estado, idIpress, desde, hasta
        );

        // Agrupar por DNI del paciente
        Map<String, List<TeleECGImagen>> imagenesPorDni = imagenes.stream()
            .collect(Collectors.groupingBy(TeleECGImagen::getNumDocPaciente));

        // Convertir cada grupo a AseguradoConECGsDTO (mismo código que la versión paginada)
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

            // Determinar estado principal
            String estadoPrincipal = primeraImagen.getEstado();
            if (pendientes > 0) {
                estadoPrincipal = "ENVIADA";
            }

            // Obtener evaluación principal
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
                .estadoTransformado(estadoPrincipal)
                .evaluacionPrincipal(evaluacionPrincipal)
                .ecgsPendientes(pendientes)
                .ecgsObservadas(observadas)
                .ecgsAtendidas(atendidas)
                .imagenes(dtos)
                .build();

            resultado.add(asegurado);
        }

        // Ordenar por fecha último ECG descendente
        resultado.sort((a, b) -> {
            LocalDateTime fechaA = a.getFechaUltimoEcg() != null ? a.getFechaUltimoEcg() : LocalDateTime.MIN;
            LocalDateTime fechaB = b.getFechaUltimoEcg() != null ? b.getFechaUltimoEcg() : LocalDateTime.MIN;
            return fechaB.compareTo(fechaA);
        });

        log.info("✅ ECGs agrupadas (limitado a 1000): {} asegurados encontrados", resultado.size());
        return resultado;
    }

    /**
     * 🆕 v1.58.0: Crear bolsa automática en dim_solicitud_bolsa para CENATE
     * Permite que coordinadores/médicos vean el ECG en su bandeja de trabajo
     */
    @Transactional
    private void crearBolsaTeleECG(TeleECGImagen imagen, Asegurado asegurado, Ipress ipress) {
        try {
            log.info("🆕 Creando bolsa TeleECG para paciente: {}", imagen.getNumDocPaciente());

            // 1. Verificar si ya existe una bolsa activa para este paciente
            var bolsasExistentes = solicitudBolsaRepository.findByPacienteDniAndActivoTrue(
                asegurado.getDocPaciente());
            if (!bolsasExistentes.isEmpty()) {
                log.info("ℹ️ Bolsa TeleECG ya existe para paciente: {}", imagen.getNumDocPaciente());
                return;
            }

            // 2. Obtener tipo de bolsa TELEECG
            TipoBolsa tipoBolsa = tipoBolsaRepository.findByCodTipoBolsa("BOLSA_TELEECG")
                .orElseThrow(() -> new RuntimeException("Tipo de bolsa TELEECG no encontrado. Ejecutar migración V4_0_0"));

            // 3. Generar número único de solicitud
            String numeroSolicitud = "TEL-" + System.currentTimeMillis();

            // 4. Obtener coordinador responsable del IPRESS (si existe)
            // TODO v1.61.0: Implementar búsqueda de coordinador por IPRESS cuando esté disponible
            Long responsableGestoraId = null;
            try {
                // Placeholder: Sin coordinador asignado por ahora
                log.info("ℹ️ Bolsa TeleECG sin coordinador responsable asignado aún");
            } catch (Exception e) {
                log.warn("⚠️ Error obteniendo coordinador para IPRESS: {}", ipress.getCodIpress());
            }

            // 5. Crear bolsa (estado PENDIENTE)
            SolicitudBolsa bolsa = SolicitudBolsa.builder()
                .numeroSolicitud(numeroSolicitud)
                .pacienteId(asegurado.getPkAsegurado())
                .pacienteDni(asegurado.getDocPaciente())
                .pacienteNombre(asegurado.getPaciente() != null ? asegurado.getPaciente() : "N/A")
                .idBolsa(tipoBolsa.getIdTipoBolsa())
                .idServicio(1L) // Servicio genérico para TeleECG
                .codigoAdscripcion(ipress.getCodIpress())
                .idIpress(ipress.getIdIpress())
                .estado("PENDIENTE")
                .estadoGestionCitasId(1L) // PENDIENTE
                .responsableGestoraId(responsableGestoraId)
                .activo(true)
                // v1.60.0: Completar datos del paciente automáticamente desde asegurados
                .tipoDocumento("DNI")
                .pacienteSexo(asegurado.getSexo())
                .pacienteTelefono(asegurado.getTelCelular() != null ? asegurado.getTelCelular() : asegurado.getTelFijo())
                .fechaNacimiento(asegurado.getFecnacimpaciente())
                // v1.60.0: Asignar tipo de cita por defecto "Voluntaria" para bolsas TeleECG
                .tipoCita("Voluntaria")
                .build();

            // 6. Guardar referencia a imagen TeleECG (nuevo campo v4.0.0)
            // bolsa.setIdTeleecgImagen(imagen.getIdImagen()); // Si la columna existe

            solicitudBolsaRepository.save(bolsa);
            log.info("✅ Bolsa TeleECG creada: ID={}, DNI={}", bolsa.getIdSolicitud(), imagen.getNumDocPaciente());

            // 7. v1.58.2: Enviar notificación email al coordinador
            // NOTA: Usuario no tiene email en BD, se envía solo log por ahora
            try {
                if (responsableGestoraId != null) {
                    var coordOpt = usuarioRepository.findById(responsableGestoraId);
                    if (coordOpt.isPresent()) {
                        Usuario coordinador = coordOpt.get();
                        log.info("📧 ECG cargado - Notificar a coordinador: {}", coordinador.getNameUser());
                        // TODO v1.61.0: Implementar envío de email cuando Usuario tenga campo email
                        // emailService.enviarNotificacionECGNuevo(...);
                    }
                }
            } catch (Exception e) {
                log.warn("⚠️ Error procesando notificación ECG (continuando): {}", e.getMessage());
            }

            // Auditoría
            auditLogService.registrarEvento(
                "SYSTEM",
                "CREATE_BOLSA_TELEECG",
                "TELEEKGS",
                String.format("Bolsa TeleECG creada - Solicitud: %s, Paciente: %s, Urgente: %s",
                    numeroSolicitud, imagen.getNumDocPaciente(), imagen.getEsUrgente()),
                "INFO",
                "SUCCESS"
            );

        } catch (Exception e) {
            // Log the error but don't rethrow - bolsa creation is not critical
            log.warn("⚠️ Error creando bolsa TeleECG (continuando): {}", e.getMessage());
        }
    }

    /**
     * Registrar evento en auditoría
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
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
     * 📊 Calcular analytics filtrado por fecha, IPRESS, evaluación, urgencia
     * v1.73.0 - Nuevo endpoint
     */
    public TeleECGAnalyticsDTO obtenerAnalytics(
            String fechaDesde,
            String fechaHasta,
            Long idIpress,
            String evaluacion,
            Boolean esUrgente) {

        log.info("📊 Calculando analytics - Desde: {}, Hasta: {}, IPRESS: {}", fechaDesde, fechaHasta, idIpress);

        try {
            // Convertir fechas
            LocalDate desde = LocalDate.parse(fechaDesde);
            LocalDate hasta = LocalDate.parse(fechaHasta);

            // Obtener todas las imágenes
            List<TeleECGImagen> imagenes = teleECGImagenRepository.findAll();

            // Filtrar por fecha
            List<TeleECGImagen> filtradas = imagenes.stream()
                    .filter(img -> img.getFechaEnvio() != null &&
                            img.getFechaEnvio().toLocalDate().compareTo(desde) >= 0 &&
                            img.getFechaEnvio().toLocalDate().compareTo(hasta) <= 0)
                    .collect(Collectors.toList());

            // Filtrar por IPRESS si se proporciona
            if (idIpress != null) {
                filtradas = filtradas.stream()
                        .filter(img -> img.getCodigoIpress() != null &&
                                img.getCodigoIpress().equals(idIpress.toString()))
                        .collect(Collectors.toList());
            }

            // Filtrar por evaluación si se proporciona
            if (evaluacion != null && !evaluacion.isEmpty()) {
                filtradas = filtradas.stream()
                        .filter(img -> evaluacion.equals(img.getEvaluacion()))
                        .collect(Collectors.toList());
            }

            // Filtrar por urgencia si se proporciona
            if (esUrgente != null) {
                filtradas = filtradas.stream()
                        .filter(img -> esUrgente.equals(img.getEsUrgente()))
                        .collect(Collectors.toList());
            }

            // Calcular KPIs
            int totalEcgs = filtradas.size();
            int ecgsNormales = (int) filtradas.stream().filter(i -> "NORMAL".equals(i.getEvaluacion())).count();
            int ecgsAnormales = (int) filtradas.stream().filter(i -> "ANORMAL".equals(i.getEvaluacion())).count();
            int ecgsSinEvaluar = totalEcgs - ecgsNormales - ecgsAnormales;

            double tatPromedioMinutos = filtradas.stream()
                    .filter(img -> img.getFechaEnvio() != null && img.getFechaEvaluacion() != null)
                    .mapToLong(img -> java.time.temporal.ChronoUnit.MINUTES.between(
                            img.getFechaEnvio(),
                            img.getFechaEvaluacion()))
                    .average()
                    .orElse(0);

            double tasaRechazoPorcentaje = totalEcgs > 0 ?
                    ((double) filtradas.stream().filter(i -> "RECHAZADA".equals(i.getEstado())).count() / totalEcgs) * 100 : 0;

            // SLA: asumimos 90 minutos como objetivo
            double slaCumplimientoPorcentaje = filtradas.stream()
                    .filter(img -> img.getFechaEnvio() != null && img.getFechaEvaluacion() != null)
                    .filter(img -> java.time.temporal.ChronoUnit.MINUTES.between(
                            img.getFechaEnvio(),
                            img.getFechaEvaluacion()) <= 90)
                    .count() * 100.0 / Math.max(1, filtradas.size());

            // Distribuciones
            // ⚠️ Nota: TeleECGImagen no tiene campo de género, por eso se deja vacío
            Map<String, Integer> distribucionGenero = new HashMap<>();
            distribucionGenero.put("M", 0);
            distribucionGenero.put("F", 0);
            distribucionGenero.put("Otro", 0);

            Map<String, Integer> distribucionEstado = new HashMap<>();
            distribucionEstado.put("ENVIADA", (int) filtradas.stream()
                    .filter(i -> "ENVIADA".equals(i.getEstado())).count());
            distribucionEstado.put("OBSERVADA", (int) filtradas.stream()
                    .filter(i -> "OBSERVADA".equals(i.getEstado())).count());
            distribucionEstado.put("ATENDIDA", (int) filtradas.stream()
                    .filter(i -> "ATENDIDA".equals(i.getEstado())).count());

            Map<String, Integer> distribucionEvaluacion = new HashMap<>();
            distribucionEvaluacion.put("NORMAL", ecgsNormales);
            distribucionEvaluacion.put("ANORMAL", ecgsAnormales);
            distribucionEvaluacion.put("SIN_EVALUAR", ecgsSinEvaluar);

            // Comparativa (período anterior = 30 días antes)
            LocalDate desdeAnterior = desde.minusDays(30);
            LocalDate hastaAnterior = desde.minusDays(1);

            List<TeleECGImagen> imagenesAnterior = imagenes.stream()
                    .filter(img -> img.getFechaEnvio() != null &&
                            img.getFechaEnvio().toLocalDate().compareTo(desdeAnterior) >= 0 &&
                            img.getFechaEnvio().toLocalDate().compareTo(hastaAnterior) <= 0)
                    .collect(Collectors.toList());

            double cambioVolumen = imagenesAnterior.isEmpty() ? 0 :
                    ((totalEcgs - imagenesAnterior.size()) * 100.0 / imagenesAnterior.size());

            double tatAnterior = imagenesAnterior.stream()
                    .filter(img -> img.getFechaEnvio() != null && img.getFechaEvaluacion() != null)
                    .mapToLong(img -> java.time.temporal.ChronoUnit.MINUTES.between(
                            img.getFechaEnvio(),
                            img.getFechaEvaluacion()))
                    .average()
                    .orElse(0);

            double cambioTat = tatAnterior > 0 ? ((tatAnterior - tatPromedioMinutos) * 100.0 / tatAnterior) : 0;

            TeleECGAnalyticsDTO.ComparativaDTO comparativa = TeleECGAnalyticsDTO.ComparativaDTO.builder()
                    .cambioVolumenPorcentaje(cambioVolumen)
                    .cambioTatPorcentaje(cambioTat)
                    .cambioRechazosPorcentaje(0.0) // Placeholder
                    .build();

            TeleECGAnalyticsDTO resultado = TeleECGAnalyticsDTO.builder()
                    .totalEcgs(totalEcgs)
                    .ecgsNormales(ecgsNormales)
                    .ecgsAnormales(ecgsAnormales)
                    .ecgsSinEvaluar(ecgsSinEvaluar)
                    .tatPromedioMinutos(tatPromedioMinutos)
                    .slaCumplimientoPorcentaje(slaCumplimientoPorcentaje)
                    .tasaRechazoPorcentaje(tasaRechazoPorcentaje)
                    .distribucionPorGenero(distribucionGenero)
                    .distribucionPorEstado(distribucionEstado)
                    .distribucionPorEvaluacion(distribucionEvaluacion)
                    .comparacion(comparativa)
                    .fechaDesde(fechaDesde)
                    .fechaHasta(fechaHasta)
                    .idIpress(idIpress)
                    .evaluacionFiltro(evaluacion)
                    .esUrgenteFiltro(esUrgente)
                    .build();

            log.info("✅ Analytics calculado: {} ECGs, TAT: {:.0f}min, SLA: {:.1f}%",
                    totalEcgs, tatPromedioMinutos, slaCumplimientoPorcentaje);

            return resultado;

        } catch (Exception e) {
            log.error("❌ Error calculando analytics", e);
            throw new RuntimeException("Error calculando analytics: " + e.getMessage());
        }
    }
}
